/* jshint camelcase:false*/
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DEFAULT_HOST = 'localhost',
    DEFAULT_PORT = 6379,
    DEFAULT_CONNECTIONS = 50,
    DEFAULT_DB = 0,
    DEFAULT_TIMEOUT = 5000;

var Bluebird = require('bluebird'),
    poolRedis = require('pool-redis'),
    redis;

redis = poolRedis({
  host: REDIS_CONFIG.host,
  port: REDIS_CONFIG.port,
  password: REDIS_CONFIG.password || null,
  options: {
    connect_timeout: REDIS_CONFIG.connectTimeout
  },
  maxConnections: REDIS_CONFIG.maxConnections,
  handleRedisError: false
});

var PoolRedisPromise = (function () {
  function PoolRedisPromise() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PoolRedisPromise);

    config.host = config.host || DEFAULT_HOST;
    config.port = config.port || DEFAULT_PORT;
    config.password = config.password || DEFAULT_PASSWORD;
    config.maxConnections = config.maxConnections || DEFAULT_CONNECTIONS;
    config.handleRedisError = config.handleRedisError || false;
    config.password = config.password || null;
    config.options = config.options || {};
    config.options.connect_timeout = config.options.connect_timeout || DEFAULT_TIMEOUT;
    config.options.database = config.options.database || DEFAULT_DB;

    this._config = config;
    this.redisPool = poolRedis(config);
  }

  _createClass(PoolRedisPromise, [{
    key: 'getClientAsync',
    value: function getClientAsync() {
      return this._getClientFromPool().timeout(this._config.options.connect_timeout, 'Connection to Redis timed out').disposer(function (client) {
        if (client) {
          return this.redisPool.release(client);
        }
      });
    }
  }, {
    key: '_getClientFromPool',
    value: function _getClientFromPool() {
      var _this = this;

      return new Bluebird(function (resolve) {

        _this.redisPool.getClient(function (client) {

          if (!client._initAsync) {
            Bluebird.promisifyAll(client);
            client._initAsync = true;
            client.selectAsync(_this._config.options.database, handleSetClient);
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
