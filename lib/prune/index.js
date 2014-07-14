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
  , del = require('del')
  , dateFormat = 'YYYY-MM-DD';

/**
 * Constructor
 *
 * @param {Object} options {
 *                  basedir: '/path/to/cache', 
 *                  experationDays: 2
 *                 }
 */

var Prune = function (options) {
  if (!(this instanceof Prune)) return new Prune(options);

  events.EventEmitter.call(this);
  this.options = options = options || {};

  options.experationDays = options.experationDays || 2;

  this.bindEvents();
  
  return this;
};

utils.inherits(Prune, events.EventEmitter);

/**
 * Binding events
 */

Prune.prototype.bindEvents = function () {
  this.on('init done', this.onInitDone.bind(this));
};

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

      me.remove(directories, function (err) {
        if (err) return me.emit('err', 'Error when trying to remove directories');

        debug('Prune done, directories removed '+directories.length);
        me.emit('prune done', directories);
      });
    });
  }
  else {
    setTimeout(function () {
      debug('Nothing to prune');
      me.emit('prune done');
    }, 0);
  }
};

/**
 * Remove an array of directories
 *
 * @param {Array} directories to be removed
 * @param {Function} callback
 */

Prune.prototype.remove = function (directories, callback) {
  var basedir = this.options.basedir;

  if (!directories || Object.prototype.toString.call(directories) !== '[object Array]') return callback('Array of directories needs to be provided');

  del(directories, function (err) {
    if (err) return callback(err);

    callback(null);
  });
};

/**
 * Extract expired directories
 *
 * @param {String} basedir
 * @param {Function} callback
 */

Prune.prototype.getOldDirectories = function (basedir, callback) {
  var expirationDate = new Date(moment().subtract('days', this.options.experationDays).format('YYYY-MM-DD'));

  fs.readdir(basedir, function (err, files) {
    if (err) return callback(err);

    var directories = files.filter(function (file) {
      var isDir = fs.statSync(path.join(basedir, file)).isDirectory()
        , date = moment(new Date(file));

      if (isDir && date.isValid()) {
        return date <= expirationDate;
      }

      return false;
    });

    directories = directories.map(function (dir) {
      return path.join(basedir, dir);
    });

    callback(null, directories);
  });
};

/**
 *
 */

Prune.prototype.onInitDone = function () {
  debug('Prune initialized');
};

/**
 * Expose
 */

module.exports = Prune;
