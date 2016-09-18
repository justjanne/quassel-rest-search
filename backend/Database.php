<?php

namespace QuasselRestSearch;

require_once 'User.php';
require_once 'Config.php';
require_once 'helper/AuthHelper.php';

class Backend {
    private $storedFindBuffers;
    private $storedFindInBuffer;
    private $loadBefore;
    private $loadAfter;

    private $findUser;

    private $user;

    private function __construct(string $database_connector, string $username, string $password) {
        $db = new \PDO($database_connector, $username, $password);

        $this->storedFindBuffers = $db->prepare("
            SELECT backlog.bufferid,
                   buffer.buffername,
                   network.networkname
            FROM backlog
            JOIN buffer ON backlog.bufferid = buffer.bufferid
            JOIN network ON buffer.networkid = network.networkid,
                            plainto_tsquery('english'::REGCONFIG, :query) query
            WHERE (backlog.type & 23559) > 0
              AND buffer.userid = :userid
              AND backlog.tsv @@ query
            GROUP BY backlog.bufferid,
                     buffer.buffername,
                     network.networkname
            ORDER BY MIN((1 + log(GREATEST(1::DOUBLE PRECISION, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - TIME))))) * (1 - ts_rank(tsv, query, 32)) * (1 + ln(backlog.type))) ASC;
        ");
        $this->storedFindInBufferMultiple = $db->prepare("
            SELECT tmp.bufferid,
                   tmp.messageid,
                   sender.sender,
                   tmp.time,
                   tmp.message,
                   ts_headline(replace(replace(tmp.message, '<', '&lt;'), '>', '&gt;'), query) AS preview
            FROM
              (SELECT backlog.messageid,
                      backlog.bufferid,
                      backlog.senderid,
                      backlog.time,
                      backlog.message,
                      query,
                      rank() OVER(PARTITION BY backlog.bufferid
                                  ORDER BY (1 + log(GREATEST(1, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - TIME))))) * (1 - ts_rank(tsv, query, 32)) * (1 + ln(backlog.type)) ASC
                                  ) AS rank
               FROM backlog
               JOIN buffer ON backlog.bufferid = buffer.bufferid,
                              plainto_tsquery('english'::REGCONFIG, :query) query
               WHERE (backlog.type & 23559) > 0
                 AND buffer.userid = :userid
                 AND backlog.tsv @@ query
               ORDER BY (1 + log(GREATEST(1, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - TIME))))) * (1 - ts_rank(tsv, query, 32)) * (1 + ln(backlog.type)) ASC
              ) tmp
            JOIN sender ON tmp.senderid = sender.senderid
            WHERE tmp.rank <= :limit;
        ");
        $this->storedFindInBuffer = $db->prepare("
            SELECT backlog.messageid,
                   sender.sender,
                   backlog.time,
                   backlog.message,
                   ts_headline(replace(replace(backlog.message, '<', '&lt;'), '>', '&gt;'), query) AS preview
            FROM backlog
            JOIN sender ON backlog.senderid = sender.senderid
            JOIN buffer ON backlog.bufferid = buffer.bufferid,
                            plainto_tsquery('english'::REGCONFIG, :query) query
            WHERE (backlog.type & 23559) > 0
              AND buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.tsv @@ query
            ORDER BY (1 + log(GREATEST(1, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - TIME))))) * (1 - ts_rank(tsv, query, 32)) * ( 1 + ln(backlog.type)) ASC
            LIMIT :limit OFFSET :offset;
        ");
        $this->loadAfter = $db->prepare("
            SELECT backlog.messageid,
                   backlog.bufferid,
                   buffer.buffername,
                   sender.sender,
                   backlog.time,
                   network.networkname,
                   backlog.message
            FROM backlog
            JOIN sender ON backlog.senderid = sender.senderid
            JOIN buffer ON backlog.bufferid = buffer.bufferid
            JOIN network ON buffer.networkid = network.networkid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.messageid >= :anchor
            ORDER BY backlog.messageid ASC
            LIMIT :limit;
        ");
        $this->loadBefore = $db->prepare("
            SELECT backlog.messageid,
                   backlog.bufferid,
                   buffer.buffername,
                   sender.sender,
                   backlog.time,
                   network.networkname,
                   backlog.message
            FROM backlog
            JOIN sender ON backlog.senderid = sender.senderid
            JOIN buffer ON backlog.bufferid = buffer.bufferid
            JOIN network ON buffer.networkid = network.networkid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.messageid < :anchor
            ORDER BY backlog.messageid DESC
            LIMIT :limit;
        ");
        $this->findUser = $db->prepare("
            SELECT *
            FROM quasseluser
            WHERE quasseluser.username = :username
        ");
    }

    public static function createFromOptions(string $database_connector, string $username, string $password) : Backend {
        return new Backend($database_connector, $username, $password);
    }

    public static function createFromConfig(Config $config) : Backend {
        return new Backend($config->database_connector, $config->username, $config->password);
    }

    public function authenticateFromHeader(string $header) : bool {
        $parsedHeader = AuthHelper::parseAuthHeader($header);
        return $this->authenticate($parsedHeader['username'], $parsedHeader['password']);
    }

    public function authenticate(string $username, string $password) : bool {
        if (!isset($username) || !isset($password)) {
            syslog(LOG_ERR, "Username or password not set");
            return false;
        }

        $this->findUser->bindParam(":username", $username);
        $this->findUser->execute();

        $result = $this->findUser->fetch(\PDO::FETCH_ASSOC);
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

    public function find(string $query, int $limitPerBuffer = 4) : array {
        $truncatedLimit = max(min($limitPerBuffer, 10), 0);

        $buffers = $this->findBuffers($query);
        $messages = $this->findInBufferMultiple($query, $truncatedLimit);

        $buffermap = [];
        foreach ($buffers as &$buffer) {
            $buffer['messages'] = [];
            $buffermap[$buffer['bufferid']] = &$buffer;
        }

        foreach ($messages as $message) {
            array_push($buffermap[$message['bufferid']]['messages'], $message);
        }

        return array_values($buffermap);
    }

    public function findBuffers(string $query) : array {
        $this->storedFindBuffers->bindParam(':userid', $this->user->userid);
        $this->storedFindBuffers->bindParam(':query', $query);
        $this->storedFindBuffers->execute();
        return $this->storedFindBuffers->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findInBufferMultiple(string $query, int $limit = 4) : array {
        $this->storedFindInBufferMultiple->bindParam(':userid', $this->user->userid);
        $this->storedFindInBufferMultiple->bindParam(':query', $query);
        $this->storedFindInBufferMultiple->bindParam(':limit', $limit);
        $this->storedFindInBufferMultiple->execute();
        return $this->storedFindInBufferMultiple->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findInBuffer(string $query, int $bufferid, int $offset = 0, int $limit = 20) : array {
        $truncatedLimit = max(min($limit, 50), 0);

        $this->storedFindInBuffer->bindParam(':userid', $this->user->userid);
        $this->storedFindInBuffer->bindParam(':bufferid', $bufferid);
        $this->storedFindInBuffer->bindParam(':query', $query);

        $this->storedFindInBuffer->bindParam(':limit', $truncatedLimit);
        $this->storedFindInBuffer->bindParam(':offset', $offset);

        $this->storedFindInBuffer->execute();
        return $this->storedFindInBuffer->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function context(int $anchor, int $buffer, int $loadBefore, int $loadAfter) : array {
        return array_merge(array_reverse($this->before($anchor, $buffer, $loadBefore)), $this->after($anchor, $buffer, $loadAfter));
    }

    public function before(int $anchor, int $buffer, int $limit) : array {
        $truncatedLimit = max(min($limit, 50), 0);

        $this->loadBefore->bindParam(":userid", $this->user->userid);
        $this->loadBefore->bindParam(":bufferid", $buffer);
        $this->loadBefore->bindParam(":anchor", $anchor);
        $this->loadBefore->bindParam(":limit", $truncatedLimit);
        $this->loadBefore->execute();
        return $this->loadBefore->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function after(int $anchor, int $buffer, int $limit) : array {
        $truncatedLimit = max(min($limit + 1, 50), 1);

        $this->loadAfter->bindParam(":userid", $this->user->userid);
        $this->loadAfter->bindParam(":bufferid", $buffer);
        $this->loadAfter->bindParam(":anchor", $anchor);
        $this->loadAfter->bindParam(":limit", $truncatedLimit);
        $this->loadAfter->execute();
        return $this->loadAfter->fetchAll(\PDO::FETCH_ASSOC);
    }
}