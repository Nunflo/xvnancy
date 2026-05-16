/* =========================================
   SCRIPT.JS — XV Nancy Paola
   ========================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb8vHdnLP5jgdcBTDuwxAkRnYKmlag_IOiLEs8s1mWBypbSbqvRQuyBidD-nwj82z5wA/exec";
const VALIDADOR_URL = "https://xvnancy.vercel.app/validador.html";

let datosGlobal = null;

/* =========================================
   ABRIR INVITACIÓN
   ========================================= */
function abrirInvitacion() {
  // 1. Música aleatoria
  const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
  const audio = document.getElementById('musica-fondo');
  if (audio) {
    audio.src = canciones[Math.floor(Math.random() * canciones.length)];
    audio.volume = 0.5;
    audio.load();
    audio.play().catch(() => {/* autoplay bloqueado por el navegador, no pasa nada */});
  }

  // 2. Animación mejorada del sobre (clase CSS maneja escala + traslado + blur)
  const pantallaSobre = document.getElementById('pantalla-sobre');
  const contenido     = document.getElementById('contenido');

  if (pantallaSobre) {
    pantallaSobre.classList.add('cerrar');

    setTimeout(() => {
      pantallaSobre.style.display = 'none';
      if (contenido) {
        contenido.classList.add('visible');
        // ScrollReveal — sólo si está disponible
        if (typeof ScrollReveal !== 'undefined') {
          ScrollReveal().reveal('.reveal', {
            delay: 200, duration: 800, distance: '20px',
            origin: 'bottom', interval: 100
          });
        }
      }
    }, 1200);
  }

  // 3. Pétalos
  iniciarPetalos();
}

/* =========================================
   PÉTALOS (flujo continuo, sin memory leak)
   ========================================= */
function iniciarPetalos() {
  // Evita crear el contenedor dos veces
  if (document.getElementById('sakura-container')) return;

  const contenedor = document.createElement('div');
  contenedor.id = 'sakura-container';
  Object.assign(contenedor.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9998', overflow: 'hidden'
  });
  document.body.appendChild(contenedor);

  // Inyectar keyframes una sola vez
  const style = document.createElement('style');
  style.innerHTML = `
    .petalo {
      position: absolute;
      background-color: #ffb7c5;
      border-radius: 150% 0 150% 0;
      opacity: 0;
      transform-origin: center;
      animation: caer-fluido linear forwards;
    }
    @keyframes caer-fluido {
      0%   { top: -10%; transform: translateX(0) rotate(0deg) scale(0.7); opacity: 0; }
      10%  { opacity: 0.8; }
      90%  { opacity: 0.8; }
      100% { top: 105%; transform: translateX(120px) rotate(360deg) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  const crearPetalo = () => {
    const p   = document.createElement('div');
    p.className = 'petalo';
    const size     = Math.random() * 8 + 10;
    const duration = Math.random() * 5 + 6;

    Object.assign(p.style, {
      width:             `${size}px`,
      height:            `${size}px`,
      left:              `${Math.random() * 100}vw`,
      animationDuration: `${duration}s`,
      filter:            `hue-rotate(${Math.random() * 25}deg)`
    });

    contenedor.appendChild(p);
    setTimeout(() => p.remove(), duration * 1000);
  };

  // Ráfaga inicial escalonada
  for (let i = 0; i < 15; i++) {
    setTimeout(crearPetalo, Math.random() * 4000);
  }

  // Generación constante
  setInterval(crearPetalo, 500);
}

/* =========================================
   CUENTA REGRESIVA
   ========================================= */
const fechaEvento = new Date("Aug 15, 2026 18:00:00").getTime();

setInterval(() => {
  const distancia = fechaEvento - Date.now();
  if (distancia < 0) return;

  const get = (id) => document.getElementById(id);
  if (get('dias'))     get('dias').innerText     = Math.floor(distancia / 86400000);
  if (get('horas'))    get('horas').innerText    = Math.floor((distancia % 86400000) / 3600000);
  if (get('minutos'))  get('minutos').innerText  = Math.floor((distancia % 3600000)  / 60000);
  if (get('segundos')) get('segundos').innerText = Math.floor((distancia % 60000)    / 1000);
}, 1000);

/* =========================================
   CARRUSEL CON FLECHAS Y DOTS
   ========================================= */
function initCarrusel() {
  const slider      = document.getElementById('slider');
  const dotsWrapper = document.querySelector('.carousel-dots');
  if (!slider) return;

  const imgs  = Array.from(slider.children);
  const total = imgs.length;
  let idx     = 0;
  let timer;

  // Crear dots dinámicamente
  if (dotsWrapper) {
    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Foto ${i + 1}`);
      dot.addEventListener('click', () => ir(i));
      dotsWrapper.appendChild(dot);
    });
  }

  function actualizarDots() {
    if (!dotsWrapper) return;
    dotsWrapper.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function ir(nuevoIdx) {
    idx = (nuevoIdx + total) % total;
    slider.style.transform = `translateX(-${idx * 100}%)`;
    actualizarDots();
    reiniciarTimer();
  }

  function reiniciarTimer() {
    clearInterval(timer);
    timer = setInterval(() => ir(idx + 1), 3500);
  }

  // Flechas
  const btnPrev = document.querySelector('.carousel-btn.prev');
  const btnNext = document.querySelector('.carousel-btn.next');
  if (btnPrev) btnPrev.addEventListener('click', () => ir(idx - 1));
  if (btnNext) btnNext.addEventListener('click', () => ir(idx + 1));

  // Arrancar autoplay
  reiniciarTimer();
}

/* =========================================
   CARGA DE INVITADO E INFRAESTRUCTURA JSONP
   ========================================= */
function llamarGoogle(url) {
  const s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

// Callback original para personalizar la vista del sobre exterior
window.actualizarNombreSobre = function(data) {
  const elemNombre = document.getElementById('nombre-invitado-sobre');
  const btnAbrir   = document.getElementById('btn-abrir') ||
                     document.getElementById('btn-abrir-sobre');

  if (data && data.familia) {
    if (elemNombre) elemNombre.innerText = data.familia;
  } else {
    if (elemNombre) elemNombre.innerText = '¡Te esperamos!';
  }

  if (btnAbrir) btnAbrir.style.display = 'inline-block';
};

/* =========================================
   GESTIÓN DE CONFIRMACIONES Y PASES QR
   ========================================= */
window.recibirDatos = function(data) {
  const loader = document.getElementById('loader');
  const contenido = document.getElementById('contenido');
  
  if (loader) loader.style.display = 'none';
  if (contenido) contenido.style.display = 'block';
  
  if (data.error) {
    alert("Error: " + data.error);
    return;
  }

  datosGlobal = data;
  
  const tituloFamilia = document.getElementById('tituloFamilia');
  if (tituloFamilia) tituloFamilia.innerText = "Familia " + data.familia;

  // Si ya hay una confirmación previa guardada en la hoja de cálculo
  if (data.confirmacionAnterior && data.confirmacionAnterior !== "") {
    mostrarVistaConfirmada(data.confirmacionAnterior);
  } else {
    generarFormulario();
  }
};

function generarFormulario() {
  const vistaConfirmada = document.getElementById('vistaConfirmada');
  const formularioConfirmacion = document.getElementById('formularioConfirmacion');
  const statusBadge = document.getElementById('statusBadge');
  
  if (vistaConfirmada) vistaConfirmada.style.display = 'none';
  if (formularioConfirmacion) formularioConfirmacion.style.display = 'block';
  if (statusBadge) statusBadge.style.display = 'none';
  
  let html = "";
  datosGlobal.integrantes.forEach((nom, i) => {
    html += `<div class="familiar-row">
        <span class="nombre-invitado-row">${nom.trim()}</span>
        <select id="status-${i}">
            <option value="Asistirá">Asistirá ✅</option>
            <option value="No asistirá">No asistirá ❌</option>
        </select>
    </div>`;
  });
  
  const listaIntegrantes = document.getElementById('listaIntegrantes');
  if (listaIntegrantes) listaIntegrantes.innerHTML = html;
}

function mostrarVistaConfirmada(resumen) {
  const formularioConfirmacion = document.getElementById('formularioConfirmacion');
  const vistaConfirmada = document.getElementById('vistaConfirmada');
  const statusBadge = document.getElementById('statusBadge');
  const resumenTexto = document.getElementById('resumenTexto');
  
  if (formularioConfirmacion) formularioConfirmacion.style.display = 'none';
  if (vistaConfirmada) vistaConfirmada.style.display = 'block';
  if (statusBadge) statusBadge.style.display = 'block';
  if (resumenTexto) resumenTexto.innerText = "Tu respuesta actual: " + resumen;
  
  const qrContainer = document.getElementById('qr-container');
  if (!qrContainer) return;
  qrContainer.innerHTML = "";

  // Generar códigos QR únicamente para quienes asistirán
  datosGlobal.integrantes.forEach((nom) => {
    if (resumen.includes(`${nom.trim()}: Asistirá`)) {
      const qrDiv = document.createElement('div');
      qrDiv.className = "pase-qr";
      qrDiv.innerHTML = `<strong>PASE</strong><br>${nom.trim()}<br><div id="qr-${nom.trim()}"></div>`;
      qrContainer.appendChild(qrDiv);

      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById(`qr-${nom.trim()}`), {
          text: `${VALIDADOR_URL}?id=${encodeURIComponent(nom.trim())}`,
          width: 100, 
          height: 100
        });
      }
    }
  });
}

function habilitarEdicion() {
  if (confirm("¿Deseas cambiar tu respuesta de asistencia?")) {
    generarFormulario();
  }
}

function enviarConfirmacion() {
  const btn = document.getElementById('btnEnviar');
  if (btn) {
    btn.innerText = "Guardando...";
    btn.disabled = true;
  }

  let respuestas = [];
  datosGlobal.integrantes.forEach((nom, i) => {
    const selector = document.getElementById('status-' + i);
    if (selector) {
      respuestas.push(`${nom.trim()}: ${selector.value}`);
    }
  });

  const id = new URLSearchParams(window.location.search).get('id');
  const finalResp = respuestas.join(" | ");
  
  llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardado`);
}

window.procesarGuardado = function(res) {
  if (res.estatus === "ok") {
    location.reload(); // Recarga la página para refrescar los datos y dibujar los QRs
  }
};

/* =========================================
   DOM READY — bloque de inicialización
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const idInvitado = params.get('id');
  const nombreSobre = document.getElementById('nombre-invitado-sobre');

  // 1. Inicializar flujos dependiendo de si es la vista del Sobre o la vista de Confirmación
  if (idInvitado) {
    const idMayuscula = idInvitado.toUpperCase();
    
    // Si el HTML actual contiene elementos de la tarjeta de confirmación de asistencia
    if (document.getElementById('listaIntegrantes') || document.getElementById('qr-container')) {
      llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idMayuscula)}&callback=recibirDatos`);
    } else {
      // Si es el index normal, personaliza la cubierta del sobre
      llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idMayuscula)}&callback=actualizarNombreSobre`);
    }
  } else {
    if (nombreSobre) nombreSobre.innerText = '¡Te esperamos!';
  }

  // 2. Vinculación del evento del botón de confirmación en la invitación principal
  const btnConfirmar = document.getElementById('btn-confirmar-asistencia');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', (e) => {
      e.preventDefault();
      if (idInvitado) {
        window.location.href = `confirmacion?id=${encodeURIComponent(idInvitado)}`;
      } else {
        alert('Error: No se encontró el ID en el enlace.');
      }
    });
  }

  // 3. Vinculación de funciones de acción del panel de asistencia si existen en el DOM
  const btnEnviarForm = document.getElementById('btnEnviar');
  if (btnEnviarForm) {
    btnEnviarForm.addEventListener('click', enviarConfirmacion);
  }

  const btnModificarResp = document.getElementById('btnModificar');
  if (btnModificarResp) {
    btnModificarResp.addEventListener('click', habilitarEdicion);
  }

  // 4. Iniciar componentes visuales compartidos
  initCarrusel();
});