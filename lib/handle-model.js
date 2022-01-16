module.exports = async function (scope, prefix, routeInfo) {
  const mapper = {
    list: 'GET',
    get: 'GET',
    create: 'POST',
    update: 'PUT',
    remove: 'DELETE'
  }
  const { _ } = scope.ndut.helper
  const actions = _.omit(mapper, routeInfo.omitted || [])
  for (const a in actions) {
    const { handler, schema } = await scope.ndutRest.helper[`modelAs${_.upperFirst(a)}Route`](routeInfo)
    const method = mapper[a]
    let url = routeInfo.url
    if (['get', 'update', 'remove'].includes(a)) url += '/:id'
    scope.route({ url, method, schema, handler })
    scope.log.debug(`* ${_.padEnd('[' + method + ']', 8, ' ')} ${_.isEmpty(prefix) ? '' : ('/' + prefix)}${url}`)
  }
}
