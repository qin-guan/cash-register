CREATE TABLE users_dg_tmp
(
    id       text NOT NULL
        PRIMARY KEY,
    name     text,
    username text NOT NULL
);
--> statement-breakpoint
INSERT INTO users_dg_tmp(id, name, username)
SELECT id, name, username
FROM users;
--> statement-breakpoint
DROP TABLE users;
--> statement-breakpoint
ALTER TABLE users_dg_tmp
    RENAME TO users;
--> statement-breakpoint
CREATE UNIQUE INDEX users_username_unique
    ON users (username);
