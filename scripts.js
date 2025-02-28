async function fetchAndRenderTeams(tableName, tableId) {
    const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Reemplaza con tu token
    const baseId = "appDePnktLp2dzqNX"; // Tu Base ID
    const tableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    try {
        const response = await fetch(tableUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        renderTeams(tableId,data.records || []);
    } catch (error) {
        console.error("Error al consultar equipos:", error);
    }
}

function renderTeams(tableId,equipos) {

    const teamsTable = document.getElementById(`${tableId}`);
    teamsTable.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

    if (equipos.length > 0) {
        // Crear las cabeceras de la tabla de forma dinámica
        const headerRow = document.createElement("tr");
        Object.keys(equipos[0].fields).forEach(field => {
            const headerCell = document.createElement("th");
            headerCell.textContent = field; // Usar el nombre del campo como cabecera
            headerRow.appendChild(headerCell);
        });
        teamsTable.appendChild(headerRow);

        // Crear las filas de la tabla de forma dinámica
        equipos.forEach(equipo => {
            const row = document.createElement("tr");
            Object.keys(equipo.fields).forEach(field => {
                const cell = document.createElement("td");
                cell.textContent = equipo.fields[field] || "-"; // Usar el valor del campo, o "-" si no tiene valor
                row.appendChild(cell);
            });
            teamsTable.appendChild(row);
        });
    } else {
        // Si no hay equipos, mostrar un mensaje en la tabla
        const noDataRow = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.colSpan = 100; // Hacer que ocupe todas las columnas
        noDataCell.textContent = "No se encontraron equipos.";
        noDataRow.appendChild(noDataCell);
        teamsTable.appendChild(noDataRow);
    }
}

function toggleTable() {
    const table = document.getElementById('equipos');
    // Comprobamos el estado de la tabla y alternamos su tamaño
    if (table.style.display === 'none') {
        table.style.display = 'table';  // Muestra la tabla
    } else {
        table.style.display = 'none';  // Oculta la tabla
    }
}




async function generateRandomMatchups() {
  const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Reemplaza con tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID

  // URLs de las tablas
  const usersTableUrl = `https://api.airtable.com/v0/${baseId}/Users`;
  const cartasTableUrl = `https://api.airtable.com/v0/${baseId}/Cartas`;
  const usuariosCartasTableUrl = `https://api.airtable.com/v0/${baseId}/UsuariosCartas`;

  try {
    // Obtener los usuarios y las cartas
    const usersResponse = await fetch(usersTableUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    const users = usersData.records || [];

    const cartasResponse = await fetch(cartasTableUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cartasData = await cartasResponse.json();
    const cartas = cartasData.records || [];

    if (!users.length || !cartas.length) {
      alert("No hay usuarios o cartas disponibles.");
      return;
    }

    // Borrar los emparejamientos anteriores
    const usuariosCartasResponse = await fetch(usuariosCartasTableUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usuariosCartasData = await usuariosCartasResponse.json();
    const usuariosCartas = usuariosCartasData.records || [];

    await Promise.all(
      usuariosCartas.map(record =>
        fetch(`${usuariosCartasTableUrl}/${record.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      )
    );

    // Mezclar los usuarios de manera aleatoria
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const totalUsers = shuffledUsers.length;

    const matchups = [];

    // Asignar cartas a los usuarios
    for (let i = 0; i < totalUsers; i += 2) {
      const user1 = shuffledUsers[i];
      const user2 = shuffledUsers[i + 1];

      // Crear un emparejamiento
      const matchup = {
        fields: {
          NombreCarta: cartas[i % cartas.length]?.fields.NombreCarta || "Sin carta",
          Usuario1: user1.fields.Nombre || "Sin usuario",
          Usuario2: user2?.fields.Nombre || "Sin usuario",
          Usuario3: null
        }
      };

      matchups.push(matchup);
    }

    // Si hay un número impar de jugadores, crear un equipo de 3
    if (totalUsers % 2 !== 0) {
      const user1 = shuffledUsers[totalUsers - 3];
      const user2 = shuffledUsers[totalUsers - 2];
      const user3 = shuffledUsers[totalUsers - 1];

      // Crear un emparejamiento de 3 usuarios
      const matchup = {
        fields: {
          NombreCarta: cartas[(totalUsers - 3) % cartas.length]?.fields.NombreCarta || "Sin carta",
          Usuario1: user1.fields.Nombre || "Sin usuario",
          Usuario2: user2?.fields.Nombre || "Sin usuario",
          Usuario3: user3?.fields.Nombre || null
        }
      };

      matchups.push(matchup);
    }

    // Guardar los nuevos emparejamientos en la tabla UsuariosCartas
    await Promise.all(
      matchups.map(matchup =>
        fetch(usuariosCartasTableUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ records: [matchup] })
        })
      )
    );

    alert("Emparejamientos generados correctamente.");
  } catch (error) {
    console.error("Error al generar emparejamientos:", error);
  }
}




//EQUIPOS ESCONDITE
async function assignTeamsToUsers() {
  const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Reemplaza con tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID

  const usersTableUrl = `https://api.airtable.com/v0/${baseId}/Users`;

  try {
    // Obtener los usuarios
    const usersResponse = await fetch(usersTableUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    const users = usersData.records || [];

    if (!users.length) {
      alert("No hay usuarios disponibles.");
      return;
    }

    // Mezclar aleatoriamente los usuarios
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());

    // Asignarles el número 1 o 2 alternadamente
    let equipo = 1;  // Empezamos asignando el número 1
    const updatedUsers = shuffledUsers.map(user => {
      const updatedUser = {
        id: user.id,
        fields: {
          EquipoEscondite: equipo
        }
      };
      
      // Alternar entre 1 y 2
      equipo = equipo === 1 ? 2 : 1;
      return updatedUser;
    });

    // Actualizar los registros en Airtable
    await Promise.all(
      updatedUsers.map(user =>
        fetch(`${usersTableUrl}/${user.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ fields: { EquipoEscondite: user.fields.EquipoEscondite } })
        })
      )
    );

    alert("Equipos asignados correctamente.");
  } catch (error) {
    console.error("Error al asignar equipos:", error);
  }
}



async function displayUsersByTeams(tableId) {
  const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Reemplaza con tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID
  const usersTableUrl = `https://api.airtable.com/v0/${baseId}/Users`;

  try {
    // Obtener los usuarios
    const usersResponse = await fetch(usersTableUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    const users = usersData.records || [];

    if (!users.length) {
      alert("No hay usuarios disponibles.");
      return;
    }

    // Dividir los usuarios por equipos (EquipoEscondite: 1 y 2)
    const team1 = users.filter(user => user.fields.EquipoEscondite === 1);
    const team2 = users.filter(user => user.fields.EquipoEscondite === 2);

    // Obtener la tabla donde se pintarán los datos
    const tableContainer = document.getElementById(tableId);
    tableContainer.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

    // Crear las tablas para mostrar los usuarios divididos por equipos
    const table1 = document.createElement("table");
    const table2 = document.createElement("table");

    // Establecer clases para darles estilo
    table1.className = "team-table";
    table2.className = "team-table";

    // Crear cabeceras
    const headerRow1 = document.createElement("tr");
    const headerRow2 = document.createElement("tr");

    const headerCell1 = document.createElement("th");
    const headerCell2 = document.createElement("th");

    headerCell1.textContent = "Equipo 1";
    headerCell2.textContent = "Equipo 2";

    headerRow1.appendChild(headerCell1);
    headerRow2.appendChild(headerCell2);

    table1.appendChild(headerRow1);
    table2.appendChild(headerRow2);

    // Rellenar las filas con los usuarios
    team1.forEach(user => {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.textContent = user.fields.Nombre || "Sin nombre";
      row.appendChild(cell);
      table1.appendChild(row);
    });

    team2.forEach(user => {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.textContent = user.fields.Nombre || "Sin nombre";
      row.appendChild(cell);
      table2.appendChild(row);
    });

    // Agregar las tablas al contenedor
    tableContainer.appendChild(table1);
    tableContainer.appendChild(table2);
  } catch (error) {
    console.error("Error al obtener y mostrar usuarios:", error);
  }
  
}


//LOGIN USUARIO
let users = [];  // Definir `users` fuera de la función para que sea accesible globalmente

// Función para obtener los usuarios
async function fetchUsers() {
  const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID
  const tableName = "Users"; // Nombre de la tabla en Airtable
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  const usernameSelect = document.getElementById('username');
  const errorDiv = document.getElementById('error');

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    users = data.records.map(record => ({
      name: record.fields.Nombre,
      password: record.fields.Password
    }));
    populateUsernames();
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    errorDiv.textContent = "Error al cargar los usuarios.";
  }
}

import { usuarios } from "./variables.js";

// Función para llenar el select con los nombres de usuario
function populateUsernames() {
  const usernameSelect = document.getElementById('username');
  usuarios.forEach(user => {
    const option = document.createElement('option');
    option.value = user.nombre;
    option.textContent = user.nombre;
    usernameSelect.appendChild(option);
  });
}

/* Función para el login del usuario
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('error');

  if (!username) {
    errorDiv.textContent = "Por favor, selecciona tu nombre.";
    return;
  }

  // Buscar el usuario en la lista de usuarios
  const user = users.find(u => u.name === username);

  if (user && user.password === password) {
    // Guardar usuario en localStorage
    localStorage.setItem("userName", username);
    alert(`¡Hola, ${username}! Has iniciado sesión.`);
    window.location.href = 'asignacion_cartas.html';
  } else {
    errorDiv.textContent = "Contraseña incorrecta. Inténtalo de nuevo.";
  }
}
*/
import { usuarios } from "./variables.js";
import { trenes } from "./variables.js";
import { respuestasTrenes } from "./variables.js";
import { fraseDiccionario } from "./variables.js";

document.addEventListener("DOMContentLoaded", () => {
  const selectElement = document.getElementById("username");
  const loginButton = document.getElementById("loginButton");

  // Solo ejecutar si la página tiene el <select> y el botón de login
  if (selectElement && loginButton) {
    // Llenar el select con los usuarios
    usuarios.forEach(user => {
      const option = document.createElement("option");
      option.value = user.nombre;
      option.textContent = user.nombre;
      selectElement.appendChild(option);
    });

    // Asignar evento al botón de login
    loginButton.addEventListener("click", login);
   }

  // Mostrar la carta asignada al hacer clic en el elemento "carta"
  const cartaElemento = document.getElementById("carta");
  const  username = localStorage.getItem("userName"); // Obtener el usuario seleccionado
    const passwordInputDiv = document.getElementById("password-input");
  const usuario = usuarios.find(user => user.nombre === username); // Encontrar al usuario en el array

  if (usuario && cartaElemento) {
    const nombreCarta = usuario.cartaAsignada; // Obtener la carta asignada al usuario

    // Agregar el evento de clic en la carta
    cartaElemento.addEventListener("click", () => {
      // Hacer que la carta se revele con un efecto de aparición
      cartaElemento.classList.add("revealed");
      cartaElemento.textContent = nombreCarta; // Muestra el nombre de la carta

      // Opcional: Agregar un pequeño retraso antes de que se muestre el texto
 
	  // Esperar 3 minutos para mostrar el div de la contraseña
      setTimeout(() => {
        passwordInputDiv.style.display = "block"; // Mostrar el div de la contraseña
      }, 10000); // 180000 ms = 3 minutos
    });

  }
 
});

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");

  if (!username) {
    errorDiv.textContent = "Por favor, selecciona tu nombre.";
    return;
  }

  const user = usuarios.find(u => u.nombre === username);

  if (user && user.contraseña === password) {
    localStorage.setItem("userName", username);
    alert(`¡Hola, ${username}! Has iniciado sesión.`);
    window.location.href = "asignacion_cartas.html";
  } else {
    errorDiv.textContent = "Contraseña incorrecta. Inténtalo de nuevo.";
  }
}



async function obtenerAsignacion() {
  const username = localStorage.getItem("userName"); // Obtener el usuario del almacenamiento local

  if (!username) {
    alert("No se ha encontrado el usuario en la sesión. Redirigiendo al login...");
    window.location.href = "index.html";
    return;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const verificarBtn = document.getElementById("verificar-btn");

  if (verificarBtn) {
    // Asignamos el evento de clic al botón para verificar la pareja
    verificarBtn.addEventListener("click", verificarPareja);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const verificarBtn = document.getElementById("verificar-btn");

  if (verificarBtn) {
    // Asignamos el evento de clic al botón para verificar la pareja
    verificarBtn.addEventListener("click", verificarPareja);
  }
});

// Función para verificar la pareja mediante la contraseña
async function verificarPareja() {
  const verificarBtn = document.getElementById("verificar-btn");
  const partnerPasswordInput = document.getElementById("partner-password");
  const parejaInput = partnerPasswordInput.value.trim().toLowerCase(); // Convertir a minúsculas para comparar sin distinción
  const username = localStorage.getItem("userName"); // Obtener el nombre del usuario actual
  
  if (!parejaInput) {
    alert("Por favor, introduce una contraseña válida.");
    return;
  }

  // Buscar al usuario actual en la lista
  const usuario = usuarios.find(user => user.nombre === username);
  if (!usuario) {
    alert("Usuario no encontrado.");
    return;
  }

  // Encontrar la pareja (usuario con la misma carta pero diferente nombre)
  const parejaUsuario = usuarios.find(user => user.cartaAsignada === usuario.cartaAsignada && user.nombre !== usuario.nombre);

  if (!parejaUsuario) {
    alert("No se encontró una pareja válida.");
    return;
  }

  // Verificar si la contraseña ingresada es el nombre de la pareja
  if (parejaInput === parejaUsuario.nombre.toLowerCase()) {
	   partnerPasswordInput.disabled = true;
    verificarBtn.disabled = true;
    alert("¡Correcto! La contraseña es válida.");

    // Registrar resultado en la tabla 'resultados' de Airtable
    await registrarResultado("buscarParejas", username, parejaUsuario.nombre);

   

    setTimeout(() => {
      window.location.href = 'diccionarios.html';
    }, 200);
  } else {
    alert("Contraseña incorrecta. Inténtalo de nuevo.");
  }
}

/* Función para verificar la pareja mediante la contraseña
async function verificarPareja() {
	  const verificarBtn = document.getElementById("verificar-btn");
  const pareja = document.getElementById("partner-password").value.trim();
  const mensajeEspera = document.getElementById("mensaje-espera");
  const partnerPasswordInput = document.getElementById("partner-password");
  const username = localStorage.getItem("userName"); // Obtener el nombre del usuario actual
  
  if (!pareja) {
    alert("Por favor, introduce una contraseña válida.");
    return;
  }

  // Buscar si la pareja está en el array de usuarios
  const usuario = usuarios.find(user => user.nombre === username);
  const parejaUsuario = usuarios.find(user => user.nombre === pareja);

  if (!usuario || !parejaUsuario) {
    alert("Uno o ambos usuarios no son válidos.");
    return;
  }

  // Verificar si la pareja está registrada en la misma asignación
  const esPareja = usuario.nombre !== parejaUsuario.nombre && (
    (usuario.equipoEscondite === parejaUsuario.equipoEscondite)
  );

  if (esPareja) {
    alert("¡Correcto! La contraseña es válida.");

    // Registrar resultado en la tabla 'resultados' de Airtable
    await registrarResultado("buscarParejas", username, pareja);

    partnerPasswordInput.disabled = true;
    verificarBtn.disabled = true;
     setTimeout(() => {
		window.location.href = 'diccionarios.html';
	}, 2000); // 2000 ms = 2 segundos
  } else {
    alert("Contraseña incorrecta. Inténtalo de nuevo.");
  }
}
*/
// Función para registrar el resultado en la tabla "resultados" de Airtable
async function registrarResultado(nombrePrueba, nombreUsuario, respuesta) {
	 const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Reemplaza con tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID
// Obtener la fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss'
const now = new Date();
const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); // Ajustar a la hora local
const date = localDate.toISOString().slice(0, 19).replace('T', ' ') + '.' + localDate.getMilliseconds().toString().padStart(3, '0'); // Formato: 'YYYY-MM-DD HH:mm:ss.SSS'

console.log(date);



  const url = `https://api.airtable.com/v0/${baseId}/Resultados`;

  const data = {
    fields: {
      NombrePrueba: nombrePrueba,
      NombreUsuario: nombreUsuario,
      Respuesta: respuesta,
      Date: date
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Resultado registrado:', result);
    } else {
      throw new Error('Error al registrar el resultado');
    }
  } catch (error) {
    console.error('Error al registrar el resultado:', error);
  }
}
async function registrarResultadoDiccionario(nombrePrueba, nombreUsuario, respuesta) {
	 const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Reemplaza con tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID
// Obtener la fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss'
const now = new Date();
const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); // Ajustar a la hora local
const date = localDate.toISOString().slice(0, 19).replace('T', ' ') + '.' + localDate.getMilliseconds().toString().padStart(3, '0'); // Formato: 'YYYY-MM-DD HH:mm:ss.SSS'

console.log(date);



  const url = `https://api.airtable.com/v0/${baseId}/ResultadosDiccionarios`;

  const data = {
    fields: {
      NombrePrueba: nombrePrueba,
      NombreUsuario: nombreUsuario,
      Respuesta: respuesta,
      Date: date
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Resultado registrado:', result);
    } else {
      throw new Error('Error al registrar el resultado');
    }
  } catch (error) {
    console.error('Error al registrar el resultado:', error);
  }
}

// Función para obtener los resultados de la tabla "Resultados" y mostrarlos ordenados
async function mostrarResultados() {
	  const puntuacion = document.getElementById("puntuacion");

  // Solo ejecutar si la página tiene el <select> y el botón de login
  if (puntuacion) {
  const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Tu token
  const baseId = "appDePnktLp2dzqNX"; // Tu Base ID
  const tableName = "Resultados"; // Nombre de la tabla en Airtable
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  
  try {
    // Solicitar los datos a la API de Airtable
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Obtener la respuesta en formato JSON
    const data = await response.json();
    
    // Extraer los registros de la respuesta
    const registros = data.records.map(record => ({
      NombreUsuario: record.fields.NombreUsuario,
      Date: record.fields.Date // Asegúrate de que este campo exista en tu tabla
    }));
    
    // Ordenar los registros por la fecha (Date) de forma ascendente
    registros.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    
    // Obtener la tabla en el HTML donde se mostrarán los resultados
    const tablaPuntuacion = document.getElementById("puntuacion");
    
    // Limpiar cualquier contenido anterior
    tablaPuntuacion.innerHTML = "";
    
    // Crear el encabezado de la tabla
    const encabezado = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");
    filaEncabezado.innerHTML = `<th>Puntuacion</th><th>Nombre Usuario</th><th>Fecha</th>`;
    encabezado.appendChild(filaEncabezado);
    tablaPuntuacion.appendChild(encabezado);
    
    // Crear el cuerpo de la tabla con los resultados
    const cuerpo = document.createElement("tbody");
    let  contador = 0;
    registros.forEach(registro => {
		contador++;
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${contador}</td><td>${registro.NombreUsuario}</td><td>${new Date(registro.Date).toLocaleString()}</td>`;
      cuerpo.appendChild(fila);
    });
    
    // Agregar el cuerpo de la tabla al elemento
    tablaPuntuacion.appendChild(cuerpo);
    
  } catch (error) {
    console.error("Error al obtener los resultados:", error);
    alert("Hubo un error al cargar los resultados.");
  }
  }
}

// Llamar a la función para mostrar los resultados cuando se cargue la página
//document.addEventListener("DOMContentLoaded", mostrarResultados);

export function mostrarTelon(mensaje) {
    // Deshabilitar scroll y colocar la vista en la parte superior
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);  

    // Crear los elementos del telón
    const telon = document.createElement("div");
    telon.id = "telon";

    const telonIzq = document.createElement("div");
    telonIzq.className = "telon-izquierda";

    const telonDer = document.createElement("div");
    telonDer.className = "telon-derecha";

    const contenido = document.createElement("div");
    contenido.className = "telon-contenido";
    contenido.innerHTML = `
        <p>${mensaje}</p>
        <p class="contador">...</p>
        <img style="border-radius:100%;" src="/semiScape/IMAGEN/huella2.png" alt="huella de alguien..">
    `;

    telon.appendChild(telonIzq);
    telon.appendChild(telonDer);
    telon.appendChild(contenido);
    document.body.appendChild(telon);
	document.body.style.display = "flex";
    let clicks = 0;
    telon.addEventListener("click", () => {
        clicks++;
        if (clicks >= 3) {
            telon.classList.add("telon-abierto"); // Aplica la animación
            setTimeout(() => {
                telon.remove();
                document.body.style.overflow = "auto"; // Restaurar el scroll
            }, 1000);
        }
    });
}

// Hacer la función accesible globalmente
window.mostrarTelon = mostrarTelon;




export function mostrarAbecedarioUsuario() {
  const username = localStorage.getItem("userName");
  const usuarioEncontrado = usuarios.find(user => user.nombre === username);
  const abecedarioElemento = document.getElementById("abecedario");

  if (abecedarioElemento) {
    if (usuarioEncontrado) {
      const abecedario = usuarioEncontrado.abecedarioDesordenado.split(""); // Convertir en array
      const letras = "abcdefghijklmnopqrstuvwxyz".split(""); // Abecedario sin la ñ

      abecedarioElemento.innerHTML = abecedario.map((letra, index) => 
        `<div class="abecedario-celda">
          <span>${letras[index % letras.length]}</span> ${letra}
        </div>`).join(""); // Usa letras en lugar de números, reciclando si hay más de 26 elementos
    } else {
      abecedarioElemento.textContent = "F.";
    }
  }
}

export function transformarMensaje() {
  const username = localStorage.getItem("userName");
  const usuarioEncontrado = usuarios.find(user => user.nombre === username);
  const mensajeElemento = document.getElementById("mensaje-poesia");

  if (!usuarioEncontrado || !mensajeElemento) {
    console.warn("Usuario no encontrado o elemento no disponible.");
    return;
  }

  const mensajeOriginal = fraseDiccionario;  // Frase original
  const abecedarioNormal = "abcdefghijklmnopqrstuvwxyz".split("");  // Abecedario normal (orden alfabético)
  const abecedarioPareja = usuarioEncontrado.abecedarioDesordenadoPareja.split("");  // Abecedario desordenado de la pareja

  // Crear un objeto de mapeo entre el abecedario normal y el abecedario desordenado de la pareja
  const mapeoPareja = {};
  abecedarioNormal.forEach((letra, index) => {
    mapeoPareja[letra] = abecedarioPareja[index];
    mapeoPareja[letra.toUpperCase()] = abecedarioPareja[index].toUpperCase();  // También mapear las mayúsculas
  });

  // Transformar el mensaje original utilizando el mapeo del abecedario
  let mensajeTransformado = mensajeOriginal.split("").map(caracter => {
    const letraMinuscula = caracter.toLowerCase();  // Convertir a minúsculas para el mapeo

    // Verificar si el carácter es una letra del abecedario
    if (/[a-zA-Z]/.test(caracter)) {
      const letraTransformada = mapeoPareja[letraMinuscula];  // Buscar el mapeo
      if (letraTransformada) {
        // Si la letra está mapeada, devolverla con la misma mayúscula/minúscula
        return caracter === caracter.toLowerCase() 
          ? letraTransformada.toLowerCase() 
          : letraTransformada;
      } else {
        console.warn(`No se encontró mapeo para la letra: ${caracter}`);
        return caracter;  // Si no se encuentra mapeo, devolver el carácter sin cambios
      }
    }

    // Si no es una letra (como espacios o signos de puntuación), no se transforma
    return caracter;
  }).join("");

  mensajeElemento.textContent = mensajeTransformado;  // Mostrar el mensaje transformado
}

export function verificarFrase() {
  const username = localStorage.getItem("userName");
  const usuarioEncontrado = usuarios.find(user => user.nombre === username);
  const inputElemento = document.getElementById("entrada-frase");
  const botonVerificar = document.getElementById("verificar-frase");

  if (!usuarioEncontrado || !inputElemento || !botonVerificar) {
    console.warn("Usuario no encontrado o elementos no disponibles.");
    return;
  }

  const mensajeOriginal = fraseDiccionario;  // Frase original

  // Función para verificar la frase introducida
  const fraseIngresada = inputElemento.value.trim();

  // Comprobar si la frase ingresada es igual a la frase original
  if (fraseIngresada.toUpperCase().trim() === mensajeOriginal.toUpperCase().trim()) {

    alert("¡Frase correcta!");
	document.getElementById('verificar-frase').disabled = true;
    // Registrar el resultado en Airtable
    registrarResultadoDiccionario("diccionarios", username, "Correcta");
	 setTimeout(() => {
      window.location.href = 'BingoPreviaTrenes.html';
    }, 1000);
  } else {
    alert("Frase incorrecta. Inténtalo de nuevo.");
  }
}


export function mostrarRolEscondite() {
    const username = localStorage.getItem("userName");
    const usuario = usuarios.find(u => u.nombre === username);
    
    if (!usuario) {
        console.error('Usuario no encontrado');
        return;
    }

    // Obtener el contenedor principal
    const contenedor = document.getElementById("rolEscondite");
    if (!contenedor) {
        console.error('No se encontró el div con id "rolEscondite"');
        return;
    }

    // Limpiar contenido previo
    contenedor.innerHTML = "";
    contenedor.classList.add("rol-container");

    // Crear contenido según el rol
    if (usuario.rol === "LOBO") {
        contenedor.classList.add("lobo");
        contenedor.innerHTML = `
            <strong>LOBO</strong><br>
            <label for="ovejas">Selecciona una oveja:</label>
            <select id="ovejas">
                ${usuarios
                    .filter(u => u.rol !== "LOBO") // Filtrar los que no son LOBO
                    .map(u => `<option value="${u.nombre}">${u.nombre}</option>`)
                    .join("")
                }
            </select>
            <br>
            <input type='text' id="claveEsconditeInput" placeholder='Ingresa una clave'>
            <button id="inputLobo">PILLAR</button>
            <button id="caceriaTerminada">¿Cacería terminada?</button>
        `;

        // Agregar eventos a los botones
        document.getElementById("inputLobo").addEventListener("click", comprobarClaveLobo);
        document.getElementById("caceriaTerminada").addEventListener("click", () => {
            if (confirm("¿Estás seguro de que la cacería ha terminado?")) {
                window.location.href = "formularioPreguntas.html";
            }
        });
    } else if (usuario.rol === "OVEJA") {
        contenedor.classList.add("oveja");
        contenedor.innerHTML = `
            <strong>OVEJA</strong><br>
            <p>El LOBO solo podrá usar su flash para buscaros..</p>
            <p>Clave Escondite: ${usuario.claveEscondite}</p>
            <button id="cazado">¿CAZADO?</button>
        `;

        // Agregar evento al botón de "¿CAZADO?"
        document.getElementById("cazado").addEventListener("click", () => {
            if (confirm("¿Estás seguro?")) {
                window.location.href = "formularioPreguntas.html";
            }
        });
    } else {
        console.error("Rol no reconocido");
    }
}


async function comprobarClaveLobo() {
    const selectOvejas = document.getElementById("ovejas");
    const nombreLobo = selectOvejas.value; // El usuario seleccionado en el <select>
    const claveIngresada = document.getElementById("claveEsconditeInput").value;
    const username = localStorage.getItem("userName"); // Usuario logueado

    // Buscar la oveja seleccionada en la lista de usuarios
    const oveja = usuarios.find(u => u.nombre === nombreLobo);

    if (oveja && claveIngresada === oveja.claveEscondite) {
        alert("Correcto, sigue cazando");

        // Guardar el resultado en la base de datos de Airtable
        await registrarResultadoEnAirtable(username, nombreLobo);

        // Eliminar la oveja del select
        selectOvejas.removeChild(selectOvejas.querySelector(`option[value="${nombreLobo}"]`));
    } else {
        alert("Incorrecta");
    }
}

async function registrarResultadoEnAirtable(usuarioLogueado, nombreLobo) {
const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Token de Airtable
const baseId = "appDePnktLp2dzqNX"; // Base ID
const tableName = "ResultadosEscondite"; // Nombre de la tabla
const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

// Obtener la fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss.SSS'
const now = new Date();
const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); // Ajustar a la hora local
const date = localDate.toISOString().slice(0, 19).replace('T', ' ') + '.' + localDate.getMilliseconds().toString().padStart(3, '0');

// Datos que se enviarán
const data = {
    records: [
        {
            fields: {
                "NombrePrueba": "Escondite",
                "NombreUsuario": usuarioLogueado,
                "Respuesta": nombreLobo,
                "Date": date // Nuevo campo con la fecha formateada
            }
        }
    ]
};

  //  console.log("Enviando a Airtable:", JSON.stringify(data, null, 2)); // Depuración

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
     //   console.log("Respuesta de Airtable:", result);

        if (!response.ok) {
            throw new Error("Error al registrar en Airtable");
        }
    } catch (error) {
        console.error("Error al enviar datos a Airtable:", error);
    }
}

// TRENES
export function generarTablaTrenes() {
    const treness = trenes;

    // Mezclar aleatoriamente los trenes usando el algoritmo de Fisher-Yates
    for (let i = treness.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [treness[i], treness[j]] = [treness[j], treness[i]];
    }

    // Dividir en dos listas
    const mitad = Math.ceil(treness.length / 2);
    const trenes1 = treness.slice(0, mitad);
    const trenes2 = treness.slice(mitad);

    // Obtener el contenedor donde se insertarán las tablas
    const contenedor = document.getElementById("tablaTrenes");
    if (!contenedor) {
        console.error('No se encontró el div con id "tablaTrenes"');
        return;
    }

    // Función para generar una tabla
    const generarTablaHTML = (treness) => `
        <table border="1">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Distancia (km)</th>
                </tr>
            </thead>
            <tbody>
                ${treness.map(tren => `
                    <tr>
                        <td>${tren.nombre}</td>
                        <td>${tren.distancia}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Insertar las dos tablas en el div
    contenedor.innerHTML = `
        <div style="display: flex; flex-direction: row; gap: 5px;width:90%;    justify-content: center;flex-wrap: wrap;">
            ${generarTablaHTML(trenes1)}
            ${generarTablaHTML(trenes2)}
        </div>
    `;
}

// Función para registrar el resultado en la tabla ResultadosTrenes de Airtable
async function registrarResultadoEnAirtableTrenes(usuarioLogueado, sumaDistancias, inicialesTrenes) {
    const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Token de Airtable
    const baseId = "appDePnktLp2dzqNX"; // Base ID
    const tableName = "ResultadosTrenes"; // Nombre de la tabla
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    // Obtener la fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss.SSS'
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); // Ajustar a la hora local
    const date = localDate.toISOString().slice(0, 19).replace('T', ' ') + '.' + localDate.getMilliseconds().toString().padStart(3, '0');

    // Datos que se enviarán
    const data = {
        records: [
            {
                fields: {
                    "NombrePrueba": "trenes", // Nombre de la prueba
                    "NombreUsuario": usuarioLogueado,
                    "Respuesta": `Suma Distancias: ${sumaDistancias}, Iniciales Trenes: ${inicialesTrenes}`, // Respuesta combinada
                    "Date": date // Fecha formateada
                }
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error("Error al registrar en Airtable");
        }
    } catch (error) {
        console.error("Error al enviar datos a Airtable:", error);
    }
}

// Función para comprobar respuestas
export function comprobarPrimerCandado() {
    // Obtener los valores de los inputs
    const inputSuma = document.getElementById("sumaDistancias").value;
    console.log(inputSuma);
    const inputIniciales = document.getElementById("inicialesTrenes").value.toUpperCase(); // Convertir a mayúsculas
    console.log(inputIniciales);

    // Obtener la primera respuesta esperada
    const primeraRespuesta = respuestasTrenes[0];
    console.log(primeraRespuesta.sumaDistancias + "-" + primeraRespuesta.inicialesTrenes.trim());

    // Comprobar si los valores coinciden
    if (parseInt(inputSuma) == primeraRespuesta.sumaDistancias && inputIniciales.trim() == primeraRespuesta.inicialesTrenes.trim()) {
		const username = localStorage.getItem("userName");
				const usuarioLogueado =  localStorage.getItem("userName"); // Aquí deberías obtener el nombre del usuario logueado
				console.log("Usuario logueado:", usuarioLogueado);
console.log("Suma Distancias:", inputSuma);
console.log("Iniciales Trenes:", inputIniciales);
        registrarResultadoEnAirtableTrenes(usuarioLogueado, inputSuma, inputIniciales); // Registrar el resultado en Airtable
        alert("¡Acertaste!");
        
        window.location.href = "memorion.html"; // Redirigir a memorion.html
    } else {
        alert("No es correcto, intenta de nuevo.");
    }
}


//MEMORION
/*
import { parejasMemorion } from "./variables.js";

const memorionContainer = document.getElementById("memorion");
let selectedCards = [];
let totalPairs = parejasMemorion.length; // Número total de parejas
let matchedPairs = 0; // Contador de parejas descubiertas

export function createMemorion() {
    // Duplicamos y mezclamos los nombres
    let nombres = [];
    parejasMemorion.forEach(par => {
        nombres.push({ nombre: par.Nombre1, pareja: par.Nombre2 });
        nombres.push({ nombre: par.Nombre2, pareja: par.Nombre1 });
    });
    nombres = nombres.sort(() => Math.random() - 0.5);

    // Creamos las cartas
    memorionContainer.innerHTML = "";
    nombres.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.nombre = item.nombre;
        card.dataset.pareja = item.pareja;
        card.innerHTML = "<div class='front'></div><div class='back'>" + item.nombre + "</div>";
        card.addEventListener("click", () => flipCard(card));
        memorionContainer.appendChild(card);
    });

    // Reiniciar el contador de parejas descubiertas
    matchedPairs = 0;
}

function flipCard(card) {
    if (selectedCards.length < 2 && !card.classList.contains("flipped")) {
        card.classList.add("flipped");
        selectedCards.push(card);
    }
    
    if (selectedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

function checkMatch() {
    const [card1, card2] = selectedCards;

    if (card1.dataset.pareja === card2.dataset.nombre) {
        card1.removeEventListener("click", () => flipCard(card1));
        card2.removeEventListener("click", () => flipCard(card2));
        matchedPairs++; // Aumentamos el contador de parejas descubiertas

        if (matchedPairs === totalPairs) {
            alert("🎉 ¡Felicidades! Has encontrado todas las parejas. 🎉");
                window.location.href = 'esconditePrevia.html'; 
        } else {
            alert("¡Correcto!");
        }
    } else {
        alert("No coinciden, intenta de nuevo.");
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
    }
    selectedCards = [];
}


*/
//PUZZLE
import { habitacionesMemorion } from "./variables.js";

const memorionContainer = document.getElementById("memorion");
let selectedCards = [];
let discoveredRooms = [];

// Función para registrar el resultado en Airtable
async function registrarResultadoEnAirtableMemorion(usuarioLogueado) {
	  // Mostrar mensaje de espera
    const mensajeEspera = document.createElement("div");
    mensajeEspera.style.position = "fixed";
    mensajeEspera.style.top = "50%";
    mensajeEspera.style.left = "50%";
    mensajeEspera.style.transform = "translate(-50%, -50%)";
    mensajeEspera.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    mensajeEspera.style.color = "white";
    mensajeEspera.style.padding = "20px";
    mensajeEspera.style.borderRadius = "10px";
    mensajeEspera.style.fontSize = "18px";
    mensajeEspera.style.zIndex = "9999";
    mensajeEspera.innerText = "Su respuesta está siendo grabada, espere un momento...";
    document.body.appendChild(mensajeEspera);

    const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Token de Airtable
    const baseId = "appDePnktLp2dzqNX"; // Base ID
    const tableName = "ResultadosMemorion"; // Nombre de la tabla
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    // Obtener la fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss.SSS'
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)); // Ajustar a la hora local
    const date = localDate.toISOString().slice(0, 19).replace('T', ' ') + '.' + localDate.getMilliseconds().toString().padStart(3, '0');

    // Datos que se enviarán
    const data = {
        records: [
            {
                fields: {
                    "NombrePrueba": "memorion", // El nombre de la prueba
                    "NombreUsuario": usuarioLogueado,
                    "Respuesta": "Todos los huéspedes encontrados", // El nombre de la respuesta
                    "Date": date // Nuevo campo con la fecha formateada
                }
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error("Error al registrar en Airtable");
        }
    } catch (error) {
        console.error("Error al enviar datos a Airtable:", error);
    }
}

export function createMemorion() {
    let tarjetas = [];
    habitacionesMemorion.forEach(hab => {
        hab.huespedes.forEach(huesped => {
            tarjetas.push({ nombre: huesped, habitacion: hab.habitacion });
        });
    });

    // Barajar las tarjetas de manera aleatoria
    tarjetas = tarjetas.sort(() => Math.random() - 0.5);

    memorionContainer.innerHTML = "";
    tarjetas.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.nombre = item.nombre;
        card.dataset.habitacion = item.habitacion;
        card.innerHTML = "<div class='front'></div><div class='back'>" + item.nombre + "</div>";
        card.addEventListener("click", () => flipCard(card));
        memorionContainer.appendChild(card);
    });
}

function flipCard(card) {
    if (card.classList.contains("flipped") || discoveredRooms.includes(card.dataset.habitacion)) {
        return;
    }

    card.classList.add("flipped");
    selectedCards.push(card);

    if (selectedCards.length > 1) {
        setTimeout(checkRoom, 10);
    }
}

function showPopup(message) {
    return new Promise(resolve => {
        // Crear el contenedor del popup
        const popup = document.createElement("div");
        popup.classList.add("popup-overlay");
        
        // Contenido del popup
        popup.innerHTML = `
            <div class="popup-content">
                <p>${message}</p>
            </div>
        `;

        // Agregar el popup al body
        document.body.appendChild(popup);

        // Evitar interacciones
        document.body.style.pointerEvents = "none";

        // Desaparece después de 3 segundos
        setTimeout(() => {
            popup.style.opacity = "0";
            setTimeout(() => {
                popup.remove();
                document.body.style.pointerEvents = "auto";
                resolve(); // Aquí se resuelve la promesa y continúa la ejecución
            }, 500); // Tiempo para desvanecerse
        }, 1500);
    });
}

async function checkRoom() {
    const habitacion = selectedCards[0].dataset.habitacion;
    const allSameRoom = selectedCards.every(card => card.dataset.habitacion === habitacion);

    if (allSameRoom) {
        const totalHuespedes = habitacionesMemorion.find(hab => hab.habitacion === habitacion).huespedes.length;
        if (selectedCards.length === totalHuespedes) {
            await showPopup("¡Has encontrado todos los huéspedes de la habitación " + habitacion + "!");
            discoveredRooms.push(habitacion);
            selectedCards = [];

            // Verificar si se han encontrado todas las habitaciones
            if (discoveredRooms.length === habitacionesMemorion.length) {
                const usuarioLogueado = localStorage.getItem("userName"); 
                registrarResultadoEnAirtableMemorion(usuarioLogueado);
                setTimeout(() => {
                    window.location.href = "esconditePrevia.html";
                }, 500); // Espera un poco antes de redirigir
            }
            return;
        }
    } else {
        await showPopup("¡Error! No pertenece a la misma habitación.");
        selectedCards.forEach(card => card.classList.remove("flipped"));
        selectedCards = [];
    }
}


// Función para generar el formulario dinámicamente en la página
export function generarFormularioPregunta() {
    const contenedor = document.getElementById("formulario-container");
    contenedor.innerHTML = `
        <form id="preguntaForm">
            <label for="pregunta">Tu pregunta por favor:</label>
            <input type="text" id="pregunta" name="pregunta" required>

            <label for="respuesta1">Respuesta 1 (esta es la correcta, después se colocará random):</label>
            <input type="text" id="respuesta1" name="respuesta1" required>

            <label for="respuesta2">Respuesta 2:</label>
            <input type="text" id="respuesta2" name="respuesta2" required>

            <label for="respuesta3">Respuesta 3:</label>
            <input type="text" id="respuesta3" name="respuesta3" required>

            <label for="respuesta4">Respuesta 4:</label>
            <input type="text" id="respuesta4" name="respuesta4" required>

            <button type="submit" id="enviarPregunta">Guardar Pregunta</button>
        </form>
    `;

    // Agregar evento de envío del formulario
    document.getElementById("preguntaForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Evitar el envío automático del formulario

        const confirmacion = confirm("¿Estás seguro/a? Solo tendrás una pregunta.");

        if (confirmacion) {
            const botonEnviar = document.getElementById("enviarPregunta");
            botonEnviar.disabled = true; // Deshabilitar el botón para evitar más envíos
			const pregunta = document.getElementById("pregunta").value;
			const respuesta1 = document.getElementById("respuesta1").value;
			const respuesta2 = document.getElementById("respuesta2").value;
			const respuesta3 = document.getElementById("respuesta3").value;
			const respuesta4 = document.getElementById("respuesta4").value;
			const usuarioLogueado =  localStorage.getItem("userName");
            await guardarPreguntaEnAirtable(pregunta,respuesta1,respuesta2,respuesta3,respuesta4,usuarioLogueado); // Llamar a la función para guardar en Airtable

            window.location.href = "final.html"; // Redirigir a final.html
        }
    });
}



// Función para guardar la pregunta en Airtable
async function guardarPreguntaEnAirtable(pregunta,respuesta1,respuesta2,respuesta3,respuesta4,usuarioLogueado) {
  // Evita que el formulario recargue la página

    const token = "patINyZ6fcrXhaEfY.5a17ebb4f88d4f3df1942277fc7372cf4680eba1ddcd604d07558e99d1ca1aa3"; // Token de Airtable
    const baseId = "appDePnktLp2dzqNX"; // Base ID
    const tableName = "Preguntas"; // Nombre de la tabla en Airtable
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    // Obtener valores del formulario
   

    // Obtener fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss.SSS'
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const date = localDate.toISOString().slice(0, 19).replace('T', ' ') + '.' + localDate.getMilliseconds().toString().padStart(3, '0');

    // Datos a enviar
    const data = {
        records: [
            {
                fields: {
					"Usuario": usuarioLogueado,
                    "Pregunta": pregunta,
                    "Respuesta Correcta": respuesta1,
                    "Opcion 2": respuesta2,
                    "Opcion 3": respuesta3,
                    "Opcion 4": respuesta4,
                    "Fecha": date
                }
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Error en la respuesta de Airtable:", result);
            throw new Error("Error al guardar la pregunta en Airtable");
        }
			// Deshabilitar el botón para evitar más envíos
        alert("Pregunta guardada con éxito");
        document.getElementById("preguntaForm").reset(); // Limpiar formulario después de guardar

    } catch (error) {
        console.error("Error al enviar datos a Airtable:", error);
    }
}
export function insertarEstilosYParticulas() {
    // Insertar el CSS en el head
    const style = document.createElement('style');
    style.innerHTML = `
    body {
        overflow: hidden;
    }

    /* Contenedor de partículas */
    .particles-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: -8px;
        left: 0;
        pointer-events: none;
    }
    /* Estilos de las partículas */
    .particle {
        position: absolute;
        background-color: white;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        opacity: 0.8;
        animation: floatParticles linear infinite;
    }

    /* Animación de partículas */
    @keyframes floatParticles {
        0% {
            transform: translateY(100vh) scale(0.5);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: translateY(-10vh) scale(1);
            opacity: 0;
        }
    }

    /* Distribución de partículas con tiempos ajustados */
    .particle:nth-child(1) { left: 5%; animation-duration: 4s; animation-delay: 0s; }
    .particle:nth-child(2) { left: 15%; animation-duration: 6s; animation-delay: 0.5s; }
    .particle:nth-child(3) { left: 25%; animation-duration: 5s; animation-delay: 1s; }
    .particle:nth-child(4) { left: 35%; animation-duration: 7s; animation-delay: 1.5s; }
    .particle:nth-child(5) { left: 45%; animation-duration: 6s; animation-delay: 2s; }
    .particle:nth-child(6) { left: 55%; animation-duration: 5s; animation-delay: 2.5s; }
    .particle:nth-child(7) { left: 65%; animation-duration: 8s; animation-delay: 3s; }
    .particle:nth-child(8) { left: 75%; animation-duration: 6s; animation-delay: 3.5s; }
    .particle:nth-child(9) { left: 85%; animation-duration: 7s; animation-delay: 4s; }
    .particle:nth-child(10) { left: 95%; animation-duration: 5s; animation-delay: 4.5s; }
    `;
    document.head.appendChild(style);

    // Crear y agregar el contenedor de partículas con las partículas
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';

    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particlesContainer.appendChild(particle);
    }

    document.body.appendChild(particlesContainer);
}
export function shuffleUsuarios() {
    // Clonar el array original para evitar modificarlo directamente
    let shuffledUsuarios = [...usuarios];
    
    // Extraer los valores que deben moverse juntos
    let cartas = shuffledUsuarios.map(u => ({
        cartaAsignada: u.cartaAsignada,
        abecedarioDesordenado: u.abecedarioDesordenado,
        abecedarioDesordenadoPareja: u.abecedarioDesordenadoPareja
    }));
    
    // Mezclar los valores de cartas sin alterar el orden de usuarios
    let shuffledCartas = [...cartas].sort(() => Math.random() - 0.5);
    
    // Asignar los valores mezclados a los usuarios manteniendo el resto igual
    shuffledUsuarios = shuffledUsuarios.map((user, index) => ({
        ...user,
        cartaAsignada: shuffledCartas[index].cartaAsignada,
        abecedarioDesordenado: shuffledCartas[index].abecedarioDesordenado,
        abecedarioDesordenadoPareja: shuffledCartas[index].abecedarioDesordenadoPareja
    }));
    
    // Crear el contenido del txt manteniendo el formato original
    let txtContent = `export const usuarios = [\n` +
        shuffledUsuarios.map(u => 
            `  { nombre: "${u.nombre}", contraseña: "${u.contraseña}", cartaAsignada: "${u.cartaAsignada}", equipoEscondite: "${u.equipoEscondite}", rol: "${u.rol}", abecedarioDesordenado: "${u.abecedarioDesordenado}", abecedarioDesordenadoPareja: "${u.abecedarioDesordenadoPareja}", claveEscondite: "${u.claveEscondite}" },` 
        ).join('\n') + `\n];`;
    
    // Crear el elemento de texto en pantalla
    let txtElement = document.createElement("div");
    txtElement.textContent = txtContent;
    txtElement.style.position = "fixed";
    txtElement.style.bottom = "20px";
    txtElement.style.left = "50%";
    txtElement.style.transform = "translateX(-50%)";
    txtElement.style.background = "black";
    txtElement.style.color = "white";
    txtElement.style.padding = "10px";
    txtElement.style.borderRadius = "5px";
    txtElement.style.cursor = "pointer";
    txtElement.style.whiteSpace = "pre-wrap";
    txtElement.style.zIndex = "1000";
    txtElement.style.maxHeight = "80vh";
    txtElement.style.overflowY = "auto";
    document.body.appendChild(txtElement);
    
    // Copiar al portapapeles al hacer clic
    txtElement.addEventListener("click", () => {
        navigator.clipboard.writeText(txtContent);
        alert("Copiado al portapapeles");
    });
    
    // Eliminar después de 20 segundos
    setTimeout(() => {
        txtElement.remove();
    }, 20000);
}
