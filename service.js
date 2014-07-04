var pdf2image = require('./lib/pdf2image')();

pdf2image.request({
  url: 'https://www.verifyd.com/CLServicesDev/VendorApi.ashx?ActiveBid&orderId=532764',
  convertSettings: ['-density', '150']
});

pdf2image.on('end', function () {
  console.log('end convertion ...');
});

pdf2image.on('err', function (err) {
  console.log('pdf2image error: ', err);
});

pdf2image.on('page', function (page) {
  console.log('Page => ', page);
});