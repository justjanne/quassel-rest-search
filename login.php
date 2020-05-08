<?php

namespace QuasselRestSearch;

require_once 'qrs_config.php';
require_once 'database/Database.php';
require_once 'database/helper/RendererHelper.php';
require_once 'database/helper/SessionHelper.php';

$config = Config::createFromGlobals();
$session = SessionHelper::getInstance($config);
$renderer = new RendererHelper($config, $session);
$backend = Database::createFromConfig($config);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $username = $_POST['username'] ?: '';
    $password = $_POST['password'] ?: '';
    if ($backend->authenticate($username, $password)) {
        $session->username = $username;
        $session->password = $password;
        $renderer->redirect('/');
    } else {
        syslog(LOG_ERR, "Could not authenticate user " . $username);
        $renderer->redirect('/login.php', ['message' => 'login.message.error_invalid', 'type' => 'error']);
    }
} elseif (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $session->destroy();
    $renderer->redirect('/login.php', ['message' => 'login.message.success_logout', 'type' => 'info']);
} else if ($backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $renderer->redirect('/');
} else {
    $renderer->renderPage('login');
}