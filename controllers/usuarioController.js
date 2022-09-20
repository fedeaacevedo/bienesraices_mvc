import { check, validationResult } from "express-validator";
import bcrypt from 'bcrypt'
import generarId from "../helpers/token.js";
import Usuario from "../models/Usuario.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

//Utilizamos await porque estamos trabajando con la base de datos

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar Sesion",
    csrfToken: req.csrfToken()
  });
};

const autenticar = async (req, res) => {
    //validacion 
    await check("email")
    .isEmail()
    .withMessage("Debe ingresar un email valido")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .run(req);

    let resultado = validationResult(req);

  //verificar que el resultado este vacio

  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    });
  
  }

  const {email, password} = req.body

  //comprobar si el usuario existe
  const usuario = await Usuario.findOne({where: {email} })
  if(!usuario){
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{msg:'Usuario y/o contraseña invalido'}]
    });
  }
  //confirmar si el usuario esta confirmado
  if(!usuario.confirmado){
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{msg:'Debes validar tu cuenta para iniciar sesion'}]
    });
  }

  //revisar el password
  if(!usuario.verificarPassword(password)){
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{msg:'Usuario y/o contraseña invalido'}]
    });
  }

  //autenticar usuario
  

  };


const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  //Validar campos
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre no puede quedar vacio")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("Debe ingresar un email valido")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe contener como minimo 6 caracteres")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Los Passwords no son iguales")
    .run(req);

  

  //extraer los datos
  const { nombre, email, password } = req.body;

  //verificar que el usuario no este duplicado
  const existeUsuario = await Usuario.findOne({ where: { email } });

  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario ya esta registrado" }],
      //los campos quedan grabados en el form en caso de error
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Almacenar un usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  //Envia email de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //mostrar mensaje de confirmacion
  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos enviado un email de confirmacion",
  });
};

//funcion que comprueba una cuenta
const confirmar = async (req, res) => {
  const { token } = req.params;
  console.log(token);

  //verificar si el token es valido, con el where buscamos el que tenga el token que hayamos solicitado en ese momento

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  //confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  return res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta se confirmo correctamente",
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Restaurar Password",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  //Validar campos

  await check("email")
    .isEmail()
    .withMessage("Debe ingresar un email valido")
    .run(req);

  let resultado = validationResult(req);

  //verificar que el resultado este vacio

  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/olvide-password", {
      pagina: "Restaurar Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  //Buscamos el usuario
  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: " Recupera tu acceso",
      csrfToken: req.csrfToken(),
      errores: [{msg:'El email no pertenece a un usuario valido'}]
    });
  }

  //Generar token y enviar el email
    usuario.token = generarId();
    await usuario.save();
    
    //enviar email

    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //renderizar mensaje
    res.render("templates/mensaje", {
        pagina: "Reestablece tu password",
        mensaje: "Hemos enviado un email con las instrucciones",
      });
};

const comprobarToken = async (req, res) => {

    const {token} = req.params;

    const usuario = await Usuario.findOne({where:{token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validad tu informacion, intenta de nuevo',
            error: true
        })
    }
    //mostrar formulario para modificar password si el usuario es valido
    res.render('auth/reset-password',{
      pagina: 'Reestablece tu Password',
      csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {

  //valirar nuevo password
  await check("password").isLength({ min: 6 }).withMessage("El password debe contener como minimo 6 caracteres").run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/reset-password", {
      pagina: "Reestablecer contraseña",
      csrfToken: req.csrfToken(),
      errores: resultado.array()  
    });
  }

  const { token } = req.params
  const { password } = req.body

  //Identificar quien hace el cambio
  const usuario = await Usuario.findOne({where: {token}})


  //Hashear el nuevo password
  const salt = await bcrypt.genSalt(10)
  usuario.password= await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render('auth/confirmar-cuenta',{
    pagina: 'Contraseña reestablecida',
    mensaje:'La contraseña se cambio correctamente'
  })
}

export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  registrar,
  confirmar,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword
};
