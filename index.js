const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session')
const PORT = process.env.PORT || 3000;

//configuração do handlebars
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main'
})); app.set('view engine', 'hbs');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))

//Importar model usuarios
const Usuario = require('./models/Usuario');

//configurações da seçoes
app.use(session({
    secret: 'CriarUmaChabeQualquer1324!blablaaba',
    resave: false,
    saveUninitialized: true
}))

app.get('/', (req, res) => {
    if (req.session.errors) {
        var arrayErros = req.session.errors;
        req.session.errors = ""
        return res.render('index', { NavActiveCad: true, error: arrayErros })
    }

    if (req.session.success) {
        req.session.success = false;
        return res.render('index', { NavActiveCad: true, MsgSuccess: true })
    }

    res.render('index', { NavActiveCad: true })
})

app.get('/users', (req, res) => {
    Usuario.findAll().then((valores) => {
        //console.log(valores.map(valores => valores.toJSON()));
        if (valores.length > 0) {
            return res.render('users', { NavActiveUsers: true, table: true, usuarios: valores.map(valores => valores.toJSON()) })
        } else {
            res.render('users', { NavActiveUsers: true, table: false })
        }
    }).catch((err) => {
        console.log(`Houve um problema: ${err}`)
    })
    //res.render('users', { NavActiveUsers: true })
})

app.post('/editar', (req, res) => {
    var id = req.body.id;
    Usuario.findByPk(id).then((dados) => {
        return res.render('editar', { error: false, id: dados.id, nome: dados.nome, email: dados.email })
    }).catch((err) => {
        console.log(err)
        return res.render('editar', { error: true, problema: 'Não é pissivel editar este registe' })
    })
    //res.render('editar')
})

app.post('/cad', (req, res) => {
    var nome = req.body.nome;
    var email = req.body.email;

    const erros = [];

    //remover os espaços em branco antes e depois
    nome = nome.trim();
    email = email.trim();

    //limpar oo nome de caracteres especiais
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '');
    nome = nome.trim();
    console.log(nome);

    //verificar se está vazio ou não o campo
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({ mensagem: "Campo nome não pode ser vazio!" })
    }

    //verificar se o campo nome é valido
    if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({ mensagem: "Nome inválido!" })
    }

    //validação do email
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({ mensagem: "Campo email não pode ser vazio!" })
    }

    //verificar se email é valido
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        erros.push({ mensagem: "Campo email inválido!" })
    }

    if (erros.length > 0) {
        console.log(erros);
        req.session.erros = erros;
        req.session.success = false;
        return res.redirect('/');
    }

    //sucesso nenhum erro
    //salvar no banco de dados
    Usuario.create({
        nome: nome,
        email: email.toLowerCase()
    }).then(function () {
        console.log('Cadastrado com sucesso!')
        req.session.success = true;
        return res.redirect('/');
    }).catch(function (erro) {
        console.log(`Ops, houve um erro: ${erro}`)
    })



})

app.post('/update', (req, res) => {

    var nome = req.body.nome;
    var email = req.body.email;

    const erros = [];

    //remover os espaços em branco antes e depois
    nome = nome.trim();
    email = email.trim();

    //limpar oo nome de caracteres especiais
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '');
    nome = nome.trim();
    console.log(nome);

    //verificar se está vazio ou não o campo
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({ mensagem: "Campo nome não pode ser vazio!" })
    }

    //verificar se o campo nome é valido
    if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({ mensagem: "Nome inválido!" })
    }

    //validação do email
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({ mensagem: "Campo email não pode ser vazio!" })
    }

    //verificar se email é valido
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        erros.push({ mensagem: "Campo email inválido!" })
    }

    if (erros.length > 0) {
        console.log(erros);
        return res.status(400).send({ status: 400, erro: erros });
    }

    //atualizar registro no banco de daos
    Usuario.update(
        {
            nome: nome,
            email: email.toLowerCase()
        },
        {
            where: {
                id: req.body.id
            }
        }).then((resultado) => {
            console.log(resultado);
            return res.redirect('/users');
        }).catch((err) => {
            console.log(err);
        })

})


app.post('/del', (req, res) => {
    Usuario.destroy({
        where: {
            id: req.body.id
        }
    }).then((retorno) => {
        return res.redirect('/users');
    }).catch((err) => {
        console.log(err);
    })
})


app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT);
})