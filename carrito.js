let carrito = {};
let productoCantidadPendiente = 1;

// ------------ LocalStorage ------------



function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function guardarCarrito() {
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
}


function cargarCarrito() {
  const guardado = sessionStorage.getItem("carrito");
  if (guardado) {
    carrito = JSON.parse(guardado);
  }
}

// inicialización
cargarCarrito();

// ------------ Configuración de productos ------------
const productosConGuarnicion = ["Milanesa", "Pollo", "Cerdo", "Pescado", "Ternera", "Merluza", "Salmón", "Langostinos", "Napolitana Especial"];
const productosConSalsa = ["Ternera", "Pasta"];

const guarniciones = ["Papas fritas", "Puré", "Ensalada", "Papas rústicas", "Arroz"];
const productosGuarnicionReducida = ["Empanada", "Tarta"];

const carneTerneraItems = ["Entrecotte", "Bife de chorizo", "Matambre", "Matambre a la pizza", "Vacio"];
const pastasItems = ["Ñoquis", "Ravioles", "Sorrentinos", "Lasagna", "Canelones"];
const pescadosItems = ["Merluza", "Salmón", "Langostinos"];

const salsas = ["Fileto", "Bolognesa", "Cuatro quesos", "Roquefort"];
const salsasCarneTernera = ["Chimichurri", "Roquefort", "Mostaza", "Provenzal"];
const salsasPastas = ["Fileto", "Bolognesa", "Cuatro quesos", "Pesto"];

// NUEVAS LISTAS SEGÚN PEDIDO
const guarnicionesPescado = [
  "Papas fritas",
  "Papas rústicas",
  "Papas noisette",
  "Puré de papas",
  "Papas revuelta con huevo",
  "Tortilla de papa",
  "Ensalada mixta",
  "Rúcula con queso"
];

const guarnicionesCarnes = [
  "Papas fritas",
  "Papas rústicas",
  "Puré de papas",
  "Ensalada mixta",
  "Ensalada de rúcula"
];

const salsasPastasActualizadas = [
  "Bolognesa",
  "Crema de hongos",
  "Crema de langostinos",
  "Parisienne",
  "Cuatro queso"
];

const salsasTerneraActualizadas = [
  "Puerro",
  "Champiñones",
  "Roquefort",
  "Criolla",
  "Chimichurri"
];

// ------------ Agregar al carrito ------------
function agregarAlCarrito(producto, event) {
  const productoLower = producto.toLowerCase();
  const esTernera = carneTerneraItems.some(p => productoLower.includes(p.toLowerCase()));
  const esPasta = pastasItems.some(p => productoLower.includes(p.toLowerCase()));
  const esPescado = pescadosItems.some(p => productoLower.includes(p.toLowerCase()));
  const guarnicionReducida = productosGuarnicionReducida.some(p => productoLower.includes(p.toLowerCase()));
  

  let necesitaSalsaLocal = esTernera || esPasta;
let necesitaGuarnicionLocal = productosConGuarnicion.some(p => productoLower.includes(p.toLowerCase())) || esPescado || esTernera;


  // FORZAR que Cerdo nunca tenga salsa
  if (productoLower.includes("cerdo")) {
    necesitaSalsaLocal = false;
  }

  if (productoLower.includes("sandwich de milanesa")) {
    necesitaGuarnicionLocal = false;
  }

  if (productoLower.includes("langostinos rebozados")) {
    necesitaGuarnicionLocal = false;
  }

    if (productoLower.includes("caesar con pollo")) {
    necesitaGuarnicionLocal = false;
  }

      if (productoLower.includes("caesar con langostinos")) {
    necesitaGuarnicionLocal = false;
  }

      if (productoLower.includes("de pollo")) {
    necesitaGuarnicionLocal = false;
  }



  const li = event?.target?.closest ? event.target.closest("li") : null;
  if (!li) return; // seguridad
  const contenedorCantidad = li.querySelector(".cantidad-container");

  // Si ya hay un input, no duplicar
  if (!contenedorCantidad.querySelector("input")) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.value = 1;
    input.classList.add("input-cantidad");

    const confirmarBtn = document.createElement("button");
    confirmarBtn.textContent = "✔️";
    confirmarBtn.classList.add("btn-confirmar");
    confirmarBtn.onclick = () => {
      const cantidad = parseInt(input.value) || 1;
      if (necesitaSalsaLocal || necesitaGuarnicionLocal) {
        productoCantidadPendiente = cantidad;
        mostrarModalOpciones(
          producto,
          esTernera,
          esPasta,
          guarnicionReducida,
          esPescado,
          necesitaSalsaLocal,
          necesitaGuarnicionLocal
        );
      } else {
        for (let i = 0; i < cantidad; i++) {
          agregarProductoAlCarrito(producto);
        }
        mostrarNotificacion(` ✅ Producto agregado`);
      }
      // Limpiar el input y botón, y resetear el estilo
      contenedorCantidad.innerHTML = "";
      contenedorCantidad.style.display = "none"; // Oculta el contenedor
      setTimeout(() => (contenedorCantidad.style.display = ""), 10); // Restaura después de unos ms
    };

    contenedorCantidad.appendChild(input);
    contenedorCantidad.appendChild(confirmarBtn);
  }
}

function mostrarModalOpciones(
  producto,
  esTernera,
  esPasta,
  guarnicionReducida,
  esPescado,
  necesitaSalsaLocal,
  necesitaGuarnicionLocal
) {
  const modal = document.getElementById('modal-opciones');
  const titulo = document.getElementById('modal-titulo');
  const contenedorSalsas = document.getElementById('contenedor-salsas');
  const contenedorGuarniciones = document.getElementById('contenedor-guarniciones');
  const selectSalsa = document.getElementById('select-salsa');
  const selectGuarnicion = document.getElementById('select-guarnicion');

  // reset completo para evitar residuos
  selectSalsa.innerHTML = '';
  selectGuarnicion.innerHTML = '';
  titulo.textContent = '';
  contenedorSalsas.style.display = 'none';
  contenedorGuarniciones.style.display = 'none';

  // Guardar los flags actuales en data-attributes para usar en confirmarAgregar
  modal.dataset.necesitaSalsa = necesitaSalsaLocal ? "1" : "0";
  modal.dataset.necesitaGuarnicion = necesitaGuarnicionLocal ? "1" : "0";
  modal.dataset.producto = producto;

  titulo.textContent = `Opciones para: ${producto}`;

  // Siempre pongo el default aunque se oculte
  selectSalsa.innerHTML = `<option value="">Sin salsa</option>`;
  selectGuarnicion.innerHTML = `<option value="">Sin guarnición</option>`;

  contenedorSalsas.style.display = necesitaSalsaLocal ? 'block' : 'none';
  contenedorGuarniciones.style.display = necesitaGuarnicionLocal ? 'block' : 'none';

  if (necesitaSalsaLocal) {
    let opciones = [];
    if (esPasta) {
      opciones = salsasPastasActualizadas;
    } else if (esTernera) {
      opciones = salsasTerneraActualizadas;
    } else {
      opciones = salsas;
    }

    opciones.forEach(salsa => {
      const opt = document.createElement('option');
      opt.value = salsa;
      opt.textContent = salsa;
      selectSalsa.appendChild(opt);
    });
  }

  if (necesitaGuarnicionLocal) {
    let opciones = [];
    const productoLower = producto.toLowerCase();

    if (esPescado) {
      opciones = guarnicionesPescado;
    } else if (
      esTernera ||
      productoLower.includes("milanesa".toLowerCase()) ||
      productoLower.includes("pollo".toLowerCase()) ||
      productoLower.includes("cerdo".toLowerCase()) ||
      productoLower.includes("napolitana especial")
    ) {
      opciones = guarnicionesCarnes;
    } else if (guarnicionReducida) {
      opciones = ["Puré", "Ensalada"];
    } else {
      opciones = guarniciones;
    }

    opciones.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      selectGuarnicion.appendChild(opt);
    });
  }

  modal.classList.remove('oculto');
}

function confirmarAgregar() {
  const modal = document.getElementById('modal-opciones');
  const necesitaSalsaLocal = modal.dataset.necesitaSalsa === "1";
  const necesitaGuarnicionLocal = modal.dataset.necesitaGuarnicion === "1";
  const producto = modal.dataset.producto || '';

  const salsa = document.getElementById('select-salsa').value;
  const guarnicion = document.getElementById('select-guarnicion').value;
  let final = producto;

  if (necesitaSalsaLocal && !salsa) {
    alert("Elegí una salsa.");
    return;
  }
  if (necesitaGuarnicionLocal && !guarnicion) {
    alert("Elegí una guarnición.");
    return;
  }

  if (salsa) final += ` (con ${salsa})`;
  if (guarnicion) final += ` (con ${guarnicion})`;

  for (let i = 0; i < productoCantidadPendiente; i++) {
    agregarProductoAlCarrito(final);
  }

  cerrarOpciones();
  mostrarNotificacion(` ✅ Producto agregado`);
  productoCantidadPendiente = 1;
}

function agregarProductoAlCarrito(producto) {
  if (carrito[producto]) {
    carrito[producto]++;
  } else {
    carrito[producto] = 1;
  }
  guardarCarrito();
}

// ------------ Mostrar carrito ------------
function mostrarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const botonVaciar = document.getElementById('borrar-carrito');
  lista.innerHTML = '';

  if (Object.keys(carrito).length === 0) {
    lista.innerHTML = '<li class="listovich">El carrito está vacío.</li>';
    botonVaciar.classList.add('oculto');
  } else {
    for (let p in carrito) {
      const li = document.createElement('li');
      li.classList.add('item-carrito');
      li.innerHTML = `
        ${p} x${carrito[p]} 
        <button class="btn-eliminar" onclick="eliminarDelCarrito('${p.replace(/'/g, "\\'")}')">❌</button>
      `;
      lista.appendChild(li);
    }
    botonVaciar.classList.remove('oculto');
  }

  document.getElementById('modal-carrito').classList.remove('oculto');
}

function eliminarDelCarrito(producto) {
  if (carrito[producto]) {
    carrito[producto]--;
    if (carrito[producto] <= 0) {
      delete carrito[producto];
    }
  }
  guardarCarrito();
  mostrarCarrito();
}

document.getElementById('borrar-carrito').addEventListener('click', () => {
  if (Object.keys(carrito).length === 0) {
    alert("El carrito ya está vacío.");
    return;
  }

  if (confirm("¿Querés vaciar el carrito?")) {
    carrito = {};
    guardarCarrito();
    mostrarCarrito();
    mostrarNotificacion("🗑️ Carrito vaciado.");
  }
});

function cerrarCarrito() {
  document.getElementById('modal-carrito').classList.add('oculto');
}

function cerrarOpciones() {
  document.getElementById('modal-opciones').classList.add('oculto');
}

// persistir nombre y teléfono
function guardarDatosCliente(nombre, telefono) {
  localStorage.setItem('pedido_nombre', nombre);
  localStorage.setItem('pedido_telefono', telefono);
}
function cargarDatosCliente() {
  return {
    nombre: localStorage.getItem('pedido_nombre') || '',
    telefono: localStorage.getItem('pedido_telefono') || ''
  };
}




// reemplaza/enlaza el comportamiento de enviarWhatsApp
function enviarWhatsApp() {
  if (Object.keys(carrito).length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

    const resumenEl = document.getElementById("resumen-en-modal");
    let texto = "";
    let totalItems = 0;
    for (let p in carrito) {
      texto += `- ${p} x${carrito[p]}\n`;
      totalItems += carrito[p];
    }
    if (resumenEl) resumenEl.textContent = `Tu pedido:\n${texto}`;

  // precargar datos guardados
  const { nombre, telefono } = cargarDatosCliente();
  document.getElementById('nombre').value = nombre;
  document.getElementById('telefono').value = telefono;
  document.getElementById('tipo-entrega').value = '';
  document.getElementById('forma-pago').value = '';

  document.getElementById('modal-whatsapp').classList.remove('oculto');
}

function cerrarModalWhatsApp() {
  document.getElementById('modal-whatsapp').classList.add('oculto');
}

// submit del form

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-whatsapp');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const tipoEntrega = document.getElementById('tipo-entrega').value;
    const formaPago = document.getElementById('forma-pago').value;

    if (!nombre || !telefono || !tipoEntrega || !formaPago) {
      alert('Completá todos los campos.');
      return;
    }

    guardarDatosCliente(nombre, telefono);

    let detalle = '';
    for (let producto in carrito) {
      detalle += `${carrito[producto]} x *${producto}*\n`;
    }

    let mensaje = `_¡Hola! Te hago el siguiente pedido:_\n\n`;
    mensaje += ` *Nombre:* ${nombre}\n`;
    mensaje += ` *Teléfono:* ${telefono}\n\n`;
    mensaje += tipoEntrega.toLowerCase().includes('retira')
      ? ` *Retiro del local*\n\n`
      : ` *Delivery*\n\n`;
    mensaje += ` *Pedido:*\n`;
    mensaje += detalle + `\n`;
    mensaje += ` *Será abonado con:* ${formaPago}\n\n`;
    mensaje += `Espero tu respuesta para confirmar mi pedido`;

    const numero = '543534069898';
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    cerrarModalWhatsApp();
  });
});



function mostrarNotificacion(texto) {
  const noti = document.getElementById("notificacion");
  if (!noti) return;

  noti.textContent = texto;
  noti.classList.remove("oculto");
  noti.classList.add("visible");

  setTimeout(() => {
    noti.classList.remove("visible");
    setTimeout(() => noti.classList.add("oculto"), 500);
  }, 2000);
}



