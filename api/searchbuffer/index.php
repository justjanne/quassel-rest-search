<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../database/Database.php';
require_once '../../database/helper/RendererHelper.php';

$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Database::createFromConfig($config);

try {
    $backend->authenticateFromHeader($_SERVER['HTTP_AUTHORIZATION'] ?: "");
    $renderer->renderJson($backend->findInBuffer($_REQUEST['query'] ?: "", $_REQUEST['since'] ?: null, $_REQUEST['before'] ?: null, $_REQUEST['buffer'] ?: 0, $_REQUEST['offset'] ?: 0, $_REQUEST['limit'] ?: 20));
} catch (\Exception $e) {
    $renderer->renderJson(["error" => $e->getMessage()]);
}