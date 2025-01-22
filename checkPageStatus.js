async function checkPageStatus() {
  try {
    // Obtener el nombre de la página actual (sin la extensión)
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];

    console.log(`Página actual: ${currentPage}`); // Depuración

    // Consultar la API
    const response = await fetch("https://678aba6fdd587da7ac2b3c2b.mockapi.io/api/pruebas");
    const pages = await response.json();

    console.log("Configuración de páginas:", pages); // Depuración

    // Buscar la configuración de la página actual en la API
    const pageConfig = pages.find(page => page.nombre.toLowerCase() === currentPage.toLowerCase());

    console.log(`Configuración de la página actual:`, pageConfig); // Depuración

    // Si no se encuentra la configuración o el estado es 0, redirigir
    if (!pageConfig || pageConfig.estado == 0) {
      alert(`La página "${currentPage}" no está activa.`);
      window.location.href = "index.html"; // Redirigir a la página principal
    }
  } catch (error) {
    console.error("Error al comprobar el estado de la página:", error);
  }
}

// Llamar a la función para comprobar el estado al cargar la página
checkPageStatus();
