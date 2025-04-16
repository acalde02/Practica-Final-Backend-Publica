const FormData = require('form-data');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const uploadToPinata = async (fileBuffer, fileName) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    const data = new FormData();
    data.append('file', fileBuffer, {
        filename: fileName,
        contentType: 'image/png' // Ajusta si usas otros formatos
    });

    const metadata = JSON.stringify({ name: fileName });
    data.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 0 });
    data.append('pinataOptions', options);

    try {
        const response = await axios.post(url, data, {
            headers: {
                ...data.getHeaders(),
                'pinata_api_key': process.env.PINATA_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading file to Pinata:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = uploadToPinata;
