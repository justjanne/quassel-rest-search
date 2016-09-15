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
    $renderer->renderJson($backend->context($_GET['anchor'] ?: 0, $_GET['buffer'] ?: 0, $_GET['before'], $_GET['after']));
} catch (\Exception $e) {
    $renderer->renderError($e);
}