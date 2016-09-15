<?php

namespace QuasselRestSearch;

require_once 'qrs_config.php';
require_once 'backend/Database.php';
require_once 'backend/helper/RendererHelper.php';
require_once 'backend/helper/SessionHelper.php';

$session = SessionHelper::getInstance();
$config = Config::createFromGlobals();
$renderer = new RendererHelper($config);
$backend = Backend::createFromConfig($config);

if (!$backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $session->destroy();
    $renderer->redirect('/login.php');
} else {
    $renderer->renderPage('search', ['username' => $session->username]);
}