var redis = require("./redis");
var _ = require('lodash');

function Agent (strategy) {
  strategy = _.isFunction(strategy) ? _.bind(strategy, this) : function(){};
  this.redis = redis.sharedClient;
  this.redisSub = redis.createClient();
  
  this.redisSub.on("message", function (channel, message) {
    if (channel == 'bid-request' && strategy) {
      var bidRequest = JSON.parse(message);
      strategy(bidRequest._auction, bidRequest, this.bid);
    };
  });
  this.redisSub.subscribe("bid-request");
};

Agent.prototype.bid = function (auction, bid) {
  this.redis.rpush(auction, JSON.stringify(bid));
};

Agent.prototype.destroy = function () {
  this.redisSub.unsubscribe();
  this.redisSub.end();
};

module.exports.createAgent = function (strategy) {
  return new Agent(strategy);
};
