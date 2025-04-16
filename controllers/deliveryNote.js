const mongoose = require("mongoose");
const { projectModel, deliveryNoteModel } = require("../models");
const { handleHttpError } = require("../utils/handleError");
const { generatePDF } = require("../utils/pdf/deliveryNote");
const uploadPdfToPinata = require("../utils/upload/uploadPDFToPinata");
const uploadImageToPinata = require("../utils/upload/uploadSignedImage");

/**
 * Registra un albarán de entrega
 * El albarán de entrega se asocia a un proyecto y a un cliente.
 * Si no proporciona el cliente o el proyecto, se generará un error.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const registerDeliveryNote = async (req, res) => {
  try {
    const deliveryNoteData = req.body;
    const userCompanyId = req.user?.company;
    const userId = req.user?._id;

    const project = await projectModel.findById(deliveryNoteData.projectId);
    if (!project) {
      return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
    }

    const clientId = project.client;

    const deliveryNote = new deliveryNoteModel({
      ...deliveryNoteData,
      company: userCompanyId,
      createdBy: userId,
      userId: deliveryNoteData.format === "hours" ? userId : undefined,
      clientId,
    });

    await deliveryNote.save();

    project.deliveryNote.push(deliveryNote._id);
    await project.save();

    res.status(201).json({ status: "success", message: "Delivery note registered successfully", data: deliveryNote });
  } catch (error) {
    console.error("Error registering delivery note:", error);
    handleHttpError(res, "ERROR_REGISTERING_DELIVERY_NOTE");
  }
};

/**
 * Actualiza un albarán de entrega
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateDeliveryNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNoteData = { ...req.body };
    const userCompanyId = req.user?.company;
    const userId = req.user?._id;

    if (!userCompanyId) return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);

    delete deliveryNoteData.company;

    const deliveryNote = await deliveryNoteModel.findOneAndUpdate(
      { _id: id, company: userCompanyId },
      { ...deliveryNoteData, updatedBy: userId },
      { new: true }
    );

    if (!deliveryNote) return handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);

    res.status(200).json({ status: "success", message: "Delivery note updated successfully", data: deliveryNote });
  } catch (error) {
    console.error("Error updating delivery note:", error);
    handleHttpError(res, "ERROR_UPDATING_DELIVERY_NOTE");
  }
};

/**
 * Obtiene un albarán de entrega o todos los albaranes de entrega 
 * de la compañia del usuario autenticado.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getDeliveryNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user?.company;
    if (!userCompanyId) return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) return handleHttpError(res, "INVALID_DELIVERY_NOTE_ID", 400);

      const result = await deliveryNoteModel.findOne({ _id: id, company: userCompanyId })
        .populate("projectId clientId userId");

      if (!result) return handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);

      return res.status(200).json({ status: "success", message: "Delivery note retrieved successfully", data: result });
    } else {
      const result = await deliveryNoteModel.find({ company: userCompanyId })
        .populate("projectId clientId userId company");

      return res.status(200).json({ status: "success", message: "Delivery notes retrieved successfully", data: result });
    }
  } catch (error) {
    console.error("Error retrieving delivery note(s):", error);
    handleHttpError(res, "ERROR_RETRIEVING_DELIVERY_NOTE");
  }
};

/**
 * Elimina un albarán de entrega (soft o hard delete)
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteDeliveryNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { soft } = req.query;
    const userCompanyId = req.user?.company;

    if (!userCompanyId) return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);
    if (!mongoose.Types.ObjectId.isValid(id)) return handleHttpError(res, "INVALID_DELIVERY_NOTE_ID", 400);

    const deliveryNote = await deliveryNoteModel.findOne({ _id: id, company: userCompanyId });
    if (!deliveryNote) return handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);
    if (deliveryNote.sign) return handleHttpError(res, "CANNOT_DELETE_SIGNED_DELIVERY_NOTE", 403);

    if (soft === "false") {
      await deliveryNoteModel.deleteOne({ _id: id });
      return res.status(200).json({ status: "success", message: "Delivery note permanently deleted" });
    } else {
      await deliveryNote.delete();
      return res.status(200).json({ status: "success", message: "Delivery note soft-deleted" });
    }
  } catch (error) {
    console.error("Error deleting delivery note:", error);
    handleHttpError(res, "ERROR_DELETING_DELIVERY_NOTE");
  }
};

/**
 * Obtiene el PDF de un albarán de entrega.
 * Si el PDF ya existe, lo devuelve directamente.
 * Si no existe, lo genera y lo sube a Pinata.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getDeliveryNotePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user?.company;

    if (!mongoose.Types.ObjectId.isValid(id)) return handleHttpError(res, "INVALID_DELIVERY_NOTE_ID", 400);
    if (!userCompanyId) return handleHttpError(res, "USER_NOT_ASSOCIATED_WITH_COMPANY", 403);

    const deliveryNote = await deliveryNoteModel.findOne({ _id: id, company: userCompanyId })
      .populate("projectId clientId userId company");

    if (!deliveryNote) return handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);

    if (deliveryNote.pdf) {
      const cleanUrl = deliveryNote.pdf.replace(/([^:]\/)+/g, "$1");
      return res.status(200).json({ status: "success", message: "PDF already generated", pdfUrl: cleanUrl });
    }

    const pdfBuffer = await generatePDF(deliveryNote);
    const fileUrl = await uploadPdfToPinata(pdfBuffer, `deliverynote-${id}.pdf`);
    const cleanUrl = fileUrl.replace(/([^:]\/)+/g, "$1");

    deliveryNote.pdf = cleanUrl;
    await deliveryNote.save();

    res.status(200).json({ status: "success", message: "PDF generated and uploaded successfully", pdfUrl: cleanUrl });
  } catch (error) {
    console.error("Error retrieving or generating PDF:", error);
    handleHttpError(res, "ERROR_RETRIEVING_OR_GENERATING_PDF");
  }
};

/**
 * Sube la firma y genera el PDF del albarán de entrega.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const uploadSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user?.company;
    if (!req.file) return handleHttpError(res, "NO_FILE_UPLOADED", 400);

    const deliveryNote = await deliveryNoteModel.findOne({ _id: id, company: userCompanyId })
      .populate("projectId clientId userId company");

    if (!deliveryNote) return handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);

    const signBuffer = req.file.buffer;

    const signUrl = (await uploadImageToPinata(signBuffer, req.file.originalname)).replace(/([^:]\/)+/g, "$1");
    deliveryNote.sign = signUrl;

    const pdfBuffer = await generatePDF({
      ...deliveryNote.toObject(),
      signBuffer,
    });
    

    const pdfUrl = (await uploadPdfToPinata(pdfBuffer, `deliverynote-${id}.pdf`)).replace(/([^:]\/)+/g, "$1");

    deliveryNote.pdf = pdfUrl;
    await deliveryNote.save();

    res.status(200).json({
      status: "success",
      message: "Firma y PDF subidos correctamente",
      data: {
        sign: signUrl,
        pdf: pdfUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading signature and generating PDF:", error);
    handleHttpError(res, "ERROR_UPLOADING_SIGNATURE_AND_PDF");
  }
};



const restoreDeliveryNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user?.company;

    if (!mongoose.Types.ObjectId.isValid(id)) return handleHttpError(res, "INVALID_DELIVERY_NOTE_ID", 400);

    const deliveryNote = await deliveryNoteModel.findOneWithDeleted({ _id: id, company: userCompanyId });
    if (!deliveryNote) return handleHttpError(res, "DELIVERY_NOTE_NOT_FOUND", 404);

    await deliveryNote.restore();

    res.status(200).json({ status: "success", message: "Delivery note restored successfully", data: deliveryNote });
  } catch (error) {
    console.error("Error restoring delivery note:", error);
    handleHttpError(res, "ERROR_RESTORING_DELIVERY_NOTE");
  }
};

module.exports = {
  registerDeliveryNote,
  updateDeliveryNote,
  getDeliveryNote,
  deleteDeliveryNote,
  getDeliveryNotePDF,
  uploadSignature,
  restoreDeliveryNote,
};