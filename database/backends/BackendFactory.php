<?php

namespace QuasselRestSearch;

require_once 'PostgresSmartBackend.php';
require_once 'SQLiteSmartBackend.php';

class BackendFactory
{

    public static function create(string $type, \PDO $db, array $options): Backend
    {
        switch ($type) {
            case 'pgsql-smart':
                return new PostgresSmartBackend($db, $options);
            case 'sqlite-smart':
                return new SQLiteSmartBackend($db, $options);
            default:
                return null;
        }
    }
}