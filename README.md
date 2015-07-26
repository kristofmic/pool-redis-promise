Pool-redis-promise
================

Pool-redis-promise provides a wrapper to the [pool-redis](https://github.com/Valzon/node-redis-pool) npm library.

## Usage

Pool-redis-promise wraps pool-redis, which wraps [node_redis](https://github.com/NodeRedis/node_redis), providing redis connection pooling with a clean promise-based API (based on [Bluebird](https://github.com/petkaantonov/bluebird));

Pool-redis-promise exposes a simple class that can be invoked with a [configuration](https://www.npmjs.com/package/pool-redis#redis-pool-options) that pool-redis expects, which is then passed to the redis clients. The instance returned exposes a single public API method `#getClientAsync`, which must be invoked with a single callback function argument which receives the redis client from the pool as its single argument.

All calls to `getClientAsync` returns a promise. The client itself is populated with both promise-based and non-promised based methods. The non-promise-based methods are those on the (standard redis client)[https://github.com/NodeRedis/node_redis#sending-commands]. The promise-based methods are those same commands appended with `Async` (e.g., the callback-based `set` has a promise-based method `setAsync`). The promise-based methods accept the same arguments however return a promise and do not accept a callback as the last command (errors will bubble to `catch` functions and successes will bubble to the next `then`);

### Default configuration

Pool-redis-promise sets up a default configuration when a new instance is created if a configuration is not provided (or only a partial configuration is provided). The default configuration is as follows:

```js
  {
    host: 'localhost',
    port: 6379,
    password: null,
    maxConnections: 50,
    handleRedisError: false,
    options: {
      database: 0,
      connect_timeout: 5000
    }
  }

```

## API

### #constructor

`new require('pool-redis-promise')([config])`

Initializes a new redis connection pool with the provided configuration settings. Any settings not provided will fallback to the defaults listed above.

**Arguments**

1. [configs] *(Object)*: *Optional* Configuration settings (see [pool-redis options](https://www.npmjs.com/package/pool-redis#redis-pool-options) for the settings that can be provided)

**Returns**

Instance of a redis connection pool

### #getClientAsync(callback)

Fetches a client from the redis connection pool and passes the client as the first and only argument to the callback function. As previously mentioned, the client contains callback-based and promise-based methods. The promise-based methods are the same as the standard redis client methods but with `Async` appended and return a promise instead of accepting a callback as the last argument.

**Returns**

A Bluebird promise

## Testing

Tests can be run via `npm test`. Ensure that an instance of Redis is running for the integration tests.