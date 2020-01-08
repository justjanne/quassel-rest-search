FROM k8r.eu/justjanne/php:latest

RUN apk add --no-cache --update \
    php-json \
    php-pdo_sqlite \
    php-pdo_pgsql

USER nobody

ADD . /var/www/html/