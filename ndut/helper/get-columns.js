module.exports = function (source) {
  const { _ } = this.ndut.helper
  let columns = _.without(_.map((source || '').split(','), c => _.trim(c)), '', null, undefined)
  columns = _.map(columns, c => {
    const [value, label] = _.map(c.split(':'), item => _.trim(item))
    return { value, label: label || value }
  })
  return columns
}
