<?php

namespace QuasselRestSearch;

require_once 'ViewHelper.php';

class RendererHelper {
    private $config;

    public function __construct(Config $config) {
        $this->config = $config;
    }

    public function renderError($e) {
        header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden');
        header('Status: 403 Forbidden');
        echo 'Error 403: Forbidden' . "\n";
        echo $e . "\n";
    }

    public function renderJsonError($json) {
        header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden');
        header('Status: 403 Forbidden');
        echo 'Error 403: Forbidden' . "\n";
        header('Content-Type: application/json');
        echo json_encode($json) . "\n";
    }

    public function renderJson($json) {
        header('Content-Type: application/json');
        echo json_encode($json) . "\n";
    }

    public function renderPage(string $template, array $vars = null) {
        $viewHelper = new ViewHelper($vars);
        $viewHelper->render($template);
    }

    public function redirect(string $page, string $flash = null) {
        header('Location: ' . $this->config->page_prefix . $page);
    }
}