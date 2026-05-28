// ================================================
//   FARMALIZI — lizi.js
// ================================================


// ------------------------------------------------
// NÚMERO DE WHATSAPP DE LA VENDEDORA
// Si el número cambia, solo lo modificás acá
// y se actualiza en toda la app automáticamente.
// ------------------------------------------------
const WHATSAPP_NUMBER = '5493364580967';


// ================================================
// 1. CAMBIAR CANTIDAD DE UN PRODUCTO (botones + y -)
// ================================================
// Esta función se llama cada vez que el usuario
// presiona + o - en cualquier producto.
//
// "btn" es el botón que se presionó.
// "valor" es +1 (si presionó +) o -1 (si presionó -).
//
// Busca el <span> que tiene el número dentro del
// mismo .cantidad-control, le suma o resta 1,
// y si el resultado es negativo lo deja en 0.
// Al final llama a actualizarResumen() para
// reflejar el cambio en el resumen de abajo.
// ------------------------------------------------
function cambiarCantidad(btn, valor) {
  const span = btn.parentElement.querySelector('span');
  let cantidad = parseInt(span.textContent) + valor;
  if (cantidad < 0) cantidad = 0;
  span.textContent = cantidad;
  actualizarResumen();
}


// ================================================
// 2. LEER TODOS LOS PRODUCTOS SELECCIONADOS
// ================================================
// Recorre todas las tarjetas (.prod-card) del HTML
// y devuelve solo las que tienen cantidad mayor a 0.
//
// De cada tarjeta lee:
//   data-nombre → el nombre del producto
//   data-precio → el precio (número sin $ ni puntos)
//   span        → la cantidad elegida por el usuario
//
// Devuelve un array (lista) de objetos así:
//   { nombre: "Actron 600", precio: 7600, cantidad: 2 }
// ------------------------------------------------
function obtenerProductos() {
  const cards = document.querySelectorAll('.prod-card');
  const productos = [];

  cards.forEach(card => {
    const span = card.querySelector('.cantidad-control span');
    const cantidad = parseInt(span.textContent);

    if (cantidad > 0) {
      productos.push({
        nombre:   card.dataset.nombre,
        precio:   parseInt(card.dataset.precio),
        cantidad: cantidad
      });
    }
  });

  return productos;
}


// ================================================
// 3. ACTUALIZAR EL RESUMEN AL PIE DE LA PÁGINA
// ================================================
// Se llama cada vez que el usuario toca + o -.
// Lee los productos seleccionados y:
//
//   - Si no hay ninguno: oculta el resumen.
//   - Si hay al menos uno: muestra el resumen con
//     la lista de productos, subtotales y total,
//     y habilita el botón de WhatsApp.
// ------------------------------------------------
function actualizarResumen() {
  const productos = obtenerProductos();
  const seccion = document.getElementById('resumen-pedido');

  // Si no hay productos seleccionados, oculta el resumen y sale
  if (productos.length === 0) {
    seccion.style.display = 'none';
    return;
  }

  // Calcula el total sumando precio * cantidad de cada producto
  const total = productos.reduce((suma, p) => suma + p.precio * p.cantidad, 0);

  // Arma el HTML de cada fila del resumen
  const filas = productos.map(p => `
    <div class="resumen-item">
      <span class="resumen-nombre">${p.nombre}</span>
      <span class="resumen-cant">x${p.cantidad}</span>
      <span class="resumen-precio">$${(p.precio * p.cantidad).toLocaleString('es-AR')}</span>
    </div>
  `).join('');

  // Inserta las filas y el total en el HTML
  document.getElementById('resumen-filas').innerHTML = filas;
  document.getElementById('resumen-total').textContent = '$' + total.toLocaleString('es-AR');

  // Muestra el resumen (por defecto está oculto con display:none)
  seccion.style.display = 'block';
}


// ================================================
// 4. ENVIAR PEDIDO POR WHATSAPP
// ================================================
// Arma un mensaje de texto con todos los productos
// elegidos, cantidades, subtotales y total,
// lo codifica para una URL y abre WhatsApp
// directo al número de la vendedora.
//
// El mensaje que llega al WhatsApp queda así:
//
//   🛒 Pedido FarmaLizi
//
//   • Actron 600 x2 — $15.200
//   • Paracetamol 500 x1 — $800
//
//   💰 Total: $16.000
//   ¡Hola! Quisiera hacer este pedido 😊
// ------------------------------------------------
function enviarWhatsApp() {
  const productos = obtenerProductos();
  if (productos.length === 0) return;

  const total = productos.reduce((suma, p) => suma + p.precio * p.cantidad, 0);

  // Arma el texto del mensaje
  let mensaje = '🛒 *Pedido FarmaLizi*\n\n';

  productos.forEach(p => {
    mensaje += `• ${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toLocaleString('es-AR')}\n`;
  });

  mensaje += `\n💰 *Total: $${total.toLocaleString('es-AR')}*`;
  mensaje += '\n\n¡Hola! Quisiera hacer este pedido 😊';

  // Abre WhatsApp con el mensaje ya escrito
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}


// ================================================
// 5. FILTROS POR CATEGORÍA (Blister, Jarabes, etc.)
// ================================================
// Escucha el clic en cada botón de filtro.
// Al hacer clic:
//   1. Saca la clase "active" de todos los botones
//   2. Se la pone al que se clickeó
//   3. Llama a filtrarProductos() para mostrar/ocultar
// ------------------------------------------------
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtrarProductos();
  });
});


// ================================================
// 6. BUSCADOR EN TIEMPO REAL
// ================================================
// Cada vez que el usuario escribe algo en el buscador
// llama a filtrarProductos() para actualizar la grilla.
// ------------------------------------------------
document.getElementById('buscador').addEventListener('input', filtrarProductos);


function filtrarProductos() {
  const botonActivo = document.querySelector('.filtro-btn.active');
  if (!botonActivo) return;

  const cat = botonActivo.dataset.cat.toLowerCase().trim();
  const texto = document.getElementById('buscador').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.prod-card');
  const titulos = document.querySelectorAll('.seccion-categoria');
  let visibles = 0;

  // Ocultar TODOS los títulos primero
  titulos.forEach(t => t.style.display = 'none');

  // Filtrar cards
  cards.forEach(card => {
    const catCard  = (card.dataset.cat || '').toLowerCase().trim();
    const matchCat = cat === 'todos' || catCard === cat;
    const matchText = (card.dataset.nombre || '').toLowerCase().includes(texto);
    const mostrar  = matchCat && matchText;
    card.style.display = mostrar ? '' : 'none';
    if (mostrar) visibles++;
  });

  // Mostrar solo el título que corresponde
  if (cat === 'todos') {
    titulos.forEach(t => t.style.display = '');
  } else {
    const tituloActivo = document.getElementById(cat);
    if (tituloActivo) tituloActivo.style.display = '';
  }

  const sinResultados = document.getElementById('sin-resultados');
  if (sinResultados) {
    sinResultados.style.display = visibles === 0 ? 'block' : 'none';
  }
}