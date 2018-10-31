let mongoose = require('mongoose')
let Schema = mongoose.Schema

module.exports = mongoose.model('User', new Schema({

    nome: { type: String, required: true},
    sobrenome: { type: String, required: true},
    senha: { type: String, required: true},
    telefone: { type: String, required: true },
    email: { type: String, required: true },
    admin: { type: Boolean, required: false },
    funcionario: { type: Boolean, required: false},
    favoritos: []

}))