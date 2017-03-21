<?php

namespace QuasselRestSearch;

require_once 'qrs_config.php';
require_once 'backend/Database.php';
require_once 'backend/helper/RendererHelper.php';
require_once 'backend/helper/SessionHelper.php';

$session = SessionHelper::getInstance();
$config = Config::createFromGlobals();
$renderer = new RendererHelper($config, $session);
$backend = Database::createFromConfig($config);

if (!$backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $session->destroy();
    $renderer->redirect('/login.php', ['message' => 'login.message.error_unauthed', 'type' => 'error']);
} else {
    $renderer->renderPage('search', ['username' => $session->username]);
}