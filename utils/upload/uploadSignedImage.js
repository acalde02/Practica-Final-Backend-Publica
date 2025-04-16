const axios = require("axios");
const FormData = require("form-data");

const uploadImageToPinata = async (buffer, filename) => {
    const pinataJwt = process.env.PINATA_JWT;
    const gateway = process.env.PINATA_GATEWAY_URL;

    const formData = new FormData();
    formData.append("file", buffer, { filename });

    const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
            headers: {
                Authorization: `Bearer ${pinataJwt}`,
                ...formData.getHeaders(),
            },
        }
    );

    const ipfsHash = res.data.IpfsHash;
    return `${gateway}${ipfsHash}`;
};

module.exports = uploadImageToPinata;
