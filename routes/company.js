const express = require("express")
const router = express.Router()
const { createItem, updateImage } = require("../controllers/storage")
const authMiddleware = require("../middleware/session")
const { uploadMiddlewareMemory } = require("../utils/handleStorage")
const checkRol = require("../middleware/rol")
const { updateCompanyCtrl, deleteCompanyCtrl } = require("../controllers/company")

/**
 * @openapi
 * /api/company:
 *   patch:
 *     tags:
 *       - Company
 *     summary: Actualizar información de la compañía
 *     description: Actualiza los datos generales de la compañía asociada al usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: Empresa Renovada S.L.
 *               cif: B12345678
 *               street: Calle Innovación
 *               number: 45
 *               postal: 08080
 *               city: Barcelona
 *               province: Cataluña
 *     responses:
 *       200:
 *         description: Compañía actualizada correctamente
 *       400:
 *         description: El usuario no tiene compañía asignada
 *       403:
 *         description: Acceso no autorizado
 *       409:
 *         description: CIF ya en uso por otra compañía
 *       500:
 *         description: Error al actualizar la compañía
 */

/**
 * @openapi
 * /api/company/logo:
 *   patch:
 *     tags:
 *       - Company
 *     summary: Actualizar logo de la compañía
 *     description: Sube una imagen (logo) y actualiza la compañía asociada al usuario con la URL generada.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado correctamente
 *       400:
 *         description: No se subió ninguna imagen
 *       403:
 *         description: Acceso no autorizado o sin compañía
 *       500:
 *         description: Error al subir el logo
 */


/**
 * @openapi
 * /api/company:
 *   delete:
 *     tags:
 *       - Compañías
 *     summary: Eliminar una compañía (requiere rol admin)
 *     description: Elimina la compañía asociada al usuario autenticado. Por defecto realiza un soft delete. Para hacer un hard delete, pasa `?soft=false` en la query.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: string
 *         required: false
 *         description: Si se pasa como "false", se hará un hard delete en lugar de soft delete.
 *     responses:
 *       200:
 *         description: Compañía eliminada exitosamente (soft o hard).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: COMPANY_SOFT_DELETED
 *       403:
 *         description: El usuario no tiene permiso para esta operación.
 *       404:
 *         description: No hay compañía asociada al usuario.
 *       500:
 *         description: Error interno del servidor.
 */


    // Actualiza datos generales de la compañía
    router.patch("/", authMiddleware, checkRol(["admin"]), updateCompanyCtrl);

    // Actualiza solo el logo
    router.patch("/logo", authMiddleware, checkRol(["admin"]), uploadMiddlewareMemory.single("image"), updateImage);

    // Elimina la compañía asociada al usuario autenticado
    router.delete("/", authMiddleware, checkRol(["admin"]), deleteCompanyCtrl);



    
module.exports = router