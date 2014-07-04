var cluster = require('cluster');
cluster.on('exit', function (worker) { cluster.fork(); });

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i += 1) cluster.fork();
} 
else {
  var utils = require('./models/utils');
  var Auction = require('./models/auction');
  var agent = require('./controllers/agent');
  var auctionStrategy = require('./controllers/auction-strategy');
  var express = require('express');
  var app = express();

  agent.loadAgents();
  auctionStrategy.loadStrategy();
  app.use(express.json());
  app.use(app.router);

  app.use(function(err, req, res, next) {
    utils.logError(err);
    if (req.url.indexOf('/bid-request') == 0) {
      console.log('sending empty bid to ' + req.params.exchange);
      res.send(204);
    }
    else res.send(500);
  });

  app.post('/bid-request/:exchange', utils.validateBidRequest, function (req, res, next) {
    console.log('recieved bid request ' + req.body.id + ' from ' + req.params.exchange +' (worker ' + cluster.worker.id +')');
    Auction.createAuction(req.params.exchange, req.body, auctionStrategy.current, res);
  });

  app.post('/agents', utils.requireJSON, agent.createAgent);
  app.get('/agents', agent.getAgents);
  app.delete('/agents/:agentId', agent.deleteAgentWithId);

  app.put('/auctionStrategies/current', utils.requireJSON, auctionStrategy.updateCurrentStrategy);

  var port = process.env.PORT || 5000;
  app.listen(port, function() {
    console.log('server listening on port ' + port +' (worker ' + cluster.worker.id +')');
  });
}
