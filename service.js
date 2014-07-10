var express = require('express')
  , bodyParser = require('body-parser')
  , Prune = require('./lib/prune')
  , pdf2imageApp = require('./lib/pdf2image/routes')
  , path = require('path')
  , debug = require('debug')('service')
  , app = express()
  , port = process.env.PORT || 7005
  , _p;

/**
 * Pruning configuration
 */

_p = Prune({
  basedir: path.resolve('./cache'),
  experationDays: 2
});

/**
 * Middlewares
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(function (req, res, next) {
  process.nextTick(function () {
    _p
      .init()
      .prune();
  });

  next();
});

app.use(pdf2imageApp(_p));

/**
 * Listen
 */

app.listen(port, function () {
  console.log('pdf2image service listening on port %d', port);
});
