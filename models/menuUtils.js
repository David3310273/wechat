var request = require('request');
var redis = require('redis');
var assert = require('assert');
var {promisify} = require('util');
var config = require('../config');
var querystring = require('querystring');
var client = redis.createClient();
var getAsync = promisify(client.get).bind(client);

var menu = {

    list: (req, res, next) => {
        return getAsync('token').then(function(reply) {
            return reply.toString();
        }).then(function(token) {
            url = config.menuProfile + '?' + querystring.stringify({
                access_token: token
            });

            return url;             
        });
    },

    create: (req, res, next) => {
        const postBody = {      //test code
            "button":[
                {
                   "name":"菜单",
                   "sub_button":[
                        {    
                           "type":"view",
                           "name":"搜索",
                           "url":"http://www.soso.com/"
                        }
                    ]
                }
            ]
        };

        getAsync('token').then(function(reply) {
            return reply.toString();
        }).then(function(token) {
            url = config.menuCreate + '?' + querystring.stringify({
                access_token: token
            });

            return url;
        }).then(function(url) {
            const options = {
                url: url,
                method: 'post',
                body: JSON.stringify(postBody)
            };

            request(options, (err, resp) => {
                if (!err && resp.statusCode == 200) {
                    res.send(resp.body);
                }
            });
        }, function(err) {
            console.log(err);
        });
    }
}

module.exports = menu;