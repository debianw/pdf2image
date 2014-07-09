/**
 * API for Requesting PDF files and convert them to images
 *
 * @author Waly
 * @dependencies (ImageMagick)
 */

var spawn = require('child_process').spawn
  , request = require('request')
  , fs = require('fs')
  , util = require('util')
  , events = require('events')
  , dir = require('node-dir');

/**
 * Constructor
 */

var Pdf2Image = function () {
  if (!(this instanceof Pdf2Image)) return new Pdf2Image();

  events.EventEmitter.call(this);
};

// Extend emitter
util.inherits(Pdf2Image, events.EventEmitter);

/**
 * Convert
 *
 * @param {Object} options
 */

Pdf2Image.prototype.request = function (options) {
  var self = this
    , settings = options.convertSettings || ['-density', '150']
    , url = options.url
    , convert
    , reqStream;

  settings.push('-', './cache/page.png');

  convert = spawn('convert', settings);
  reqStream = request(url);

  reqStream.on('data', function (data) {
    convert.stdin.write(data);
  });

  reqStream.on('end', function () {
    convert.stdin.end();
  });

  convert.stdout.on('end', function (data) {
    self.emit('end');

    if (reqStream.response.statusCode !== 200) return self.emit('err', 'Bad Request');

    self.loadPages();
  });

  convert.stderr.setEncoding('utf8');
  convert.stderr.on('data', function (message) {
    self.emit('err', message);
  });
};

/**
 *
 */

Pdf2Image.prototype.loadPages = function () {
  var me = this;

  dir.readFiles('./cache',
    function(err, content, next) {
      if (err) return me.emit('err', err);
      
      /*pages.push({
        src: new Buffer(content).toString('base64')
      });*/

      next();
    },
    function(err, files){
      if (err) return me.emit('err', err);

      me.emit('pages', files);
    });

  /*var self = this
    , lineStream = eventStream.map(function (file, next) {
        var data = fs.readFileSync(file);

        self.emit('page', data);

        next(false, file + "\n");
      });

  directoryStream('./cache/').pipe(lineStream).pipe(process.stdout);*/
};

/**
 * Expose
 */

module.exports = Pdf2Image;

/*module.exports = function (options) {
  var settings = [
      '-density', options.density || '150',
      '-',
      './cache/page.' + (options.format || 'png')
    ]
    , src = options.src
    , convert = spawn('convert', settings);


  request(url)
    .pipe(convert.stdin);

  convert.stdout.on('data', function (data) {
    console.log('Data => ', data);
  });

  convert.stdout.on('end', function (data) {
    console.log('End => ', data);
  });

  convert.stderr.setEncoding('utf8');
  convert.stderr.on('data', function (message) {
    console.log('Err => ', message);
  });

};*/

//var stream = fs.createReadStream(file);

//stream.pipe(convert.stdin);

/*fs.readFile(, function (err, data) {
  console.log('data => ', data);

  convert.stdin.write(data);
  convert.stdin.end();
});*/

/*var spawn = require('child_process').spawn
  , directoryStream = require('directory-stream')
  , eventStream = require('event-stream')
  , cachedir = './cache'
  , convert = spawn('convert', ['-density', '150', 'pdf/Bid_532764.pdf', './cache/image.png']);

convert.stdout.setEncoding('utf8');
convert.stdout.on('data', function (data) {
  console.log('stdout: ', data);
});

convert.stderr.setEncoding('utf8');
convert.stderr.on('data', function (data) {
  console.log('stderr: ', data);
});

convert.on('close', function (code) {
  console.log('child process exited with code: ', code);

  var lineStream = eventStream.map(function (file, next) {
    console.log('File => ', file);
    next(false, file + "\n");
  });

  directoryStream('./cache/').pipe(lineStream).pipe(process.stdout);
});*/

/*var im = require('imagemagick');

im.convert(['Bid_532764.pdf', '-density', '150', './cache/image.png'], function (err, stdout) {
  if (err) throw err;

  console.log('stdout: ', stdout);
});*/