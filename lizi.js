// ================================================
//   FARMALIZI — lizi.js
// ================================================

// ------------------------------------------------
// NÚMERO DE WHATSAPP DE LA VENDEDORA
// Si el número cambia, solo lo modificás acá
// y se actualiza en toda la app automáticamente.
// ------------------------------------------------
let WHATSAPP_NUMBER = '5493364580967';
// Más abajo, si querés cambiar el número, lo asignás SIN poner const/let:
WHATSAPP_NUMBER = '5493364580967'; // Ejemplo: '5493364580967' (sin espacios ni guiones)


// ================================================
// 1. CAMBIAR CANTIDAD DE UN PRODUCTO (botones + y -)
// ================================================
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
function actualizarResumen() {
  const productos = obtenerProductos();
  const seccion = document.getElementById('resumen-pedido');

  if (productos.length === 0) {
    seccion.style.display = 'none';
    return;
  }

  const total = productos.reduce((suma, p) => suma + p.precio * p.cantidad, 0);

  const filas = productos.map(p => `
    <div class="resumen-item">
      <span class="resumen-nombre">${p.nombre}</span>
      <span class="resumen-cant">x${p.cantidad}</span>
      <span class="resumen-precio">$${(p.precio * p.cantidad).toLocaleString('es-AR')}</span>
    </div>
  `).join('');

  document.getElementById('resumen-filas').innerHTML = filas;
  document.getElementById('resumen-total').textContent = '$' + total.toLocaleString('es-AR');

  seccion.style.display = 'block';
}


// ================================================
// 4. ENVIAR PEDIDO POR WHATSAPP
// ================================================
function enviarWhatsApp() {
  const productos = obtenerProductos();
  if (productos.length === 0) return;

  const total = productos.reduce((suma, p) => suma + p.precio * p.cantidad, 0);

  let mensaje = '🛒 *Pedido FarmaLizi*\n\n';

  productos.forEach(p => {
    mensaje += `• ${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toLocaleString('es-AR')}\n`;
  });

  mensaje += `\n💰 *Total: $${total.toLocaleString('es-AR')}*`;
  mensaje += '\n\n¡Hola! Quisiera hacer este pedido 😊';

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}


// ================================================
// 5. FILTROS POR CATEGORÍA (Blister, Jarabes, etc.)
// ================================================
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtrarProductos();
  });
});


// ================================================
// 6. BUSCADOR EN TIEMPO REAL CON DROPDOWN Y CRUZ
// ================================================

// NUEVA FUNCIÓN: Limpia tildes y mayúsculas
function limpiarTexto(texto) {
  if (!texto) return '';
  return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
}

const inputBuscador = document.getElementById('buscador');
const clearBtn = document.getElementById('clear-btn');
const searchResults = document.getElementById('search-results');

inputBuscador.addEventListener('input', () => {
  const query = limpiarTexto(inputBuscador.value.trim());

  filtrarProductos();

  if (query.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    searchResults.classList.add('hidden');
    return;
  }

  actualizarDropdown(query);
});

function actualizarDropdown(texto) {
  searchResults.innerHTML = '';
  
  const botonActivo = document.querySelector('.filtro-btn.active');
  const catActiva = botonActivo ? botonActivo.dataset.cat.toLowerCase().trim() : 'todos';

  const cards = document.querySelectorAll('.prod-card');
  let coincidencias = 0;

  cards.forEach((card, index) => {
    if (!card.id) {
      card.id = `prod-card-auto-${index}`;
    }

    const catCard = (card.dataset.cat || '').toLowerCase().trim();
    const nombre = card.dataset.nombre || '';
    const matchCat = catActiva === 'todos' || catCard === catActiva;
    
    // Ahora usa la función limpiarTexto para ignorar las tildes
    const matchText = limpiarTexto(nombre).includes(texto);

    if (matchCat && matchText) {
      coincidencias++;

      const imgElem = card.querySelector('img');
      const imgSrc = imgElem ? imgElem.src : '';

      const item = document.createElement('a');
      item.classList.add('result-item');
      item.href = 'javascript:void(0);';

      item.innerHTML = `
        <img src="${imgSrc}" alt="${nombre}" class="result-thumb" />
        <span class="result-title">${nombre}</span>
      `;

      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        searchResults.classList.add('hidden');

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.6)';

        setTimeout(() => {
          card.style.transform = 'none';
          card.style.boxShadow = 'none';
        }, 1200);
      });

      searchResults.appendChild(item);
    }
  });

  if (coincidencias === 0) {
    searchResults.innerHTML = `<div class="no-results">No se encontraron medicamentos</div>`;
  }

  searchResults.classList.remove('hidden');
}

function filtrarProductos() {
  const botonActivo = document.querySelector('.filtro-btn.active');
  if (!botonActivo) return;

  const cat = botonActivo.dataset.cat.toLowerCase().trim();
  const texto = limpiarTexto(inputBuscador.value.trim());
  const cards = document.querySelectorAll('.prod-card');
  const titulos = document.querySelectorAll('.seccion-categoria');
  let visibles = 0;

  titulos.forEach(t => t.style.display = 'none');

  cards.forEach(card => {
    const catCard  = (card.dataset.cat || '').toLowerCase().trim();
    const matchCat = cat === 'todos' || catCard === cat;
    
    // Ahora usa la función limpiarTexto para ignorar las tildes
    const matchText = limpiarTexto(card.dataset.nombre || '').includes(texto);
    
    const mostrar  = matchCat && matchText;
    card.style.display = mostrar ? '' : 'none';
    if (mostrar) visibles++;
  });

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

clearBtn.addEventListener('click', () => {
  inputBuscador.value = '';
  clearBtn.classList.add('hidden');
  searchResults.classList.add('hidden');
  filtrarProductos(); 
  inputBuscador.focus();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) {
    searchResults.classList.add('hidden');
  }
});


// ================================================
// 7. BOTÓN VOLVER ARRIBA (Back to Top)
// ================================================
document.addEventListener('DOMContentLoaded', () => {
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    const detectarScroll = () => {
      const scroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      
      if (scroll > 100) {
        backToTopBtn.style.setProperty('display', 'flex', 'important');
      } else {
        backToTopBtn.style.setProperty('display', 'none', 'important');
      }
    };

    window.addEventListener('scroll', detectarScroll);
    document.addEventListener('scroll', detectarScroll, true);

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }
});