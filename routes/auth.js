const express = require("express")
const { registerCtrl, loginCtrl, verifyCodeCtrl } = require("../controllers/auth")
const {validatorRegister, validatorLogin, validatorVerify} = require("../validators/auth")
const router = express.Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registro de usuario
 *     description: Registra un nuevo usuario con email y password. Se envía un código de verificación por email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *     responses:
 *       200:
 *         description: Registro exitoso. Se envió código de verificación.
 *       401:
 *         description: El usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Inicio de sesión
 *     description: Inicia sesión un usuario verificado. Devuelve token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas o usuario no verificado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/auth/verify:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verificación de código
 *     description: Verifica el código enviado por email para activar la cuenta.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: number
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Verificación exitosa
 *       400:
 *         description: Usuario ya verificado
 *       401:
 *         description: Token inválido o no autorizado
 *       402:
 *         description: Código incorrecto
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */


//POST http://localhost:3000/api/auth/register
router.post("/register", validatorRegister, registerCtrl)

//POST http://localhost:3000/api/auth/login
router.post("/login", validatorLogin, loginCtrl) 

//POST http://localhost:3000/api/auth/verify
router.post("/verify", validatorVerify, verifyCodeCtrl)


module.exports = router
