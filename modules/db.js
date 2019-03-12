const Datastore = require('nedb');
const path = require('path');

const families = new Datastore({ filename: path.join(__dirname, '..', 'db', 'families.db'), autoload: true });
const products = new Datastore({ filename: path.join(__dirname, '..', 'db', 'products.db'), autoload: true });
const users = new Datastore({ filename: path.join(__dirname, '..', 'db', 'users.db'), autoload: true });
const brands = new Datastore({ filename: path.join(__dirname, '..', 'db', 'brands.db'), autoload: true });
const providers = new Datastore({ filename: path.join(__dirname, '..', 'db', 'providers.db'), autoload: true });
const inventory = new Datastore({ filename: path.join(__dirname, '..', 'db', 'inventory.db'), autoload: true });


module.exports = {
  families,
  users,
  products,
  brands,
  providers,
  inventory,
};
