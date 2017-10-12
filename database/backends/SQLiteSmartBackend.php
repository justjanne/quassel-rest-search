<?php

namespace QuasselRestSearch;

require_once 'Backend.php';

class SQLiteSmartBackend implements Backend
{
    private $db;

    function __construct(\PDO $db)
    {
        $this->db = $db;
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
        // TODO: Implement findInBuffers() method.
    }

    public function findInBuffersCount(): \PDOStatement
    {
        // TODO: Implement findInBuffersCount() method.
    }

    public function findInBuffer(): \PDOStatement
    {
        // TODO: Implement findInBuffer() method.
    }

    public function findInBufferCount(): \PDOStatement
    {
        // TODO: Implement findInBufferCount() method.
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