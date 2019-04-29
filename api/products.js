const { Router } = require('express');
const { products, inventory } = require('../modules/db');
const { saveImage, getLocalImage } = require('../modules/image');

const r = new Router();
module.exports = r;

r.get('/alerts', (req, res) => {
  products.find({ $or: [{}] }, (err, docs) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.send(docs);
    }
  });
});


r.get('/', (req, res) => {
  res.send(products.getAllData());
});


r.get(':code', (req, res) => {
  const { code } = req.params;

  products.findOne({ code }, (err, doc) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      doc.image = getLocalImage(doc.code);
      res.send(doc);
    }
  });
});

r.post('/', (req, res) => {
  const { image } = req.body;
  const product = req.body;
  product.user = req.user;
  delete product.image;
  if (product.code) {
    if (image) {
      saveImage(product.code, image);
    }
    products.insert(product);
    products.findOne({ code: product.code }, (err) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.send('Produit Ajouté');
      }
    });
  } else {
    res.status(400).send();
  }
});

r.post('/:code/invotory', (req, res) => {
  const { code } = req.params;
  const { count, force } = req.body;
  if (count > 0) {
    inventory.findOne({ code, user: req.user }, (err, doc) => {
      if (err) {
        res.status(400).send(err.message);
      } else if (doc) {
        if (force) {
          inventory.insert({
            user: req.user, count, code, timestamp: new Date().getTime(),
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
          user: req.user, count, code, timestamp: new Date().getTime(),
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
