FROM trafex/php-nginx:latest

USER root

RUN apk add --no-cache --update \
    php82-json \
    php82-pdo_sqlite \
    php82-pdo_pgsql

USER nobody

ADD . /var/www/html/
