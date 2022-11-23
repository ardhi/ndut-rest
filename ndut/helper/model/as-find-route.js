const getColumns = require('../get-columns')
const translateFilter = require('../translate-filter')

module.exports = async function (opts = {}) {
  const { _ } = this.ndut.helper
  const { alias, schema, swaggerTags, query } = opts

  const handler = async function (request, reply) {
    const realAlias = alias ? alias : request.params.model
    const { _ } = this.ndut.helper
    const { getSchemaByAlias, getModelByAlias } = this.ndutDb.helper
    const modelSchema = await getSchemaByAlias(realAlias)
    if (!modelSchema.expose.find) throw this.Boom.notFound('resourceNotFound')
    const model = await getModelByAlias(realAlias)
    const params = this.ndutApi.helper.prepList(translateFilter.call(this, request.query), model)
    if (_.isFunction(query)) await query.call(this, params.where, request)
    else params.where = _.merge(params.where, query)
    const columns = getColumns.call(this, request.query.columns)
    const filter = this.ndutRoute.helper.buildFilter(request)
    if (request.query.export && !this.ndutReport) throw this.Boom.internal('ndutReportMissing')
    const options = { columns, request }
    if (['json', 'jsonl'].includes(request.query.export)) {
      options.trueJson = request.query.export === 'json'
      const stream = await this.ndutReport.helper.exportJsonl({ model, params, filter, options })
      reply.type(trueJson ? 'application/json' : 'text/plain').send(stream)
      return
    }
    if (request.query.export === 'csv') {
      reply.header('Content-Type', 'text/csv')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.csv;`)
      const data = await this.ndutReport.helper.exportCsv({ model, params, filter, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=${realAlias}.xlsx;`)
      const data = await this.ndutReport.helper.exportXlsx({ model, params, filter, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'html') {
      reply.header('Content-Type', 'text/html')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.html;`)
      const data = await this.ndutReport.helper.exportHtml({ model, params, filter, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'pdf') {
      reply.header('Content-Type', 'application/pdf')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.pdf;`)
      const data = await this.ndutReport.helper.exportPdf({ model, params, filter, options })
      reply.send(data)
      return
    }
    params.noCount = !!(request.query.nocount || request.query.noCount)
    return await this.ndutApi.helper.find({ model, params, filter, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags
  }
  return { handler, schema: realSchema }
}