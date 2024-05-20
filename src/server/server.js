require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    const server = Hapi.server({
        port: 8080,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
            payload: {
                maxBytes: 1000000,
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `Terjadi kesalahan dalam melakukan prediksi`
            });
            newResponse.code(response.statusCode);  // Ensure statusCode is an integer
            return newResponse;
        }

        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            });
            newResponse.code(parseInt(response.output.statusCode, 10));  // Ensure statusCode is an integer
            return newResponse;
        }

        if ( request.payload && request.payload.length > 1000000 ) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Payload content lenght greater than maximun allow: 1000000'
            });
            newResponse.code(413);
        }

        if ( response.statusCode === 400 ) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi'
            });
            newResponse.code(400);
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();
