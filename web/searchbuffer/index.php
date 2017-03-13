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
    $renderer->renderJson($backend->findInBuffer($_GET['query'] ?: "", $_GET['since'] ?: null, $_GET['before'] ?: null, $_GET['buffer'] ?: 0, $_GET['offset'] ?: 0, $_GET['limit'] ?: 20));
}