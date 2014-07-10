/**
 *
 */

var options = process.argv[2] ? JSON.parse(process.argv[2]) : null
  , Pdf2image = require('./')
  , path = require('path')
  , debug = require('debug')('pdf2image-fork');

debug('Running fork');

var pdf2image = Pdf2image({
  url: options.url,
  convertSettings: ['-density', options.density || '150'],
  basedir: options.basedir || './cache'
});

pdf2image.on('init done', pdf2image.request);

pdf2image.on('end', function () {
  debug('end convertion ...');
});

pdf2image.on('err', function (err) {
  debug('pdf2image error: ', err);
  process.send({
    err: err,
    pages: null
  });
});

pdf2image.on('pages', function (pages) {
  debug('pages returned: ' + pages.length);
  process.send({
    err: null,
    pages: pages
  });
});
