<?php

namespace QuasselRestSearch;


class Config
{
    public $database_connector;
    public $username;
    public $password;
    public $database_options;

    public $backend;
    public $enable_ranking;

    public $path_prefix;

    public $session_set_cookie_params;

    public function __construct(string $path_prefix, string $database_connector, string $username, string $password, string $backend, array $options, bool $enable_ranking, string $session_set_cookie_params)
    {
        $this->database_connector = $database_connector;
        $this->username = $username;
        $this->password = $password;
        $this->path_prefix = $path_prefix;
        $this->backend = $backend;
        $this->database_options = $options;
        $this->enable_ranking = $enable_ranking;
        $this->session_set_cookie_params = $session_set_cookie_params;
    }

    public static function createFromGlobals()
    {
        $options = [];
        if (defined('qrs_db_option_tsqueryfunction') && (null !== qrs_db_option_tsqueryfunction)) {
            $options['tsqueryfunction'] = qrs_db_option_tsqueryfunction;
        }

        $options['timeout'] = (defined('qrs_db_option_timeout') && (null !== qrs_db_option_timeout)) ? qrs_db_option_timeout : 5000;

        if (defined('qrs_db_connector') && null !== qrs_db_connector)
            return new Config(qrs_path_prefix, qrs_db_connector, qrs_db_user, qrs_db_pass, qrs_backend, $options, qrs_enable_ranking, qrs_session_set_cookie_params);
        else
            return new Config(qrs_path_prefix, 'pgsql:host=' . qrs_db_host . ';port=' . qrs_db_port . ';dbname=' . qrs_db_name . '', qrs_db_user, qrs_db_pass, qrs_backend, $options, qrs_enable_ranking, qrs_session_set_cookie_params);
    }
}
