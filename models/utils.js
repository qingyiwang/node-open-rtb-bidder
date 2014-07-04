var util = require('util');
var _ = require('lodash');

module.exports.logError = function (err) {
  console.error(util.inspect(err));
  console.error(err.stack);
}

module.exports.requireJSON = function (req, res, next) {
  if (req.is('application/json')) next();
  else res.send(415);
}

module.exports.validateBidRequest = function (req, res, next) {
  if (!req.is('application/json')) {
    console.log('bid request from ' + req.params.exchange +' contains unsuported media type');
    console.log('sending empty bid to ' + req.params.exchange);
    res.send(204);
    return;
  }

  var version;
  if (_.isEmpty(version = req.headers['x-openrtb-version']) || !_.isPlainObject(req.body)) {
    console.log('invalid bid request sent from ' + req.params.exchange);
    console.log('sending empty bid to ' + req.params.exchange);
    res.send(204)
    return;
  }

  if (version == '2.0' || version == '2.1') {
    var bid, imp;
    if (_.has(bid = req.body, 'id') && !_.isEmpty(bid.id) && _.has(bid, 'imp') && _.isArray(imp = req.body.imp)
      && imp.length > 0 && imp.every(function (impression) {
        return _.has(impression, 'id') && !_.isEmpty(impression.id) && (_.has(impression, 'banner') || _.has(impression, 'video'));
      })) next();
    else {
      console.log('invalid bid request sent from ' + req.params.exchange);
      console.log('sending empty bid to ' + req.params.exchange);
      res.send(204);
    }
    return;
  }
  
  console.log('invalid bid request sent from ' + req.params.exchange);
  console.log('sending empty bid to ' + req.params.exchange);
  res.send(204);
}
