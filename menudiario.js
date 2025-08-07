const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ7gntHyR7YPhMXYLeqzUZ0jPwmoDLu9MlTciPdGADqZDXELb5VUOmH1d32Iya77p5zGuZwegQ7bAL/pub?output=csv";

async function cargarMenuDelDia() {
  try {
    const respuesta = await fetch(urlCSV + `&nocache=${Date.now()}`);
    const texto = await respuesta.text();
    const lineas = texto.trim().split('\n');
    const hoy = new Date().toISOString().split('T')[0];

    const menusHoy = [];

    for (let i = 1; i < lineas.length; i++) {
      const [fecha, menu] = lineas[i].split(',');

      if (fecha.trim() === hoy) {
        menusHoy.push(menu.trim());
      }
    }

    const contenedor = document.getElementById("contenido-menu");

    if (menusHoy.length > 0) {
const tarjetasHTML = menusHoy.map(plato => `
  <div class="fila-plato">
    <div class="nombre-plato">
      <span class="texto-plato">${plato}</span>
    </div>
<button onclick="agregarAlCarrito('${plato}', event)" class="agregar">Agregar</button>

  </div>
`).join('');



      contenedor.innerHTML = `
        <h3 class="fecha">Hoy (${hoy}):</h3>
        <div class="contenedor-tarjetas">
          ${tarjetasHTML}
        </div>
      `;
    } else {
      contenedor.innerHTML = `<p class="cargando">No hay menú cargado para hoy (${hoy}).</p>`;
    }

  } catch (error) {
    document.getElementById("contenido-menu").innerHTML = `<p class="cargando">Error al cargar el menú. Intentá más tarde.</p>`;
    console.error("Error al cargar el CSV:", error);
  }
}

cargarMenuDelDia();
