// Store Digital Brain — Demo App
// This is a minimal storefront backend

const express = require('express');
const app = express();
app.use(express.json());

app.get('/products', (req, res) => {
  res.json({ products: [] });
});

app.listen(3000, () => console.log('Running on port 3000'));
