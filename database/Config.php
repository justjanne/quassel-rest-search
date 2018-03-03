<?php

namespace QuasselRestSearch;


class Config
{
    public $database_connector;
    public $username;
    public $password;
    public $database_options;

    public $backend;

    public $path_prefix;

    public function __construct(string $path_prefix, string $database_connector, string $username, string $password, string $backend, array $options)
    {
        $this->database_connector = $database_connector;
        $this->username = $username;
        $this->password = $password;
        $this->database_options = $options;
        $this->path_prefix = $path_prefix;
        $this->backend = $backend;
    }

    public static function createFromGlobals()
    {
        $options = [];
        if (defined(qrs_db_option_tsqueryfunction) && null !== qrs_db_option_tsqueryfunction)
            $options['tsqueryfunction'] = qrs_db_option_tsqueryfunction;

        $options['timeout'] = (defined(qrs_db_option_timeout) && null !== qrs_db_option_timeout) ? qrs_db_option_timeout : 5000;

        if (defined(qrs_db_connector) && null !== qrs_db_connector)
            return new Config(qrs_path_prefix, qrs_db_connector, qrs_db_user, qrs_db_pass, qrs_backend, $options);
        else
            return new Config(qrs_path_prefix, 'pgsql:host=' . qrs_db_host . ';port=' . qrs_db_port . ';dbname=' . qrs_db_name . '', qrs_db_user, qrs_db_pass, qrs_backend, $options);
    }
}
