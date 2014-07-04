var redis = require('../models/redis').sharedClient;
var flow = require('flow');

module.exports.loadStrategy = function () {
  redis.hget('auctionStrategy:current', 'strategy', function (err, strategy) {
    if (err) throw err;
    else {
      var strategy;
      eval('strategy = ' + strategy);
      module.exports.current = strategy;
    }
  });
};

module.exports.updateCurrentStrategy = function (req, res, next) {
  redis.hset('auctionStrategy:current', 'strategy', req.body.strategy, function (err) {
    if (err) next(err);
    else {
      var strategy;
      eval('strategy = ' + req.body.strategy);
      module.exports.current = strategy;
      res.send(200);
    }
  });
};
