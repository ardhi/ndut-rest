const mixPlugins = require('ndut-helper/src/mix-plugins')
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

plugins = plugins.map(p => {
  if (typeof(p) === 'string') p = { name: p }
  p.module = require(p.name)
  return p
})

module.exports = async function (fastify) {
  const { config } = fastify
  mixPlugins(plugins, config)
}
