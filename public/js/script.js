/* =========================================
   SCRIPT.JS — XV Nancy Paola
   Limpio, modular y protegido contra errores
   ========================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb8vHdnLP5jgdcBTDuwxAkRnYKmlag_IOiLEs8s1mWBypbSbqvRQuyBidD-nwj82z5wA/exec";

/* =========================================
   ABRIR INVITACIÓN (Index)
   ========================================= */
function abrirInvitacion() {
  const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
  const audio = document.getElementById('musica-fondo');
  if (audio) {
    audio.src = canciones[Math.floor(Math.random() * canciones.length)];
    audio.volume = 0.5;
    audio.load();
    audio.play().catch(() => {/* Autoplay bloqueado por el navegador */});
  }

  const pantallaSobre = document.getElementById('pantalla-sobre');
  const contenido     = document.getElementById('contenido');

  if (pantallaSobre) {
    pantallaSobre.classList.add('cerrar');

    setTimeout(() => {
      pantallaSobre.style.display = 'none';
      if (contenido) {
        contenido.classList.add('visible');
        if (typeof ScrollReveal !== 'undefined') {
          ScrollReveal().reveal('.reveal', {
            delay: 200, duration: 800, distance: '20px',
            origin: 'bottom', interval: 100
          });
        }
      }
    }, 1200);
  }

  iniciarPetalos();
}

/* =========================================
   PÉTALOS SAKURA (Flujo continuo)
   ========================================= */
function iniciarPetalos() {
  if (document.getElementById('sakura-container')) return;

  const contenedor = document.createElement('div');
  contenedor.id = 'sakura-container';
  Object.assign(contenedor.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9998', overflow: 'hidden'
  });
  document.body.appendChild(contenedor);

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
    const p = document.createElement('div');
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

  for (let i = 0; i < 15; i++) {
    setTimeout(crearPetalo, Math.random() * 4000);
  }
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

  if (dotsWrapper && dotsWrapper.children.length === 0) {
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

  const btnPrev = document.querySelector('.carousel-btn.prev');
  const btnNext = document.querySelector('.carousel-btn.next');
  if (btnPrev) btnPrev.addEventListener('click', () => ir(idx - 1));
  if (btnNext) btnNext.addEventListener('click', () => ir(idx + 1));

  reiniciarTimer();
}

/* =========================================
   INYECTOR JSONP DE GOOGLE SHEETS
   ========================================= */
function llamarGoogle(url) {
  const s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

// Callback global para la pantalla del sobre
window.actualizarNombreSobre = function(data) {
  const elemNombre = document.getElementById('nombre-invitado-sobre');
  const btnAbrir   = document.getElementById('btn-abrir') || document.getElementById('btn-abrir-sobre');

  if (data && data.familia) {
    if (elemNombre) elemNombre.innerText = data.familia;
  } else {
    if (elemNombre) elemNombre.innerText = '¡Te esperamos!';
  }
  if (btnAbrir) btnAbrir.style.display = 'inline-block';
};

/* =========================================
   LÓGICA EXCLUSIVA DE CONFIRMACIÓN
   ========================================= */
window.procesarDatosConfirmacion = function(data) {
  const loader = document.getElementById('loader');
  const contenido = document.getElementById('contenido-confirmacion');
  const tituloFamilia = document.getElementById('tituloFamilia');

  if (loader) loader.classList.add('oculto');
  if (!contenido) return;
  
  contenido.classList.remove('oculto');

  if (!data || data.error) {
    if (tituloFamilia) tituloFamilia.innerText = "Invitación no encontrada";
    return;
  }

  if (tituloFamilia) tituloFamilia.innerText = data.familia;
  
  // Renderizar la lista dinámica de familiares
  const lista = document.getElementById('listaIntegrantes');
  if (lista && data.integrantes) {
    lista.innerHTML = '';
    data.integrantes.forEach((persona, i) => {
      lista.innerHTML += `
        <div class="familiar-row">
          <span class="nombre">${persona.nombre}</span>
          <input type="checkbox" id="p_${i}" ${persona.asiste ? 'checked' : ''} class="chk-asistencia">
        </div>
      `;
    });
  }

  // Verificar estado de visualización previa
  if (data.confirmado) {
    mostrarPasesConfirmados(data);
  }
};

function enviarConfirmacion() {
  const btnEnviar = document.getElementById('btnEnviar');
  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.innerText = "Guardando...";
  }
  
  // Aquí recolectas las respuestas del DOM para mandarlas de vuelta a tu WebApp de Sheets
  // Simulación de éxito tras guardado:
  setTimeout(() => {
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) statusBadge.classList.remove('oculto');
    // Lógica para alternar a vista confirmada y generar tus QRs dinámicos...
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.innerText = "Guardar Confirmación";
    }
  }, 1000);
}

function habilitarEdicion() {
  const form = document.getElementById('formularioConfirmacion');
  const vista = document.getElementById('vistaConfirmada');
  const badge = document.getElementById('statusBadge');

  if (form) form.classList.remove('oculto');
  if (vista) vista.classList.add('oculto');
  if (badge) badge.classList.add('oculto');
}

function mostrarPasesConfirmados(data) {
  const form = document.getElementById('formularioConfirmacion');
  const vista = document.getElementById('vistaConfirmada');
  const badge = document.getElementById('statusBadge');
  
  if (form) form.classList.add('oculto');
  if (vista) vista.classList.remove('oculto');
  if (badge) badge.classList.remove('oculto');

  // Ejemplo generador de QR si se cuenta con la librería cargada en el DOM
  const qrContainer = document.getElementById('qr-container');
  if (qrContainer && typeof QRCode !== 'undefined') {
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: `ID:${data.id}-CONFIRMADO`,
      width: 128,
      height: 128
    });
  }
}

/* =========================================
   MANEJADOR DOM READY INTEGRADO
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const idInvitado = params.get('id');

  // 1. Inicialización en Pantalla de Inicio (index)
  const nombreSobre = document.getElementById('nombre-invitado-sobre');
  if (nombreSobre) {
    if (idInvitado) {
      llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=actualizarNombreSobre`);
    } else {
      nombreSobre.innerText = '¡Te esperamos!';
    }
  }

  const btnConfirmar = document.getElementById('btn-confirmar-asistencia');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', (e) => {
      e.preventDefault();
      if (idInvitado) {
        window.location.href = `confirmacion.html?id=${encodeURIComponent(idInvitado)}`;
      } else {
        alert('Error: No se encontró el ID en el enlace.');
      }
    });
  }

  // Inicializa carrusel si existe en la página actual
  initCarrusel();

  // 2. Inicialización en Pantalla de Confirmación
  const contenidoConf = document.getElementById('contenido-confirmacion');
  if (contenidoConf && idInvitado) {
    llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&action=get&callback=procesarDatosConfirmacion`);
  }

  // Registro de Event Listeners limpios (Buenas prácticas - No onClick inline)
  const btnEnviar = document.getElementById('btnEnviar');
  if (btnEnviar) btnEnviar.addEventListener('click', enviarConfirmacion);

  const btnModificar = document.getElementById('btnModificar');
  if (btnModificar) btnModificar.addEventListener('click', habilitarEdicion);
});