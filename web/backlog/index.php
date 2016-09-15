<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../backend/Database.php';
require_once '../../backend/helper/RendererHelper.php';
require_once '../../backend/helper/SessionHelper.php';

$session = SessionHelper::getInstance();
$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Backend::createFromConfig($config);

if (!$backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $session->destroy();
    $renderer->renderJsonError(false);
} else {
    syslog(LOG_INFO, json_encode($_GET));
    $renderer->renderJson($backend->context($_GET['anchor'] ?: 0, $_GET['buffer'] ?: 0, $_GET['before'], $_GET['after']));
}