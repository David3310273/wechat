var log4js = require('log4js');
var config = require('../config');

log4js.configure(config.logConfig);

module.exports.getLogger = (level) => {
    const logger = log4js.getLogger(level);
    return logger;
};