const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const client_id = process.env.CLIENT_ID;
const refresh_token = process.env.REFRESH_TOKEN;


const getAccessToken = async () => {
    try {
        const response = await axios.post(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            new URLSearchParams({
                client_id: client_id, // Desde .env
                grant_type: "refresh_token",
                refresh_token: refresh_token, // Desde .env
                scope: "https://graph.microsoft.com/Mail.Send offline_access"
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        console.log("Nuevo Access Token:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("Error obteniendo access token:", error.response?.data || error.message);
    }
};




const sendEmail = async (from=process.env.EMAIL, to, subject, text, html) => {
    try {
        const access_token = await getAccessToken();
        const response = await axios.post(
            "https://graph.microsoft.com/v1.0/me/sendMail",
            {
                message: {
                    subject: subject,
                    body: {
                        contentType: "HTML",
                        content: html || text
                    },
                    toRecipients: [
                        {
                            emailAddress: { address: to }
                        }
                    ],
                    from: {
                        emailAddress: { address: from }
                    }
                },
                saveToSentItems: "true"
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Correo enviado con éxito", response.data);
    } catch (error) {
        console.error("Error enviando correo:", error.response?.data || error.message);
    }
};

module.exports = { sendEmail };
