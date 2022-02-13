module.exports = async function (scope, prefix, routeInfo) {
  const mapper = {
    list: 'GET',
    get: 'GET',
    create: 'POST',
    update: 'PUT',
    remove: 'DELETE'
  }
  const { _, getNdutConfig } = scope.ndut.helper
  const { getSchemaByAlias } = scope.ndutDb.helper
  const actions = _.omit(mapper, routeInfo.omitted || [])
  const cfg = getNdutConfig('ndut-rest')
  const dbSchema = await getSchemaByAlias(routeInfo.alias)
  for (const a in actions) {
    const { handler, schema } = await scope.ndutRest.helper[`modelAs${_.upperFirst(a)}Route`](routeInfo)
    const method = mapper[a]
    const exposed = _.get(dbSchema, `expose.${a}`)
    if (!exposed) continue
    let url = routeInfo.url
    if (['get', 'update', 'remove'].includes(a)) url += '/:id'
    if (_.get(cfg, `hideSwaggerTags.${url}`, []).includes(mapper[a])) schema.tags = false
    scope.route({ url, method, schema, handler })
    scope.log.debug(`* ${_.padEnd('[' + method + ']', 8, ' ')} ${_.isEmpty(prefix) ? '' : ('/' + prefix)}${url}`)
  }
}
