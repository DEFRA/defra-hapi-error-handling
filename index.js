const Joi = require('@hapi/joi')
const { logger } = require('defra-logging-facade')

function createError (request, field, type) {
  // Generate an example error structure
  const schema = Joi.object({ [field]: Joi.string() })
  const errors = schema.validate({ [field]: true })
  const [error] = errors.error.details
  // Replace contents with error we want to create
  error.message = `"${field}" ${request.response.message}`
  error.type = type
  return errors.error
}

const register = (server, options = {}) => {
  const {
    handleFailedPrecondition = (request, h) => h.redirect('/'),
    errorViewLocation = 'error-handling'
  } = options

  server.ext('onPreResponse', async (request, h) => {
    const response = request.response

    if (response.isBoom) {
      // An error was raised during
      // processing the request
      const statusCode = response.output.statusCode

      switch (statusCode) {
        case 403:
        case 404:
          return h.view(`${errorViewLocation}/${statusCode}`).code(statusCode)
        case 412: {
          return handleFailedPrecondition(request, h)
        }
        case 413: {
          return request.route.settings.validate.failAction(request, h, createError(request, 'photograph', 'binary.max'))
        }
        default:
          request.log('error', {
            statusCode: statusCode,
            data: response.data,
            message: response.message
          })

          // log an error to airbrake/errbit - the response object is actually an instanceof Error
          logger.serverError(response, request)

          // Then return the `500` view (HTTP 500 Internal Server Error )
          return h.view(`${errorViewLocation}/500`).code(500)
      }
    }
    return h.continue
  })
}

const pkg = require('./package.json')

exports.plugin = {
  name: pkg.name,
  register,
  once: true,
  pkg
}
