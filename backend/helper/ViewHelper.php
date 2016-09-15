<?php

namespace QuasselRestSearch;

class ViewHelper {
    protected $template_dir;
    protected $vars = [];

    public function __construct($vars = null) {
        $this->setPath('../../templates/');
        if ($vars !== null) {
            $this->vars = $vars;
        }
    }

    public function setPath(string $path) {
        $this->template_dir = realpath(dirname(__FILE__) . '/' . $path);
    }

    public function render($template_file) {
        $path = $this->template_dir . '/' . $template_file . '.phtml';
        if (file_exists($path)) {
            include $path;
        } else {
            throw new \Exception('Template ' . $path . ' not found ');
        }
    }

    public function __get($name) {
        return $this->vars[$name];
    }

    public function __set($name, $value) {
        $this->vars[$name] = $value;
    }
}