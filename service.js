var cp = require('child_process')
  , express = require('express')
  , bodyParser = require('body-parser')
  , app = express()
  , port = process.env.PORT || 7005
  , options
  , child;

/**
 * Middlewares
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Routes
 */

app.post('/pdf', function (req, res) {
  if (!req.body.url) return res.send(400, 'get pdf file');

  var options = {
    url: req.body.url,
    density: req.body.density
  };

  child = cp.fork('./lib/pdf2image/fork', [JSON.stringify(options)]);

  child.on('message', function (pages) {
    res.json(pages);
  });
});

/**
 * Listen
 */

app.listen(port, function () {
  console.log('pdf2image service listening on port %d', port);
});
