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
    const { prepList } = this.ndutApi.helper
    const model = await getModelByAlias(realAlias)
    const filter = translateFilter.call(this, request.query)
    const params = await prepList(model, filter)
    if (_.isFunction(query)) params.where = await query.call(this, params.where, request)
    else params.where = _.merge(params.where, query)
    const columns = getColumns.call(this, request.query.columns)
    const { user, site, rule } = request
    if (request.query.export && !this.ndutReport) throw this.Boom.internal('ndutReportMissing')
    if (['json', 'jsonl'].includes(request.query.export)) {
      const trueJson = request.query.export === 'json'
      const options = { trueJson, columns }
      const stream = await this.ndutReport.helper.exportJsonl({ model, params, filter: { user, site, rule }, options })
      reply.type(trueJson ? 'application/json' : 'text/plain').send(stream)
      return
    }
    if (request.query.export === 'csv') {
      reply.header('Content-Type', 'text/csv')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.csv;`)
      const options = { columns }
      const data = await this.ndutReport.helper.exportCsv({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=${realAlias}.xlsx;`)
      const options = { columns }
      const data = await this.ndutReport.helper.exportXlsx({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'html') {
      reply.header('Content-Type', 'text/html')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.html;`)
      const options = { columns }
      const data = await this.ndutReport.helper.exportHtml({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    if (request.query.export === 'pdf') {
      reply.header('Content-Type', 'application/pdf')
      if (!request.query.inline) reply.header('Content-Disposition', `attachment; filename=${realAlias}.pdf;`)
      const options = { columns }
      const data = await this.ndutReport.helper.exportPdf({ model, params, filter: { user, site, rule }, options })
      reply.send(data)
      return
    }
    const options = { columns }
    params.noCount = request.query.nocount
    if (!params.noCount) params.total = await this.ndutApi.helper.count({ model, params, filter: { user, site, rule } })
    return await this.ndutApi.helper.find({ model, params, filter: { user, site, rule }, options })
  }
  const tags = _.isString(swaggerTags) ? [swaggerTags] : swaggerTags
  const realSchema = _.cloneDeep(schema) || {
    description: 'Get records. Use query string to filter, sort and pagination',
    tags
  }
  return { handler, schema: realSchema }
}