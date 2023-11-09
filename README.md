# Quassel RESTSearch

This is a websearch frontend for a quassel database.

It offers both a simple HTTP API for search, and a normal website for the same purpose.

Setting up search backends
--------------------------

#### pgsql-smart

##### Using stored generated columns (PostgreSQL 12 or later)

First, add a new column to the backlog table:

```sql
ALTER TABLE backlog ADD COLUMN tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', message)) STORED;
```

Second, add the two new indices:

```sql
CREATE INDEX backlog_tsv_idx
  ON backlog
  USING gin(tsv);
```

```sql
CREATE INDEX backlog_tsv_filtered_idx
  ON backlog
  USING gin(tsv)
  WHERE (type & 23559) > 0;
```

##### Older versions

First, add a new column to the backlog table:

```sql
ALTER TABLE backlog ADD COLUMN tsv tsvector;
```

Second, add the two new indices:

```sql
CREATE INDEX backlog_tsv_idx
  ON backlog
  USING gin(tsv);
```

```sql
CREATE INDEX backlog_tsv_filtered_idx
  ON backlog
  USING gin(tsv)
  WHERE (type & 23559) > 0;
```

Third, set up a trigger to populate the `tsv` column:

```sql
CREATE TRIGGER tsvectorupdate
  BEFORE INSERT OR UPDATE
  ON backlog
  FOR EACH ROW
  EXECUTE PROCEDURE tsvector_update_trigger('tsv', 'pg_catalog.english', 'message');
```

Fourth, populate the `tsv` column:
```sql
UPDATE backlog
SET messageid = messageid;
```

Setting up the search
---------------------

First, copy the file `qrs_config.default.php` to `qrs_config.php`.

Then configure the database access, backend (currently only `pgsql-smart` is available), and the prefix of the path.

Your qrs_config.php should look something like this

```injectablephp
<?php
// Here you should put the hostname of your postgres database
define('qrs_db_host', 'example.com');
// This is the port of your postgres database, usually it should stay at 5432
define('qrs_db_port', 5432);
// The username of the database in the postgres database
define('qrs_db_name', 'quassel');

// Only change this if you know what you are doing
define('qrs_db_connector', null);

// Username and password QRS should use to connect to your database
// (not your quassel user/pass)
define('qrs_db_user', 'quassel');
define('qrs_db_pass', 'password');

// Configure the primary language of your database here. Supported are:
// - simple (works for every language, but worse than configuring the correct language)
// - arabic
// - danish
// - dutch
// - english
// - finnish
// - french
// - german
// - hungarian
// - indonesian
// - irish
// - italian
// - lithuanian
// - nepali
// - norwegian
// - portuguese
// - romanian
// - russian
// - spanish
// - swedish
// - tamil
// - turkish
define('qrs_db_option_tsqueryfunction', "websearch_to_tsquery('english', :query)");
// Timeout in milliseconds
define('qrs_db_option_timeout', 5000);

define('qrs_backend', 'pgsql-smart');
define('qrs_enable_ranking', false);

// If you install QRS in a subfolder, put the path to the subfolder, without trailing /, here.
define('qrs_path_prefix', '');
```

Development
-----------

Please install the required libraries for development with `npm install`

Before every commit, git will automatically run `npm run jsx`, but you can do so yourself during testing. The project
uses `nativejsx`

License and Credits
-------------------

The error image is from [xiprox/ErrorView](https://github.com/xiprox/ErrorView) and under Apache2.

This project uses the "Material Icons" font from Google, available under Apache2.

The rest of this project is available under LGPLv2.1 or later.
