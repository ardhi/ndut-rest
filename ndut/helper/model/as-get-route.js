const getColumns = require('../get-columns')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags } = opts
  const handler = async function (request, reply) {
    const { getModelByAlias, getSchemaByAlias, query = {} } = this.ndutDb.helper
    const realAlias = alias ? alias : request.params.model
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.get) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const { user, site, rule } = request
    let where = { id: request.params.id }
    if (_.isFunction(query)) where = await query.call(this, where)
    else where = _.merge(where, query)
    const params = { where }
    const options = { columns: getColumns.call(this, request.query.columns) }
    if (['json', 'jsonl'].includes(request.query.export)) {
      options.trueJson = request.query.export === 'json'
      const stream = await this.ndutReport.helper.exportSingleJsonl({ model, params, filter: { user, site, rule }, options })
      reply.type('application/json').send(stream)
      return
    }
    if (request.query.export === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=${realAlias}.xlsx;`)
      const data = await this.ndutReport.helper.exportSingleXlsx({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'csv') {
      reply.header('Content-Type', 'text/csv')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.csv;`)
      const data = await this.ndutReport.helper.exportSingleCsv({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'html') {
      reply.header('Content-Type', 'text/html')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.html;`)
      const data = await this.ndutReport.helper.exportSingleHtml({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'pdf') {
      reply.header('Content-Type', 'application/pdf')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.pdf;`)
      const data = await this.ndutReport.helper.exportSinglePdf({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    return await this.ndutApi.helper.findOne({ model, params, filter: { user, site }, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get record by its ID',
    tags,
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Record ID'
        }
      }
    }
  }
  return { handler, schema: realSchema }
}

