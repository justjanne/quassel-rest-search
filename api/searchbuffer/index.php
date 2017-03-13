<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../backend/Database.php';
require_once '../../backend/helper/RendererHelper.php';
require_once '../../backend/helper/SessionHelper.php';

$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Backend::createFromConfig($config);

try {
    $backend->authenticateFromHeader($_SERVER['HTTP_AUTHORIZATION'] ?: "");
    $renderer->renderJson($backend->findInBuffer($_GET['query'] ?: "", $_GET['since'] ?: null, $_GET['before'] ?: null, $_GET['buffer'] ?: 0, $_GET['offset'] ?: 0, $_GET['limit'] ?: 20));
} catch (\Exception $e) {
    $renderer->renderJson(["error" => $e->getMessage()]);
}