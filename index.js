const express = require('express');

const app = express();
// const parser = require('js-xlsx');
require('./polyfills');
const bodyParser = require('body-parser');


const { families, brands, users } = require('./modules/db')

const productsApi = require('./api/products');
const usersApi = require('./api/users');
const autoCompleteApi = require('./api/autocomplete');


app.use(bodyParser.json({
  limit: '50mb',
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.path.startsWith('/users')) {
    return next();
  }
  if (req.headers && req.headers.authorization) {
    const tokens = Buffer.from(req.headers.authorization.replace("Basic ", ""), "base64").toString('ascii').split(':');
    if (tokens.length === 2) {
      const opt = {
        name: tokens[0],
        password: tokens[1]
      }
      users.findOne(opt, (err, u) => {
        if (u) {
          return next();
        } else {
          res.status(401).send();
        }
      });
    }
    else {
      res.status(401).send();
    }
  } else {
    res.status(401).send();
  }

});

// var sheet2arr = function (sheet) {
//     var result = [];
//     var row;
//     var rowNum;
//     var colNum;
//     var range = parser.utils.decode_range(sheet['!ref']);
//     for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
//         row = [];
//         for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
//             var nextCell = sheet[
//                 parser.utils.encode_cell({r: rowNum, c: colNum})
//                 ];
//             if (typeof nextCell === 'undefined') {
//                 row.push(void 0);
//             } else row.push(nextCell.w);
//         }
//         result.push(row);
//     }
//     return result;
// };

app.get('/families', (req, res) => {
  // const families = sheet2arr(parser.readFile(__dirname + '/files/families.xls').Sheets['A'])
  // const subFamilies = sheet2arr(parser
  // .readFile(__dirname + '/files/sub_families.xls').Sheets['A'])
  // const familiesArray = []
  // families.forEach(family => {
  //     const familyObj = {
  //         name: family[0],
  //         id: family[1],
  //         subFamilies: subFamilies
  //             .filter(f => f[2] === family[1])
  //             .map(f => ({name: f[0], id: f[1]}))
  //             .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())),
  //     }
  //     familiesArray.push(familyObj)
  // })
  // familiesArray.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  // familiesD.insert(familiesArray)
  res.send(families.getAllData());
});

app.get('/brands', (req, res) => {
  res.send(brands
    .getAllData()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
});
app.post('/brands', (req, res) => {
  const b = req.body;
  if (b.name) {
    const max = Math.max(...brands.getAllData().map(e => e.id)) + 1;
    brands.insert({
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

app.delete('/brands/:id', (req, res) => {
  const { id } = req.params;
  if (id) {
    brands.remove({
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


app.use('/products', productsApi);
app.use('/users', usersApi);
app.use('/autocomplete', autoCompleteApi);

app.listen(process.env.PORT || 3000, () => {
});
