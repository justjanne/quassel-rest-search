<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../backend/Database.php';
require_once '../../backend/helper/RendererHelper.php';
require_once '../../backend/helper/SessionHelper.php';

$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Database::createFromConfig($config);

try {
    $backend->authenticateFromHeader($_SERVER['HTTP_AUTHORIZATION'] ?: "");
    $renderer->renderJson($backend->findInBufferMultiple($_REQUEST['q'] ?: "", $_REQUEST['since'] ?: null, $_REQUEST['before'] ?: null, $_REQUEST['limit'] ?: 4));
} catch (\Exception $e) {
    $renderer->renderJson(["error" => $e->getMessage()]);
}