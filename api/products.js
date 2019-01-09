const { Router } = require('express')
const Datastore = require('nedb');
const products = new Datastore({ filename: '../db/products.db', autoload: true });

const r = module.exports =  new Router();


r.get('/', (req, res) => {
    res.send(products.getAllData());
})


r.post('/', (req, res) => {
    res.send(products.insert(req.body));
})