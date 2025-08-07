(function () {
  // --------- Estado y almacenamiento ----------


  let carrito = {};

function guardarCarrito() {
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
}


function cargarCarrito() {
  const guardado = sessionStorage.getItem("carrito");
  if (guardado) {
    carrito = JSON.parse(guardado);
  }
}



  cargarCarrito();

  // --------- Helpers de cliente ----------
  function guardarDatosCliente(nombre, telefono) {
    localStorage.setItem("pedido_nombre", nombre);
    localStorage.setItem("pedido_telefono", telefono);
  }
  function cargarDatosCliente() {
    return {
      nombre: localStorage.getItem("pedido_nombre") || "",
      telefono: localStorage.getItem("pedido_telefono") || ""
    };
  }

  // --------- Notificación ----------
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

  // --------- Carrito (expuesto) ----------
  window.agregarAlCarrito = function (producto, event) {
    const contenedor = event?.target?.closest(".promo-item, .fila-plato");
    if (!contenedor) {
      carrito[producto] = (carrito[producto] || 0) + 1;
      guardarCarrito();
      mostrarNotificacion("✅ Producto agregado");
      return;
    }

    // evitar duplicar wrapper
    if (contenedor.querySelector(".cantidad-wrapper")) return;

    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.value = 1;
    input.classList.add("input-cantidad");

    const confirmarBtn = document.createElement("button");
    confirmarBtn.textContent = "✔️";
    confirmarBtn.classList.add("btn-confirmar");

    const wrapper = document.createElement("div");
    wrapper.classList.add("cantidad-wrapper");
    wrapper.appendChild(input);
    wrapper.appendChild(confirmarBtn);

    confirmarBtn.onclick = () => {
      const cantidad = parseInt(input.value) || 1;
      carrito[producto] = (carrito[producto] || 0) + cantidad;
      guardarCarrito();
      mostrarNotificacion("✅ Producto agregado");

      // restaurar contenido original del contenedor
      if (contenedor.classList.contains("promo-item")) {
        let textoMostrar = producto;
        const match = producto.match(/(\d+\s*x\s*\$\d+)/i);
        if (match) {
          textoMostrar = `• ${match[1]}`;
        }
        contenedor.innerHTML = `${textoMostrar} <button onclick="agregarAlCarrito('${producto.replace(/'/g, "\\'")}',event)" class="agregar">Agregar</button>`;
      } else if (contenedor.classList.contains("fila-plato")) {
        contenedor.innerHTML = `
          <div class="nombre-plato">
            <span class="texto-plato">${producto}</span>
          </div>
          <button onclick="agregarAlCarrito('${producto.replace(/'/g, "\\'")}',event)" class="agregar">Agregar</button>
        `;
      } else {
        contenedor.innerHTML = `<button onclick="agregarAlCarrito('${producto.replace(/'/g, "\\'")}',event)" class="agregar">Agregar</button>`;
      }
    };

    contenedor.appendChild(wrapper);
  };

  window.mostrarCarrito = function () {
    const lista = document.getElementById("lista-carrito");
    const botonVaciar = document.getElementById("borrar-carrito");
    lista.innerHTML = "";

    if (Object.keys(carrito).length === 0) {
      lista.innerHTML = '<li class="listovich">El carrito está vacío.</li>';
      if (botonVaciar) botonVaciar.classList.add("oculto");
    } else {
      for (let p in carrito) {
        const li = document.createElement("li");
        li.classList.add("item-carrito");
        li.innerHTML = `
          ${p} x${carrito[p]} 
          <button class="btn-eliminar" onclick="eliminarDelCarrito('${p.replace(/'/g, "\\'")}')">❌</button>
        `;
        lista.appendChild(li);
      }
      if (botonVaciar) botonVaciar.classList.remove("oculto");
    }

    const modal = document.getElementById("modal-carrito");
    if (modal) modal.classList.remove("oculto");
  };

  window.eliminarDelCarrito = function (producto) {
    if (carrito[producto]) {
      carrito[producto]--;
      if (carrito[producto] <= 0) delete carrito[producto];
    }
    guardarCarrito();
    window.mostrarCarrito();
  };

  window.cerrarCarrito = function () {
    const modal = document.getElementById("modal-carrito");
    if (modal) modal.classList.add("oculto");
  };

  // Vaciar botón (puede cargar también si no existe)
  const btnVaciar = document.getElementById("borrar-carrito");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      if (Object.keys(carrito).length === 0) {
        alert("El carrito ya está vacío.");
        return;
      }
      if (confirm("¿Querés vaciar el carrito?")) {
        carrito = {};
        guardarCarrito();
        window.mostrarCarrito();
        mostrarNotificacion("🗑️ Carrito vaciado.");
      }
    });
  }

  // --------- WhatsApp / modal ---------
  function enviarWhatsApp() {
    if (Object.keys(carrito).length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // resumen
    const resumenEl = document.getElementById("resumen-en-modal");
    let texto = "";
    let totalItems = 0;
    for (let p in carrito) {
      texto += `- ${p} x${carrito[p]}\n`;
      totalItems += carrito[p];
    }
    if (resumenEl) resumenEl.textContent = `Tu pedido:\n${texto}`;

    const { nombre, telefono } = cargarDatosCliente();
    const nombreInput = document.getElementById("nombre");
    const telefonoInput = document.getElementById("telefono");
    const tipoEntregaInput = document.getElementById("tipo-entrega");
    const formaPagoInput = document.getElementById("forma-pago");

    if (nombreInput) nombreInput.value = nombre;
    if (telefonoInput) telefonoInput.value = telefono;
    if (tipoEntregaInput) tipoEntregaInput.value = "";
    if (formaPagoInput) formaPagoInput.value = "";

    const modal = document.getElementById("modal-whatsapp");
    if (modal) modal.classList.remove("oculto");
  }

  function cerrarModalWhatsApp() {
    const modal = document.getElementById("modal-whatsapp");
    if (modal) modal.classList.add("oculto");
  }

  // exponer globalmente
  window.enviarWhatsApp = enviarWhatsApp;
  window.cerrarModalWhatsApp = cerrarModalWhatsApp;

  // submit
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-whatsapp");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre")?.value.trim() || "";
      const telefono = document.getElementById("telefono")?.value.trim() || "";
      const tipoEntrega = document.getElementById("tipo-entrega")?.value || "";
      const formaPago = document.getElementById("forma-pago")?.value || "";

      if (!nombre || !telefono || !tipoEntrega || !formaPago) {
        alert("Completá todos los campos.");
        return;
      }

      guardarDatosCliente(nombre, telefono);

      // armar detalle
      let detalle = "";
      for (let producto in carrito) {
        detalle += `${carrito[producto]} x *${producto}*\n`;
      }

      // mensaje
      let mensaje = `_¡Hola! Te hago el siguiente pedido:_\n\n`;
      mensaje += ` *Nombre:* ${nombre}\n`;
      mensaje += ` *Teléfono:* ${telefono}\n\n`;
      mensaje += tipoEntrega.toLowerCase().includes("retira")
        ? ` *Retiro del local*\n\n`
        : ` *Delivery*\n\n`;
      mensaje += ` *Pedido:*\n`;
      mensaje += detalle + `\n`;
      mensaje += ` *Será abonado con:* ${formaPago}\n\n`;
      mensaje += `_Espero tu respuesta para confirmar mi pedido_`;

      const numero = "543534069898";
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");

      cerrarModalWhatsApp();
    });
  });
})();



