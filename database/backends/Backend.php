<?php

namespace QuasselRestSearch;

interface Backend
{
    public function findUser(): \PDOStatement;

    public function findInBuffers(): \PDOStatement;

    public function findInBuffersCount(): \PDOStatement;

    public function findInBuffer(): \PDOStatement;

    public function findInBufferCount(): \PDOStatement;

    public function loadAfter(): \PDOStatement;

    public function loadBefore(): \PDOStatement;
}