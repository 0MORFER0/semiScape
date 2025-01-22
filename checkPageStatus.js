async function checkPageStatus(nombreWeb) {
  try {
    // Si no se proporciona nombreWeb, obtener el nombre de la página actual (sin la extensión)
    if (!nombreWeb) {
      nombreWeb = window.location.pathname.split('/').pop().split('.')[0];
    }

    console.log(`Página actual: ${nombreWeb}`); // Depuración

    // Consultar la API
    const response = await fetch("https://678aba6fdd587da7ac2b3c2b.mockapi.io/api/pruebas");
    const pages = await response.json();

    console.log("Configuración de páginas obtenida de la API:", pages); // Depuración

    // Buscar la configuración de la página actual en la API
    const pageConfig = pages.find(page => page.nombre.toLowerCase() === nombreWeb.toLowerCase());

    console.log(`Configuración de la página "${nombreWeb}":`, pageConfig); // Depuración

    // Si no se encuentra la configuración o el estado es 0, redirigir
    if (!pageConfig || pageConfig.estado == 0) {
      alert(`La página "${nombreWeb}" no está activa.`);
      window.location.href = "index.html"; // Redirigir a la página principal
    }
  } catch (error) {
    console.error("Error al comprobar el estado de la página:", error);
  }
}

// Ejemplo de uso
checkPageStatus(); // Llamada sin parámetro, toma automáticamente el nombre de la página actual
