const express = require('express');

//creamos la app
const app = express();

//Routing
app.get('/', function(req, res){
    res.send("Hola mundo en express")
})


//Definir un puerto
const port = 3000;

app.listen(port, () => {
    console.log(`El puerto en uso es ${port}`)
})