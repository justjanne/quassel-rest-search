<?php

namespace QuasselRestSearch;


class Config {
    public $database_connector;
    public $username;
    public $password;

    public $page_prefix;

    public function __construct(string $page_prefix, string $database_connector, string $username, string $password) {
        $this->database_connector = $database_connector;
        $this->username = $username;
        $this->password = $password;
        $this->page_prefix = $page_prefix;
    }

    public static function createFromGlobals() {
        return new Config(page_prefix, 'pgsql:host=' . db_host . ';port=' . db_port . ';dbname=' . db_name . '', db_user, db_pass);
    }
}