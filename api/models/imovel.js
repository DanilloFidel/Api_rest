let mongoose = require('mongoose')
let Schema = mongoose.Schema
    
module.exports = mongoose.model('Imovel', new Schema({
  
    tipo: { type: String, require: true },
    valor: { type: String, require: true },
    disp: { type: String, require: true },
    area: { type: String, require: true },
    quartos: { type: String, require: true },
    vagas: { type: String, require: true },
    suites: { type: String, require: false },
    descricao: { type: String, require: true },
    cep: { type: String, required: true },
    bairro: { type: String, require: true },
    nro: { type: String, required: true },
    cidade: { type: String, required: true },
    estado: { type: String, required: true },
    imvImg: [ {type: String, required: false }]

}))