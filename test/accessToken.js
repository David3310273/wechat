var mocha = require('mocha');
var assert = require('assert');
var mongoose = require('mongoose');
var config = require('../config');
var querystring = require('querystring');
var accessToken = require('../models/accessToken');
var request = require('request');
var sha1 = require("sha1");
var redis = require('redis');
var client = redis.createClient();
var AccessToken = accessToken.model;

describe('accessToken', function () {
    before(function() {
      client.on('connected', function() {
        console.log('redis connected!');
      });

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
            accessTokenData = JSON.parse(res.body);
          }, Error);

          assert.notEqual(accessTokenData['access_token'], undefined);
          assert.notEqual(accessTokenData['access_token'], '');

          client.set('token', accessTokenData['access_token'], 'EX', 7200);

          client.get('token', function(err, reply) {
            assert.equal(err, undefined);
            assert.equal(reply.toString(), accessTokenData["access_token"]);
            done();
          });
        });
      });
    });

    /*
    notice: using .only() to adjust test case here, don't execute them directly.
     */
    describe.skip('testing validate method', function() {
      var mockRequest = {};

      mockRequest.query = {};

      it('should not pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), "error");
        mockRequest.query.timestamp = Date.now();
      });

      it('should not pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), "error");
        
        mockRequest.query.nonce = "123456";
        mockRequest.query.signature = "123456";
        mockRequest.query.echostr = "haha";
      });

      it('should not pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), "error");
        assert.notEqual(accessToken.validate(mockRequest), "haha");
        
        var dataToBeEncrypted = [config.appToken, mockRequest.query.timestamp, mockRequest.query.nonce];
        mockRequest.query.signature = sha1(dataToBeEncrypted.sort().join(""));
      });

      it('should pass', function(done) {
        assert.equal(accessToken.validate(mockRequest), mockRequest.query.echostr);
        done();
      });
    })

    after(function() {
      client.quit();
    })
})