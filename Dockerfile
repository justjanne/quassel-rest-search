FROM php:7.3-apache

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libsqlite3-dev

RUN docker-php-ext-install pdo pdo_pgsql pdo_sqlite

ADD . /var/www/html/