const getColumns = require('../get-columns')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags } = opts
  const handler = async function (request, reply) {
    const { getNdutConfig } = this.ndut.helper
    const { getModelByAlias, getSchemaByAlias, query = {} } = this.ndutDb.helper
    const cfg = getNdutConfig('ndutApi')
    const realAlias = alias ? alias : request.params.model
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.get) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const filter = this.ndutRoute.helper.buildFilter(request)
    const replacer = new RegExp(cfg.slashReplacer, 'g')
    const where = { id: request.params.id.replace(replacer, '/') }
    const params = { where }
    if (_.isFunction(query)) await query.call(this, params.where, request)
    else params.where = _.merge(params.where, query)
    const options = { columns: getColumns.call(this, request.query.columns), request }
    if (['json', 'jsonl'].includes(request.query.export)) {
      options.trueJson = request.query.export === 'json'
      const stream = await this.ndutReport.helper.exportSingleJsonl({ model, params, filter, options })
      reply.type('application/json').send(stream)
      return
    }
    if (request.query.export === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=${realAlias}.xlsx;`)
      const data = await this.ndutReport.helper.exportSingleXlsx({ model, params, filter, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'csv') {
      reply.header('Content-Type', 'text/csv')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.csv;`)
      const data = await this.ndutReport.helper.exportSingleCsv({ model, params, filter, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'html') {
      reply.header('Content-Type', 'text/html')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.html;`)
      const data = await this.ndutReport.helper.exportSingleHtml({ model, params, filter, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'pdf') {
      reply.header('Content-Type', 'application/pdf')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.pdf;`)
      const data = await this.ndutReport.helper.exportSinglePdf({ model, params, filter, options })
      reply.send(data)
      return
    }
    return await this.ndutApi.helper.findOne({ model, params, filter, options })
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

