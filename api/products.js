const { Router } = require('express');
const {products} = require('../modules/db');

const r = new Router();
module.exports = r;

r.get('/', (req, res) => {
  res.send(products.getAllData());
});


r.post('/', (req, res) => {
  res.send(products.insert(req.body));
});
