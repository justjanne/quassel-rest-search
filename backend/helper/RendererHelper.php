<?php

namespace QuasselRestSearch;

require_once 'ViewHelper.php';
require_once 'TranslationHelper.php';

class RendererHelper {
    private $config;
    private $translator;
    private $sessionHelper;

    public function __construct(Config $config, SessionHelper $sessionHelper = null) {
        $this->config = $config;
        $this->translator = new TranslationHelper($config);
        $this->sessionHelper = $sessionHelper;
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

    public function renderPage(string $template, array $vars = []) {
        $translation = $this->translator->loadTranslation($this->translator->findMatchingLanguage($_SERVER['HTTP_ACCEPT_LANGUAGE']));
        $viewHelper = new ViewHelper($translation, array_merge($this->sessionHelper->vars, $vars));
        $viewHelper->render($template);
    }

    public function redirect(string $page, array $vars = []) {
        header('Location: ' . $this->config->path_prefix . $page);
        $this->sessionHelper->startSession();
        $this->sessionHelper->vars = $vars;
    }
}