require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  rootURL: '/asset',
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  redis: {
    port: 6379,
    host: 'localhost'
  },
  kue: {
    port: (parseInt(process.env.APIPORT, 10) + 1),
    title: 'UHS-API'
  }
}, environment);
