const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const company = require('./company');

const clientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
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

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true,
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true
        }
    });

    clientSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
    module.exports = mongoose.model('client', clientSchema);
    