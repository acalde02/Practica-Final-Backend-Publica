const express = require("express");
const { validatorClient } = require("../validators/client");
const {
    registerClientCtrl,
    getClientCtrl,
    updateClientCtrl,
    deleteClientCtrl,
    getAllClientsCtrl,
    restoreClientCtrl,
} = require("../controllers/client");

const checkRol = require("../middleware/rol");
const authMiddleware = require("../middleware/session");

/**
 * @openapi
 * /api/client:
 *   get:
 *     tags:
 *       - Client
 *     summary: Obtener todos los clientes de la compañía
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente
 *       403:
 *         description: Usuario no asociado a una compañía
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/client/{id}:
 *   get:
 *     tags:
 *       - Client
 *     summary: Obtener un cliente por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Acceso no autorizado
 *       404:
 *         description: Cliente no encontrado
 */

/**
 * @openapi
 * /api/client/register:
 *   post:
 *     tags:
 *       - Client
 *     summary: Registrar un nuevo cliente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Empresa XYZ
 *               email:
 *                 type: string
 *                 example: contacto@xyz.com
 *     responses:
 *       200:
 *         description: Cliente creado correctamente
 *       403:
 *         description: Usuario no asociado a compañía
 *       409:
 *         description: Cliente ya existe
 *       500:
 *         description: Error al crear cliente
 */

/**
 * @openapi
 * /api/client/{id}:
 *   patch:
 *     tags:
 *       - Client
 *     summary: Actualizar un cliente existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: Nuevo nombre de cliente
 *               email: nuevoemail@cliente.com
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Acceso no autorizado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error al actualizar cliente
 */

/**
 * @openapi
 * /api/client/{id}:
 *   delete:
 *     tags:
 *       - Client
 *     summary: Eliminar un cliente (soft o hard)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del cliente a eliminar
 *         schema:
 *           type: string
 *       - name: soft
 *         in: query
 *         required: false
 *         description: Si soft=false realiza hard delete
 *         schema:
 *           type: string
 *           example: false
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Acceso no autorizado o cliente firmado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error al eliminar cliente
 */


const router = express.Router();

// GET http://localhost:3000/api/client
router.get("/", authMiddleware, getAllClientsCtrl); 

// GET http://localhost:3000/api/client/:id
router.get("/:id", authMiddleware, getClientCtrl);

// POST http://localhost:3000/api/client/register
router.post("/register", authMiddleware, checkRol(["admin"]), validatorClient, registerClientCtrl);

// PATCH http://localhost:3000/api/client/:id
router.patch("/:id", authMiddleware, checkRol(["admin"]), validatorClient, updateClientCtrl);

// DELETE http://localhost:3000/api/client/:id
router.delete("/:id", authMiddleware, checkRol(["admin"]), deleteClientCtrl);

/**
 * @openapi
 * /api/client/restore/{id}:
 *   patch:
 *     tags:
 *       - Clientes
 *     summary: Restaurar un cliente eliminado (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente a restaurar
 *     responses:
 *       200:
 *         description: Cliente restaurado exitosamente
 *       400:
 *         description: El cliente no está soft-deleted o error de validación
 *       403:
 *         description: Usuario no autorizado o sin compañía
 *       404:
 *         description: Cliente no encontrado
 */
router.patch("/restore/:id", authMiddleware,  checkRol(["admin"]), restoreClientCtrl);


module.exports = router;
