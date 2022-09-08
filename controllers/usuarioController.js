import { check, validationResult } from 'express-validator'
import Usuario from '../models/Usuario.js'

//Utilizamos await porque estamos trabajando con la base de datos

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
    const existeUsuario = await Usuario.findOne({ where: { email }})

    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{ msg: 'El usuario ya esta registrado' }],
            //los campos quedan grabados en el form en caso de error
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Almacenar un usuario
    await Usuario.create({
        nombre,
        email, 
        password,
        token: 123
    })

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