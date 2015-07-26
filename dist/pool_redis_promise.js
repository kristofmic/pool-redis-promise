/* jshint camelcase:false*/
/* jshint maxlen:110*/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Bluebird = require('bluebird'),
    poolRedis = require('pool-redis'),
    DEFAULT_CONFIGS = require('../config');

var PoolRedisPromise = (function () {
  function PoolRedisPromise() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PoolRedisPromise);

    config.host = config.host || DEFAULT_CONFIGS.DEFAULT_HOST;
    config.port = config.port || DEFAULT_CONFIGS.DEFAULT_PORT;
    config.password = config.password || DEFAULT_CONFIGS.DEFAULT_PASSWORD;
    config.maxConnections = config.maxConnections || DEFAULT_CONFIGS.DEFAULT_CONNECTIONS;
    config.handleRedisError = config.handleRedisError || false;
    config.password = config.password || null;
    config.options = config.options || {};
    config.options.connect_timeout = config.options.connect_timeout || DEFAULT_CONFIGS.DEFAULT_TIMEOUT;
    config.options.database = config.options.database || DEFAULT_CONFIGS.DEFAULT_DB;

    this._config = config;
    this.redisPool = poolRedis(config);
  }

  _createClass(PoolRedisPromise, [{
    key: 'getClientAsync',
    value: function getClientAsync() {
      var _this = this;

      return this._getClientFromPool().timeout(this._config.options.connect_timeout, 'Connection to Redis timed out').disposer(function (client) {
        if (client) {
          return _this.redisPool.release(client);
        }
      });
    }
  }, {
    key: '_getClientFromPool',
    value: function _getClientFromPool() {
      var _this2 = this;

      return new Bluebird(function (resolve) {

        _this2.redisPool.getClient(function (client) {

          if (!client._initAsync) {
            Bluebird.promisifyAll(client);
            client._initAsync = true;
            client.selectAsync(_this2._config.options.database, handleSetClient);
          } else {
            handleSetClient();
          }

          function handleSetClient() {
            resolve(client);
          }
        });
      });
    }
  }]);

  return PoolRedisPromise;
})();

module.exports = PoolRedisPromise;
