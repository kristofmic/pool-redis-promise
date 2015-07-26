module.exports = {
  test: {
    src: [
      'test/config/mocha.conf.js',
      'test/config/istanbul.conf.js',
      'test/specs/**/*.uspec.js'
    ], // the folder, not the files
    options: {
      coverage: true,
      coverageFolder: 'test/reports/',
      root: '/',
      excludes: [''],
      reportFormats: ['lcov'],
      check: {
        statements: 90,
        branches: 75,
        functions: 75,
        lines: 90
      }
    }
  }
};