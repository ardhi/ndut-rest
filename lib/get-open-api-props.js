module.exports = function (alias, omittedColumns = []) {
  if (!alias) return
  const { getSchemaByAlias, formatSchema } = this.ndutDb.helper
  let properties = {}
  const schema = getSchemaByAlias(alias)
  if (schema.expose.create) properties = formatSchema(schema, true, omittedColumns)
  return properties
}
