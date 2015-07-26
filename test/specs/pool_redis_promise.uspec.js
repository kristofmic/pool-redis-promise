describe('pool redis promise', function () {
  var
    DEFAULT_CONFIGS = require('../../config'),
    proxyquire = require('proxyquire').noCallThru(),
    Bluebird = require('bluebird'),
    poolRedisStub,
    redisClientStub,
    PoolRedisPromise,
    prp;

  function setupPromise(cb) {
    return new Bluebird(cb);
  }

  beforeEach(function () {
    redisClientStub = {
      getClient: sinon.stub(),
      release: sinon.stub()
    };

    poolRedisStub = sinon.stub();
    poolRedisStub.returns(redisClientStub);

    PoolRedisPromise = proxyquire('../../dist/pool_redis_promise', {
      'pool-redis': poolRedisStub
    });

    prp = new PoolRedisPromise();
  });

  describe('initialization', function () {
    it('should setup the redis pool', function() {
      expect(poolRedisStub).to.have.been.calledWith({
        host: DEFAULT_CONFIGS.DEFAULT_HOST,
        port: DEFAULT_CONFIGS.DEFAULT_PORT,
        password: null,
        options: {
          connect_timeout: DEFAULT_CONFIGS.DEFAULT_TIMEOUT,
          database: DEFAULT_CONFIGS.DEFAULT_DB
        },
        maxConnections: DEFAULT_CONFIGS.DEFAULT_CONNECTIONS,
        handleRedisError: false
      });
    });
  });

  describe('getClientAsync()', function () {
    it('should setup a client from the pool if it has not been initialized', function(done) {
      var
        clientStub = {
          _initAsync: false,
          selectAsync: sinon.stub(),
          nodeFunc: function(arg1, cb) {
            cb(null, arg1);
          }
        };

      redisClientStub.getClient.callsArgWith(0, clientStub);
      clientStub.selectAsync.callsArg(1);

      prp.getClientAsync(function(client) {
        return new Bluebird(function(res) {
          expect(client._initAsync).to.be.true;
          expect(typeof client.nodeFuncAsync).to.equal('function');
          expect(client.selectAsync).to.have.been.calledWith(DEFAULT_CONFIGS.DEFAULT_DB);
          done();
        });
      });
    });

    it('should not setup a client from the pool if it has been initialized', function(done) {
      var
        clientStub = {
          _initAsync: true,
          selectAsync: sinon.stub(),
          nodeFunc: function(arg1, cb) {
            cb(null, arg1);
          }
        };

      redisClientStub.getClient.callsArgWith(0, clientStub);

      prp.getClientAsync(function(client) {
        return new Bluebird(function() {
          expect(client._initAsync).to.be.true;
          expect(typeof client.nodeFuncAsync).to.equal('undefined');
          expect(client.selectAsync).to.not.have.been.called;
          done();
        });
      });
    });

    it('should release the client after the callback has resolved or rejected', function(done) {
      var
        clientStub = {
          _initAsync: true
        };

      redisClientStub.getClient.callsArgWith(0, clientStub);

      prp.getClientAsync(function(client) {
        return new Bluebird(function(resolve) {
          resolve('success');

          setTimeout(function() {
            expect(redisClientStub.release).to.have.been.calledWith(client);
            done();
          }, 0);
        });
      });
    });
  });
});