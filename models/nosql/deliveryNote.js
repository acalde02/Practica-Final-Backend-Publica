const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const deliveryNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: function () {
      return this.format === "hours";
    }
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "client",
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
    required: true
  },  
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true
  },
  format: {
    type: String,
    enum: ["hours", "material"],
    required: true
  },
  hours: {
    type: Number,
    required: function () {
      return this.format === "hours";
    }
  },
  material: {
    type: String,
    required: function () {
      return this.format === "material";
    }
  },
  quantity: {
    type: Number,
    required: function () {
      return this.format === "material";
    }
  },
  description: {
    type: String
  },
  sign: {
    type: String, // ruta al archivo/firma
    required: false
  },
  pending: {
    type: Boolean,
    default: true
  },
  pdf: {
    type: String // ruta al archivo PDF generado
  },
}, {
  timestamps: true,
  versionKey: false
}); 

deliveryNoteSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("deliverynote", deliveryNoteSchema);
