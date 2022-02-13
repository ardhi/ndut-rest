module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags } = opts
  const { asOpenApiProperties } = this.ndutDb.helper
  const properties = await asOpenApiProperties(opts.alias)
  const handler = async function (request, reply) {
    const { getModelByAlias, getSchemaByAlias } = this.ndutDb.helper
    const realAlias = alias ? alias : request.params.model
    const schema = await getSchemaByAlias(realAlias)
    if (!schema.expose.create) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const { body, user, site } = request
    return await this.ndutApi.helper.create({ model, body, filter: { user, site } })
  }
  let tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Create and persist records',
    tags,
    body: {
      type: 'object'
      // properties
    }
  }
  return { handler, schema: realSchema }
}