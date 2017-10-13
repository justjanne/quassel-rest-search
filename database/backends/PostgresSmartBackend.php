<?php

namespace QuasselRestSearch;

require_once 'Backend.php';

class PostgresSmartBackend implements Backend
{
    private $db;

    function __construct(\PDO $db)
    {
        $this->db = $db;
        $this->db->exec("SET statement_timeout = 5000;");
    }

    public function findUser(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT *
            FROM quasseluser
            WHERE quasseluser.username = :username
        ");
    }

    public function findInBuffers(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT
              ranked_messages.bufferid,
              ranked_messages.buffername,
              network.networkname,
              ranked_messages.messageid,
              ranked_messages.time,
              sender.sender,
              ts_headline(replace(replace(ranked_messages.message, '<', '&lt;'), '>', '&gt;'), query, 'HighlightAll=TRUE') AS message
            FROM
              (SELECT
                 matching_messages.*,
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
                    backlog.time,
                    backlog.message,
                    query,
                    (
                      (ts_rank(tsv, query, :config_normalization) ^ :weight_content) *
                      ((CASE
                        WHEN TYPE IN (1, 4) THEN 1.0
                        WHEN TYPE IN (2, 1024, 2048, 4096, 16384) THEN 0.75
                        WHEN TYPE IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.5
                        WHEN TYPE IN (8, 16, 8192, 131072) THEN 0.25
                        ELSE 0.1 END) ^ :weight_type) *
                      ((EXTRACT(EPOCH FROM TIME) / EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)) ^ :weight_time)
                    ) AS rank_value
                  FROM
                    backlog
                    JOIN buffer ON backlog.bufferid = buffer.bufferid
                    , phraseto_tsquery_multilang(:query) query
                  WHERE buffer.userid = :userid
                    AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
                    AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
                    AND (:ignore_buffer::BOOLEAN OR buffer.buffername ~* :buffer)
                    AND backlog.type & 23559 > 0
                    AND backlog.tsv @@ query
                 ) matching_messages
              ) ranked_messages
              JOIN sender ON ranked_messages.senderid = sender.senderid
              JOIN network ON ranked_messages.networkid = network.networkid
            WHERE ranked_messages.rank <= :limit
              AND (:ignore_network::BOOLEAN OR network.networkname ~* :network)
              AND (:ignore_sender::BOOLEAN OR sender.sender ~* :sender)
            ORDER BY ranked_messages.max_rank_value DESC, ranked_messages.rank_value DESC
        ");
    }

    public function findInBuffersCount(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT
              backlog.bufferid,
              COUNT(*) > (:limit::INT + :offset::INT) AS hasmore
            FROM
              backlog
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN network ON buffer.networkid = network.networkid
              , phraseto_tsquery_multilang(:query) query
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
        return $this->db->prepare("
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
                 backlog.time,
                 backlog.message,
                 query,
                 (
                   (ts_rank(tsv, query, :config_normalization) ^ :weight_content) *
                   ((CASE
                     WHEN TYPE IN (1, 4) THEN 1.0
                     WHEN TYPE IN (2, 1024, 2048, 4096, 16384) THEN 0.75
                     WHEN TYPE IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.5
                     WHEN TYPE IN (8, 16, 8192, 131072) THEN 0.25
                     ELSE 0.1 END) ^ :weight_type) *
                   ((EXTRACT(EPOCH FROM TIME) / EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)) ^ :weight_time)
                 ) AS rank_value
               FROM
                 backlog
                 JOIN buffer ON backlog.bufferid = buffer.bufferid
                 , phraseto_tsquery_multilang(:query) query
               WHERE buffer.userid = :userid
                 AND buffer.bufferid = :bufferid
                 AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
                 AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
                 AND backlog.type & 23559 > 0
                 AND backlog.tsv @@ query
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
        return $this->db->prepare("
            SELECT
              COUNT(*) > (:limit::INT + :offset::INT) AS hasmore
            FROM
              backlog
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN sender ON backlog.senderid = sender.senderid
              , phraseto_tsquery_multilang(:query) query
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
                   backlog.time,
                   network.networkname,
                   replace(replace(replace(backlog.message, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') AS message
            FROM
              backlog
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN network ON buffer.networkid = network.networkid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.messageid >= :anchor
            ORDER BY backlog.messageid ASC
            LIMIT :limit;
        ");
    }

    public function loadBefore(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT backlog.messageid,
                   backlog.bufferid,
                   buffer.buffername,
                   sender.sender,
                   backlog.time,
                   network.networkname,
                   replace(replace(replace(backlog.message, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') AS message
            FROM
              backlog
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN network ON buffer.networkid = network.networkid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND backlog.messageid < :anchor
            ORDER BY backlog.messageid DESC
            LIMIT :limit;
        ");
    }
}
