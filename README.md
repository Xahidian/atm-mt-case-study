# 💸 ATM Metamorphic Testing Case Study

By **MD Zahid**

Recreation of the case study from:

> **Metamorphic Testing for Web Services: A Case Study**  
> *Chang-ai Sun, Guan Wang, Baohong Mu, Huai Liu, ZhaoShun Wang, T.Y. Chen *  
> [ISSRE 2011](https://ieeexplore.ieee.org/document/6009400)

---

## 🎯 Purpose

This project evaluates **Metamorphic Testing (MT)** applied to a simplified ATM transfer API and compares it to **Functional Testing** using mutation analysis.

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Testing**: Playwright
- **Mutation Testing**: StrykerJS

---

## 🚀 Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/atm-mt-case-study.git
cd atm-mt-case-study

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Set up SQLite database
sqlite3 db/accounts.db < db/schema.sql

# Start the server (runs on http://localhost:3000)
node src/app.js
```

---

## ✅ Run Tests

### Functional Tests
```bash
npx playwright test test/functional/functional_test.spec.js
```

### MR-Based Tests
```bash
npx playwright test test/playwright/mr_test.spec.js
```

---

## 🧪 Mutation Testing

### Functional Test Mutation Analysis
```bash
cp stryker.functional.conf.js stryker.conf.js
npx stryker run
```

### MR-Based Test Mutation Analysis
```bash
cp stryker.mr.conf.js stryker.conf.js
npx stryker run
```

---

## 📊 Mutation Score Summary

| Test Suite      | Mutation Score | Mutants Killed |
|-----------------|----------------|----------------|
| Functional      | 0%             | 0/46           |
| MR-Based        | 8.7%           | 4/46           |

> **Insight**: MR tests detected faults missed by functional tests, demonstrating their advantage in oracle-limited environments.

---

## 🔁 Metamorphic Relations Implemented

- **MR1**: Double transfer → double delta
- **MR2**: Reverse transfer → minimal net change
- **MR3**: Split transfer ≈ combined
- **MR4**: Zero transfer → zero delta
- **MR5**: Fee consistency for same type
- **MR6**: Transfer to self → no effect

---

## 🧾 Automate Everything

You can run the entire setup with:
```bash
./command.sh
```
This script installs dependencies, resets the database, runs all tests, and performs mutation analysis.

---

## 📁 Folder Structure

```
📦 atm-mt-case-study
├── 📂 src
│   ├── app.js
│   ├── logic/commission.js
│   └── routes/transfer.js
├── 📂 db
│   └── schema.sql
├── 📂 test
│   ├── 📂 functional
│   │   └── functional_test.spec.js
│   ├── 📂 playwright
│   │   └── mr_test.spec.js
│   └── 📂 mrs
│       └── mr1.js ... mr6.js
├── stryker.functional.conf.js
├── stryker.mr.conf.js
├── command.sh
└── README.md
```

---

## 📜 License

MIT — free to use and modify for academic or educational purposes.

---

## 🙌 Acknowledgments

## 🙌 Acknowledgments

This work is based on the paper *"Metamorphic Testing for Web Services: A Case Study"* presented at ISSRE 2011. This project modernizes the original case study using REST APIs, Playwright, and StrykerJS for practical and educational purposes.


---



