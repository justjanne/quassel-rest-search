<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../database/Database.php';
require_once '../../database/helper/RendererHelper.php';
require_once '../../database/helper/SessionHelper.php';

$session = SessionHelper::getInstance();
$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Database::createFromConfig($config);

if (!$backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $session->destroy();
    $renderer->renderJsonError(false);
} else {
    syslog(LOG_INFO, json_encode($_GET));
    $renderer->renderJson($backend->context($_REQUEST['anchor'] ?: 0, $_REQUEST['buffer'] ?: 0, $_REQUEST['before'], $_REQUEST['after']));
}