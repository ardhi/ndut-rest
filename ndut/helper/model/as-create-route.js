const getOpenApiProps = require('../../../lib/get-open-api-props')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, schemaTags } = opts
  const properties = getOpenApiProps.call(this, opts.alias)
  const handler = async function (request, reply) {
    const { _ } = this.ndut.helper
    const { getSchemaByAlias, formatSchema } = this.ndutDb.helper
    const realAlias = alias ? alias : request.params.model
    const schema = getSchemaByAlias(realAlias)
    if (!schema.expose.create) throw this.Boom.notFound('Resource not found')
    const bodyProps = formatSchema(schema)
    const model = this.ndutDb.helper.getModelByAlias(realAlias)
    const data = await this.ndutDb.create(model, request, request.body)
    return {
      data,
      message: 'Record successfully created'
    }
  }
  const realSchema = _.cloneDeep(schema) || {
    description: 'Create and persist records',
    tags: [schemaTags || 'General'],
    body: {
      type: 'object',
      properties
    }
  }
  return { handler, schema: realSchema }
}