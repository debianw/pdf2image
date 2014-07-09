var assert = require('assert')
  , Prune = require('../lib/Prune')
  , path = require('path')
  , fs = require('fs')
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
    var prune = new Prune(options);

    prune.init();

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
    var prune = new Prune(options);

    fs.mkdirSync(path.join(options.basedir, '2014-01-01'));
    fs.mkdirSync(path.join(options.basedir, '2014-02-02'));

    /*prune.getOldDirectories(function (err, directories) {
      if (err) console.log('err: ', err);

      console.log(directories);

      done();
    });*/
    done();
  });

  /**
   *
   */

  /*it('should prune old data', function (done) {
    var prune = new Prune(options);

    

    prune.prune();

    prune.on('prune done', function (files) {
      console.log('files: ', files);
      done();
    });

    prune.on('err', function () {
      done(err);
    });

  });*/

});