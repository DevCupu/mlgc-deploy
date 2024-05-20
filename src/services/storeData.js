const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();

async function storeData(id, data) {
    const predictCollection = db.collection('predictions');
    return predictCollection.doc(id).set(data);
}
async function getDataHistory() {
    const savedData = await db.collection('predictions').get();
    const documents = [];

    for (const doc of savedData.docs) {
    const data = {
        id: doc.id,
        history: {
        result: doc.data().result,
        createdAt: doc.data().createdAt,
        suggestion: doc.data().suggestion,
        id: doc.id,
        },
    };
    documents.push(data);
    };

    return documents;
}
module.exports = { storeData, getDataHistory };