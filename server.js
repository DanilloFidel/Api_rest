let express = require('express')
let app = express()

let bodyParser = require('body-parser')
let morgan = require('morgan')
let mongoose = require('mongoose')

let jwt = require('jsonwebtoken')
let config = require('./config')

let User = require('./api/models/user')
let Imovel = require('./api/models/imovel')

let port = process.env.PORT || 0042
mongoose.Promise = global.Promise
mongoose.connect(config.database, {
    useMongoClient: true
})
    .then(() => console.log('Conectado com MongoDB'))
    .catch((err) => console.error(err));

app.set('superNode-auth', config.configName)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(morgan('dev'))

let apiRoutes = express.Router()

app.listen(port)
console.log('Ta rodando na porta::' + port)

// =========================================
app.use('/api', apiRoutes, cors())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

apiRoutes.post('/registro', (req, res) => {
    let newUser = new User({
        name: req.body.name,
        pwd: req.body.pwd,
        telefone: req.body.telefone,
        email: req.body.email,
        admin: req.body.admin
    })

    newUser.save( function (error){
        if(error)
            throw error
        
        console.log('sucesso!!')
            res.json({
                success: true
            })
    })
})

apiRoutes.post('/authenticate', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err)
            throw error

        if(!user) {
            res.json({ success: false, message: 'Autenticaçao do Email falhou. N existe User'})
        } else if (user) {

            if(user.pwd != req.body.pwd) {
                res.json({ success: false, message: 'Autenticaçao do Email Falhou. Senha ERRROUUUU!!'})
            } else {
                let token = jwt.sign(user, app.get('superNode-auth'), {
                    expiresIn: 300
                })

                res.json({
                    success: true,
                    message: 'Token Criado!!',
                    token: token
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
                return res.json({ success: false, message: 'Falha ao tentar Autenticar'})
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

apiRoutes.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        res.json(users)
    })
})

apiRoutes.get('/users/:_id', (req, res) => {
    User.find({_id: req.params._id}, (err, users) => {
        res.json(users)
    })
})

apiRoutes.put('/users', (req, res) => {
    User.findOneAndUpdate({ _id: req.params._id }, req.body, { upsert: true}, (err, users) => {
        if(err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json(users)
    })
})

apiRoutes.delete('/users', (req, res) => {
    User.find({ _id: req.params._id }).remove( (err) => {
        if(err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json({ success: true })
    })
})

// ============================================

apiRoutes.post('/registro', (req, res) => {
    let newImovel = new Imovel({
        tipo: req.body.tipo,
        valor: req.body.valor,
        disp: req.body.disp,
        area: req.body.area,
        quartos: req.body.quartos,
        vagas: req.body.vagas,
        suite: req.body.suite,
        desc: req.body.desc,
        rua: req.body.rua,
        cep: req.body.cep,
        bairro: req.body.bairro
    })

    newImovel.save( (err) => {
        if(err)
            throw error
        
        console.log('sucesso!!')
            res.json({
                success: true
            })
    })
})

apiRoutes.get('/imoveis', (req, res) => {
    Imovel.find({}, (err, imoveis) => {
        res.json(imoveis)
    })
})

apiRoutes.get('/imoveis/:_id', (req, res) => {
    Imovel.find({ _id: req.params._id }, (err, imoveis ) => {
        res.json(imoveis)
    })
})

apiRoutes.put('/imoveis', (req, res) => {
    Imovel.findOneAndUpdate({ _id: req.params._id }, req.body, { upsert: true }, (err, imoveis) => {
        if(err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json(imoveis)
    })
})

apiRoutes.delete('/imoveis', (req, res) => {
    Imovel.find({ _id: req.params._id }).remove( (err) => {
        if(err) {
            res.status(500).json({ error: err.message })
            return
        }
        res.json({ success: true })
    })
})