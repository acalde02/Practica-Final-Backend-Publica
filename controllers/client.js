const mongoose = require('mongoose');
const { clientModel, companyModel } = require('../models');
const { handleHttpError } = require('../utils/handleError');

const registerClientCtrl = async (req, res) => {
    try {
        const clientData = req.body;
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        // Verificar si ya existe un cliente con el mismo email en la misma compañía
        const existingClient = await clientModel.findOne({
            email: clientData.email,
            company: userCompanyId
        });

        if (existingClient) {
            return handleHttpError(res, "CLIENT_ALREADY_EXISTS", 409);
        }

        // Crear cliente
        const client = await clientModel.create({
            ...clientData,
            company: userCompanyId
        });

        // Actualizar la compañía para incluir el cliente
        await companyModel.findByIdAndUpdate(userCompanyId, {
            $push: { clients: client._id }
        });

        res.status(200).json(client);
    } catch (error) {
        console.error("Error creating client:", error);
        handleHttpError(res, "ERROR_CREATING_CLIENT");
    }
};


// Obtener todos los clientes de la compañía
const getAllClientsCtrl = async (req, res) => {
    try {
      const userCompanyId = req.user?.company;
  
      if (!userCompanyId) {
        return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
      }
  
      const clients = await clientModel.find({ company: userCompanyId });
      res.status(200).json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      handleHttpError(res, "ERROR_FETCHING_CLIENTS");
    }
  };
  
  // Ya tienes este para un solo cliente:
  const getClientCtrl = async (req, res) => {
    try {
      const { id } = req.params;
      const userCompanyId = req.user?.company;
  
      if (!userCompanyId) {
        return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
      }
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return handleHttpError(res, "INVALID_CLIENT_ID", 400);
      }
  
      const client = await clientModel.findById(id);
  
      if (!client) {
        return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      }
  
      if (client.company.toString() !== userCompanyId.toString()) {
        return handleHttpError(res, "UNAUTHORIZED_CLIENT_ACCESS", 403);
      }
  
      res.status(200).json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      handleHttpError(res, "ERROR_FETCHING_CLIENT");
    }
  };
  

// Actualizar cliente
const updateClientCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const clientData = req.body;
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleHttpError(res, "INVALID_CLIENT_ID", 400);
        }

        const client = await clientModel.findById(id);

        if (!client) {
            return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
        }

        if (client.company.toString() !== userCompanyId.toString()) {
            return handleHttpError(res, "UNAUTHORIZED_CLIENT_UPDATE", 403);
        }

        const updatedClient = await clientModel.findByIdAndUpdate(id, clientData, { new: true });
        res.status(200).json(updatedClient);
    } catch (error) {
        console.error("Error updating client:", error);
        handleHttpError(res, "ERROR_UPDATING_CLIENT");
    }
};

// Eliminar cliente (soft por defecto, hard si soft=false)
const deleteClientCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { soft } = req.query; // Si soft === 'false' → hard delete
        const userCompanyId = req.user?.company;

        if (!userCompanyId) {
            return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleHttpError(res, "INVALID_CLIENT_ID", 400);
        }

        const client = await clientModel.findById(id);

        if (!client) {
            return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
        }

        if (client.company.toString() !== userCompanyId.toString()) {
            return handleHttpError(res, "UNAUTHORIZED_CLIENT_DELETE", 403);
        }

        if (soft === 'false') {
            await clientModel.deleteOne({ _id: id }); // Hard delete
            return res.status(200).json({ message: "Client permanently deleted" });
        } else {
            await client.delete(); // Soft delete
            return res.status(200).json({ message: "Client deleted (soft)" });
        }
    } catch (error) {
        console.error("Error deleting client:", error);
        handleHttpError(res, "ERROR_DELETING_CLIENT");
    }
};

const restoreClientCtrl = async (req, res) => {
    try {
      const { id } = req.params;
      const userCompanyId = req.user?.company;
  
      if (!userCompanyId) {
        return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
      }
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return handleHttpError(res, "INVALID_CLIENT_ID", 400);
      }
  
      const client = await clientModel.findOneWithDeleted({ _id: id });
  
      if (!client) {
        return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
      }
  
      if (!client.deleted) {
        return handleHttpError(res, "CLIENT_NOT_SOFT_DELETED", 400);
      }
  
      if (client.company.toString() !== userCompanyId.toString()) {
        return handleHttpError(res, "UNAUTHORIZED_CLIENT_RESTORE", 403);
      }
  
      await client.restore();
      res.status(200).json(client);
  
    } catch (error) {
      console.error("Error restoring client:", error);
      handleHttpError(res, "ERROR_RESTORING_CLIENT");
    }
  };
  


module.exports = {
    registerClientCtrl,
    getClientCtrl,
    updateClientCtrl,
    deleteClientCtrl,
    getAllClientsCtrl,
    restoreClientCtrl
};
