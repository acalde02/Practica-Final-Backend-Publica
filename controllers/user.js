const {usersModel, companyModel} = require("../models")
const {handleHttpError} = require('../utils/handleError');
const {sendEmail} = require('../utils/handleEmail');
const bcrypt = require('bcryptjs');


/**
 * Controlador para obtener la información de un usuario
 * @param {*} req 
 * @param {*} res 
 */
const userController = async (req, res) => {
    try {
      const userId = req.params.id || req.user._id;
  
      // Buscar con eliminados incluidos
      const user = await usersModel.findOneWithDeleted({ _id: userId }).select("-password").populate("company");
  
      if (!user) {
        return handleHttpError(res, "USER_NOT_FOUND", 404);
      }
  
      if (user.deleted) {
        return handleHttpError(res, "USER_DELETED", 403);
      }
  
      res.json(user);
    } catch (error) {
      console.error("Error fetching user info:", error);
      handleHttpError(res, "ERROR_FETCHING_USER", 500);
    }
  };
  
  



/**
 * Controlador para actualizar usuario autenticado
 * @param {*} req 
 * @param {*} res 
 */
const updateUserCtrl = async (req, res) => {
    try {
        const userId = req.user._id;

        // Filtrar solo los campos que no sean undefined
        const updatedFields = {};
        if (req.body.name) updatedFields.name = req.body.name;
        if (req.body.surnames) updatedFields.surnames = req.body.surnames;
        if (req.body.nif) updatedFields.nif = req.body.nif;
        if (req.body.email) updatedFields.email = req.body.email;

        // Si no hay campos para actualizar, devolver error
        if (Object.keys(updatedFields).length === 0) {
            return handleHttpError(res, "NO_FIELDS_TO_UPDATE", 400);
        }

        // Actualiza el usuario con solo los campos proporcionados
        const updatedUser = await usersModel.findByIdAndUpdate(
            userId,
            { $set: updatedFields }, // forzar actualización de campos
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        res.json({ message: "USER_UPDATED", user: updatedUser });

    } catch (error) {
        console.error("Error updating user:", error);
        handleHttpError(res, "ERROR_UPDATING_USER");
    }
};




/**
 * Controlador para eliminar usuario autenticado
 * @param {*} req 
 * @param {*} res 
 */

const deleteUserCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const softDelete = req.query.soft !== "false"; // Si es "false", hace hard delete

        const userToDelete = await usersModel.findById(userId);
        if (!userToDelete) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        if (softDelete) {
            await userToDelete.delete(); // Soft delete
            return res.json({ message: "USER_SOFT_DELETED" });
        } else {
            await usersModel.findByIdAndDelete(userId); // Hard delete
            return res.json({ message: "USER_HARD_DELETED" });
        }

    } catch (error) {
        console.error("Error deleting user:", error);
        handleHttpError(res, "ERROR_DELETING_USER");
    }
};


/**
 * Controlador para agregar un usuario a su empresa con el rol de guest
 * 
 * @param {*} req
 * @param {*} res
 */

const registerGuestCtrl = async (req, res) => {
    try {
        const { email, name, surnames, nif, password } = req.body;
        const company = req.user.company;

        if (!company) {
            return handleHttpError(res, "COMPANY_NOT_ASSOCIATED", 400);
        }

        const companyFound = await companyModel.findById(company);
        if (!companyFound) {
            return handleHttpError(res, "COMPANY_NOT_FOUND", 404);
        }

        let hashedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const newUser = new usersModel({
            email,
            name,
            surnames,
            nif,
            company,
            role: "guest",
            password: hashedPassword
        });

        await newUser.save();

        // Si se proporcionó una contraseña, enviarla por correo
        if (password) {
            const fullName = `${name} ${surnames || ""}`.trim();
            const subject = "Tus credenciales de acceso";
            const html = `
                <h2>¡Hola ${fullName}!</h2>
                <p>Te has registrado exitosamente como usuario guest en nuestra plataforma.</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Contraseña:</strong> ${password}</p>
                <p>Puedes iniciar sesión con estos datos en el portal.</p>
            `;

            await sendEmail(process.env.EMAIL, email, subject, null, html);
        }

        res.json({ message: "USER_REGISTERED", user: newUser });

    } catch (error) {
        console.error("Error registrando usuario guest:", error);
        handleHttpError(res, "ERROR_REGISTERING_USER");
    }
};

/**
 * Restaurar usuario eliminado
 * Solo se puede restaurar si no ha sido con un hard delete
 * 
 * @param {*} req
 * @param {*} res
 */
const restoreUserByAdminCtrl = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await usersModel.findOneWithDeleted({ _id: userId });

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        if (!user.deleted) {
            return res.status(400).json({ message: "USER_NOT_SOFT_DELETED" });
        }

        await user.restore();
        res.json({ message: "USER_RESTORED_BY_ADMIN" });

    } catch (error) {
        console.error("Error restoring user:", error);
        handleHttpError(res, "ERROR_RESTORING_USER_BY_ADMIN");
    }
};

/**
 * Petición para solicitar un código de recuperación de contraseña
 * 
 * 
 * @param {*} req
 * @param {*} res
 */
const requestPasswordResetCtrl = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await usersModel.findOne({ email });
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        const code = Math.floor(100000 + Math.random() * 900000);
        user.code = code;
        user.recoveryAttempts = 0;
        await user.save();

        await sendEmail(process.env.EMAIL, email, "Recuperación de contraseña", null, `
            <p>Tu código para cambiar la contraseña es: <strong>${code}</strong></p>
        `);

        res.json({ message: "RECOVERY_CODE_SENT" });

    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_SENDING_RECOVERY_CODE");
    }
};


/**
 * Controlador para restablecer la contraseña de un usuario. 
 * Requiere un código de recuperación válido.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 */
const resetPasswordCtrl = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!/^\d{6}$/.test(code)) {
            return handleHttpError(res, "INVALID_CODE", 400);
        }


        const user = await usersModel.findOne({ email }).select("+code");

        if (!user || user.code !== code) {
            return handleHttpError(res, "INVALID_CODE", 400);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.code = undefined;
        user.recoveryAttempts = 0;
        await user.save();

        res.json({ message: "PASSWORD_RESET_SUCCESS" });

    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_RESETTING_PASSWORD");
    }
};





module.exports = { userController, updateUserCtrl, 
    deleteUserCtrl, registerGuestCtrl, restoreUserByAdminCtrl, 
    requestPasswordResetCtrl, resetPasswordCtrl };




