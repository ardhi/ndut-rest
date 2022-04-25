module.exports = function (item) {
  const { _, getNdutConfig } = this.ndut.helper
  const config = getNdutConfig('ndut-rest')
  const invQueryKey = _.invert(config.queryKey)

  const result = {}
  _.forOwn(item, (v, k) => {
    if (_.has(invQueryKey, k)) result[invQueryKey[k]] = v
    else result[k] = v
  })
  return result
}
