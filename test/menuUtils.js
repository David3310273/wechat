var menuUtils = require('../models/menuUtils');
var request = require('request');
var redis = require('redis');
var assert = require('assert');
var {promisify} = require('util');
var config = require('../config');
var querystring = require('querystring');
var client = redis.createClient();
var getAsync = promisify(client.get).bind(client);

describe('menuUtils', function() {
    before(function() {
      client.on('connected', function() {
        console.log('redis connected!');
      });
    });

    describe.skip('testing list...', function() {
        var url = '';   //global varaible

        it('should return record', function(done) {
            getAsync('token').then(function(reply) {
                assert.notEqual(reply.toString(), '');
                return reply.toString();
            }).then(function(token) {
                url = config.menuProfile + '?' + querystring.stringify({
                    access_token: token
                });              
            });

            done();
        });

        it('should pass', function(done) {
            assert.notEqual(url, '');

            request(url, function(err, res) {
                assert.equal(err, undefined);

                assert.doesNotThrow(function() {
                    msg = JSON.parse(res.body);
                });

                assert.notEqual(msg, {});
                assert.equal(msg.errcode, undefined);

                done();
            });
        })
    });

    describe('testing create...', function() {
        var url = '';

        it('should pass', function (done) {
            getAsync('token').then(function(reply) {
                assert.notEqual(reply, null);
                assert.notEqual(reply.toString(), '');
                return reply.toString();
            }).then(function(token) {
                url = config.menuCreate + '?' + querystring.stringify({
                    access_token: token
                });

                done();
            });
        });

        it('should create', function (done) {
            assert.notEqual(url, '');

            const postBody = {      //test code
                "button":[
                    {
                       "name":"菜单",
                       "sub_button":[
                            {    
                               "type":"view",
                               "name":"搜索",
                               "url":"http://www.baidu.com/"
                            }
                        ]
                    }
                ]
            };

            const options = {
                url: url,
                method: 'post',
                body: JSON.stringify(postBody)
            }

            request(options, (err, resp) => {
                assert.equal(resp.statusCode, 200);
                assert.equal(err, undefined);
            });

            done();
        });
    });

    after(function() {
        client.quit();
    })
});
