const glob = require("glob")
const testFiles = glob.sync('lib/**/*.test.js')
const config = {
  paths: testFiles,
  coverage: true,
  threshold: 85,
  globals: '__core-js_shared__'
}

module.exports = config
