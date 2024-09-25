const api = require('./api');
const realTimeApi = require('./realTimeApi');

function route(app) {
    app.use('/api', api);
    // app.use('/realtime/api');

}

module.exports = route;