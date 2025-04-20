const express = require('express');
const bodyParser = require('body-parser');
const transferRoute = require('./routes/transfer');

const app = express();
app.use(bodyParser.json());

app.use('/transfer', transferRoute);
app.get('/', (req, res) => {
  res.send('ATM Metamorphic Testing API is up and running 🚀');
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
