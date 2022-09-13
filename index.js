import express from 'express';
import usuarioRouter from './Routes/usuarioRoutes.js'
import db from './config/db.js'


//creamos la app
const app = express();

//Habilitar lectura de formularios
app.use(express.urlencoded({extended: true}))

//conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log("Conexion a la base de datos correcta");
} catch (error) {
    console.log(error)
}


//Habilitar PUG
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica
app.use(express.static('public'))

//Routing
app.use('/auth',usuarioRouter)


//Definir un puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El puerto en uso es ${port}`)
})