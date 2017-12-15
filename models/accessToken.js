var mongoose = require('mongoose');
var https = require('https');
var util = require('../util');
var sha1 = require('sha1');
var config = require('../config');
var Schema = mongoose.Schema;
var debug = require('debug')('accessToken');

var accessTokenSchema = new Schema({
    token: String,
    record_time: Date,
    expires: Number
});

var AccessToken = mongoose.model('accessToken', accessTokenSchema);

module.exports.model = AccessToken;

/**
 * get token from api
 */

module.exports.fetch = (url) => {
  request(url, (err, res) => {
    if (!err) {
      try {
          const accessTokenData = JSON.parse(res.body);
          var newToken = new AccessToken({
              token: accessTokenData["access_token"],
              record_time: Date.now(),
              expires: accessTokenData["expires_in"]
          });

          newToken.save(function(err) {
            if (err) {
              console.log("save error: " + err);
            } else {
              console.log("save succeed!");
            }
          });
      } catch (e) {
          console.error('parse error: ' + e);
      }
    }
  });
}

/**
 * access to the wechat server
 */

module.exports.validate = function (req)
{
    var request = req.query;    //not req.params here!!
    var token = config.appToken;
    var params = [];

    if (util.isset(request.timestamp) && util.isset(request.nonce)) {
      var dataToBeEncrypted = [token, request.timestamp, request.nonce];
      params = dataToBeEncrypted.sort();
    }

    var ecryptedContent = sha1(params.join(""));

    if (util.isset(request.signature) && ecryptedContent == request.signature) {
        return request.echostr;
    } else {
        return "error";
    }
}

