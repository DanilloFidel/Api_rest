let express = require('express')
let app = express()

let bodyParser = require('body-parser')
let morgan = require('morgan')
let mongoose = require('mongoose')

let cors = require('cors')

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().getTime() + '-' + file.originalname);
    }
});
  
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
  
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

let jwt = require('jsonwebtoken')
let config = require('./config')

let Usuario = require('./api/models/usuario')
let Imovel = require('./api/models/imovel')

let port = process.env.PORT || 1337 //DARKSORCER
mongoose.Promise = global.Promise
mongoose.connect(config.database, {
    useMongoClient: true
})
    .then(() => console.log('A conexao com o mLAB foi um SUCESSO!!!'))
    .catch((err) => console.error(err));

app.set('superNode-auth', config.configName)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(morgan('dev'))

let apiRoutes = express.Router()

app.listen(port)
console.log('A api esta hospedada na porta: ' + port)

// =========================================
var corsOptions = {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept', 'x-access-token'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use('/api', apiRoutes)

apiRoutes.post('/registro/usuario', (req, res) => {

    let novoUsuario = new Usuario({
        nome: req.body.nome,
        sobrenome: req.body.sobrenome,
        senha: req.body.senha,
        telefone: req.body.telefone,
        email: req.body.email,
        admin: req.body.admin,
        funcionario: req.body.funcionario
    })


    Usuario.findOne({ email: req.body.email }, (err, usuario) => {
       
        if( usuario == null ){
            novoUsuario
                .save()
                .then(result => {
                    res.status(201).json({ success: true,
                        message: 'Usuario cadastrado com SUCESSO!!!'
                    })
                }).catch(err => { success: false,
                    res.status(500).json({ message: 'Existe alguma informacao pendente a ser preenchida' })
                })
        } else { success: false,
            res.status(501).json({ message: 'Email ja existe' })
        }
    })
        
})

apiRoutes.get('/imoveis', (req, res) => {
    Imovel.find()
        .select("tipo valor disp area quartos vagas suite descricao cep bairro nro cidade estado imvImg")
        .exec()
        .then(docs => {
            const response = {
                success: true,
                count: docs.length,
                imoveis: docs.map(doc => {
                    return {
                        _id: doc._id,
                        tipo: doc.tipo,
                        valor: doc.valor,
                        disp: doc.disp,
                        area: doc.area,
                        quartos: doc.quartos,
                        vagas: doc.vagas,
                        suites: doc.suites,
                        descricao: doc.descricao,
                        cep: doc.cep,
                        bairro: doc.bairro,
                        cidade: doc.cidade,
                        estado: doc.estado,
                        nro: doc.nro,
                        imvImg: doc.imvImg
                    }
                })  
            }
            res.status(200).json(response)
        }).catch(err => {
            res.status(404).json({ success: false, message: 'imoveis nao encontrados' })
        })
    })      

apiRoutes.get('/imoveis/:_id', (req, res) => {
    Imovel.find({ _id: req.params._id }, (err, imoveis ) => {
        if( err ){
            res.status(404).json({ success: false, message: "imovel nao encontrado"})
        } else {
            res.status(200).json(imoveis)
        }
    })
})

apiRoutes.post('/autenticacao', (req, res) => {
    Usuario.findOne({ email: req.body.email }, (err, usuario) => {
        if (err)
            res.status(500).json({ success: false ,error: err.message })

        if(!usuario) {
            res.status(500).json({ success: false, message: 'Autenticaçao falhou'})
        } else if (usuario) {

            if(usuario.senha != req.body.senha) {
                res.status(500).json({ success: false, message: 'Autenticaçao Falhou'})
            } else {
                let token = jwt.sign(usuario, app.get('superNode-auth'), {
                    expiresIn: 700
                })

                res.json({
                    success: true,
                    message: 'Token Criado!!',
                    token: token,
                    usuarioID: usuario._id, 
                    usuarioNome: usuario.nome, 
                    usuarioEmail: usuario.email
                })
            }
        }
    })
})

apiRoutes.use( (req, res, next) => {
    
    let token = req.body.token || req.query.token || req.headers['x-access-token']

    if(token) {
        jwt.verify(token, app.get('superNode-auth'), (err, decoded) => {
            if(err) {
                return res.status(500).json({ success: false, message: 'Falha ao tentar Autenticar'})
            } else {
                req.decoded = decoded
                next()
            }
        })

    } else {
        return res.status(403).send({
            success: false,
            message: 'Nao tem token'
        })
    }
})

// ============================================

apiRoutes.get('/usuarios', (req, res) => {
    Usuario.find()
    .select("nome sobrenome telefone email favoritos admin funcionario")
    .exec()
    .then(docs => {
        const response = {
            success: true,
            count: docs.length,
            usuarios: docs.map(doc => {
                return {
                    _id: doc._id,
                    nome: doc.nome,
                    sobrenome: doc.sobrenome,
                    telefone: doc.telefone,
                    email: doc.email,
                    favoritos: doc.favoritos,
                    admin: doc.admin,
                    funcionario: doc.funcionario
                }
            })
        }
        res.status(200).json(response)
    }).catch(err => {
        res.status(404).json({ success: false, message: 'usuarios nao encontrados' })
    })
})

apiRoutes.get('/usuarios/:_id', (req, res) => {
    Usuario.find({ _id: req.params._id })
    .select("nome sobrenome telefone email favoritos admin funcionario")
    .exec()
    .then(docs => {
        const response = {
            success: true,
            usuarios: docs.map(doc => {
                return {
                    _id: doc._id,
                    nome: doc.nome,
                    sobrenome: doc.sobrenome,
                    telefone: doc.telefone,
                    email: doc.email,
                    favoritos: doc.favoritos,
                    admin: doc.admin,
                    funcionario: doc.funcionario
                }
            })
        }
        res.status(200).json(response)
    }).catch(err => {
        res.status(404).json({ success: false, message: 'usuarios nao encontrados' })
    })
})

// apiRoutes.get('/usuarios/:email', (req, res) => {
//     Usuario.find().distinct('email', (err, usuarios) => {
//     res.json(usuarios)
//     })
// })

apiRoutes.put('/usuarios/:_id', (req, res) => {
    Usuario.findOneAndUpdate({ _id: req.params._id }, req.body, { upsert: true}, (err, usuarios) => {
        if(err) {
            res.status(500).json({ success: false, message: 'Falha ao alterar os dados do usuario' })
            return
        } else {
            res.status(200).json({ success: true, message: 'Sucesso ao alterar!!' })
        }
    })
})

apiRoutes.delete('/usuarios/:_id', (req, res) => {
    Usuario.remove({ _id: req.params._id })
        .exec()
        .then(result => {
            res.status(200).json({ success: true, message: 'Usuario deletado' })
        }).catch (err => {
            console.log(err)
            res.status(500).json({ success: false, message: 'Falha ao deletar' })
        })
})

// ============================================

apiRoutes.post('/registro/imovel', upload.single('imvImg'), (req, res) => {
    let novoImovel = new Imovel({
        tipo: req.body.tipo,
        valor: req.body.valor,
        disp: req.body.disp,
        area: req.body.area,
        quartos: req.body.quartos,
        vagas: req.body.vagas,
        suites: req.body.suites,
        descricao: req.body.descricao,
        cep: req.body.cep,
        bairro: req.body.bairro,
        nro: req.body.nro,
        cidade: req.body.cidade,
        estado: req.body.estado,
        imvImg: req.file.path
    })

    Imovel.findOne({ tipo: req.body.tipo , area: req.body.area, cep: req.body.cep, nro: req.body.nro  }, (err, imovel) => {
        if( imovel == null ){
            novoImovel
                .save()
                .then(result => {
                    res.status(200).json({ success: true, message: 'Imovel cadastrado com SUCESSO!!' })
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ success: false, message: 'Existe alguma informacao incompleta' })
                })
        } else {
            res.status(501).json({ success: false, message: 'Imovel Existente' })
        }
    })
    
})

apiRoutes.put('/imoveis', (req, res) => {
    Imovel.findOneAndUpdate({ _id: req.params._id }, req.body, { upsert: true }, (err, imoveis) => {
        if(err) {
            res.status(500).json({ success: false, message: 'Falha ao tentar alterar os dados do imovel' })
            return
        } else {
            res.status(200).json({ success: true, message: 'Sucesso ao alterar!!' })
        }
    })
})

apiRoutes.delete('/imoveis/:_id', (req, res) => {
    Imovel.remove({ _id: req.params._id })
        .exec()
        .then(result => {
            res.status(200).json({ success: false, message: 'Imovel deletado' })
        }).catch (err => {
            console.log(err)
            res.status(500).json({ success: true, message: 'Falha ao deletar' })
        })
})

// ============================================