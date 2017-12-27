var express = require('express');
var router = express.Router();
var https = require('https');   //pay attention to this, http not equals https!
var debug = require('debug')('wechat');
var mongoose = require('mongoose');
var config = require('../config');
var util = require('../util');
var request = require('request');
var querystring = require('querystring');
var accessToken = require('../models/accessToken');
var wechatMenu = require('../models/menuUtils');
var infoLogger = require('../models/logger').getLogger('info');
var errLogger = require('../models/logger').getLogger('error');

router.get('/', (req, res, next) => {
    wechatMenu.list().then((url) => {
        request(url, (err, response) => {
            if (err) {
                next(err);
            }

            res.render('menuManagement', JSON.parse(response.body));
            // res.send(response.body);
        });
    });
});

module.exports = router;