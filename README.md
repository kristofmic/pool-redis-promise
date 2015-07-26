Node-env-conf
================

Node-env-conf provides a wrapper to the popular [nconf](https://github.com/indexzero/nconf) npm library.

## Usage

Node-env-conf extends nconf with a simple initialization function to setup nconf and load either default or custom configuration files.

Calling init will always setup nconf with the `process.argv` and `process.env` variables.

### Default configuration

```js
// main project file (e.g., app.js);
var envConf = require('node-env-conf');

// load default configuration
envConf.init();

// loaded
// * [PROJECT_ROOT]/private-config.json
// * [PROJECT_ROOT]/env/[NODE_ENV].json
// * [PROJECT_ROOT]/config.json
// * [PROJECT_ROOT]/package.json

```

### Custom configuration

```js
// main project file (e.g., app.js);
var
  path = require('path'),
  envConf = require('node-env-conf');

// load custom configuration
envConf.init([
  {
    name: 'other_config.json',
    path: path.resolve(__dirname, '..', '..', 'other', 'configs')
  }
]);

// loaded
// * [PROJECT_ROOT]/other/configs/other_config.json

```

## API

Node-env-conf extends the [nconf API](https://github.com/indexzero/nconf#api-documentation), so all properties and methods available on nconf will be available through node-env-conf.

### #init([configs])

Initializes nconf with the `process.argv` and `process.env` variables. Loads in either the default configuration files or the custom files specified by the configs argument.

The order in which the configuration files is specified determines the priority of the configuration values. In other words, whichever file is loaded in first will get highest priority, and whichever is loaded in last will get lowest priority. Any key/value collisions will be resolved to the highest priority file. This can be a convenient means of overriding global configurations with custom environment ones.

The default load order is:

* private-config.json
* [NODE_ENV].json
* config.json
* package.json

**Arguments**

1. [configs] *(Array)*: *Optional* Array of config Objects:
  - name *(String)*: File name
  - path *(String)*: Resolve path to the directory containing the file

**Returns**

Node-env-conf object

## Testing

Tests can be run via `npm test`