
//CREAMOS ID RANDOM PARA QUE LOS USUARIOS CONFIRMEN SU CUENTA
const generarId = () =>  Math.random().toString(32).substring(2) + Date.now().toString(32);

export default generarId