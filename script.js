// ==========================================
// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
// ==========================================
let listaPedido = [];
let totalAcumulado = 0;
let rolloActual = {}; 

// URL de tu Google Apps Script (App Web)
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbyysS2vy5QwiJjumguQdK5pvblqGE4llBnV1rasMCZUWp3swpyPAcu12uw0dFEpJ4vV/exec"; 

// ==========================================
// 2. GESTIÓN DEL CARRITO
// ==========================================

/**
 * Agrega un producto a la lista y suma al total
 */
function agregarAlPedido(nombre, precio) {
    listaPedido.push(nombre);
    totalAcumulado += precio;
    actualizarInterfaz();
}

/**
 * Quita un producto de la lista y resta del total
 */
function quitarDelPedido(nombre, precio) {
    const indice = listaPedido.indexOf(nombre);
    if (indice > -1) {
        listaPedido.splice(indice, 1);
        totalAcumulado -= precio;
        actualizarInterfaz();
    }
}

/**
 * Actualiza el texto del total en la barra inferior
 */
function actualizarInterfaz() {
    const totalElem = document.getElementById('total');
    if (totalElem) {
        totalElem.innerText = totalAcumulado;
    }
}

// ==========================================
// 3. CONTROL DE MODALES E INTERFAZ
// ==========================================

/**
 * Abre o cierra las categorías del menú (Fríos, Calientes, Mexas)
 */
function toggleCategory(id) {
    const content = document.getElementById(id);
    const allContent = document.querySelectorAll('.category-content');
    
    // Si la categoría ya está abierta, la cierra. Si no, cierra las demás y abre esta.
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        allContent.forEach(el => el.style.display = 'none');
        content.style.display = "block";
    }
}

/**
 * Abre el modal con la información detallada del producto
 */
function abrirDetalle(nombre, imagen, precio, descripcion) {
    const modal = document.getElementById('modal-sushi');
    rolloActual = { nombre, precio };

    document.getElementById('modal-titulo').innerText = nombre;
    document.getElementById('modal-imagen').src = imagen;
    document.getElementById('modal-descripcion').innerText = descripcion;
    
    const precioElem = document.querySelector('.modal-precio');
    if(precioElem) {
        precioElem.innerText = `$${precio}.00`;
    }

    modal.classList.add('open');
}

/**
 * Cierra el modal de detalle
 */
function cerrarDetalle() {
    document.getElementById('modal-sushi').classList.remove('open');
}

/**
 * Función que se ejecuta desde el botón del modal para confirmar la selección
 */
function confirmarYAgregar() {
    if (rolloActual.nombre) {
        agregarAlPedido(rolloActual.nombre, rolloActual.precio);
        cerrarDetalle();
    }
}

// ==========================================
// 4. ENVÍO DE DATOS (EXCEL + WHATSAPP)
// ==========================================

/**
 * Procesa el pedido, lo envía a la base de datos y abre WhatsApp
 */
async function enviarWhatsApp() {
    const nombre = document.getElementById('nombreCliente').value.trim();
    const direccion = document.getElementById('direccionCliente').value.trim();
    const notas = document.getElementById('notas').value.trim() || "Sin notas";

    // Validaciones de seguridad
    if (listaPedido.length === 0) {
        return alert("¡Tu carrito está vacío!");
    }
    if (!nombre || !direccion) {
        return alert("Por favor, ingresa nombre y dirección.");
    }

    // Preparar paquete de datos para la base de datos
    const datosParaSheet = {
        nombre: nombre,
        direccion: direccion,
        pedido: listaPedido.join(", "),
        total: totalAcumulado,
        notas: notas
    };

    // 1. Envío a Google Sheets (Asíncrono)
    // Se usa 'no-cors' para evitar bloqueos del navegador al contactar con Google
    fetch(URL_SCRIPT, {
        method: "POST",
        mode: "no-cors", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosParaSheet)
    })
    .then(() => {
        console.log("✅ Datos enviados a Google Sheets correctamente.");
    })
    .catch(err => {
        console.error("❌ Error al enviar a Sheets:", err);
    });

    // 2. Formatear mensaje para WhatsApp
    const telefono = "523221523363"; 
    const listaFormateada = listaPedido.map(item => `• ${item}`).join("\n");

    const textoWhatsApp = `*NUEVO PEDIDO: YOKO SUSHI* 🍣\n\n` +
                          `👤 *Cliente:* ${nombre}\n` +
                          `📍 *Dirección:* ${direccion}\n\n` +
                          `🍱 *Detalle:* \n${listaFormateada}\n\n` +
                          `💰 *Total:* $${totalAcumulado}\n` +
                          `📝 *Notas:* ${notas}`;

    // 3. Ejecutar apertura de WhatsApp
    const urlWA = `https://wa.me/${telefono}?text=${encodeURIComponent(textoWhatsApp)}`;
    window.open(urlWA, '_blank');
}