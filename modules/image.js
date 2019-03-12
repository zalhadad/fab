const request = require('request').defaults({ encoding: null });
const { writeFileSync } = require('fs');
const path = require('path');

module.exports = {
  getImage: id => new Promise((resolve, reject) => request.get(`https://static.openfoodfacts.org/images/products/${id}`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const data = `data:${response.headers['content-type']};base64,${Buffer.from(body).toString('base64')}`;
      resolve(data);
    } else {
      reject(error);
    }
  })),
  saveImage: (code, image) => {
    const data = image.replace(/^data:image\/png;base64,/, '');
    writeFileSync(path.join(__dirname, '..', 'files', 'images', `${code}.png`), data);
  },
};
