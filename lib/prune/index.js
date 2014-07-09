/**
 *
 */

var fs = require('fs')
  , mkdirp = require('mkdirp')
  , moment = require('moment')
  , events = require('events')
  , utils = require('util')
  , debug = require('debug')('Prune')
  , path = require('path')
  , dateFormat = 'YYYY-MM-DD';

/**
 * Constructor
 *
 * @param {Object} options {basedir: '/path/to/cache', experationDays: 2}
 */

var Prune = function (options) {
  if (!(this instanceof Prune)) return new Prune(options);

  events.EventEmitter.call(this);
  this.options = options = options || {};

  options.experationDays = options.experationDays || 2;
  
  return this;
};

utils.inherits(Prune, events.EventEmitter);

/**
 * Setups directory environment
 */

Prune.prototype.init = function () {
  var me = this
    , today = moment(new Date()).format(dateFormat)
    , basedir = this.options.basedir
    , dir = [basedir, today].join('/');

  // basedir doesnt exists
  if (!fs.existsSync(basedir)) {
    mkdirp(dir, function (err) {
      if (err) return me.emit('err', err);

      debug('Base directory created: ' + dir);

      me.emit('init done');
    });
  }

  // check if today's folder exists
  else if (!fs.existsSync(dir)) {
    mkdirp(dir, function (err) {
      if (err) return me.emit('err', err);

      debug('Today\'s directory created: ' + dir);

      me.emit('init done');
    });
  }

  // base dir and today's dir exists then finish
  else {
    setTimeout(function () {
      me.emit('init done');
    }, 0);
  }

  return this;
};

/**
 * Prune old cache
 */

Prune.prototype.prune = function () {
  var me = this
    , basedir = this.options.basedir;

  if (fs.existsSync(basedir)) {
    this.getOldDirectories(basedir, function (err, directories) {
      if (err) return me.emit('err', err);

      me.emit('prune done', directories);
    });
    /*fs.readdir(basedir, function (err, files) {
      if (err) return me.emit('err', err);

      var directories = files.filter(function (file) {
        return fs.statSync(path.join(basedir, file)).isDirectory();
      });

      console.log('directories: ', directories);
      me.emit('prune done', files);
    });*/

  }
  else {
    setTimeout(function () {
      debug('Nothing to prune');
      me.emit('prune done');
    });
  }
};

/**
 * Extract directories
 */

Prune.prototype.getOldDirectories = function (basedir, callback) {
  var expirationDate = new Date(moment().subtract('days', this.options.experationDays).format('YYYY-MM-DD'));

  fs.readdir(basedir, function (err, files) {
    if (err) return callback(err);

    var directories = files.filter(function (file) {
      var isDir = fs.statSync(path.join(basedir, file)).isDirectory()
        , date = moment(file);

      if (isDir && date.isValid()) {
        return date <= expirationDate;
      }

      return false;
    });

    callback(null, directories);
  });
};

/**
 * Expose
 */

module.exports = Prune;
