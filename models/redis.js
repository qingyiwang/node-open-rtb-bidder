var redis = require("redis");
var utils = require('./utils');
var sharedClient = redis.createClient();

sharedClient.on("error", function (err) { utils.logError(err); });

module.exports.sharedClient = sharedClient;

module.exports.createClient = function () {
  client = redis.createClient();
  client.on("error", function (err) { utils.logError(err); });
  return client;
};
