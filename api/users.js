const { Router } = require('express');
const Datastore = require('nedb');
const path = require('path');

const r = new Router();
module.exports = r;
const users = new Datastore({ filename: path.join(__dirname, '..', 'db', 'users.db'), autoload: true });

r.get('/users', (req, res) => {
  res.send(users
    .getAllData()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
});
r.post('/users', (req, res) => {
  const b = req.body;
  if (b.name) {
    const max = Math.max(...users.getAllData().map(e => e.id)) + 1;
    users.insert({
      id: max.toString(),
      name: b.name.trim().capitalize(),
    }, (e, t) => {
      if (e) {
        res.status(400).send(e);
      } else {
        res.send(t);
      }
    });
  } else {
    res.sendStatus(405);
  }
});

r.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  if (id) {
    users.remove({
      id,
    }, { multi: true }, (e, t) => {
      if (e) {
        res.status(400).send(e);
      } else {
        res.send({ message: `${t} removed` });
      }
    });
  } else {
    res.sendStatus(405);
  }
});
