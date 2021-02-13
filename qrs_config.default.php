<?php
// Here you should put the hostname of your postgres database
define('qrs_db_host', 'example.com');
// This is the port of your postgres database, usually it should stay at 5432
define('qrs_db_port', 5432);
// The username of the database in the postgres database
define('qrs_db_name', 'quassel');

// Only change this if you know what you are doing
define('qrs_db_connector', null);

// Username and password QRS should use to connect to your database
// (not your quassel user/pass)
define('qrs_db_user', 'quassel');
define('qrs_db_pass', 'password');

// Configure the primary language of your database here. Supported are:
// - simple (works for every language, but worse than configuring the correct language)
// - arabic
// - danish
// - dutch
// - english
// - finnish
// - french
// - german
// - hungarian
// - indonesian
// - irish
// - italian
// - lithuanian
// - nepali
// - norwegian
// - portuguese
// - romanian
// - russian
// - spanish
// - swedish
// - tamil
// - turkish
define('qrs_db_option_tsqueryfunction', "websearch_to_tsquery('english', :query)");
// Timeout in milliseconds
define('qrs_db_option_timeout', 5000);

define('qrs_backend', 'pgsql-smart');
define('qrs_enable_ranking', false);

// If you install QRS in a subfolder, put the path to the subfolder, without trailing /, here.
define('qrs_path_prefix', '');
