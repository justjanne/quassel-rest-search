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
    $renderer->renderJson($backend->find($_REQUEST['query'] ?: "", $_REQUEST['since'] ?: null, $_REQUEST['before'] ?: null, $_REQUEST['buffer'] ?: null, $_REQUEST['network'] ?: null, $_REQUEST['sender'] ?: null, $_REQUEST['limit'] ?: null));
} catch (\Exception $e) {
    $renderer->renderJson(["error" => $e->getMessage()]);
}