/**
 *
 */

var options = process.argv[2] ? JSON.parse(process.argv[2]) : null
  , pdf2image = require('./')()
  , debug = require('debug')('pdf2image-fork');

debug('Running fork');

pdf2image.request({
  url: options.url,
  convertSettings: ['-density', options.density || '150']
});

pdf2image.on('end', function () {
  console.log('end convertion ...');
});

pdf2image.on('err', function (err) {
  console.log('pdf2image error: ', err);
});

pdf2image.on('pages', function (pages) {
  process.send({
    pages: pages
  });
});
