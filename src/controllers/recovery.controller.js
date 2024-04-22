const transport = require('../utils/nodemailer.util');
const { email_out } = require('../config/services.config');
const { Router } = require('express');
const { generateTokenPass, verifyTokenPass } = require('../utils/jwt-utils');
const Users = require('../models/users.model');
const router = Router();

// Almacenamiento para los tokens utilizados
const usedTokens = new Set();

router.get('/forgotpassword/:token', (req, res) => {
  const token = req.params.token; // Obtener el token de los parámetros de la URL

  // Verificar si el token ha sido utilizado
  if (usedTokens.has(token)) {
      res.status(400).send('El enlace de restablecimiento de contraseña ya ha sido utilizado.');
      return;
  }

  // Verificar el token y su tiempo de expiración
  const decodedToken = verifyTokenPass(token);

  if (!decodedToken) {
      // El token no es válido o ha expirado
      res.status(400).send('El enlace de restablecimiento de contraseña es inválido o ha expirado.');
  }
});
router.post('/recoveryPass', async (req, res) => {
    const email = req.body.email;

    const currentPassword = await getUserCurrentPassword(email); // Asegúrate de esperar la resolución de esta promesa

    // Generar un token único adicional
    const additionalToken = randomString(5);

    // Generar el token con marca de tiempo para el enlace de restablecimiento de contraseña
    const token = generateTokenPass(email); // Mover la generación de token aquí

    // Combino el token generado con el token único adicional
    const combinedToken = `${token}-${additionalToken}`;

    // Agrego el token combinado a la lista de tokens utilizados
    usedTokens.add(combinedToken);

    // Configurar el contenido del correo electrónico
    const resetLink = `http://localhost:8080/pass/forgotpassword/${combinedToken}?email=${encodeURIComponent(email)}`;
    const mailOptions = {
        from: email_out,
        to: email,
        subject: 'Recuperación de contraseña',
        html: `
            <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        `,
    };

    // Enviar el correo electrónico
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send('Ocurrió un error al enviar el correo electrónico');
        } else {
            res.status(200).json({ status: 'success', message: 'Mail enviado'});
        }
    });
});

// Función para generar una cadena aleatoria de longitud dada
function randomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function getUserCurrentPassword(email) {
    try {
        // Buscar al usuario en la base de datos por su correo electrónico
        const user = await Users.findOne({ email });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        return user.password; // Devolver la contraseña del usuario encontrado
    } catch (error) {
        throw error; // Manejar errores de consulta
    }
}

module.exports = router;
