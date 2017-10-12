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
              tmp.bufferid,
              tmp.buffername,
              network.networkname,
              tmp.messageid,
              sender.sender,
              tmp.time,
              replace(replace(tmp.message, '<', '&lt;'), '>', '&gt;') AS message,
              ts_headline(replace(replace(tmp.message, '<', '&lt;'), '>', '&gt;'), query) AS preview
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
                 rank() OVER (
                   PARTITION BY backlog.bufferid
                   ORDER BY (
                     (ts_rank(tsv, query, :config_normalization) ^ :weight_content) *
                     ((CASE
                       WHEN type IN (1, 4) THEN 1.0
                       WHEN type IN (2, 1024, 2048, 4096, 16384) THEN 0.75
                       WHEN type IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.5
                       WHEN type IN (8, 16, 8192, 131072) THEN 0.25
                       ELSE 0.1 END) ^ :weight_type) *
                     ((EXTRACT(EPOCH FROM time) / EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)) ^ :weight_time)
                   ) DESC
                 ) AS rank
               FROM backlog
               JOIN buffer ON backlog.bufferid = buffer.bufferid,
                 phraseto_tsquery_multilang(:query) query
               WHERE buffer.userid = :userid
                 AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
                 AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
                 AND (:ignore_buffer::BOOLEAN OR buffer.buffername ~* :buffer)
                 AND backlog.tsv @@ query AND backlog.type & 23559 > 0
              ) tmp
              JOIN sender ON tmp.senderid = sender.senderid
              JOIN network ON tmp.networkid = network.networkid
            WHERE tmp.rank <= :limit
              AND (:ignore_network::BOOLEAN OR network.networkname ~* :network)
              AND (:ignore_sender::BOOLEAN OR sender.sender ~* :sender);
        ");
    }

    public function findInBuffersCount(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT
              backlog.bufferid,
              COUNT(backlog.messageid) > (:limit::INT + :offset::INT) AS hasmore
            FROM backlog
            JOIN buffer ON backlog.bufferid = buffer.bufferid
            JOIN sender ON backlog.senderid = sender.senderid
            JOIN network ON buffer.networkid = network.networkid,
              phraseto_tsquery_multilang(:query) query
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
              tmp.bufferid,
              tmp.messageid,
              sender.sender,
              tmp.time,
              replace(replace(tmp.message, '<', '&lt;'), '>', '&gt;') AS message,
              ts_headline(replace(replace(tmp.message, '<', '&lt;'), '>', '&gt;'), query) AS preview
            FROM
              (SELECT
                 backlog.messageid,
                 backlog.bufferid,
                 backlog.senderid,
                 backlog.time,
                 backlog.message,
                 query
               FROM backlog
               JOIN buffer ON backlog.bufferid = buffer.bufferid,
                 phraseto_tsquery_multilang(:query) query
               WHERE buffer.userid = :userid
                 AND backlog.bufferid = :bufferid
                 AND (:ignore_since::BOOLEAN OR backlog.time > :since::TIMESTAMP)
                 AND (:ignore_before::BOOLEAN OR backlog.time < :before::TIMESTAMP)
                 AND backlog.tsv @@ query AND backlog.type & 23559 > 0
               ORDER BY (
                 (ts_rank(tsv, query, :config_normalization) ^ :weight_content) *
                 ((CASE
                   WHEN type IN (1, 4) THEN 1.0
                   WHEN type IN (2, 1024, 2048, 4096, 16384) THEN 0.75
                   WHEN type IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.5
                   WHEN type IN (8, 16, 8192, 131072) THEN 0.25
                   ELSE 0.1 END) ^ :weight_type) *
                 ((EXTRACT(EPOCH FROM time) / EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)) ^ :weight_time)
               ) DESC
              ) tmp
              JOIN sender ON tmp.senderid = sender.senderid
              WHERE (:ignore_sender::BOOLEAN OR sender.sender ~* :sender)
            LIMIT :limit
            OFFSET :offset;
        ");
    }

    public function findInBufferCount(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT
              backlog.bufferid,
              COUNT(backlog.messageid) > (:limit::INT + :offset::INT) AS hasmore
            FROM backlog
            JOIN buffer ON backlog.bufferid = buffer.bufferid
            JOIN sender ON backlog.senderid = sender.senderid,
              phraseto_tsquery_multilang(:query) query
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
    }
}
