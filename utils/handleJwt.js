const jwt = require("jsonwebtoken");

/**
 * Genera un token de acceso o verificación
 * @param {*} user 
 * @param {string} type Tipo de token: "access" o "verification"
 * @param {string} expiresIn Duración del token (ej: "10m", "2h")
 */
const tokenSign = async (user, type = "access", expiresIn = "2h") => {
    const payload = {
        _id: user._id,
        role: user.role
    };

    if (type === "verification") {
        payload.verificationPending = true; // Agregar flag para verificación
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verifica un token JWT
 * @param {*} tokenJwt 
 */
const verifyToken = async (tokenJwt) => {
    try {
        return jwt.verify(tokenJwt, process.env.JWT_SECRET);
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = { tokenSign, verifyToken };