<?php

namespace QuasselRestSearch;

require_once 'Backend.php';

class PostgresSmartBackend implements Backend
{
    private $db;
    private $options;
    private $enable_ranking;

    function __construct(\PDO $db, array $options, bool $enable_ranking)
    {
        $this->db = $db;
        $timeout = $options["timeout"];
        $this->db->exec("SET statement_timeout = $timeout;");
        $this->options = $options;
        $this->enable_ranking = $enable_ranking;
    }

    public function findUser(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT *
            FROM quasseluser
            WHERE quasseluser.username = :username
        ");
    }

    private function tsQueryFunction(): string
    {
        return array_key_exists('tsqueryfunction', $this->options) ? $this->options['tsqueryfunction'] : "plainto_tsquery('english', :query)";
    }

    private function rankingFunction(): string
    {
        if ($this->enable_ranking) {
            return "(
                      (ts_rank_cd(tsv, query, :config_normalization) ^ :weight_content) *
                      ((CASE
                        WHEN TYPE IN (1, 4) THEN 1.0
                        WHEN TYPE IN (2, 1024, 2048, 4096, 16384) THEN 0.8
                        WHEN TYPE IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.6
                        WHEN TYPE IN (8, 16, 8192, 131072) THEN 0.4
                        ELSE 0.2 END) ^ :weight_type) *
                      ((1 / (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) - EXTRACT(EPOCH FROM time))) ^ :weight_time)
                    )";
        } else {
            return "(
                      ((CASE
                        WHEN TYPE IN (1, 4) THEN 1.0
                        WHEN TYPE IN (2, 1024, 2048, 4096, 16384) THEN 0.8
                        WHEN TYPE IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.6
                        WHEN TYPE IN (8, 16, 8192, 131072) THEN 0.4
                        ELSE 0.2 END) ^ :weight_type) *
                      ((1 / (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) - EXTRACT(EPOCH FROM time))) ^ :weight_time)
                    )";
        }
    }

    public function findInBuffers(): \PDOStatement
    {
        $tsQueryFunction = $this->tsQueryFunction();
        $rankingFunction = $this->rankingFunction();
        return $this->db->prepare("
            WITH matching_backlog AS (
              SELECT * FROM backlog WHERE tsv @@ $tsQueryFunction
            )
            SELECT
              ranked_messages.bufferid,
              ranked_messages.buffername,
              ranked_messages.networkname,
              ranked_messages.messageid,
              ranked_messages.type,
              ranked_messages.time,
              ranked_messages.sender,
              ts_headline(replace(replace(ranked_messages.message, '<', '&lt;'), '>', '&gt;'), query, 'HighlightAll=TRUE') AS message
            FROM
              (SELECT
                 matching_messages.*,
                 network.networkname,
                 sender.sender,
                 rank()
                 OVER (
                   PARTITION BY matching_messages.bufferid
                   ORDER BY matching_messages.rank_value DESC
                   ) AS rank,
                 first_value(rank_value)
                 OVER (
                   PARTITION BY matching_messages.bufferid
                   ORDER BY matching_messages.rank_value DESC
                   ) AS max_rank_value
               FROM
                 (SELECT
                    backlog.messageid,
                    backlog.bufferid,
                    buffer.buffername,
                    buffer.networkid,
                    backlog.senderid,
                    backlog.type,
                    backlog.time,
                    backlog.message,
                    query,
                    $rankingFunction AS rank_value
                  FROM
                    matching_backlog AS backlog
                    JOIN buffer ON backlog.bufferid = buffer.bufferid
                    , $tsQueryFunction query
                  WHERE buffer.userid = :userid
                    AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
                    AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
                    AND (:ignore_buffer::BOOLEAN OR buffer.buffername ~* :buffer)
                    AND backlog.type & 23559 > 0
                 ) matching_messages
                JOIN sender ON matching_messages.senderid = sender.senderid
                JOIN network ON matching_messages.networkid = network.networkid
                WHERE (:ignore_network::BOOLEAN OR network.networkname ~* :network)
                  AND (:ignore_sender::BOOLEAN OR sender.sender ~* :sender)
              ) ranked_messages
            WHERE ranked_messages.rank <= :limit
            ORDER BY ranked_messages.max_rank_value DESC, ranked_messages.rank_value DESC
        ");
    }

    public function findInBuffersCount(): \PDOStatement
    {
        $tsQueryFunction = $this->tsQueryFunction();
        return $this->db->prepare("
            SELECT
              backlog.bufferid,
              COUNT(*) > (:limit::INT + :offset::INT) AS hasmore
            FROM
              backlog
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN network ON buffer.networkid = network.networkid
              , $tsQueryFunction query
            WHERE buffer.userid = :userid
              AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
              AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
              AND (:ignore_buffer::BOOLEAN OR buffer.buffername ~* :buffer)
              AND (:ignore_network::BOOLEAN OR network.networkname ~* :network)
              AND (:ignore_sender::BOOLEAN OR sender.sender ~* :sender)
              AND backlog.tsv @@ query AND backlog.type & 23559 > 0
            GROUP BY backlog.bufferid;
        ");
    }

    public function findInBuffer(): \PDOStatement
    {
        $tsQueryFunction = $this->tsQueryFunction();
        $rankingFunction = $this->rankingFunction();
        return $this->db->prepare("
            WITH matching_backlog AS (
              SELECT * FROM backlog WHERE tsv @@ $tsQueryFunction
            )
            SELECT
              matching_messages.messageid,
              matching_messages.time,
              sender.sender,
              ts_headline(replace(replace(matching_messages.message, '<', '&lt;'), '>', '&gt;'), query, 'HighlightAll=TRUE') AS message
            FROM
              (SELECT
                 backlog.messageid,
                 backlog.bufferid,
                 buffer.buffername,
                 buffer.networkid,
                 backlog.senderid,
                 backlog.type,
                 backlog.time,
                 backlog.message,
                 query,
                 $rankingFunction AS rank_value
               FROM
                 matching_backlog AS backlog
                 JOIN buffer ON backlog.bufferid = buffer.bufferid
                 , $tsQueryFunction query
               WHERE buffer.userid = :userid
                 AND buffer.bufferid = :bufferid
                 AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
                 AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
                 AND backlog.type & 23559 > 0
              ) matching_messages
              JOIN sender ON matching_messages.senderid = sender.senderid
              JOIN network ON matching_messages.networkid = network.networkid
            WHERE (:ignore_sender::BOOLEAN OR sender.sender ~* :sender)
            ORDER BY matching_messages.rank_value DESC
            LIMIT :limit
            OFFSET :offset
        ");
    }

    public function findInBufferCount(): \PDOStatement
    {
        $tsQueryFunction = $this->tsQueryFunction();
        return $this->db->prepare("
            SELECT
              COUNT(*) > (:limit::INT + :offset::INT) AS hasmore
            FROM
              backlog
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN sender ON backlog.senderid = sender.senderid
              , $tsQueryFunction query
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
              AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
              AND (:ignore_sender::BOOLEAN OR sender.sender ~* :sender)
              AND backlog.tsv @@ query AND backlog.type & 23559 > 0
            GROUP BY backlog.bufferid;
        ");
    }

    public function loadAfter(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT backlog.messageid,
                   backlog.bufferid,
                   buffer.buffername,
                   sender.sender,
                   backlog.type,
                   backlog.time,
                   network.networkname,
                   backlog.message
            FROM
              backlog
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN network ON buffer.networkid = network.networkid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.messageid > :anchor
            ORDER BY backlog.messageid ASC
            LIMIT :limit;
        ");
    }

    public function loadBefore(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT * FROM (SELECT backlog.messageid,
                   backlog.bufferid,
                   buffer.buffername,
                   sender.sender,
                   backlog.type,
                   backlog.time,
                   network.networkname,
                   backlog.message
            FROM
              backlog
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN network ON buffer.networkid = network.networkid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.messageid < :anchor
            ORDER BY backlog.messageid DESC
            LIMIT :limit) t
            ORDER BY messageid ASC;
        ");
    }
}
