const request = require('request').defaults({ encoding: null });
const { writeFileSync, readFileSync, existsSync } = require('fs');
const path = require('path');


const imageName = code => path.join(__dirname, '..', 'files', 'images', `${code}.png`);

module.exports = {
  getImage: id => new Promise((resolve, reject) => request.get(`https://static.openfoodfacts.org/images/products/${id}`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const data = `data:${response.headers['content-type']};base64,${Buffer.from(body).toString('base64')}`;
      resolve(data);
    } else {
      reject(error);
    }
  })),
  getLocalImage: (code) => {
    if (existsSync(imageName(code))) {
      const bitmap = readFileSync(imageName(code));
      // convert binary data to base64 encoded string
      return Buffer.from(bitmap).toString('base64');
    }
    return null;
  },
  saveImage: (code, image) => {
    const data = image.replace(/^data:image\/png;base64,/, '');
    writeFileSync(imageName(code), data);
  },
};
