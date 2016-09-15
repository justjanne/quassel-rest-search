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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'login') {
    $username = $_POST['username'] ?: '';
    $password = $_POST['password'] ?: '';
    if ($backend->authenticate($username, $password)) {
        $session->username = $username;
        $session->password = $password;
        $renderer->redirect('/');
    }
} elseif ($_GET['action'] === 'logout') {
    $session->destroy();
    $renderer->redirect('/login.php');
} else if ($backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $renderer->redirect('/');
} else {
    $renderer->renderPage('login');
}