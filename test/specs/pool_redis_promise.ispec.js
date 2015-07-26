describe('pool redis promise (integration)', function () {
  var
    Bluebird = require('bluebird'),
    PoolRedisPromise,
    prp;

  before(function () {
    PoolRedisPromise = require('../../dist/pool_redis_promise');
    prp = new PoolRedisPromise();
  });

  it('should be able to store and fetch a value from redis', function(done) {
    prp.getClientAsync(function(client) {
      client.hmsetAsync('myKey', 'prop1', 'val1', 'prop2', 'val2')
        .then(function() {
          return client.hgetallAsync('myKey');
        })
        .then(function(vals) {
          expect(vals).to.eql({
            prop1: 'val1',
            prop2: 'val2'
          });

          return client.delAsync('myKey');
        })
        .then(function(val) {
          expect(val).to.equal(1);

          done();
        });
    });
  });
});