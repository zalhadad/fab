const { Router } = require('express');
const { products, inventory } = require('../modules/db');
const { saveImage } = require('../modules/image');

const r = new Router();
module.exports = r;

r.get('/', (req, res) => {
  res.send(products.getAllData());
});

r.get('/alerts', (req, res) => {
  products.find({ $or: [{}] }, (err, docs) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.send(docs);
    }
  });
});

r.post('/', (req, res) => {
  const { image } = req.body;
  const product = req.body;
  product.user = product.user.id;
  delete product.image;
  if (product.code) {
    if (image) {
      saveImage(product.code, image);
    }
    products.insert(product);
    products.findOne({ code: product.code }, (err, doc) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.send(doc);
      }
    });
  } else {
    res.status(400).send();
  }
});

r.post('/:code/invotory', (req, res) => {
  const { code } = req.query;
  const { user, count, force } = req.body;
  if (count > 0) {
    inventory.findOne({ code, user: user.id }, (err, doc) => {
      if (err) {
        res.status(400).send(err.message);
      } else if (doc) {
        if (force) {
          inventory.insert({
            user: user.id, count, code, timestamp: new Date().getTime(),
          });
          inventory.find({ code }, (err2, docs) => {
            if (err2) {
              res.status(400).send(err2.message);
            } else {
              res.send(docs.map(d => d.count).reduce((acc, cur) => acc + cur, 0));
            }
          });
        } else {
          res.status(449).send();
        }
      } else {
        inventory.insert({
          user: user.id, count, code, timestamp: new Date().getTime(),
        });
        inventory.find({ code }, (err2, docs) => {
          if (err2) {
            res.status(400).send(err2.message);
          } else {
            res.send(docs.map(d => d.count).reduce((acc, cur) => acc + cur, 0));
          }
        });
      }
    });
  } else {
    res.status(400).send();
  }
});
