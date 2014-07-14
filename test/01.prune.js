var assert = require('assert')
  , Prune = require('../lib/Prune')
  , path = require('path')
  , fs = require('fs')
  , del = require('del')
  , moment = require('moment')
  , options;

options = {
  basedir: path.resolve('./tmp'),
  experationDays: 2
};

describe('Prune', function () {

  /**
   *
   */

  it('should create base directory', function (done) {
    var prune = Prune(options);

    del(options.basedir, function (err) {
      if (err) return done(err);
      prune.init();
    });
    
    prune.on('init done', function () {
      done();
    });

    prune.on('err', function () {
      done(err);
    });

  });

  /**
   *
   */

  it('should return old directories', function (done) {
    var prune = Prune(options)
      , dir1 = path.join(options.basedir, moment().subtract('days', options.experationDays+1).format('YYYY-MM-DD'))
      , dir2 = path.join(options.basedir, moment().subtract('days', options.experationDays+2).format('YYYY-MM-DD'));

    // remove base directory
    del(options.basedir, function (err) {
      if (err) return done(err);

      fs.mkdirSync(options.basedir);
      fs.mkdirSync(dir1);
      fs.mkdirSync(dir2);

      prune.getOldDirectories(options.basedir, function (err, directories) {
        if (err) return done(err);

        if (directories.indexOf(dir1) === -1 || directories.indexOf(dir2) === -1) return done('Error returning expired directories');

        done();
      });

    });
  });

  /**
   *
   */

  it('should prune old directories', function (done) {
    var prune = Prune(options)
      , dir1 = path.join(options.basedir, moment().subtract('days', options.experationDays+1).format('YYYY-MM-DD'))
      , dir2 = path.join(options.basedir, moment().subtract('days', options.experationDays+2).format('YYYY-MM-DD'));

    // remove base directory
    del(options.basedir, function (err) {
      if (err) return done(err);

      fs.mkdirSync(options.basedir);
      fs.mkdirSync(dir1);
      fs.mkdirSync(dir2);

      prune.prune();
    });

    prune.on('prune done', function () {
      done();
    });

    prune.on('err', function () {
      done(err);
    });

  });

});