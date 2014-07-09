/**
 *
 */

var express = require('express')
  , cp = require('child_process')
  , path = require('path')
  , app = express();

/**
 * Expose
 */

module.exports = function () {

  /**
   * POST /pdf2image
   */

  app.post('/pdf2image', function (req, res) {
    var child
      , options;

    if (!req.body.url) return res.send(400, 'get pdf file');

    options = {
      url: req.body.url,
      density: req.body.density
    };

    child = cp.fork(path.join(__dirname, 'fork'), [JSON.stringify(options)]);

    child.on('message', function (pages) {
      res.json(pages);
    });
  });

  return app;
};
