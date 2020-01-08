<?php

namespace QuasselRestSearch;

require_once 'PostgresSmartBackend.php';
require_once 'SQLiteSmartBackend.php';

class BackendFactory
{

    public static function create(string $type, \PDO $db, array $options, $enable_ranking): Backend
    {
        switch ($type) {
            case 'pgsql-smart':
                return new PostgresSmartBackend($db, $options, $enable_ranking);
            case 'sqlite-smart':
                return new SQLiteSmartBackend($db, $options, $enable_ranking);
            default:
                return null;
        }
    }
}