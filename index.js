import express from 'express';
import usuarioRouter from './usuarioRoutes.js'


//creamos la app
const app = express();


//Habilitar PUG
app.set('view engine', 'pug')
app.set('views', './views')

//Routing
app.use('/auth',usuarioRouter)


//Definir un puerto
const port = 3000;
app.listen(port, () => {
    console.log(`El puerto en uso es ${port}`)
})