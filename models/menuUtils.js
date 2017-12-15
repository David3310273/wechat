var https = require('https');   //pay attention to this, http not equals https!
var debug = require('debug')('wechat');
var mongoose = require('mongoose');
var config = require('../config');
var util = require('../util');
var request = require('request');
var accessToken = require('../models/accessToken');
var querystring = require('querystring');

var menu = {
    list: (req, res, next) => {
        var record = '';
        var AccessToken = accessToken.model;
        var record = AccessToken.findOne({}, 'token');

        record.then((doc) => {
            var rawBody = '';
            var url = config.menuProfile + '?' + querystring.stringify({
                access_token: doc.token
            });

            request(url, (err, response) => {
                res.send(response.body);
            });
        });
    },

    create: (req, res, next) => {
        var AccessToken = accessToken.model;
        var record = AccessToken.findOne({}, 'token');
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

        record.then((doc) => {
            var rawBody = '';
            const url = config.menuCreate + '?' + querystring.stringify({
                access_token: doc.token
            });
            const options = {
                url: url,
                method: 'post',
                body: JSON.stringify(postBody)
            }

            request(options, (err, resp) => {
                if (!err && resp.statusCode == 200) {
                    res.send(resp.body);
                }
            });
        });
    }
}

module.exports = menu;