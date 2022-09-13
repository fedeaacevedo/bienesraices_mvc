import { check, validationResult } from 'express-validator'
import generarId from '../helpers/token.js'
import Usuario from '../models/Usuario.js'
import { emailRegistro } from '../helpers/email.js'


//Utilizamos await porque estamos trabajando con la base de datos

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion'
    })
}

const formularioRegistro = (req, res) => {

    
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    //Validar campos 
    await check('nombre').notEmpty().withMessage('El nombre no puede quedar vacio').run(req)
    await check('email').isEmail().withMessage('Debe ingresar un email valido').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe contener como minimo 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req)

    let resultado = validationResult(req)

    // return res.json(resultado.array)

    //verificar que el resultado este vacio

    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            //los campos quedan grabados en el form en caso de error
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //extraer los datos
    const { nombre, email, password } = req.body

    //verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where: { email } })

    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario ya esta registrado' }],
            //los campos quedan grabados en el form en caso de error
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })



    //mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmacion'
    })
}


//funcion que comprueba una cuenta
const confirmar = async (req, res) => {
    const {token} = req.params;
    console.log(token)

    //verificar si el token es valido, con el where buscamos el que tenga el token que hayamos solicitado en ese momento

    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //confirmar la cuenta
    usuario.token= null;
    usuario.confirmado= true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente'
    })
    
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Restaurar Password'
    })
}

const resetPassword = (req, res) => {

}





export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword
}