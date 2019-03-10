const Datastore = require('nedb');
const path = require('path');

const families = new Datastore({ filename: path.join(__dirname, '..', 'db', 'families.db'), autoload: true });
const products = new Datastore({ filename: path.join(__dirname, '..', 'db', 'products.db'), autoload: true });
const users = new Datastore({ filename: path.join(__dirname, '..', 'db', 'users.db'), autoload: true });
const brands = new Datastore({ filename: 'db/brands.db', autoload: true });
const providers = new Datastore({ filename: 'db/providers.db', autoload: true });


module.exports = {
  families,
  users,
  products,
  brands,
  providers,

};
