const models = {
    usersModel: require('./nosql/users'),
    companyModel: require('./nosql/company'),
    storageModel: require('./nosql/storage'),
    clientModel: require('./nosql/client'),
    projectModel: require('./nosql/project'),
    deliveryNoteModel: require('./nosql/deliverynote'),
    }

module.exports = models