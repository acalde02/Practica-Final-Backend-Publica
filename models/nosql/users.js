const mongoose = require("mongoose")
const mongooseDelete = require("mongoose-delete")

const UserScheme = new mongoose.Schema(
    {
        name: {
            type: String
        },
        surnames: {
            type: String,
            required: false
        },
        nif: {
            type: String,
            unique: true,
            sparse: true, // Sparce es para que no se guarde si no se ha rellenado
        },
        age: {
            type: Number
        },
        email: {
            type: String,
            unique: true
        },
        password:{
            type: String,  // Guardaremos el hash
            select: false
        },
        role:{
            type: String,
            enum: ["user", "admin", "guest"], // es como el enum de SQL
            default: "user"
        },

        isVerified:{
            type: Boolean,
            default: false
        },
        company: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "company",
            required: false
        },

        code: { // Código de verificación y de recuperación de contraseña
            type: Number,
            select: false
          },
          recoveryAttempts: {
            type: Number,
            default: 0
          }          
    },
    {
        timestamps: true, // Añade las fechas de creación y modificación
        versionKey: false
    }
)
UserScheme.plugin(mongooseDelete, { deletedAt: true, deleted: true, overrideMethods: "all"})
module.exports = mongoose.model("users", UserScheme) // Nombre de la colección (o de la tabla en SQL)