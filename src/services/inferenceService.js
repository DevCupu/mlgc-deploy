const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try {
        // Mengubah gambar menjadi tensor dengan TensorFlow
        const tensor = tf.node
            .decodeJpeg(image) // Mendekode gambar menjadi tensor
            .resizeNearestNeighbor([224, 224]) // Mengubah ukuran tensor menjadi [224, 224]
            .expandDims() // Menambah dimensi tensor
            .toFloat(); // Mengonversi nilai tensor menjadi float

        // Melakukan prediksi dengan model yang diberikan
        const prediction = model.predict(tensor); // Memprediksi kelas gambar

        // Mendapatkan hasil prediksi dalam bentuk array
        const scores = await prediction.data();

        // Menghitung skor hasil prediksi
        const confidenceScore = Math.max(...scores) * 100;

        // Menentukan hasil prediksi berdasarkan skor 
        let result;
        if (confidenceScore > 50) {
            result = 'Cancer';
        } else {
            result = 'Non-cancer';
        }

        // Hasil Suges berdasarkan hasil prediksi
        let suggestion;
        if (result === 'Cancer') {
            suggestion = 'Terindikasi, Segera periksa ke dokter!';
        } else {
            suggestion = 'Anda sehat';
        }

        // Mengembalikan hasil prediksi
        return { confidenceScore, result, suggestion };
    } catch (error) {
        throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    }
}

module.exports = predictClassification;
