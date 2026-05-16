/* =========================================
   SCRIPT.JS — XV Nancy Paola
   ========================================= */

// URL de la API en Google Apps Script para validar pases e invitados
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb8vHdnLP5jgdcBTDuwxAkRnYKmlag_IOiLEs8s1mWBypbSbqvRQuyBidD-nwj82z5wA/exec";


/* =========================================
   INTERACCIÓN DEL SOBRE (APERTURA)
   ========================================= */
function abrirInvitacion() {
  // Elegimos música de fondo aleatoria para sorprender al usuario
  const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
  const audio = document.getElementById('musica-fondo');
  
  if (audio) {
    audio.src = canciones[Math.floor(Math.random() * canciones.length)];
    audio.volume = 0.5;
    audio.load();
    audio.play().catch(() => {
      // Navegadores modernos bloquean el autoplay si el usuario no interactúa primero.
      // No pasa nada, se maneja en silencio.
    });
  }

  // Ocultamos el sobre con la animación CSS y activamos el layout principal
  const pantallaSobre = document.getElementById('pantalla-sobre');
  const contenido     = document.getElementById('contenido');

  if (pantallaSobre) {
    pantallaSobre.classList.add('cerrar');

    setTimeout(() => {
      pantallaSobre.style.display = 'none';
      if (contenido) {
        contenido.classList.add('visible');
        
        // Animaciones de entrada sólo si la librería ScrollReveal está en el HTML
        if (typeof ScrollReveal !== 'undefined') {
          ScrollReveal().reveal('.reveal', {
            delay: 200, duration: 800, distance: '20px',
            origin: 'bottom', interval: 100
          });
        }
      }
    }, 1200);
  }

  // Despegamos el efecto visual de pétalos flotantes
  iniciarPetalos();
}


/* =========================================
   EFECTO DE PÉTALOS EN PANTALLA
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

  // Reglas CSS mínimas para controlar la caída fluida de los pétalos
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

  // Ráfaga rápida al abrir la invitación y luego flujo regular constante
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
   CARRUSEL DE FOTOS
   ========================================= */
function initCarrusel() {
  const slider      = document.getElementById('slider');
  const dotsWrapper = document.querySelector('.carousel-dots');
  if (!slider) return;

  const imgs  = Array.from(slider.children);
  const total = imgs.length;
  let idx     = 0;
  let timer;

  // Renderizador dinámico de los indicadores inferiores (dots)
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

  // Listeners para las flechas de navegación manual
  const btnPrev = document.querySelector('.carousel-btn.prev');
  const btnNext = document.querySelector('.carousel-btn.next');
  if (btnPrev) btnPrev.addEventListener('click', () => ir(idx - 1));
  if (btnNext) btnNext.addEventListener('click', () => ir(idx + 1));

  reiniciarTimer();
}


/* =========================================
   SISTEMA DE LECTURA Y VALIDACIÓN QR
   ========================================= */
let html5QrcodeScanner = null;

function onScanSuccess(decodedText) {
  // Apagamos el escáner al capturar lectura para congelar la cámara mientras procesa
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear();
  }
  
  let idInvitado;
  try {
    // Si escaneamos el link de la invitación completo, extraemos solo el valor de "id="
    const url = new URL(decodedText);
    idInvitado = url.searchParams.get("id") || decodedText;
  } catch (e) {
    // Si no es URL válida, asumimos que el QR contiene el ID de texto crudo directamente
    idInvitado = decodedText;
  }

  mostrarMensajeQR("Consultando lista en tiempo real...", "consultando");

  // Inyectamos script dinámico (JSONP) para brincarnos restricciones de CORS en el navegador
  const finalURL = `${SCRIPT_URL}?id=${encodeURIComponent(idInvitado)}&callback=recibirRespuestaQR`;
  
  const script = document.createElement('script');
  script.src = finalURL;
  script.onerror = () => mostrarMensajeQR("Error de red: No se pudo conectar con el servidor.", "error");
  document.body.appendChild(script);
}

// Callback global que procesa la respuesta devuelta por la hoja de cálculo
window.recibirRespuestaQR = function(data) {
  if (data.familia) {
    mostrarMensajeQR("✅ ACCESO PERMITIDO:<br>" + data.familia, "exito");
  } else if (data.error) {
    mostrarMensajeQR("❌ " + data.error, "error");
  } else {
    mostrarMensajeQR("❌ INVITADO NO ENCONTRADO", "error");
  }
};

function mostrarMensajeQR(texto, clase) {
  const statusDiv = document.getElementById('status');
  if (!statusDiv) return;
  
  statusDiv.innerHTML = texto;
  statusDiv.className = "mensaje " + clase;
  statusDiv.style.display = "block";
}


/* =========================================
   CARGA DE DATOS VÍA JSONP (SOBRE)
   ========================================= */
function llamarGoogle(url) {
  const s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

// Callback para actualizar el nombre del invitado impreso sobre la tarjeta inicial
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
   PUNTO DE ENTRADA ÚNICO (DOM READY)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  const params      = new URLSearchParams(window.location.search);
  const idInvitado  = params.get('id');
  const nombreSobre = document.getElementById('nombre-invitado-sobre');

  // 1. Personalizar el sobre según la URL
  if (idInvitado) {
    llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=actualizarNombreSobre`);
  } else {
    if (nombreSobre) nombreSobre.innerText = '¡Te esperamos!';
  }

  // 2. Manejo del botón para Confirmar Asistencia desde la vista
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

  // 3. Inicializar Carrusel de fotos
  initCarrusel();

  // 4. Arrancar el escáner QR solo si el contenedor existe en este HTML (evita romper código si es otra vista)
  if (document.getElementById('reader')) {
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
  }
});