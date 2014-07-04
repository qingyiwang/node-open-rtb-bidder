var redis = require('../models/redis').sharedClient;
var flow = require('flow');
var Agent = require('../models/agent');
var agents = {};

module.exports.loadAgents = function () {
  agents = {};
  flow.exec(
    function() { redis.lrange('agents', 0, -1, this); },
    function(err, agents) {
      var thisFlow = this;
      if (err) throw err;
      else agents.forEach(function (agentKey) { redis.hgetall(agentKey, thisFlow.MULTI()); });
    },
    function(argsArray) {
      var error = false;
      argsArray.forEach(function (args) {
        if (args[0]) throw args[0];
        else {
          var strategy;
          eval('strategy = ' + args[1].strategy);
          agents[args[1].id] = Agent.createAgent(strategy);
        }
      });
    }
  );
};

module.exports.createAgent = function (req, res, next) {
  var agentId, _nextId;
  
  flow.exec(
    function () { redis.incr('agent:nextId', this); },
    function (err, nextId) {
      agentId = 'agent:' + nextId;
      _nextId = nextId;

      if (err) next(err);
      else redis.hmset(agentId, {id: nextId, strategy: req.body.strategy}, this);
    },
    function (err) {
      if (err) next(err);
      else redis.lpush('agents', agentId, this);
    },
    function (err) {
      if (err) next(err);
      else {
        res.send(201);
        var strategy;
        eval('strategy = ' + req.body.strategy);
        agents[_nextId] = Agent.createAgent(strategy);
      }
    }
  );
};

module.exports.getAgents = function (req, res, next) {
  flow.exec(
    function () { redis.lrange('agents', 0, -1, this); },
    function (err, agents) {
      var thisFlow = this;
      if (err) next(err);
      else if (!agents.length) res.send(200, []);
      else agents.forEach(function (agentKey) { redis.hgetall(agentKey, thisFlow.MULTI()); });
    },
    function(argsArray) {
      var error;
      var agentsArray = [];

      argsArray.forEach(function (args) {
        if (args[0]) error = args[0];
        else agentsArray.push(args[1]);
      });

      if (error) next(error);
      else res.send(200, agentsArray);
    }
  );
};

module.exports.deleteAgentWithId = function (req, res, next) {
  var agentKey = 'agent:' + req.params.agentId;
  flow.exec(
    function () { redis.lrem('agents', 0, agentKey, this); },
    function (err) {
      if (err) next(err);
      else redis.del(agentKey, this);
    },
    function (err) {
      if (err) next(err);
      else {
        var agent = agents[req.params.agentId];
        if (agent) {
          agent.destroy();
          delete agents[req.params.agentId];
        }
        res.send(200);
      }
    }
  );
};
