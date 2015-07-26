describe('getProjectRoot', function () {
  var
    proxyquire = require('proxyquire'),
    fsStub,
    getProjectRoot;

  beforeEach(function () {
    fsStub = {
      readdirSync: sinon.stub()
    };

    getProjectRoot = proxyquire('../../lib/get_project_root', {
      fs: fsStub
    });
  });

  it('should get the root where package.json is found', function() {
    fsStub.readdirSync.returns(['foo.js', 'bar.js', 'package.json', 'baz.yml']);

    expect(getProjectRoot('path/to/service/node_modules')).to.equal('path/to/service/');
    expect(getProjectRoot('path/to/service/node_modules/another_service/node_modules/lib')).to.equal('path/to/service/node_modules/another_service/');
  });
});