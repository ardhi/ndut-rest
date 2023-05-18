const pingHandler = async function (request, reply) {
  return { message: 'PONG!' }
}

module.exports = async function () {
  this.route({ url: '/ping', method: 'GET', handler: pingHandler })
}
