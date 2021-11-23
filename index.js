const { isString } = require('lodash')
const qs = require('qs')
const swaggerDef = require('./swagger-def')

let plugins = [
  'fastify-compress',
  'fastify-cors',
  {
    name: 'fastify-formbody',
    options: { parser: str => qs.parse(str) }
  },
  'fastify-multipart',
  'fastify-helmet',
  'fastify-rate-limit',
  {
    name: 'fastify-swagger',
    options: swaggerDef
  }
]

plugins = plugins.map(p => (isString(p) ? { name: p } : p))

module.exports = async fastify => {
  const { config } = fastify
  for (const p of plugins) {
    const cfg = config.plugins[p.name]
    await fastify.register(require(p.name), cfg || p.options)
  }
}
