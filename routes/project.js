const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/session");
const checkRol = require("../middleware/rol");
const {
  registerProjectCtrl,
  updateProjectCtrl,
  getProjectCtrl,
  deleteProjectCtrl,
  getArchivedProjectsCtrl,
  recoverProjectCtrl,
} = require("../controllers/project");

const { validatorProject } = require("../validators/project");



/**
 * @openapi
 * /api/project:
 *   post:
 *     tags:
 *       - Proyectos
 *     summary: Crear un nuevo proyecto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Proyecto creado exitosamente
 *       403:
 *         description: Usuario no asociado a una compañía o cliente no válido
 *       409:
 *         description: Ya existe un proyecto con ese nombre en la compañía
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authMiddleware, checkRol(["admin"]), validatorProject, registerProjectCtrl);

/**
 * @openapi
 * /api/project/{id}:
 *   put:
 *     tags:
 *       - Proyectos
 *     summary: Actualizar un proyecto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
 *       400:
 *         description: ID de proyecto inválido
 *       403:
 *         description: Usuario no autorizado o cliente no válido
 *       404:
 *         description: Proyecto no encontrado
 *       409:
 *         description: Ya existe otro proyecto con ese nombre
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", authMiddleware, checkRol(["admin"]), validatorProject, updateProjectCtrl);

/**
 * @openapi
 * /api/project/{id}:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Obtener uno o todos los proyectos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto(s) obtenido(s) exitosamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id?", authMiddleware, getProjectCtrl);

/**
 * @openapi
 * /api/project/{id}:
 *   delete:
 *     tags:
 *       - Proyectos
 *     summary: Eliminar un proyecto (soft o hard)
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
 *         description: Proyecto eliminado
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", authMiddleware, checkRol(["admin"]), deleteProjectCtrl);

/**
 * @openapi
 * /api/project/archived/{id}:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Obtener un proyecto archivado o todos los archivados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto(s) archivado(s) obtenido(s) exitosamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Proyecto archivado no encontrado
 *       500:
 *         description: Internal Server Error
 */
router.get("/archived/:id?", authMiddleware, getArchivedProjectsCtrl);

/**
 * @openapi
 * /api/project/recover/{id}:
 *   put:
 *     tags:
 *       - Proyectos
 *     summary: Recuperar un proyecto archivado (soft delete)
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
 *         description: Proyecto recuperado exitosamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: Usuario no autorizado
 *       404:
 *         description: Proyecto no encontrado o no archivado
 *       500:
 *         description: Internal Server Error
 */
router.put("/recover/:id", authMiddleware, checkRol(["admin"]), recoverProjectCtrl);



module.exports = router;
