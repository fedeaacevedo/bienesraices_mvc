import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRouter from './Routes/usuarioRoutes.js'
import propiedadesRoutes from './Routes/propiedadesRoutes.js'
import db from './config/db.js'


//creamos la app
const app = express();

//Habilitar lectura de formularios
app.use(express.urlencoded({extended: true}))

//habilitar cookie-parser
app.use(cookieParser())

//habilitar CSRF
app.use(csrf({cookie: true}))

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
app.use('/', propiedadesRoutes)


//Definir un puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El puerto en uso es ${port}`)
})