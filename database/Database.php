<?php

namespace QuasselRestSearch;

use PDO;

require_once 'User.php';
require_once 'Config.php';
require_once 'helper/AuthHelper.php';
require_once 'backends/BackendFactory.php';

class Database
{
    private $user;

    private $backend;
    private $enable_ranking;

    private function __construct(string $database_connector, string $username, string $password, string $type, array $options, bool $enable_ranking)
    {
        $this->backend = BackendFactory::create($type, new \PDO($database_connector, $username, $password), $options, $enable_ranking);
        $this->enable_ranking = $enable_ranking;
    }

    public static function createFromConfig(Config $config): Database
    {
        return Database::createFromOptions($config->database_connector, $config->username, $config->password, $config->backend, $config->database_options, $config->enable_ranking);
    }

    public static function createFromOptions(string $database_connector, string $username, string $password, string $type, array $options, bool $enable_ranking): Database
    {
        return new Database($database_connector, $username, $password, $type, $options, $enable_ranking);
    }

    public function authenticateFromHeader(string $header): bool
    {
        $parsedHeader = AuthHelper::parseAuthHeader($header);
        return $this->authenticate($parsedHeader['username'], $parsedHeader['password']);
    }

    public function authenticate(string $username, string $password): bool
    {
        if (!isset($username) || !isset($password)) {
            syslog(LOG_ERR, "Username or password not set");
            return false;
        }

        $stmt = $this->backend->findUser();

        $stmt->bindParam(":username", $username);
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($result === FALSE) {
            syslog(LOG_ERR, "Couldn’t find user " . $username);
            return false;
        }

        $user = new User($result);

        if (!AuthHelper::initialAuthenticateUser($password, $user->password, $user->hashversion)) {
            syslog(LOG_ERR, "Password does not match for user " . $username);
            return false;
        }

        $this->user = $user;
        return true;
    }

    private function apply_config(\PDOStatement $stmt)
    {
        if ($this->enable_ranking) {
            if (!($this->backend instanceof SQLiteSmartBackend)) {
                $stmt->bindValue(':config_normalization', 4, PDO::PARAM_INT);
            }
            $stmt->bindValue(':weight_content', 14, PDO::PARAM_INT);
        }

        $stmt->bindValue(':weight_type', 32, PDO::PARAM_INT);
        $stmt->bindValue(':weight_time', 1, PDO::PARAM_INT);
    }

    public function find(string $query, string $since = null, string $before = null, string $buffer = null, string $network = null, string $sender = null, int $limitPerBuffer = 4): array
    {
        $truncatedLimit = max(min($limitPerBuffer, 10), 0);

        $messages = $this->findInBufferMultiple($query, $since, $before, $buffer, $network, $sender, $truncatedLimit);
        $hasMore = $this->findInBufferMultipleCount($query, $since, $before, $buffer, $network, $sender, 0, $truncatedLimit);

        $buffermap = [];

        foreach ($messages as $message) {
            if (!array_key_exists($message['bufferid'], $buffermap)) {
                $buffermap[$message['bufferid']] = [
                    "bufferid" => $message['bufferid'],
                    "buffername" => $message['buffername'],
                    "networkname" => $message['networkname'],
                    "messages" => []
                ];
            }

            array_push($buffermap[$message['bufferid']]['messages'], $message);
        }

        foreach ($hasMore as $hasMoreResult) {
            if (array_key_exists($hasMoreResult['bufferid'], $buffermap))
                $buffermap[$hasMoreResult['bufferid']]['hasmore'] = $hasMoreResult['hasmore'];
        }

        return array_values($buffermap);
    }

    public function findInBufferMultiple(string $query, string $since = null, string $before = null, string $buffer = null, string $network = null, string $sender = null, int $limit = 4): array
    {
        $ignore_since = $since === null;
        $ignore_before = $before === null;
        $ignore_network = $network === null;
        $ignore_buffer = $buffer === null;
        $ignore_sender = $sender === null;

        $stmt = $this->backend->findInBuffers();
        $this->apply_config($stmt);

        $stmt->bindParam(':userid', $this->user->userid, PDO::PARAM_INT);
        $stmt->bindParam(':query', $query, PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);

        $stmt->bindValue(':since', !$ignore_since ? (string)$since : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':before', !$ignore_before ? (string)$before : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':buffer', !$ignore_buffer ? (string)$buffer : "", PDO::PARAM_STR);
        $stmt->bindValue(':network', !$ignore_network ? (string)$network : "", PDO::PARAM_STR);
        $stmt->bindValue(':sender', !$ignore_sender ? (string)$sender : "", PDO::PARAM_STR);
        $stmt->bindParam(':ignore_since', $ignore_since, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_before', $ignore_before, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_buffer', $ignore_buffer, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_network', $ignore_network, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_sender', $ignore_sender, PDO::PARAM_INT);

        $success = $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return $result;
    }

    public function findInBufferMultipleCount(string $query, string $since = null, string $before = null, string $buffer = null, string $network = null, string $sender = null, int $offset = 0, int $limit = 4): array
    {
        $truncatedLimit = max(min($limit, 50), 0);
        $ignore_since = $since === null;
        $ignore_before = $before === null;
        $ignore_network = $network === null;
        $ignore_buffer = $buffer === null;
        $ignore_sender = $sender === null;

        $stmt = $this->backend->findInBuffersCount();

        $stmt->bindParam(':userid', $this->user->userid, PDO::PARAM_INT);
        $stmt->bindParam(':query', $query, PDO::PARAM_STR);

        $stmt->bindValue(':since', !$ignore_since ? (string)$since : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':before', !$ignore_before ? (string)$before : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':buffer', !$ignore_buffer ? (string)$buffer : "", PDO::PARAM_STR);
        $stmt->bindValue(':network', !$ignore_network ? (string)$network : "", PDO::PARAM_STR);
        $stmt->bindValue(':sender', !$ignore_sender ? (string)$sender : "", PDO::PARAM_STR);
        $stmt->bindParam(':ignore_since', $ignore_since, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_before', $ignore_before, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_buffer', $ignore_buffer, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_network', $ignore_network, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_sender', $ignore_sender, PDO::PARAM_INT);

        $stmt->bindParam(':limit', $truncatedLimit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

        $success = $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return $result;
    }

    public function findInBuffer(string $query, string $since = null, string $before = null, string $sender = null, int $bufferid, int $offset = 0, int $limit = 20): array
    {
        $truncatedLimit = max(min($limit, 50), 0);
        $ignore_since = $since === null;
        $ignore_before = $before === null;
        $ignore_sender = $sender === null;

        $stmt = $this->backend->findInBuffer();
        $this->apply_config($stmt);

        $stmt->bindParam(':userid', $this->user->userid, PDO::PARAM_INT);
        $stmt->bindParam(':bufferid', $bufferid, PDO::PARAM_INT);
        $stmt->bindParam(':query', $query, PDO::PARAM_STR);

        $stmt->bindValue(':since', !$ignore_since ? (string)$since : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':before', !$ignore_before ? (string)$before : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':sender', !$ignore_sender ? (string)$sender : "", PDO::PARAM_STR);
        $stmt->bindParam(':ignore_since', $ignore_since, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_before', $ignore_before, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_sender', $ignore_sender, PDO::PARAM_INT);

        $stmt->bindParam(':limit', $truncatedLimit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

        $stmt->execute();
        return [
            'results' => $stmt->fetchAll(\PDO::FETCH_ASSOC),
            'hasmore' => $this->findInBufferCount($query, $since, $before, $sender, $bufferid, $offset, $limit)
        ];
    }

    public function findInBufferCount(string $query, string $since = null, string $before = null, string $sender = null, int $bufferid, int $offset = 0, int $limit = 4): bool
    {
        $truncatedLimit = max(min($limit, 50), 0);
        $ignore_since = $since === null;
        $ignore_before = $before === null;
        $ignore_sender = $sender === null;

        $stmt = $this->backend->findInBufferCount();

        $stmt->bindParam(':userid', $this->user->userid, PDO::PARAM_INT);
        $stmt->bindParam(':bufferid', $bufferid, PDO::PARAM_INT);
        $stmt->bindParam(':query', $query, PDO::PARAM_STR);

        $stmt->bindValue(':since', !$ignore_since ? (string)$since : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':before', !$ignore_before ? (string)$before : "1970-01-01", PDO::PARAM_STR);
        $stmt->bindValue(':sender', !$ignore_sender ? (string)$sender : "", PDO::PARAM_STR);
        $stmt->bindParam(':ignore_since', $ignore_since, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_before', $ignore_before, PDO::PARAM_INT);
        $stmt->bindParam(':ignore_sender', $ignore_sender, PDO::PARAM_INT);

        $stmt->bindParam(':limit', $truncatedLimit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchColumn();
    }

    public function context(int $anchor, int $buffer, int $loadBefore, int $loadAfter): array
    {
        return array_merge(array_reverse($this->before($anchor, $buffer, $loadBefore)), $this->after($anchor, $buffer, $loadAfter));
    }

    public function before(int $anchor, int $buffer, int $limit): array
    {
        $truncatedLimit = max(min($limit, 50), 0);

        $stmt = $this->backend->loadBefore();

        $stmt->bindParam(":userid", $this->user->userid, PDO::PARAM_INT);
        $stmt->bindParam(":bufferid", $buffer, PDO::PARAM_INT);
        $stmt->bindParam(":anchor", $anchor, PDO::PARAM_INT);

        $stmt->bindParam(":limit", $truncatedLimit, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function after(int $anchor, int $buffer, int $limit): array
    {
        $truncatedLimit = max(min($limit, 50), 0);

        $stmt = $this->backend->loadAfter();

        $stmt->bindParam(":userid", $this->user->userid, PDO::PARAM_INT);
        $stmt->bindParam(":bufferid", $buffer, PDO::PARAM_INT);
        $stmt->bindParam(":anchor", $anchor, PDO::PARAM_INT);

        $stmt->bindParam(":limit", $truncatedLimit, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
