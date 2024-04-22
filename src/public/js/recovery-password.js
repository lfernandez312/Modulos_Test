document.getElementById('recoveryPass').addEventListener('submit', function(event) {
  event.preventDefault();

  var formData = {
      'email': document.getElementById('email').value
  };

  // Tu código AJAX para enviar la solicitud al servidor
  $.ajax({
      type: 'POST',
      url: '/pass/recoveryPass',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function(data) {
          if (data.status === 'success') {
              // Muestra un mensaje de éxito al usuario
              Swal.fire({
                  icon: 'success',
                  title: 'Solicitud exitosa',
                  text: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.',
              });
          } else {
              // Muestra un mensaje de error al usuario si la solicitud falla
              Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: `Ha ocurrido un error: ${data.error}`,
              });
          }
      },
      error: function(xhr, status, error) {
          // Muestra un mensaje de error al usuario si hay un error de red o servidor
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error: ${error}`,
          });
      }
  });
});