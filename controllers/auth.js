const { matchedData } = require("express-validator")
const { tokenSign, verifyToken } = require("../utils/handleJwt")
const { encrypt, compare } = require("../utils/handlePassword")
const {handleHttpError} = require("../utils/handleError")
const {usersModel} = require("../models")
const {sendEmail} = require("../utils/handleEmail")
const checkRol = require("../middleware/rol")

/**
 * Encargado de registrar un nuevo usuario
 * @param {*} req 
 * @param {*} res 
 */
const registerCtrl = async (req, res) => {
    try {
        req = matchedData(req);
        const password = await encrypt(req.password);
        const code = Math.floor(100000 + Math.random() * 900000);  // Código de 6 dígitos
        const body = { ...req, password, code, isVerified: false }; // Estado "on hold"

        let exists = await usersModel.findOne({ email: body.email });

        if (exists) {
            handleHttpError(res, "USER_EXISTS");
            return;
        }

        // Guardar usuario con estado "on hold"
        const dataUser = await usersModel.create(body);
        dataUser.set("password", undefined, { strict: false });

        // Generar un token temporal para verificar el código
        const verificationToken = await tokenSign(dataUser, "verification", "10m"); // Expira en 10 minutos

        // Enviar código de verificación por email
        await sendEmail(
            process.env.EMAIL,
            body.email,
            `Tu código de verificación es: ${code}`,
            `<h1>Tu código de verificación es: ${code}</h1>`
        );

        res.json({
            message: "Registro pendiente de verificación. Revisa tu correo.",
            verificationToken,
            code
        });

        console.log("Código generado:", code);
        console.log("Usuario guardado:", dataUser);

    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_REGISTER_USER");
    }
};



/**
 * Encargado de hacer login del usuario
 * @param {*} req 
 * @param {*} res 
 */
const loginCtrl = async (req, res) => {
    try {
        req = matchedData(req)
        const user = await usersModel.findOne({ email: req.email }).select("password name role email isVerified deleted")

        if (!user) {
            handleHttpError(res, "USER_NOT_EXISTS", 404)
            return
        }

        if (!user.isVerified && user.role != "guest") {
            handleHttpError(res, "USER_NOT_VERIFIED", 403)
            return
        }

        if (user.role === "guest") {
            user.isVerified = true;
            await user.save();
        }

        if (user.deleted) {
            handleHttpError(res, "USER_DELETED", 403)
            return
        }

        const hashPassword = user.password;
        const check = await compare(req.password, hashPassword)

        if (!check) {
            handleHttpError(res, "INVALID_PASSWORD", 401)
            return
        }

        user.set('password', undefined, { strict: false })
        const data = {
            token: await tokenSign(user),
            user
        }

        res.send(data)

    } catch (err) {
        console.log(err)
        handleHttpError(res, "ERROR_LOGIN_USER")
    }
}


const verifyCodeCtrl = async (req, res) => {
    try {

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "UNAUTHORIZED" });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.verificationPending) {
            return res.status(401).json({ error: "INVALID_TOKEN" });
        }

        const { code: code } = matchedData(req);
        const user = await usersModel.findById(decoded._id).select("+code");

        if (!user) {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "USER_VERIFIED" });
        }

        if (user.code !== Number(code)) {
            return res.status(402).json({ error: "INCORRECT_CODE" });
        }

        // Activar la cuenta y eliminar el código de verificación
        user.isVerified = true;
        user.code = null;
        await user.save();

        // Generar un nuevo token de acceso
        const accessToken = await tokenSign(user, "access", "2h");

        res.json({
            message: "VERIFIED",
            token: accessToken
        });

        console.log("Usuario actualizado:", user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    };


    
};


const deleteUserByAdminCtrl = async (req, res) => {
    try {
      const userId = req.params.id;
      const softDelete = req.query.soft !== "false";
  
      const userToDelete = await usersModel.findById(userId);
      if (!userToDelete) {
        return handleHttpError(res, "USER_NOT_FOUND", 404);
      }
  
      if (softDelete) {
        await userToDelete.delete();
        return res.json({ message: "USER_SOFT_DELETED" });
      } else {
        await usersModel.findByIdAndDelete(userId);
        return res.json({ message: "User deleted successfully" });
      }
  
    } catch (error) {
      console.error("Error deleting user by admin:", error);
      handleHttpError(res, "ERROR_DELETING_USER_BY_ADMIN");
    }
  };
  

module.exports = { registerCtrl, loginCtrl, verifyCodeCtrl, deleteUserByAdminCtrl };