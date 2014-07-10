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
  , dir = require('node-dir')
  , path = require('path')
  , moment = require('moment')
  , dateFormat = 'YYYY-MM-DD'
  , debug = require('debug')('pdf2image')
  , uuid = require('uuid')
  , mkdirp = require('mkdirp');

/**
 * Constructor
 */

var Pdf2Image = function (options) {
  if (!(this instanceof Pdf2Image)) return new Pdf2Image(options);
  events.EventEmitter.call(this);

  this.id = uuid.v1();
  this.options = options || {};

  this.init();
};

// Extend emitter
util.inherits(Pdf2Image, events.EventEmitter);

/**
 * Initialize
 */

Pdf2Image.prototype.init = function () {
  var me = this
    , options = this.options
    , today = moment(new Date()).format(dateFormat);

  debug('Initilizing Pdf2Image: ', options);

  if (!options.basedir) return me.emit('err', 'Missing base directory');
  if (!options.url) return me.emit('err', 'Missing url');

  this.basedir = path.join(options.basedir, today, this.id);

  mkdirp(this.basedir, function (err) {
    if (err) return me.emit('Error creating uuid directory');

    debug('Pdf2Image has being initialized');
    me.emit('init done');
  });

  return this;
};

/**
 * Convert
 */

Pdf2Image.prototype.request = function () {
  var me = this
    , options = this.options
    , settings = options.convertSettings || ['-density', '150']
    , basedir
    , url = options.url
    , convert
    , reqStream;

  basedir = this.basedir;

  settings.push('-', path.join(basedir, 'page.png'));
  convert = spawn('convert', settings);

  debug('doing request to => ', url);
  reqStream = request(url);

  reqStream.on('data', function (data) {
    convert.stdin.write(data);
  });

  reqStream.on('end', function () {
    convert.stdin.end();
  });

  reqStream.on('error', function () {
    debug('Bad Request: ', url);
    me.emit('err', 'Bad Request');
  });

  convert.stdout.on('end', function (data) {
    me.emit('end');

    if (reqStream.response.statusCode !== 200) return me.emit('err', 'Bad Request status code: '+ reqStream.response.statusCode);

    me.loadPages();
  });

  convert.stderr.setEncoding('utf8');
  /*convert.stderr.on('data', function (message) {
    me.emit('err', message);
  });*/

};

/**
 *
 */

Pdf2Image.prototype.loadPages = function () {
  var me = this;

  dir.readFiles(this.basedir,
    function(err, content, next) {
      if (err) return me.emit('err', err);

      next();
    },
    function(err, files){
      if (err) return me.emit('err', err);

      me.emit('pages', files);
    }
  );
};

/**
 * Expose
 */

module.exports = Pdf2Image;
