<?php

namespace QuasselRestSearch;

require_once 'Backend.php';

/*
-- Check integrity of fts
-- INSERT INTO backlog_fts(backlog_fts) VALUES('integrity-check');
-- INSERT INTO backlog_fts(backlog_fts, rank) VALUES('integrity-check', 0);
-- INSERT INTO backlog_fts(backlog_fts, rank) VALUES('integrity-check', 1);

-- Optimize fts indexes
-- INSERT INTO backlog_fts(backlog_fts) VALUES('optimize');

-- Custom rank
-- INSERT INTO backlog_fts(backlog_fts, rank) VALUES('rank', 'bm25(10.0, 5.0)');

-- Phrase search example
select rowid, * from backlog_fts where backlog_fts match 'message: jeanm*' order by rank;

-- Phrase highlight example
SELECT highlight(backlog_fts, 0, '<b>', '</b>') FROM backlog_fts WHERE backlog_fts MATCH ('message: ' || 'jeanmuch*')
*/

class SQLiteSmartBackend implements Backend
{
    private $db;
    private $options;
    private $enable_ranking;
    private $fts5_enabled;
    private $opening_tag_marker;
    private $closing_tag_marker;
    private $opening_tag;
    private $closing_tag;

    function __construct(\PDO $db, array $options, bool $enable_ranking)
    {
        $this->db = $db;
        $timeout = $options["timeout"];
        $this->db->exec("PRAGMA busy_timeout = $timeout;");
        $this->options = $options;
        $this->enable_ranking = $enable_ranking;
        $this->fts5_enabled = SQLiteSmartBackend::ensureFullTextSearchableDatabase($db);
        $this->opening_tag_marker = chr(2);
        $this->closing_tag_marker = chr(3);
        $this->opening_tag = $this->opening_tag_marker . 'b' . $this->closing_tag_marker;
        $this->closing_tag = $this->opening_tag_marker . '/b' . $this->closing_tag_marker;
    }

    private static function ensureFullTextSearchableDatabase(\PDO $db): bool
    {
        // Check fts5 is supported
        $stmt = $db->prepare("SELECT sqlite_compileoption_used('ENABLE_FTS5');");

        if (!$stmt->execute()) {
            return false;
        }

        $record = $stmt->fetch(\PDO::FETCH_NUM);

        if (!$record || (int)$record[0] !== 1) {
            return false;
        }

        // Check if the fts5 table already exists
        $stmt = $db->prepare("SELECT rowid FROM sqlite_master WHERE type='table' and name = 'backlog_fts'");

        if (!$stmt->execute()) {
            return false;
        }

        $record = $stmt->fetch(\PDO::FETCH_NUM);

        if ($record && $record[0] > 0) {
            return true;
        }

        // Create the fts5 table, its update triggers and populate the initial indexes
        try {
            $oldMode = $db->getAttribute(\PDO::ATTR_ERRMODE);

            $db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $db->beginTransaction();

            $db->exec("CREATE VIRTUAL TABLE backlog_fts USING fts5(message, content='backlog', content_rowid='messageid');");

            $db->exec("
                CREATE TRIGGER tsvectorupdate_ai AFTER INSERT ON backlog BEGIN
                    INSERT INTO backlog_fts(rowid, message) VALUES (new.messageid, new.message);
                END;
            ");

            $db->exec("
                CREATE TRIGGER tsvectorupdate_ad AFTER DELETE ON backlog BEGIN
                    INSERT INTO backlog_fts(backlog_fts, rowid, message) VALUES('delete', old.messageid, old.message);
                END;
            ");

            $db->exec("
                CREATE TRIGGER tsvectorupdate_au AFTER UPDATE ON backlog BEGIN
                    INSERT INTO backlog_fts(backlog_fts, rowid, message) VALUES('delete', old.messageid, old.message);
                    INSERT INTO backlog_fts(rowid, message) VALUES (new.messageid, new.message);
                END;
            ");

            $db->exec("INSERT INTO backlog_fts(backlog_fts) VALUES('rebuild');");

            $db->setAttribute(\PDO::ATTR_ERRMODE, $oldMode);
            $db->commit();
            return true;
        } catch (\PDOException $e) {
            $db->rollBack();
            return false;
        }
    }

    public function findUser(): \PDOStatement
    {
        return $this->db->prepare("
            SELECT *
            FROM quasseluser
            WHERE quasseluser.username = :username
        ");
    }

    private function rankingFunction(): string
    {
        // TODO: Properly port missing support of Pow in sqlite

        if ($this->enable_ranking) {
            return "(
                      (matching_backlog.rank << :weight_content) *
                      ((CASE
                        WHEN type IN (1, 4) THEN 1.0
                        WHEN type IN (2, 1024, 2048, 4096, 16384) THEN 0.8
                        WHEN type IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.6
                        WHEN type IN (8, 16, 8192, 131072) THEN 0.4
                        ELSE 0.2 END) << :weight_type) *
                      ((1 / (CAST(strftime('%s', 'now') AS INT) - (time / 1000))) << :weight_time)
                    )";
        } else {
            return "(
                      ((CASE
                        WHEN type IN (1, 4) THEN 1.0
                        WHEN type IN (2, 1024, 2048, 4096, 16384) THEN 0.8
                        WHEN type IN (32, 64, 128, 256, 512, 32768, 65536) THEN 0.6
                        WHEN type IN (8, 16, 8192, 131072) THEN 0.4
                        ELSE 0.2 END) << :weight_type) *
                      ((1 / (CAST(strftime('%s', 'now') AS INT) - (time / 1000))) << :weight_time)
                    )";
        }
    }

    public function findInBuffers(): \PDOStatement
    {
        $rankingFunction = $this->rankingFunction();
        return $this->db->prepare("
            WITH matching_backlog AS (
              SELECT rowid, snippet(backlog_fts, 0, '$this->opening_tag', '$this->closing_tag', '...', 64) AS message, rank FROM backlog_fts WHERE backlog_fts MATCH ('message: ' || :query)
            )
            SELECT
              ranked_messages.bufferid,
              ranked_messages.buffername,
              ranked_messages.networkname,
              ranked_messages.messageid,
              ranked_messages.type,
              datetime(ranked_messages.time / 1000, 'unixepoch') AS time,
              ranked_messages.sender,
              replace(replace(replace(replace(ranked_messages.message, '<', '&lt;'), '>', '&gt;'), '$this->opening_tag_marker', '<'), '$this->closing_tag_marker', '>') AS message
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
                    matching_backlog.message,
                    $rankingFunction AS rank_value
                  FROM
                    backlog
                    JOIN buffer ON backlog.bufferid = buffer.bufferid
                    JOIN matching_backlog ON backlog.messageid = matching_backlog.rowid
                  WHERE buffer.userid = :userid
                    AND (:ignore_since OR backlog.time > CAST(strftime('%s', strftime('%Y-%m-%d', :since)) AS INT) * 1000)
                    AND (:ignore_before OR backlog.time < CAST(strftime('%s', strftime('%Y-%m-%d', :before)) AS INT) * 1000)
                    AND (:ignore_buffer OR buffer.buffername LIKE '%' || :buffer || '%')
                    AND backlog.type & 23559 > 0
                 ) matching_messages
                JOIN sender ON matching_messages.senderid = sender.senderid
                JOIN network ON matching_messages.networkid = network.networkid
                WHERE (:ignore_network OR network.networkname LIKE '%' || :network || '%')
                  AND (:ignore_sender OR sender.sender LIKE '%' || :sender || '%')
              ) ranked_messages
            WHERE ranked_messages.rank <= :limit
            ORDER BY ranked_messages.max_rank_value DESC, ranked_messages.rank_value DESC;
        ");
    }

    public function findInBuffersCount(): \PDOStatement
    {
        return $this->db->prepare("
            WITH matching_backlog AS (
              SELECT rowid FROM backlog_fts WHERE backlog_fts MATCH ('message: ' || :query)
            )
            SELECT
              backlog.bufferid,
              COUNT(*) > (:limit + :offset) AS hasmore
            FROM
              backlog
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN network ON buffer.networkid = network.networkid
              JOIN matching_backlog ON backlog.messageid = matching_backlog.rowid
            WHERE buffer.userid = :userid
              AND (:ignore_since OR backlog.time > CAST(strftime('%s', strftime('%Y-%m-%d', :since)) AS INT) * 1000)
              AND (:ignore_before OR backlog.time < CAST(strftime('%s', strftime('%Y-%m-%d', :before)) AS INT) * 1000)
              AND (:ignore_buffer OR buffer.buffername LIKE '%' || :buffer || '%')
              AND (:ignore_network OR network.networkname LIKE '%' || :network || '%')
              AND (:ignore_sender OR sender.sender LIKE '%' || :sender || '%')
              AND backlog.type & 23559 > 0
            GROUP BY backlog.bufferid;
        ");
    }

    public function findInBuffer(): \PDOStatement
    {
        $rankingFunction = $this->rankingFunction();
        return $this->db->prepare("
            WITH matching_backlog AS (
              SELECT rowid, snippet(backlog_fts, 0, '$this->opening_tag', '$this->closing_tag', '...', 64) AS message, rank FROM backlog_fts WHERE backlog_fts MATCH ('message: ' || :query)
            )
            SELECT
              matching_messages.messageid,
              matching_messages.time,
              datetime(matching_messages.time / 1000, 'unixepoch') AS time,
              sender.sender,
              replace(replace(replace(replace(matching_messages.message, '<', '&lt;'), '>', '&gt;'), '$this->opening_tag_marker', '<'), '$this->closing_tag_marker', '>') AS message
            FROM
              (SELECT
                 backlog.messageid,
                 backlog.bufferid,
                 buffer.buffername,
                 buffer.networkid,
                 backlog.senderid,
                 backlog.type,
                 backlog.time,
                 matching_backlog.message,
                 $rankingFunction AS rank_value
               FROM
                 backlog
                 JOIN buffer ON backlog.bufferid = buffer.bufferid
                 JOIN matching_backlog ON backlog.messageid = matching_backlog.rowid
               WHERE buffer.userid = :userid
                 AND buffer.bufferid = :bufferid
                 AND (:ignore_since OR backlog.time > CAST(strftime('%s', strftime('%Y-%m-%d', :since)) AS INT) * 1000)
                 AND (:ignore_before OR backlog.time < CAST(strftime('%s', strftime('%Y-%m-%d', :before)) AS INT) * 1000)
                 AND backlog.type & 23559 > 0
              ) matching_messages
              JOIN sender ON matching_messages.senderid = sender.senderid
              JOIN network ON matching_messages.networkid = network.networkid
            WHERE (:ignore_sender OR sender.sender LIKE '%' || :sender || '%')
            ORDER BY matching_messages.rank_value DESC
            LIMIT :limit
            OFFSET :offset
        ");
    }

    public function findInBufferCount(): \PDOStatement
    {
        return $this->db->prepare("
            WITH matching_backlog AS (
              SELECT rowid FROM backlog_fts WHERE backlog_fts MATCH ('message: ' || :query)
            )
            SELECT
              COUNT(*) > (:limit + :offset) AS hasmore
            FROM
              backlog
              JOIN buffer ON backlog.bufferid = buffer.bufferid
              JOIN sender ON backlog.senderid = sender.senderid
              JOIN matching_backlog ON backlog.messageid = matching_backlog.rowid
            WHERE buffer.userid = :userid
              AND backlog.bufferid = :bufferid
              AND (:ignore_since OR backlog.time > CAST(strftime('%s', strftime('%Y-%m-%d', :since)) AS INT) * 1000)
              AND (:ignore_before OR backlog.time < CAST(strftime('%s', strftime('%Y-%m-%d', :before)) AS INT) * 1000)
              AND (:ignore_sender OR sender.sender LIKE '%' || :sender || '%')
              AND backlog.type & 23559 > 0
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
                   datetime(backlog.time / 1000, 'unixepoch') AS time,
                   network.networkname,
                   replace(replace(replace(backlog.message, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') AS message
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
                   datetime(backlog.time / 1000, 'unixepoch') AS time,
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
            LIMIT :limit) t
            ORDER BY messageid ASC;
        ");
    }
}
