module.exports.isset = function (data) {
    return typeof data !== "undefined";
}

module.exports.empty = function (data) {
    return isset(data) && (data === '' || data === null || data.length === 0);
}