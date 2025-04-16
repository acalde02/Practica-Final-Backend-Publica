const axios = require("axios");
const FormData = require("form-data");

const uploadPdfToPinata = async (pdfBuffer, filename) => {
  const formData = new FormData();
  formData.append("file", pdfBuffer, {
    filename: filename,
    contentType: "application/pdf",
  });

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders(),
      },
    }
  );

  const ipfsHash = res.data.IpfsHash;
  return `${process.env.PINATA_GATEWAY_URL}/${ipfsHash}`;
};

module.exports = uploadPdfToPinata;
