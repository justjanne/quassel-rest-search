<?php

namespace QuasselRestSearch;

require_once '../../qrs_config.php';
require_once '../../database/Database.php';
require_once '../../database/helper/RendererHelper.php';
require_once '../../database/helper/SessionHelper.php';

$config = Config::createFromGlobals();
$session = SessionHelper::getInstance($config);
$renderer = new RendererHelper($config);
$backend = Database::createFromConfig($config);

function param(string $key, $default = null)
{
    return array_key_exists($key, $_REQUEST) ? ($_REQUEST[$key] !== "" ? $_REQUEST[$key] : $default) : $default;
}

if (!$backend->authenticate($session->username ?: '', $session->password ?: '')) {
    $session->destroy();
    $renderer->renderJsonError(false);
} else {
    $renderer->renderJson($backend->find(
        param('query', ""),
        param('since'),
        param('before'),
        param('buffer'),
        param('network'),
        param('sender'),
        param('limit', 4)
    ));
}