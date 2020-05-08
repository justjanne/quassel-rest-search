<?php
define('qrs_db_host', 'example.com');
define('qrs_db_port', 5432);
define('qrs_db_name', 'quassel');

// Only change this if you know what you are doing
define('qrs_db_connector', null);

define('qrs_db_user', 'quassel');
define('qrs_db_pass', 'password');

define('qrs_db_option_tsqueryfunction', "plainto_tsquery('english', :query)");
// Timeout in milliseconds
define('qrs_db_option_timeout', 5000);

define('qrs_backend', 'pgsql-smart');
define('qrs_enable_ranking', false);

define('qrs_path_prefix', '');
define('qrs_session_set_cookie_params', '7200');