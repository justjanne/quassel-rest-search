# quassel-rest-search

This is just a simple Proof-of-Concept, don’t use it in production yet.

How to use
----------

First, you have to have PostgreSQL

Second, create an index over your messages column like

```sql
CREATE INDEX backlog_idx ON backlog USING gin(to_tsvector('simple', message));
```

Third, install this and set it up via config.ini

The error image is from [xiprox/ErrorView](https://github.com/xiprox/ErrorView) and under Apache2.

The rest of this project is available under LGPLv2.1 or later.
