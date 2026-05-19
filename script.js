let carrito = [];
let productoEnModal = null;
let precioEnModal = 0;

function toggleCategory(categoryId) {
    const content = document.getElementById(categoryId);
    const arrow = content.previousElementSibling.querySelector('.arrow');
    
    if (content.style.display === 'block') {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    }
}

function abrirDetalle(nombre, imagen, precio, descripcion) {
    productoEnModal = nombre;
    precioEnModal = precio;
    
    document.getElementById('modal-titulo').innerText = nombre;
    document.getElementById('modal-imagen').src = imagen;
    document.getElementById('modal-descripcion').innerText = descripcion;
    document.getElementById('modal-precio-texto').innerText = '$' + precio;
    
    document.getElementById('modal-sushi').style.display = 'flex';
}

function cerrarDetalle() {
    document.getElementById('modal-sushi').style.display = 'none';
    productoEnModal = null;
    precioEnModal = 0;
}

function agregarAlPedido(nombre, precio) {
    const item = carrito.find(p => p.nombre === nombre);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    actualizarTotal();
    showToast(`${nombre} agregado al pedido`, 'success');
}

function quitarDelPedido(nombre, precio) {
    const itemIndex = carrito.findIndex(p => p.nombre === nombre);
    if (itemIndex > -1) {
        carrito[itemIndex].cantidad--;
        if (carrito[itemIndex].cantidad === 0) {
            carrito.splice(itemIndex, 1);
        }
        actualizarTotal();
        showToast(`1 x ${nombre} removido del pedido`, 'success');
    }
}

function confirmarYAgregar() {
    if (productoEnModal) {
        agregarAlPedido(productoEnModal, precioEnModal);
        cerrarDetalle();
    }
}

function actualizarTotal() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('total').innerText = total;
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Configuración de Google Sheets y WhatsApp
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxelPg5xObqU4SF5oBtyVsDhs2S9dSnlEZm6Ai_buRVa-rbMGyPha_wGeSinR57nHoN/exec'; // Cambiar por tu URL de script
const WHATSAPP_NUMBER = '523221523363';

async function enviarWhatsApp() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const direccionCliente = document.getElementById('direccionCliente').value.trim();
    const notas = document.getElementById('notas').value.trim();
    const total = document.getElementById('total').innerText;

    if (!nombreCliente || !direccionCliente) {
        showToast('Por favor ingresa tu nombre y dirección.', 'error');
        return;
    }

    if (carrito.length === 0) {
        showToast('Tu carrito está vacío.', 'error');
        return;
    }

    const btnSubmit = document.getElementById('btn-enviar');
    const btnText = btnSubmit.querySelector('.btn-text');
    const loader = btnSubmit.querySelector('.loader');

    btnSubmit.disabled = true;
    if(btnText) btnText.classList.add('transparent');
    if(loader) loader.classList.remove('hidden');

    let pedidoDetallado = carrito.map(item => `${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})`).join(', ');

    const data = {
        nombre: nombreCliente,
        direccion: direccionCliente,
        pedidoDetallado: pedidoDetallado,
        totalAcumulado: total,
        notas: notas
    };

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data)
        });

        showToast('¡Pedido registrado exitosamente!', 'success');

        let mensajeWA = `🍣 *NUEVO PEDIDO YOKO SUSHI* 🍣%0A%0A`;
        mensajeWA += `*Nombre:* ${nombreCliente}%0A`;
        mensajeWA += `*Dirección:* ${direccionCliente}%0A%0A`;
        mensajeWA += `*Pedido:*%0A`;
        carrito.forEach(item => {
            mensajeWA += `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})%0A`;
        });
        mensajeWA += `%0A*Total:* $${total} MXN%0A`;
        if (notas) {
            mensajeWA += `*Notas:* ${notas}%0A`;
        }

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeWA}`;
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1500);

        // Limpiar formulario y carrito
        document.getElementById('nombreCliente').value = '';
        document.getElementById('direccionCliente').value = '';
        document.getElementById('notas').value = '';
        carrito = [];
        actualizarTotal();

    } catch (error) {
        console.error('Error enviando pedido:', error);
        showToast('Hubo un problema al procesar el pedido. Intenta nuevamente.', 'error');
    } finally {
        btnSubmit.disabled = false;
        if(btnText) btnText.classList.remove('transparent');
        if(loader) loader.classList.add('hidden');
    }
}
