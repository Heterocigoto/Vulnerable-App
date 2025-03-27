const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'vulnerable_app',
    port: 5432
});

connection.connect((error)=>{
    if(error){
        console.log('El error de conexion es: '+ error);
        process.exit(1);
    }
    console.log('Conexion exitosa');

    
});

module.exports = connection;