module.exports = async function (request, model) {
  const query = request.query
  const { _, getNdutConfig } = this.ndut.helper
  const restConfig = await getNdutConfig('ndut-rest')
  const { schemas } = this.ndutDb
  const { queryKey, maxPageSize } = restConfig
  if (!_.isString(model)) model = model.name
  let limit = parseInt(query[queryKey.pageSize]) || maxPageSize
  if (limit > maxPageSize) limit = maxPageSize
  if (limit < 1) limit = 1
  let page = parseInt(query[queryKey.page]) || 1
  if (page < 1) page = 1
  let skip = (page - 1) * limit
  if (query[queryKey.offset]) {
    skip = parseInt(query[queryKey.offset]) || skip
    page = undefined
  }
  if (skip < 0) skip = 0
  let where = {}
  if (query[queryKey.query]) {
    try {
      where = JSON.parse(query[queryKey.query])
    } catch (err) {
      throw new Error(`Can't parse datasource query`)
    }
  }
  let order = query[queryKey.sort]
  if (!order) {
    const schema = _.find(schemas, { name: model }) || {}
    const keys = _.map(schema.columnns, 'name')
    const found = _.intersection(keys, ['updated_at', 'updatedAt', 'created_at', 'createdAt'])
    if (found[0]) order = `${found[0]} DESC`
  }
  return { limit, page, skip, order, where }
}
