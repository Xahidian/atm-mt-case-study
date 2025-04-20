const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const { getTransferType, calculateFee } = require('../logic/commission');

const db = new sqlite3.Database('./db/accounts.db');

router.post('/', (req, res) => {
  const { A, B, M } = req.body;

  db.serialize(() => {
    db.get("SELECT * FROM accounts WHERE account_number = ?", [A], (err1, sender) => {
      db.get("SELECT * FROM accounts WHERE account_number = ?", [B], (err2, recipient) => {
        if (!sender || !recipient) return res.status(404).send("Account not found");

        const type = getTransferType(sender, recipient);
        const fee = calculateFee(type, M);
        const total = M + fee;

        if (sender.balance < total) return res.status(400).send("Insufficient balance");

        const newSenderBalance = sender.balance - total;
        const newRecipientBalance = recipient.balance + M;

        db.run("UPDATE accounts SET balance = ? WHERE account_number = ?", [newSenderBalance, A]);
        db.run("UPDATE accounts SET balance = ? WHERE account_number = ?", [newRecipientBalance, B]);

        res.json({
          deltaA: total,
          deltaB: M,
          fee,
          type
        });
      });
    });
  });
});
// Reset DB: set balances and ensure test accounts exist
router.post('/reset-db', (req, res) => {
  const resetAccounts = [
    { id: 1000000000, balance: 5000, bank: 'BankA', city: 'City1' },
    { id: 2000000000, balance: 5000, bank: 'BankB', city: 'City2' },
    { id: 3000000000, balance: 5000, bank: 'BankC', city: 'City3' },
  ];

  db.serialize(() => {
    resetAccounts.forEach(({ id, balance, bank, city }) => {
      db.run(`
        INSERT INTO accounts (account_number, balance, bank, city)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(account_number) DO UPDATE SET balance = excluded.balance;
      `, [id, balance, bank, city]);
    });

    res.send("Database reset: test accounts ensured and balances restored");
  });
});

module.exports = router;
