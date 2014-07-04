var redis = require("./redis").sharedClient;
var _ = require('lodash');

function Auction (exchange, bidRequest, strategy, res) {
  this.bidRequest = bidRequest;
  this.res = res;
  this.exchange = exchange;
  this.bidSent = false;

  var thisSelf = this;
  var timeout;
  var responseWindow = 50;
  if (!(timeout = _.parseInt(bidRequest.tmax)) || !_.isFinite(timeout)) timeout = 500;

  strategy = _.isFunction(strategy) ? _.bind(strategy, this) : function(){};
  
  var auctionKey;
  setTimeout(function() {
    redis.LRANGE(auctionKey, 0, -1, function (err, bids) {
      if (!err && bids.length > 0) {
        strategy(bids, this.sendBid);
        setTimeout(function() {
          if (!thisSelf.bidSent) {
            thisSelf.bidSent = true;
            console.log('sending empty bid for bid request ' + bidRequest.id + ' to ' + exchange);
            res.send(204);
          }
        }, responseWindow);
      }
      else {
        thisSelf.bidSent = true;
        console.log('sending empty bid for bid request ' + bidRequest.id + ' to ' + exchange);
        res.send(204);
      }
    });
  }, Math.abs(timeout - responseWindow));

  redis.incr('auction:nextId', function (err, nextId) { 
    auctionKey = 'auction:' + nextId;
    bidRequest._auction = auctionKey;
    redis.publish("bid-request", JSON.stringify(bidRequest));
  });
};

Auction.prototype.sendBid = function (bid) {
  if (this.bidSent) return;
  this.bidSent = true;
  console.log('sending bid for bid request ' + this.bidRequest.id + ' to ' + this.exchange);
  this.res.send(200, bid);
};

module.exports.createAuction = function (exchange, bidRequest, strategy, res) {
  return new Auction(exchange, bidRequest, strategy, res);
};
