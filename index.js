const pkg = require('./package.json')

exports.plugin = {
  name: pkg.name,
  register: require('./lib/error-handling'),
  once: true,
  pkg
}
