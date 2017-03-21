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
    $renderer->renderJson($backend->findBuffers($_REQUEST['query'] ?: "", $_REQUEST['since'] ?: null, $_REQUEST['before'] ?: null, $_REQUEST['buffer'] ?: null, $_REQUEST['network'] ?: null));
} catch (\Exception $e) {
    $renderer->renderJson(["error" => $e->getMessage()]);
}