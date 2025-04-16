const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/session");
const checkRol = require("../middleware/rol");
const { uploadMiddlewareMemory } = require("../utils/handleStorage");

const {
    registerDeliveryNote,
    updateDeliveryNote,
    getDeliveryNote,
    deleteDeliveryNote,
    getDeliveryNotePDF,
    uploadSignature,
    restoreDeliveryNote,
} = require("../controllers/deliveryNote");

/**
 * @openapi
 * /api/delivery-note:
 *   post:
 *     tags:
 *       - Albaranes
 *     summary: Crear un nuevo albarán
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNoteInput'
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authMiddleware, checkRol(["admin"]), registerDeliveryNote);

/**
 * @openapi
 * /api/delivery-note/{id}:
 *   put:
 *     tags:
 *       - Albaranes
 *     summary: Actualizar un albarán existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNoteInput'
 *     responses:
 *       200:
 *         description: Albarán actualizado correctamente
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", authMiddleware, checkRol(["admin"]), updateDeliveryNote);

/**
 * @openapi
 * /api/delivery-note/{id}:
 *   get:
 *     tags:
 *       - Albaranes
 *     summary: Obtener uno o todos los albaranes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán(es) obtenido(s) exitosamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id?", authMiddleware, getDeliveryNote);

/**
 * @openapi
 * /api/delivery-note/{id}:
 *   delete:
 *     tags:
 *       - Albaranes
 *     summary: Eliminar un albarán (soft o hard)
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
 *         description: Albarán eliminado correctamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Albarán firmado no se puede eliminar
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", authMiddleware, checkRol(["admin"]), deleteDeliveryNote);

/**
 * @openapi
 * /api/delivery-note/pdf/{id}:
 *   get:
 *     tags:
 *       - Albaranes
 *     summary: Obtener o generar PDF de un albarán
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
 *         description: PDF generado o recuperado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.get("/pdf/:id", authMiddleware, getDeliveryNotePDF);

/**
 * @openapi
 * /api/delivery-note/sign/{id}:
 *   patch:
 *     tags:
 *       - Albaranes
 *     summary: Subir firma de albarán y generar PDF
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Firma subida y PDF generado correctamente
 *       400:
 *         description: Archivo no subido
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.patch("/sign/:id", authMiddleware, uploadMiddlewareMemory.single("file"), uploadSignature);

/**
 * @openapi
 * /api/delivery-note/restore/{id}:
 *   patch:
 *     tags:
 *       - Albaranes
 *     summary: Restaurar albarán archivado (soft-deleted)
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
 *         description: Albarán restaurado correctamente
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error interno
 */
router.patch("/restore/:id", authMiddleware, checkRol(["admin"]), restoreDeliveryNote);



module.exports = router;
