<?php

namespace QuasselRestSearch;


class Config {
    public $database_connector;
    public $username;
    public $password;

    public $path_prefix;

    public function __construct(string $path_prefix, string $database_connector, string $username, string $password) {
        $this->database_connector = $database_connector;
        $this->username = $username;
        $this->password = $password;
        $this->path_prefix = $path_prefix;
    }

    public static function createFromGlobals() {
        return new Config(path_prefix, 'pgsql:host=' . db_host . ';port=' . db_port . ';dbname=' . db_name . '', db_user, db_pass);
    }
}