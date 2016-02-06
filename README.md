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
