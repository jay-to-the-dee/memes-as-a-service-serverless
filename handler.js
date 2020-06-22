const fs = require('fs');
const sharp = require('sharp');
const escapeHtml = require('escape-html');

const { IMAGES_DIR, TEXT_SIZE, TEXT_PADDING } = process.env;

const parseText = text => (text || '').toUpperCase();
const getImages = () => fs.readdirSync(IMAGES_DIR);
const parseImage = image => getImages().find(file => file.indexOf(image) === 0);
const random = arr => arr[Math.floor(Math.random() * arr.length)];
const randomImage = () => random(getImages());
const svgText = text => {
  const escapedText = escapeHtml(text);
  return new Buffer(`<svg height="40" width="100%">
  <text x="0" y="40" font-size="${TEXT_SIZE}" font-family="Impact, Arial, Helvetica, sans-serif"
  style="fill: #000; stroke: #fff;">
  ${escapedText}</text>
  </svg>`);
}

module.exports.meme = (event, context, callback) => {
  const input = event.queryStringParameters || {};

  const top = parseText(input.top);
  const bottom = parseText(input.bottom);
  const image = parseImage(input.image) || randomImage();

  const textTop = svgText(top);
  const textBottom = svgText(bottom);

  const meme = sharp(`${IMAGES_DIR}${image}`)
    .composite([{
      input: textTop,
      blend: 'atop',
      gravity: 'north'
    }, {
      input: textBottom,
      blend: 'atop',
      gravity: 'south'
    }])

    .toBuffer()
    .then(buffer => {
      callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'image/jpeg' },
        body: buffer.toString('base64'),
        isBase64Encoded: true,
      });
    });
};
