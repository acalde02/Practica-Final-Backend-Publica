const mongoose = require("mongoose");
const { handleHttpError } = require("../utils/handleError");
const { projectModel, clientModel } = require("../models");

/**
 * Registra un nuevo proyecto
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const registerProjectCtrl = async (req, res) => {
    try {
        const projectData = req.body;
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        // Verificar si ya existe un proyecto con el mismo nombre en la misma compañía
        const existingProject = await projectModel.findOne({
            name: projectData.name,
            company: userCompanyId,
        });

        if (existingProject) {
            return handleHttpError(res, "PROJECT_ALREADY_EXISTS", 409);
        }

        // Validar que el cliente esté asociado a la misma compañía
        if (projectData.client) {
            const client = await clientModel.findById(projectData.client);
            if (!client || !client.company || client.company.toString() !== userCompanyId.toString())
            {
                return handleHttpError(res, "CLIENT_NOT_ASSOCIATED_WITH_COMPANY", 403);
            }
        }

        const project = await projectModel.create({
            ...projectData,
            company: userCompanyId,
            user: req.user._id, // Asignar el ID del usuario que crea el proyecto
        });

        res.status(200).json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        
        handleHttpError(res, "ERROR_CREATING_PROJECT");
    }
};

/**
 * Obtiene un proyecto o todos los proyectos de una compañía
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getProjectCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        // Si viene un ID, buscar un proyecto específico
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return handleHttpError(res, "INVALID_PROJECT_ID", 400);
            }

            const project = await projectModel.findOne({ _id: id, company: userCompanyId });

            if (!project) {
                return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
            }

            return res.status(200).json(project);
        }

        // Si no viene ID, devolver todos los proyectos de la compañía
        const projects = await projectModel.find({ company: userCompanyId });
        return res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching project(s):", error);
        handleHttpError(res, "ERROR_FETCHING_PROJECT");
    }
};

/**
 * Actualiza un proyecto
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateProjectCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const projectData = { ...req.body };
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleHttpError(res, "INVALID_PROJECT_ID", 400);
        }

        // Verificar si el proyecto existe y pertenece a la compañía del usuario
        const project = await projectModel.findOne({ _id: id, company: userCompanyId });

        if (!project) {
            return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
        }

        // Validar que el cliente esté asociado a la misma compañía
        if (projectData.client) {
            const client = await clientModel.findById(projectData.client);
            if (!client || client.company.toString() !== userCompanyId.toString()) {
                return handleHttpError(res, "CLIENT_NOT_ASSOCIATED_WITH_COMPANY", 403);
            }
        }

        // Evitar cambiar el campo company directamente
        delete projectData.company;

        // Verificar si ya existe un proyecto con ese nombre en la misma compañía (distinto ID)
        if (projectData.name) {
            const duplicateProject = await projectModel.findOne({
                name: projectData.name,
                company: userCompanyId,
                _id: { $ne: id }
            });

            if (duplicateProject) {
                return handleHttpError(res, "PROJECT_NAME_ALREADY_EXISTS", 409);
            }
        }

        // Actualizar el proyecto
        const updatedProject = await projectModel.findByIdAndUpdate(id, projectData, { new: true });

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error updating project:", error);
        handleHttpError(res, "ERROR_UPDATING_PROJECT");
    }
};


/**
 * Elimina un proyecto (soft o hard delete)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteProjectCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { soft } = req.query; // Si soft=false → hard delete
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleHttpError(res, "INVALID_PROJECT_ID", 400);
        }

        // Verificar si el proyecto existe y pertenece a la compañía del usuario
        const project = await projectModel.findOne({ _id: id, company: userCompanyId });

        if (!project) {
            return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
        }

        if (soft === 'false') {
            // Hard delete
            await projectModel.deleteOne({ _id: id });
            return res.status(200).json({ message: "Project permanently deleted" });
        } else {
            // Soft delete
            await project.delete();
            return res.status(200).json({ message: "Project deleted (soft)" });
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        handleHttpError(res, "ERROR_DELETING_PROJECT");
    }
};


/**
 * Obtiene proyectos archivados (soft deleted) de una compañía
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getArchivedProjectsCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        // Si viene un ID, buscar un proyecto archivado específico
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return handleHttpError(res, "INVALID_PROJECT_ID", 400);
            }

            const project = await projectModel.findOneDeleted({ _id: id, company: userCompanyId });

            if (!project) {
                return handleHttpError(res, "ARCHIVED_PROJECT_NOT_FOUND", 404);
            }

            return res.status(200).json(project);
        }

        // Si no viene ID, devolver todos los proyectos archivados de la compañía
        const archivedProjects = await projectModel.findDeleted({ company: userCompanyId });

        res.status(200).json(archivedProjects);
    } catch (error) {
        console.error("Error fetching archived project(s):", error);
        handleHttpError(res, "ERROR_FETCHING_ARCHIVED_PROJECTS");
    }
};



/**
 * Recupera un proyecto archivado (soft deleted)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const recoverProjectCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleHttpError(res, "INVALID_PROJECT_ID", 400);
        }

        // Buscar el proyecto eliminado
        const project = await projectModel.findOneDeleted({ _id: id, company: userCompanyId });

        if (!project) {
            return handleHttpError(res, "PROJECT_NOT_FOUND_OR_NOT_DELETED", 404);
        }

        // Restaurar el proyecto
        await project.restore();

        res.status(200).json({ message: "Project recovered successfully" });
    } catch (error) {
        console.error("Error recovering project:", error);
        handleHttpError(res, "ERROR_RECOVERING_PROJECT");
    }
};


module.exports = {
    registerProjectCtrl,
    getProjectCtrl,
    updateProjectCtrl,
    deleteProjectCtrl,
    getArchivedProjectsCtrl,
    recoverProjectCtrl
};