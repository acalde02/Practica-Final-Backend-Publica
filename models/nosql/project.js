const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');


const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'client',
            required: true
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },

        deliveryNote: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'deliveryNote',
            required: false
        }],
    },
    {
        timestamps: true,
        versionKey: false
    }
);

projectSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
module.exports = mongoose.model('project', projectSchema);