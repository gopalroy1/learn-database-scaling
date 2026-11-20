# learn-database-scaling

Hands-on experiments for learning how to scale PostgreSQL.

## Contents

- `q.sql` — scratch queries / pgbench scripts used for load testing.
- `replication/` — Docker Compose setup with one primary and two streaming replicas (`replica2` runs with a 5s `recovery_min_apply_delay` to observe replication lag).

## Replication quick start

```sh
cd replication
docker compose up -d
# primary: localhost:5440, replicas: localhost:5441, localhost:5442
```

Credentials are local-dev only (`postgres` / `pass`, `replicator` / `rep`).
