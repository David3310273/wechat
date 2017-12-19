var express = require('express');
var accessToken = require('../models/accessToken');
var router = express.Router();
var debug = require('debug')('index');
var infoLogger = require('../models/logger').getLogger('info');
var textMsgUtils = require('../models/textMessageUtils');

router.get('/', (req, res, next) => {
    infoLogger.info(req.query);
    res.send(accessToken.validate(req));
});

router.post('/', (req, res, next) => {
    infoLogger.info(req.body);
    textMsgUtils.replyMsg(req, res, next);
});

module.exports = router;
