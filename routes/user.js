const express = require("express")
const router = express.Router()
const {userController, updateUserCtrl,deleteUserCtrl, registerGuestCtrl, restoreUserByAdminCtrl, 
    requestPasswordResetCtrl,  resetPasswordCtrl} = require("../controllers/user")
const {deleteUserByAdminCtrl} = require("../controllers/auth")
const checkRol = require("../middleware/rol")
const  authMiddleware = require("../middleware/session")
const {validatorUser} = require("../validators/user")
const {validatorCompany} = require("../validators/company")
const {registerCompanyCtrl} = require("../controllers/company")
const uploadMiddleware = require("../utils/handleStorage")
const {createItem} = require("../controllers/storage")
const { validatorVerify } = require("../validators/auth")

/**
 * @openapi
 * /api/user:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener información del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida correctamente
 *       403:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el usuario
 */
router.get("/", authMiddleware, userController);

/**
 * @openapi
 * /api/user/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener información de un usuario por ID (requiere rol admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a consultar
 *     responses:
 *       200:
 *         description: Información del usuario obtenida correctamente
 *       403:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el usuario
 */
router.get("/:id", authMiddleware, checkRol(["admin"]), userController);

/**
 * @openapi
 * /api/user:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario autenticado (soft o hard)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: soft
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar el usuario
 */
router.delete("/", authMiddleware, deleteUserCtrl);

/**
 * @openapi
 * /api/user/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario por ID (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: soft
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Usuario eliminado por admin
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar usuario por admin
 */
router.delete("/:id", authMiddleware, checkRol(["admin"]), deleteUserByAdminCtrl);

/**
 * @openapi
 * /api/user/register:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar perfil de usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: No se enviaron campos a actualizar
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el usuario
 */
router.put("/register", authMiddleware, validatorUser, updateUserCtrl);

/**
 * @openapi
 * /api/user/company:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Registrar una compañía para el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyInput'
 *     responses:
 *       200:
 *         description: Compañía registrada exitosamente
 *       500:
 *         description: Error al registrar la compañía
 */
router.patch("/company", authMiddleware, validatorCompany, registerCompanyCtrl);

/**
 * @openapi
 * /api/user/guest:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Registrar usuario invitado en la compañía del autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       200:
 *         description: Usuario invitado registrado
 *       400:
 *         description: Compañía no asociada
 *       404:
 *         description: Compañía no encontrada
 *       500:
 *         description: Error al registrar usuario invitado
 */
router.post("/guest", authMiddleware, validatorUser, registerGuestCtrl);

/**
 * @openapi
 * /api/user/restore/{id}:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Restaurar usuario eliminado (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario restaurado correctamente
 *       400:
 *         description: El usuario no está eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al restaurar el usuario
 */
router.patch("/restore/:id", authMiddleware, checkRol(["admin"]), restoreUserByAdminCtrl);

/**
 * @openapi
 * /api/user/request-reset:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Solicitar código de recuperación de contraseña
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código de recuperación enviado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al enviar código de recuperación
 */
router.post("/request-reset", requestPasswordResetCtrl);

/**
 * @openapi
 * /api/user/reset-password:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Restablecer contraseña con código de verificación
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: number
 *                 format: int32
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       400:
 *         description: Código inválido
 *       500:
 *         description: Error al restablecer contraseña
 */
router.post("/reset-password", validatorVerify, resetPasswordCtrl);



module.exports = router