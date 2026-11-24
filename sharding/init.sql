CREATE TABLE users (id bigint PRIMARY KEY, name text, score int);
CREATE TABLE notes (id serial PRIMARY KEY, body text);   -- only for the id-clash demo