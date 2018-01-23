var mocha = require('mocha');
var assert = require('assert');
var mongoose = require('mongoose');
var config = require('../config');
var querystring = require('querystring');
var accessToken = require('../models/accessToken');
var request = require('request');
var sha1 = require("sha1");
var AccessToken = accessToken.model;

describe('accessToken', function () {
    before(function() {
      mongoose.connection.on('connected', function () {  
        console.log('Mongoose default connection open to ' + config.db);
      });
      mongoose.connect(config.db);
    });
    
    describe.skip('testing fetch method....', function() {
      it('should not throw error', function(done) {
        var url = config.wechat + "?" + querystring.stringify({
          grant_type: config.grantType,
          appid: config.appID,
          secret: config.appSecret
        });

        var accessTokenData = {};

        request(url, (err, res) => {
          assert.equal(err, null);
          assert.doesNotThrow(function() {
             const accessTokenData = JSON.parse(res.body);
          }, Error);

          var newToken = new AccessToken({
              token: accessTokenData["access_token"],
              record_time: Date.now(),
              expires: accessTokenData["expires_in"]
          });

          newToken.save(function(err) {
            assert.equal(err, null);
          });

          done();
        });
      });

      it('should have a record in database', function(done) {
        AccessToken.findOne({}, function(err, userInfo) {
          assert.equal(err, null);
          assert.notEqual(userInfo, null);
          done();
        });

      });
    });

    /*
    notice: using .only() to adjust test case here, don't execute them directly.
     */
    describe('testing validate method', function() {
      var mockRequest = {};

      mockRequest.query = {};

      it('should not pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), "error");
      });

      mockRequest.query.timestamp = Date.now();

      it('should not pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), "error");
      });

      mockRequest.query.nonce = "123456";
      mockRequest.query.signature = "123456";

      mockRequest.query.echostr = "haha";

      it('should not pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), "error");
        assert.notEqual(accessToken.validate(mockRequest), "haha");
      });

      var dataToBeEncrypted = [config.appToken, mockRequest.query.timestamp, mockRequest.query.nonce];

      mockRequest.query.signature = sha1(dataToBeEncrypted.sort().join(""));

      it('should pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), mockRequest.query.echostr);
        done();
      });
    })

    after(function() {
      mongoose.connection.on('disconnected', function () {  
        console.log('Mongoose default connection disconnected'); 
      });
      mongoose.disconnect();
    })
})