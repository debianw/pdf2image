/**
 *
 */

var assert = require('assert')
  , Prune = require('../lib/Prune')
  , request = require('request')
  , urls
  , pdfServer = 'http://192.168.0.100:7005/convert/'
  , staticImages = 'http://192.168.0.100:7005'
  , debug = require('debug')('testing');

urls = [
  'https://www.verifyd.com/CLServicesDev/VendorApi.ashx?ActiveBid&orderId=530236' // 5 pages
];

describe('pdf2image', function () {

  /**
   *
   */

  it('should has 5 pages', function (done) {
    request.post({
      uri: pdfServer,
      form: {
        url: urls[0],
        density: 150,
        basedir: './tmp'
      }
    }, 
    function (err, response, body) {
      var pages = JSON.parse(body);

      if (err) return done(err);
      if (response.statusCode !== 200) return done(new Error('Response code ' + response.statusCode));
      if (Object.prototype.toString.call(pages) !== '[object Array]' && pages.length !== 5) return done(new Error('Response is not an array or doesn\'t contains 5 pages'));

      done();
    });
  });

  /**
   *
   */

  it('should support 15 simultaneous req', function (done) {
    var totalReq = 15
      , count = 1
      , images = []
      , imgCallback
      , checkImages
      , options = {
          uri: pdfServer,
          form: {
            url: urls[0],
            density: 150,
            basedir: './tmp'
          }
        };

    // callback to check if image is OK
    imgCallback = function (err, response, body) {
      if (err) return done(err);
      if (response.statusCode !== 200) return done(new Error('Can\'t find image, status code: '+ response.statusCode));

      images.shift();
      debug('Image OK');

      if (!images.length) done();
    };

    // request images
    checkImages = function () {
      for (var i = 0, len = images.length; i < len; i++) {
        request.get([staticImages, '/', images[i]].join(''), imgCallback);  
      }
    };

    // callback for pdf2image request
    var callback = function (err, response, body) {
      var pages = JSON.parse(body);

      if (err) return done(err);
      if (response.statusCode !== 200) return done(new Error('Response code ' + response.statusCode));
      if (Object.prototype.toString.call(pages) !== '[object Array]' && pages.length !== 5) return done(new Error('Response is not an array or doesn\'t contains 5 pages'));

      debug('Request done with success, counter: ', count);
      images = images.concat(pages);
      if (count === totalReq) checkImages();
      count++;
    };

    for(var i=count; i<=totalReq; i++) {
      debug('Doing request #', i);
      request.post(options, callback);  
    }
  });

});
