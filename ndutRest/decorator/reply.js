module.exports = {
  t: function (payload, options = {}) {
    const scope = this.server
    const { _ } = scope.ndut.helper
    let result = payload
    if (this.request.i18n && (_.isPlainObject(payload) || options.error)) {
      let ns = result.ndut || _.get(options, 'error.data.ndut')
      if (ns === true) ns = 'ndutI18N' // BUG! Dunno remember from where '{ ndut: true }' comes from
      result.message = this.request.i18n.t(result.message, { ns })
      if (options.error) result.error = this.request.i18n.t(result.error, { ns })
    }
    this.send(result)
  }
}
