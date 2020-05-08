<?php

namespace QuasselRestSearch;

class SessionHelper
{
    const SESSION_STARTED = TRUE;
    const SESSION_NOT_STARTED = FALSE;
    private static $instance;
    private $sessionState = self::SESSION_NOT_STARTED;
    private $config;

    private function __construct(Config $config)
    {
        $this->config = $config;
        ini_set('session.gc_maxlifetime', 7200);
        session_set_cookie_params($this->config->session_set_cookie_params);
    }


    public static function getInstance(Config $config): SessionHelper
    {
        if (!isset(self::$instance)) {
            self::$instance = new self($config);
        }

        self::$instance->startSession();

        return self::$instance;
    }


    public function startSession(): bool
    {
        if ($this->sessionState == self::SESSION_NOT_STARTED) {
            $this->sessionState = session_start();
        }

        return $this->sessionState;
    }

    public function __get(string $name)
    {
        if (isset($_SESSION[$name])) {
            return $_SESSION[$name];
        } else {
            return null;
        }
    }

    public function __set(string $name, $value)
    {
        $_SESSION[$name] = $value;
    }

    public function __isset(string $name): bool
    {
        return isset($_SESSION[$name]);
    }


    public function __unset(string $name)
    {
        unset($_SESSION[$name]);
    }


    public function destroy(): bool
    {
        if ($this->sessionState == self::SESSION_STARTED) {
            $this->sessionState = !session_destroy();
            unset($_SESSION);

            return !$this->sessionState;
        }

        return !$this->sessionState;
    }
}