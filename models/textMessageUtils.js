var xml2js = require('xml2js');
var xmlParser = xml2js.parseString;
var xmlBuilder = new xml2js.Builder({
    cdata: true,
    rootName: 'xml',
    headless: true
});
var request = require('request');
var config = require('../config');
var createError = require('http-errors');
var debug = require('debug')('textMessageUtils');
var infoLogger = require('./logger').getLogger('info');
var errLogger = require('./logger').getLogger('error');

var getContent =  (xml) => {
    var content = '';

    xmlParser(xml, (err, msg) => {
        content = msg.xml;
    });

    return content;
};

var createMsg = (data) => {
    return xmlBuilder.buildObject(data);
};

/**
 * TODO: reply more types of message.
 */

module.exports.replyMsg = (req, res, next) => {
    var msg = getContent(req.body);
    var postBody = {
        key: config.turingApiKey,
        info: msg.Content.toString();
    };

    var dataToBeSend = {
        ToUserName: msg.FromUserName.toString(),
        FromUserName: msg.ToUserName.toString(),
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: ''
    }

    var options = {
        url: config.turingRobot,
        method: 'post',
        body: JSON.stringify(postBody)
    }

    request(options, (err, response) => {
        if (!err) {
            try {
                dataToBeSend.Content = (JSON.parse(response.body)).text;
                infoLogger.info(dataToBeSend.Content);
            } catch (e) {
                next(createError(500, "parse error!"));
            }
            
            res.setHeader('Content-Type', 'application/xml');
            res.send(createMsg(dataToBeSend));
        } else {
            next(err);
        }
    });
}

exports.xmlParser = xmlParser;
exports.xmlBuilder = (options) => {
    return typeof options !== 'undefined' ? new xml2js.Builder(options) : xmlBuilder;
}