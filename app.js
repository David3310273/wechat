var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var rfs = require('rotating-file-stream');  //rotate log file

var mongoose = require('mongoose');
var index = require('./routes/index');
var accessToken = require('./routes/accessToken');
var wechat = require('./routes/wechat');    
var config = require('./config');     //loading global url config
var infoLogger = require('./models/logger').getLogger('info');
var getBody = require('raw-body');

var app = express();

fs.existsSync(path.join(config.logPath)) || fs.mkdir(path.join(config.logPath));
// config log path.

var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate once a day
    path: path.join(config.logPath),
});

var errorLogStream = rfs('error.log', {
    interval: '2d',
    path: path.join(config.logPath)
});

/*use morgan to log the request in access.log and error.log, see docs here: [https://github.com/expressjs/morgan]*/
app.use(logger('combined', {
    stream: accessLogStream,
    skip: function(req, res) {
        return res.statusCode < 400
    }
}));

app.use(logger('combined', {
    stream: errorLogStream,
    skip: function(req, res) {
        return res.statusCode >= 400 && res.statusCode < 600
    }
}));  

mongoose.connect(config.db);

mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + config.db);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});

app.on('close', function() {
  mongoose.disconnect();
})

app.use(function(req, res, next) {    //if middleware can't parse the request body, return the raw body instead.
  getBody(req, {}, function(err, body) {
    if (err) {
      next(err);
    } else {
      req.body = body.toString();
      next();
    }
  });
});

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());

app.use('/index', index);   //mounting router on specific url
app.use('/accessToken', accessToken);
app.use('/wechat', wechat);

//final error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

module.exports = app;