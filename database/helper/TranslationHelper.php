<?php

namespace QuasselRestSearch;

class TranslationHelper
{
    protected $template_dir;

    public function __construct($translation)
    {
        $this->setPath('../../translations/');
    }

    public function setPath(string $path)
    {
        $this->template_dir = realpath(dirname(__FILE__) . '/' . $path);
    }

    public function findMatchingLanguage(string $language_str): string
    {
        $languages = explode(",", $language_str);
        foreach ($languages as $language) {
            $language = explode(";", $language)[0];
            if ($this->exists($language)) {
                return $language;
            }
        }
        return "en";
    }

    public function exists($language): bool
    {
        return file_exists($this->path($language));
    }

    private function path($language): string
    {
        return $this->template_dir . '/' . $language . '.json';
    }

    public function loadTranslation($language): array
    {
        return json_decode(file_get_contents($this->path($language)), true);
    }
}