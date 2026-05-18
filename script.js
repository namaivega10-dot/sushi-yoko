// ==========================================
// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
// ==========================================
let listaPedido = [];
let totalAcumulado = 0;
let rolloActual = {}; 

// URL de tu Google Apps Script (App Web) - ACTUALIZADA
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbzUpKGD_svol7-o2z_AQBleW2aNNDibrexDW5iVHtqeKsp5Xg0seXFU-xh_IPooJQU/exec"; 

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
        // CORREGIDO: Se cerraron correctamente las comillas invertidas
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
        return alert("Por favor, ingresa tu nombre y dirección de entrega.");
    }

    // Paquete de datos para Google Sheets
    const datosParaSheet = {
        nombre: nombre,
        direccion: direccion,
        pedido: listaPedido.join(", "),
        total: totalAcumulado,
        notas: notas
    };

    // 1. Envío a Google Sheets mediante el Script
    try {
        fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors', // Permite el envío sin bloqueos de seguridad
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaSheet)
        });
        console.log("Datos enviados a la hoja de cálculo.");
    } catch (error) {
        console.error("Error al conectar con Sheets:", error);
    }

    // 2. Preparar mensaje para WhatsApp
    const numeroTelefono = "5213221523363"; // RECUERDA PONER TU NÚMERO AQUÍ
    const mensajeWA = `*NUEVO PEDIDO - YOKO SUSHI*%0A` +
                      `------------------------------%0A` +
                      `*Cliente:* ${nombre}%0A` +
                      `*Dirección:* ${direccion}%0A` +
                      `*Pedido:* ${listaPedido.join(", ")}%0A` +
                      `*Notas:* ${notas}%0A` +
                      `------------------------------%0A` +
                      `*TOTAL:* $${totalAcumulado}.00 MXN`;

    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeWA}`;

    // 3. Abrir WhatsApp en una nueva pestaña
    window.open(urlWhatsApp, '_blank');
}