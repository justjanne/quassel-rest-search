<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../backend/Database.php';
require_once '../../backend/helper/RendererHelper.php';
require_once '../../backend/helper/SessionHelper.php';

$session = SessionHelper::getInstance();
$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Database::createFromConfig($config);

if (!$backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $session->destroy();
    $renderer->renderJsonError(false);
} else {
    $renderer->renderJson($backend->find($_REQUEST['query'] ?: "", $_REQUEST['since'] ?: null, $_REQUEST['before'] ?: null, $_REQUEST['buffer'] ?: null, $_REQUEST['network'] ?: null, 4));
}