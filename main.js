console.log('Server env', process.env)
require('babel-polyfill');
require('./node/dist/javascript/app.js')
