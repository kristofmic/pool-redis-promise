/* jshint camelcase:false*/
const
  DEFAULT_HOST = 'localhost',
  DEFAULT_PORT = 6379,
  DEFAULT_CONNECTIONS = 50,
  DEFAULT_DB = 0,
  DEFAULT_TIMEOUT = 5000;

var
  Bluebird = require('bluebird'),
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

class PoolRedisPromise {
  constructor (config = {}) {
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

  getClientAsync () {
    return this._getClientFromPool()
      .timeout(this._config.options.connect_timeout, 'Connection to Redis timed out')
      .disposer(function(client) {
        if (client) {
          return this.redisPool.release(client);
        }
      });
  }

  _getClientFromPool () {
    return new Bluebird((resolve) => {

      this.redisPool.getClient((client) => {

        if (!client._initAsync) {
          Bluebird.promisifyAll(client);
          client._initAsync = true;
          client.selectAsync(this._config.options.database, handleSetClient);
        }
        else {
          handleSetClient();
        }

        function handleSetClient() {
          resolve(client);
        }
      });
    });
  }
}

module.exports = PoolRedisPromise;