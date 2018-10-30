let mongoose = require('mongoose')
let Schema = mongoose.Schema
    
module.exports = mongoose.model('Imovel', new Schema({
  
    tipo: { type: String, require: true },
    valor: { type: Number, require: true },
    disp: { type: String, require: true },
    area: { type: Number, require: true },
    quartos: { type: Number, require: true },
    vagas: { type: Number, require: true },
    suite: { type: Number, require: true },
    desc: { type: String, require: true },
    rua: { type: String, required: true },
    cep: { type: String, required: true },
    bairro: { type: String, require: true }

}))