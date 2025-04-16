const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        cif: {
            type: String,
            required: true,
            unique: true
        },
        street: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        },
        postal: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        clients:[ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "client",
            required: false
        }],
        logo: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "storage",
            required: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);


companySchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('company', companySchema);