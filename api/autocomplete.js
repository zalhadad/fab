const { Router } = require('express');
const csv = require('csv-parser');
const fs = require('fs');

const path = require('path');
const stringSimilarity = require('string-similarity');
const { families, brands } = require('../modules/db');
const image = require('../modules/image');

const results = [];
let codesObj;
let codes;


fs.createReadStream(path.join(__dirname, '..', 'files', 'clean.csv')).pipe(csv()).on('data', e => results.push(e)).on('end', () => {
  codesObj = results.reduce((acc, cur) => {
    acc[cur.code] = cur;
    return acc;
  }, {});
  codes = results.map(e => e.code);
});

const r = new Router();
module.exports = r;

const mapFamilies = (element) => {
  const { cat } = element;
  if (cat) {
    const catList = families.getAllData();
    const match = stringSimilarity.findBestMatch(cat.norm(), catList.map(f => f.name.norm()));
    const matchN = stringSimilarity
      .findBestMatch(element.generic_name.norm() || element.name.norm(),
        catList.map(f => f.name.norm()));
    if (match.bestMatch.rating > 0.5) {
      const catListElement = catList[match.bestMatchIndex];
      element.family = { id: catListElement.id, name: catListElement.name };
      if (catListElement.subFamilies && catListElement.subFamilies.length) {
        const match2 = stringSimilarity
          .findBestMatch(cat.norm(), catListElement.subFamilies.map(f => f.name.norm()));
        const match2N = stringSimilarity
          .findBestMatch(element.generic_name.norm() || element.name.norm(),
            catListElement.subFamilies.map(f => f.name.norm()));
        if (match2.bestMatch.rating > 0.5) {
          const catListElement2 = catListElement.subFamilies[match2.bestMatchIndex];
          element.subFamily = { id: catListElement2.id, name: catListElement2.name };
        } else if (match2N.bestMatch.rating > 0.1) {
          const catListElement2 = catListElement.subFamilies[match2N.bestMatchIndex];
          element.subFamily = { id: catListElement2.id, name: catListElement2.name };
        }
      }
    } else if (matchN.bestMatch.rating > 0.1) {
      const catListElement = catList[matchN.bestMatchIndex];
      element.family = { id: catListElement.id, name: catListElement.name };
      if (catListElement.subFamilies && catListElement.subFamilies.length) {
        const match2 = stringSimilarity
          .findBestMatch(cat.norm(), catListElement.subFamilies.map(f => f.name.norm()));
        const match2N = stringSimilarity
          .findBestMatch(element.generic_name.norm() || element.name.norm(),
            catListElement.subFamilies.map(f => f.name.norm()));
        if (match2.bestMatch.rating > 0.5) {
          const catListElement2 = catListElement.subFamilies[match2.bestMatchIndex];
          element.subFamily = { id: catListElement2.id, name: catListElement2.name };
        } else if (match2N.bestMatch.rating > 0.1) {
          const catListElement2 = catListElement.subFamilies[match2N.bestMatchIndex];
          element.subFamily = { id: catListElement2.id, name: catListElement2.name };
        }
      }
    }
  }
  if (element.brand) {
    const brandsList = brands.getAllData();
    const match = stringSimilarity
      .findBestMatch(element.brand.norm(), brandsList.map(f => f.name.norm()));
    if (match.bestMatch.rating > 0.7) {
      const brand = brandsList[match.bestMatchIndex];
      element.brand = { id: brand.id, name: brand.name };
    }
  }
  element.name = element.name || element.generic_name;
  delete element.generic_name;
  delete element.cat;
  return element;
};

const findClosest = (code) => {
  const ratings = stringSimilarity
    .findBestMatch(code, codes)
    .ratings
    .filter(rate => rate.rating > 0.7);
  ratings.sort((a, b) => a.rating - b.rating);
  return ratings.slice(0, 4).map(e => codesObj[e.target]).map(mapFamilies);
};

r.get('/product', (req, res) => {
  const { code } = req.query;
  if (code) {
    if (codesObj[code]) {
      const element = codesObj[code];
      if (element.image) {
        image.getImage(element.image).then(img => res.send({
          ...mapFamilies(element),
          image: img,
        })).catch(e => res.status(400).send(e.message));
      } else {
        res.send({ product: mapFamilies(element) });
      }
    } else {
      const closest = findClosest(code);
      Promise.all(closest.map(c => (c.image ? image.getImage(c.image) : Promise.resolve())))
        .then((result) => {
          res.send({
            product: null,
            closest: result.map((img, i) => ({ ...closest[i], image: img })),
          });
        });
    }
  } else {
    res.status(400).send();
  }
});
