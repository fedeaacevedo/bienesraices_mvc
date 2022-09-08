import {check, validationResult} from 'express-validator'
import Usuario from '../models/Usuario.js'


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion'
    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    })
}

const registrar = async(req, res) => {
    //Validar campos 
    await check('nombre').notEmpty().run(req)

    
    const usuario = await Usuario.create(req.body)
    res.json(usuario)
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Restaurar Password'
    })
}



export {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword
}