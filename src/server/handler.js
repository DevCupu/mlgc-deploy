const predictClassification = require("../services/inferenceService");
const crypto = require('crypto');

const { storeData, getDataHistory } = require('../services/storeData');

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    const { confidenceScore, result, suggestion } = await predictClassification(model, image);

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
        "id": id,
        "result": result,
        "suggestion": suggestion,
        "createdAt": createdAt,
    }

    await storeData(id, data);
    
    const response = h.response({
        status: 'success',
        message: confidenceScore > 99 ? 'Model is predicted successfully' : 'Model is predicted successfully but under threshold. Please use the correct picture',
        data,
    })
    response.code(201);
    return response;
}

async function getPredictHandler(request, h) {
    const data = await getDataHistory();

    const response = h.response({
        status: 'success',
        data,
    });
    response.code(200)
    return response;
}
module.exports = { postPredictHandler, getPredictHandler };