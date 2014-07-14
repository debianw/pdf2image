/**
 *
 */

var express = require('express')
  , cp = require('child_process')
  , path = require('path')
  , debug = require('debug')('pdf2image:routes')
  , app = module.exports = express();

/**
 * POST /convert
 */

app.post('/convert', function (req, res) {
  var child
    , options;

  if (!req.body.url) return res.send(400, 'get pdf file');

  options = {
    url: req.body.url,
    density: req.body.density,
    basedir: req.body.basedir
  };

  child = cp.fork(path.join(__dirname, 'fork'), [JSON.stringify(options)]);

  child.on('message', function (data) {
    var err = data.err
      , pages = data.pages;

    if (err) return res.json(400, err);

    debug('====> sending pages: ', err, pages);
    res.json(pages);
  });
});
