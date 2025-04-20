DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
    account_number INTEGER PRIMARY KEY,
    balance REAL,
    bank TEXT,
    city TEXT
);

INSERT INTO accounts VALUES (1000000000, 20000, 'BankA', 'City1');
INSERT INTO accounts VALUES (2000000000, 5000, 'BankB', 'City2');
