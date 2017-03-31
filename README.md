# Quassel RESTSearch

This is a websearch frontend for a quassel database.

It offers both a simple HTTP API for search, and a normal website for the same purpose.

Setting up search backends
--------------------------

#### pgsql-smart

First, add a new column to the backlog table:

```sql
ALTER TABLE backlog ADD COLUMN tsv tsvector;
```

Second, add the two new indices:

```sql
CREATE INDEX backlog_tsv_idx
  ON public.backlog
  USING gin(tsv);
```

```sql
CREATE INDEX backlog_tsv_filtered_idx
  ON public.backlog
  USING gin(tsv)
  WHERE (type & 23559) > 0;
```

Third, set up a trigger to populate the `tsv` column:

```sql
CREATE TRIGGER tsvectorupdate
  BEFORE INSERT OR UPDATE
  ON public.backlog
  FOR EACH ROW
  EXECUTE PROCEDURE tsvector_update_trigger('tsv', 'pg_catalog.english', 'message');
```

Fourth, populate the `tsv` column:
```sql
UPDATE backlog SET backlog.messageid = backlog.messageid;
```

Setting up the search
---------------------

First, rename the file `qrs_config.default.php` to `qrs_config.php`.

Then configure the database access, backend (currently only `pgsql-smart` is available), and the prefix of the path.

License and Credits
-------------------

The error image is from [xiprox/ErrorView](https://github.com/xiprox/ErrorView) and under Apache2.

This project uses the "Material Icons" font from Google, available under Apache2.

The rest of this project is available under LGPLv2.1 or later.
