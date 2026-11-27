CREATE TABLE accounts (
  id text PRIMARY KEY,
  balance int NOT NULL CHECK (balance >= 0),
  frozen boolean NOT NULL DEFAULT false
);
CREATE TABLE sagas (id text PRIMARY KEY, from_account text, to_account text, amount int, status text NOT NULL);
CREATE TABLE applied_steps (saga_id text, step text, PRIMARY KEY (saga_id, step));