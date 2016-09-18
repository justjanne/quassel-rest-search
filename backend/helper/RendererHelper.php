<?php

namespace QuasselRestSearch;

require_once 'ViewHelper.php';
require_once 'TranslationHelper.php';

class RendererHelper {
    private $config;
    private $translator;

    public function __construct(Config $config) {
        $this->config = $config;
        $this->translator = new TranslationHelper($config);
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
        header('Content-Type: application/json');
        echo json_encode($json) . "\n";
    }

    public function renderJson($json) {
        header('Content-Type: application/json');
        echo json_encode($json) . "\n";
    }

    public function renderPage(string $template, array $vars = null) {
        $translation = $this->translator->loadTranslation($this->translator->findMatchingLanguage($_SERVER['HTTP_ACCEPT_LANGUAGE']));
        $viewHelper = new ViewHelper($translation, $vars);
        $viewHelper->render($template);
    }

    public function redirect(string $page, string $flash = null) {
        header('Location: ' . $this->config->path_prefix . $page);
    }
}