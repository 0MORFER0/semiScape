export const obtenerYMostrarUsuario = () => {
  const username = localStorage.getItem("userName");
  
  if (!username) {
    alert("No se ha encontrado el usuario en la sesión. Redirigiendo al login...");
    window.location.href = "index.html"; // Redirigir al login si no hay usuario
    return; // No continuar si no se encuentra el usuario
  }

  // Asegurémonos de que el contenedor no exista ya antes de crear uno nuevo
  let userInfoContainer = document.getElementById("user-info");

  if (!userInfoContainer) {
    // Crear el contenedor dinámicamente para mostrar la información del usuario
    userInfoContainer = document.createElement("div");
    userInfoContainer.id = "user-info"; // Asignar un id al contenedor
    document.body.appendChild(userInfoContainer); // Añadir el contenedor al body
  }

  // Mostrar el nombre del usuario
  userInfoContainer.textContent = `Usuario: ${username}`;
  
  return username; // Devolver el username por si lo necesitas en otro lugar
};

