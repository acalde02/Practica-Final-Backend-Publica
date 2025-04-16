const { usersModel, companyModel } = require("../models");
const { handleHttpError } = require("../utils/handleError");

const registerCompanyCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyData = req.body;

        const user = await usersModel.findById(userId).populate("company");
        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        let existingCompany = await companyModel.findOne({ cif: companyData.cif });

        if (existingCompany) {
            user.company = existingCompany._id;
            await user.save();

            return res.json({ message: "Company already exists. Linked user to existing company.", company: existingCompany });
        }

        let newCompany;

        if (user.company) {
            newCompany = await companyModel.findByIdAndUpdate(
                user.company._id,
                { $set: companyData },
                { new: true, runValidators: true }
            );
        } else {
            newCompany = await companyModel.create(companyData);
            user.company = newCompany._id;
            await user.save();
        }

        res.json({ message: "Company information updated", company: newCompany });

    } catch (error) {
        console.error("Error updating company:", error);
        handleHttpError(res, "ERROR_UPDATING_COMPANY");
    }
};

const updateCompanyCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyData = req.body;

        const user = await usersModel.findById(userId).populate("company");
        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        const existingCompany = await companyModel.findOne({
            cif: companyData.cif,
            _id: { $ne: user.company?._id }
        });

        if (existingCompany) {
            return handleHttpError(res, "CIF_ALREADY_IN_USE", 409);
        }

        let updatedCompany;

        if (user.company) {
            updatedCompany = await companyModel.findByIdAndUpdate(
                user.company._id,
                { $set: companyData },
                { new: true, runValidators: true }
            );
        } else {
            updatedCompany = await companyModel.create(companyData);
            user.company = updatedCompany._id;
            await user.save();
        }

        res.status(200).json({
            message: "Company updated successfully",
            company: updatedCompany
        });
    } catch (error) {
        console.error("Error updating company:", error);
        handleHttpError(res, "ERROR_UPDATING_COMPANY");
    }
};

const deleteCompanyCtrl = async (req, res) => {
    try {
      const userId = req.user._id;
      const softDelete = req.query.soft !== "false";
  
      // Buscar usuario y compañía asociada
      const user = await usersModel.findById(userId).populate("company");
      if (!user || !user.company) {
        return handleHttpError(res, "COMPANY_NOT_ASSOCIATED", 404);
      }
  
      const companyId = user.company._id;
  
      if (softDelete) {
        await companyModel.delete({ _id: companyId });
        return res.json({ message: "COMPANY_SOFT_DELETED" });
      } else {
        await companyModel.deleteOne({ _id: companyId });
        return res.json({ message: "COMPANY_HARD_DELETED" });
      }
  
    } catch (error) {
      console.error("Error deleting company:", error);
      handleHttpError(res, "ERROR_DELETING_COMPANY");
    }
  };

module.exports = { registerCompanyCtrl, updateCompanyCtrl, deleteCompanyCtrl };
