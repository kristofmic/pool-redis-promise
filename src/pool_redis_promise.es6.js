/* jshint camelcase:false*/
/* jshint maxlen:110*/

var
  Bluebird = require('bluebird'),
  poolRedis = require('pool-redis'),
  DEFAULT_CONFIGS = require('../config');

class PoolRedisPromise {
  constructor (config = {}) {
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

  getClientAsync (cb) {
    return Bluebird.using(this._getClientAsync(), cb);
  }

  _getClientAsync () {
    return this._getClientFromPool()
      .timeout(this._config.options.connect_timeout, 'Connection to Redis timed out')
      .disposer((client) => {
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