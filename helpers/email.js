import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });

      const {email, nombre, token} = datos;

      //Enviar el email
      await transport.sendMail({
        from: 'Alquileres Particulares La Plata',
        to: email,
        subject: 'Confirma tu cuenta en Alquileres Particulares La Plata',
        text: 'Confirma tu cuenta en Alquileres Particulares La Plata',
        html: `
          <p>Hola ${nombre}, confirma tu cuenta para empezar a usarla</p>
          <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a></p>
          <p>Si no creaste esta cuenta, ignora este mensaje</p>
        `
      })
}


const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    const {email, nombre, token} = datos;

    //Enviar el email
    await transport.sendMail({
      from: 'Alquileres Particulares La Plata',
      to: email,
      subject: 'Reestablece tu password en Alquileres Particulares La Plata',
      text: 'Reestablece tu cuenta en Alquileres Particulares La Plata',
      html: `
        <p>Hola ${nombre}, sigue el siguiente enlace para generar un password nuevo</p>
        <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer Password</a></p>
        <p>Si no solicitaste el cambio de password, ignora este mensaje</p>
      `
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}