var express = require('express');
var router = express.Router();
var https = require('https');   //pay attention to this, http not equals https!
const { URL, URLSearchParams } = require('url');
var debug = require('debug')('accessToken');
var config = require('../../config');
var util = require('../../util');
var accessToken = require('../../models/accessToken');

router.get('/fetch', function(req, res, next) {    //succeed!
   var params = new URLSearchParams({
       grant_type: config.grantType,
       appid: config.appID,
       secret: config.appSecret
   });

   const url = config.wechat + '?' + params.toString();

   accessToken.fetch(url);

   next();
});

module.exports = router;
