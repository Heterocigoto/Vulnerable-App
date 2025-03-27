const express = require('express');
const app     = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('/public'));
app.use('/resources', express.static(__dirname+'/public'));

app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');
const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = require('./database/db');
const e = require('express');

app.get('/login', (req, res)=>{
    res.render('login', {msg: 'Login',
                         alert: ''
    });	    
});

app.get('/register', (req, res)=>{
    res.render('register', {msg: 'Registro'});	    
});

app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.password;
    const rol  = req.body.rol;
    const name = req.body.name;
    console.log(req.body);
    let passwordHash;
    try {
        const salt = await bcryptjs.genSalt();
        passwordHash = await bcryptjs.hash(pass, salt);

    connection.query('INSERT INTO Users SET ?', {user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('login', { alert: '' });
        }
    });
    } catch (error) {
    console.error('Error hashing password:', error);
    return res.render('register', { msg: 'Error al registrar usuario' });
}
});

app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.password;

    if (user && pass ) {
        const query = `SELECT * FROM Users WHERE user = '${user}'`;
        try {
        connection.query(query, async (error, results) => {
            if (error) {
                console.error('Error en la consulta:', error);
                return res.render('login', { alert: 'Error en la autenticación' });
            }
            
            if (results.length == 0) {
                return res.render('login', { alert: 'Usuario y/o contraseña incorrectos' });
            }
            
            const hashedPassword = results[0].pass;
            if(isString(hashedPassword)){
            const passwordMatch = await bcryptjs.compare(pass, hashedPassword);
                if (passwordMatch) {
                    req.session.loggedin = true;
                    req.session.user = results[0].user;
                    res.render('index', { user: results[0].user });
                } else {
                    res.render('login', { alert: 'Usuario y/o contraseña incorrectos' });
                }
            }

        });
    }catch (error) {
        console.error('Error en la autenticación:', error);
        return res.render('login', { alert: 'Error en la autenticación' });
    }
    } else {
        res.render('login', { alert: 'Por favor ingrese usuario y contraseña' });
    }

});

app.get('/index', (req, res)=>{
    if(req.session.loggedin){
        res.render('index', { 
            login: true,
            user: req.session.user });
    }else{
        res.render('login', { 
            login: false,
            alert: 'No se ha iniciado sesión',
            msg: 'Por favor inicia sesion' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/index'); // Redirige al dashboard si hay un error
        }
        res.redirect('/login'); // Redirige al login después de cerrar sesión
    });
});
app.listen(3000, '192.168.100.84', (req, res)=>{
    console.log('Running...');
    console.log(res)
    
});

function isString (input) {  
    return typeof input === 'string' && Object.prototype.toString.call(input) === '[object String]'
  }