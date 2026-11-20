#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -c "CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'rep';"
echo "host replication replicator all scram-sha-256" >> "$PGDATA/pg_hba.conf"