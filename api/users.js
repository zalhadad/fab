const { Router } = require('express');
const { users } = require('../modules/db');

const r = new Router();
module.exports = r;


const makeid = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

r.use((req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const tokens = Buffer.from(req.headers.authorization.replace('Basic ', ''), 'base64').toString('ascii').split(':');
    if (tokens.length === 2) {
      const opt = {
        name: tokens[0],
        password: tokens[1],
      };
      users.findOne(opt, (err, u) => {
        console.log(err);
        if (u && u.role === 'admin') {
          return next();
        }
        res.status(401).send();
      });
    } else {
      res.status(401).send();
    }
  } else {
    res.status(401).send();
  }
});

r.get('/', (req, res) => {
  res.send(users
    .getAllData()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
});
r.post('/', (req, res) => {
  const { name, password } = req.body;
  if (name) {
    users.insert({
      name: name.trim().toLowerCase(),
      password: password || makeid(),
      role: req.body.role || 'user',
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

r.delete('/:id', (req, res) => {
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
