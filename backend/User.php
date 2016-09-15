<?php

namespace QuasselRestSearch;


class User {
    public $userid;
    public $username;
    public $password;
    public $hashversion;

    public function __construct(array $userArray) {
        $this->userid = $userArray['userid'];
        $this->username = $userArray['username'];
        $this->password = $userArray['password'];
        $this->hashversion = $userArray['hashversion'];
    }
}