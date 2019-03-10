const { Router } = require('express');
const Datastore = require('nedb');

const products = new Datastore({ filename: path.join(__dirname, '..', 'db', 'products.db'), autoload: true });
const path = require('path');

const r = new Router();
module.exports = r;

r.get('/', (req, res) => {
  res.send(products.getAllData());
});


r.post('/', (req, res) => {
  res.send(products.insert(req.body));
});
