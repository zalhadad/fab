const express = require('express')
const app = express()
const parser = require('js-xlsx')
const Datastore = require('nedb');
const brands = new Datastore({ filename: 'db/brands.db', autoload: true });
const providers = new Datastore({ filename: 'db/providers.db', autoload: true });
const products = new Datastore({ filename: 'db/products.db', autoload: true });
require('./polyfills')
const multer = require('multer')
const upload = multer()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var sheet2arr = function (sheet) {
  var result = [];
  var row;
  var rowNum;
  var colNum;
  var range = parser.utils.decode_range(sheet['!ref']);
  for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
    row = [];
    for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
      var nextCell = sheet[
        parser.utils.encode_cell({ r: rowNum, c: colNum })
      ];
      if (typeof nextCell === 'undefined') {
        row.push(void 0);
      } else row.push(nextCell.w);
    }
    result.push(row);
  }
  return result;
};

app.get('/families', function (req, res) {
  const families = sheet2arr(parser.readFile(__dirname + '/files/families.xls').Sheets['A'])
  const subFamilies = sheet2arr(parser.readFile(__dirname + '/files/sub_families.xls').Sheets['A'])
  const familiesArray = []
  families.forEach(family => {
    const familyObj = {
      name: family[0],
      id: family[1],
      subFamilies: subFamilies.filter(f => f[2] === family[1]).map(f => ({ name: f[0], id: f[1] })).sort((a, b) => a.name > b.name),
    }
    familiesArray.push(familyObj)
  })
  familiesArray.sort((a, b) => a.name > b.name)
  res.send(familiesArray)
})

app.get('/brands', function (req, res) {
  res.send(brands.getAllData().sort((a, b) => {
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
  }));
})
app.post('/brands', function (req, res) {
  const b = req.body;
  if (b.name) {
    const max = Math.max(...brands.getAllData().map(e => e.id)) + 1
    brands.insert({
      id: max.toString(),
      name: b.name.trim().capitalize(),
    }, (e, t) => {
      if (e) {
        res.status(400).send(e)
      } else {
        res.send(t)
      }
    })
  } else {
    res.sendStatus(405)
  }
})

app.delete('/brands/:id', function (req, res) {
  const id = req.params.id
  if (id) {
    brands.remove({
      id,
    },{ multi: true }, (e, t) => {
      if (e) {
        res.status(400).send(e)
      } else {
        res.send({ message: t + ' removed' })
      }
    })
  } else {
    res.sendStatus(405)
  }
})


app.listen(3000, function () {
})