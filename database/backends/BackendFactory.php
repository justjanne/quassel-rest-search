<?php

namespace QuasselRestSearch;

require_once 'PostgresSmartBackend.php';
require_once 'SQLiteSmartBackend.php';

class BackendFactory
{

    public static function create(string $type, \PDO $db): Backend
    {
        switch ($type) {
            case 'pgsql-smart':
                return new PostgresSmartBackend($db);
            case 'sqlite-smart':
                return new SQLiteSmartBackend($db);
            default:
                return null;
        }
    }
}