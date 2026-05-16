/* =========================================
   SCRIPT.JS — XV Nancy Paola
   Arquitectura Centralizada y Limpia
   ========================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb8vHdnLP5jgdcBTDuwxAkRnYKmlag_IOiLEs8s1mWBypbSbqvRQuyBidD-nwj82z5wA/exec";
const VALIDADOR_URL = "https://xvnancy.vercel.app/validador.html";

/**
 * Hace una petición externa a Google Apps Script utilizando la técnica JSONP.
 * Crea e inyecta un elemento <script> de forma dinámica en el DOM.
 * Incluye un manejador de errores por si falla la conexión con el servidor.
 * @param {string} url - La URL completa con los parámetros de consulta y el callback.
 */
function llamarGoogle(url) {
  const s = document.createElement('script');
  s.src = url;
  
  // Captura de errores: Si la inyección del script falla (ej. caída de servidor o problemas de red)
  s.onerror = function() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.innerHTML = "❌ Error de red: No se pudo conectar con el servidor de invitaciones.";
      loader.style.color = "#721c24";
      loader.style.fontWeight = "bold";
    }
  };
  
  document.body.appendChild(s);
}

/* =========================================
   MÓDULO: INVITACIÓN PRINCIPAL
   ========================================= */
function abrirInvitacion() {
  const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
  const audio = document.getElementById('musica-fondo');
  if (audio) {
    audio.src = canciones[Math.floor(Math.random() * canciones.length)];
    audio.volume = 0.5;
    audio.load();
    audio.play().catch(() => {});
  }

  const pantallaSobre = document.getElementById('pantalla-sobre');
  const contenido = document.getElementById('contenido');

  if (pantallaSobre) {
    pantallaSobre.classList.add('cerrar');
    setTimeout(() => {
      pantallaSobre.style.display = 'none';
      if (contenido) {
        contenido.classList.add('visible');
        if (typeof ScrollReveal !== 'undefined') {
          ScrollReveal().reveal('.reveal', { delay: 200, duration: 800, distance: '20px', origin: 'bottom', interval: 100 });
        }
      }
    }, 1200);
  }
  iniciarPetalos();
}

function iniciarPetalos() {
  if (document.getElementById('sakura-container')) return;
  const contenedor = document.createElement('div');
  contenedor.id = 'sakura-container';
  Object.assign(contenedor.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9998', overflow: 'hidden' });
  document.body.appendChild(contenedor);

  const style = document.createElement('style');
  style.innerHTML = `
    .petalo { position: absolute; background-color: #ffb7c5; border-radius: 150% 0 150% 0; opacity: 0; transform-origin: center; animation: caer-fluido linear forwards; }
    @keyframes caer-fluido { 0% { top: -10%; transform: translateX(0) rotate(0deg) scale(0.7); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 105%; transform: translateX(120px) rotate(360deg) scale(1); opacity: 0; } }
  `;
  document.head.appendChild(style);

  const crearPetalo = () => {
    const p = document.createElement('div');
    p.className = 'petalo';
    const size = Math.random() * 8 + 10;
    const duration = Math.random() * 5 + 6;
    Object.assign(p.style, { width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}vw`, animationDuration: `${duration}s`, filter: `hue-rotate(${Math.random() * 25}deg)` });
    contenedor.appendChild(p);
    setTimeout(() => p.remove(), duration * 1000);
  };
  for (let i = 0; i < 15; i++) setTimeout(crearPetalo, Math.random() * 4000);
  setInterval(crearPetalo, 500);
}

// Inicializador del Contador (Protegido para que solo corra si los elementos existen)
function initContador() {
  const fechaEvento = new Date("Aug 15, 2026 18:00:00").getTime();
  const d = document.getElementById('dias');
  if (!d) return; // Si no está en la página actual, salimos de la función sin tronar el script

  setInterval(() => {
    const distancia = fechaEvento - Date.now();
    if (distancia < 0) return;
    
    const h = document.getElementById('horas');
    const m = document.getElementById('minutos');
    const s = document.getElementById('segundos');

    if (d) d.innerText = Math.floor(distancia / 86400000);
    if (h) h.innerText = Math.floor((distancia % 86400000) / 3600000);
    if (m) m.innerText = Math.floor((distancia % 3600000) / 60000);
    if (s) s.innerText = Math.floor((distancia % 60000) / 1000);
  }, 1000);
}

function initCarrusel() {
  const slider = document.getElementById('slider');
  const dotsWrapper = document.querySelector('.carousel-dots');
  if (!slider) return;

  const imgs = Array.from(slider.children);
  const total = imgs.length;
  let idx = 0;
  let timer;

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
    dotsWrapper.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
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

window.actualizarNombreSobre = function(data) {
  const elemNombre = document.getElementById('nombre-invitado-sobre');
  const btnAbrir = document.getElementById('btn-abrir') || document.getElementById('btn-abrir-sobre');
  if (data && data.familia) {
    if (elemNombre) elemNombre.innerText = data.familia;
  } else {
    if (elemNombre) elemNombre.innerText = '¡Te esperamos!';
  }
  if (btnAbrir) btnAbrir.style.display = 'inline-block';
};

/* =========================================
   MÓDULO: CONFIRMACIÓN DE ASISTENCIA
   ========================================= */
let datosGlobal = null;

function initConfirmacion() {
  const loader = document.getElementById('loader');
  if (!loader) return; // Si no estamos en confirmacion.html, salimos

  const id = new URLSearchParams(window.location.search).get('id');
  if (id) {
    llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&callback=recibirDatosConfirmacion`);
  } else {
    loader.innerHTML = "❌ Error: Enlace no válido (Falta ID de invitado).";
  }
}

window.recibirDatosConfirmacion = function(data) {
  const loader = document.getElementById('loader');
  const contenido = document.getElementById('contenido-confirmacion');
  
  if (loader) loader.style.display = 'none';
  if (contenido) contenido.style.display = 'block';
  
  if (data.error) {
      alert("Error: " + data.error);
      return;
  }

  datosGlobal = data;
  const titulo = document.getElementById('tituloFamilia');
  if (titulo) titulo.innerText = "Familia " + data.familia;

  if (data.confirmacionAnterior && data.confirmacionAnterior !== "") {
      mostrarVistaConfirmada(data.confirmacionAnterior);
  } else {
      generarFormulario();
  }
};

window.generarFormulario = function() {
  const vistaConf = document.getElementById('vistaConfirmada');
  const formConf = document.getElementById('formularioConfirmacion');
  const badge = document.getElementById('statusBadge');
  
  if (vistaConf) vistaConf.style.display = 'none';
  if (formConf) formConf.style.display = 'block';
  if (badge) badge.style.display = 'none';
  
  let html = "";
  datosGlobal.integrantes.forEach((nom, i) => {
      html += `<div class="familiar-row">
          <span class="nombre">${nom.trim()}</span>
          <select id="status-${i}">
              <option value="Asistirá">Asistirá ✅</option>
              <option value="No asistirá">No asistirá ❌</option>
          </select>
      </div>`;
  });
  const lista = document.getElementById('listaIntegrantes');
  if (lista) lista.innerHTML = html;
};

window.mostrarVistaConfirmada = function(resumen) {
  const formConf = document.getElementById('formularioConfirmacion');
  const vistaConf = document.getElementById('vistaConfirmada');
  const badge = document.getElementById('statusBadge');
  const resumenTxt = document.getElementById('resumenTexto');
  
  if (formConf) formConf.style.display = 'none';
  if (vistaConf) vistaConf.style.display = 'block';
  if (badge) badge.style.display = 'block';
  if (resumenTxt) resumenTxt.innerText = "Tu respuesta actual: " + resumen;
  
  const qrContainer = document.getElementById('qr-container');
  if (!qrContainer) return;
  qrContainer.innerHTML = "";

  datosGlobal.integrantes.forEach((nom) => {
      if (resumen.includes(`${nom.trim()}: Asistirá`)) {
          const qrDiv = document.createElement('div');
          qrDiv.className = "pase-qr";
          qrDiv.innerHTML = `<strong>PASE</strong><br>${nom.trim()}<br><div id="qr-${nom.trim()}"></div>`;
          qrContainer.appendChild(qrDiv);

          if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById(`qr-${nom.trim()}`), {
                text: `${VALIDADOR_URL}?id=${encodeURIComponent(nom.trim())}`,
                width: 100, height: 100
            });
          }
      }
  });
};

window.habilitarEdicion = function() {
  if (confirm("¿Deseas cambiar tu respuesta de asistencia?")) {
      generarFormulario();
  }
};

window.enviarConfirmacion = function() {
  const btn = document.getElementById('btnEnviar');
  if (btn) {
    btn.innerText = "Guardando...";
    btn.disabled = true;
  }

  let respuestas = [];
  datosGlobal.integrantes.forEach((nom, i) => {
      const selectElement = document.getElementById('status-'+i);
      if (selectElement) {
        respuestas.push(`${nom.trim()}: ${selectElement.value}`);
      }
  });

  const id = new URLSearchParams(window.location.search).get('id');
  const finalResp = respuestas.join(" | ");
  
  llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardadoConfirmacion`);
};

window.procesarGuardadoConfirmacion = function(res) {
  if (res.estatus === "ok") {
      location.reload(); 
  }
};

/* =========================================
   MÓDULO: VALIDADOR DE ENTRADAS (QR)
   ========================================= */
function initValidador() {
  const reader = document.getElementById('reader');
  // Si no estamos en la página del validador o la librería no cargó, salimos pacíficamente
  if (!reader || typeof Html5QrcodeScanner === 'undefined') return;

  const statusDiv = document.getElementById('status');
  
  function onScanSuccess(decodedText) {
      html5QrcodeScanner.clear();
      let idInvitado;
      try {
          const url = new URL(decodedText);
          idInvitado = url.searchParams.get("id") || decodedText;
      } catch (e) {
          idInvitado = decodedText;
      }

      mostrarMensaje("Consultando lista en tiempo real...", "consultando");
      // Reutiliza la función global llamarGoogle con el control de errores integrado
      llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado)}&callback=recibirRespuestaValidador`);
  }

  // Definimos el callback global que espera Google Sheets
  window.recibirRespuestaValidador = function(data) {
      if (data.familia) {
          mostrarMensaje("✅ ACCESO PERMITIDO:<br>" + data.familia, "exito");
      } else if (data.error) {
          mostrarMensaje("❌ " + data.error, "error");
      } else {
          mostrarMensaje("❌ INVITADO NO ENCONTRADO", "error");
      }
  };

  function mostrarMensaje(texto, clase) {
      if (!statusDiv) return;
      statusDiv.innerHTML = texto;
      statusDiv.className = "mensaje " + clase;
      statusDiv.style.display = "block";
  }

  // Inicialización segura del escáner QR
  const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  html5QrcodeScanner.render(onScanSuccess);
}

// =========================================================
  // Botón confirmar → Redirige de forma segura a la vista de confirmación
  // =========================================================
  const btnConfirmar = document.getElementById('btn-confirmar-asistencia');
  
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', (e) => {
      e.preventDefault(); // Previene comportamientos extraños del navegador o recargas de página
      
      if (idInvitado) {
        // Redirección explícita incluyendo la extensión .html para evitar fallos de enrutamiento en Vercel
        window.location.href = `confirmacion.html?id=${encodeURIComponent(idInvitado)}`;
      } else {
        alert('Error: No se encontró un ID de invitado válido en el enlace.');
      }
    });
  } else {
    // Registro de depuración en consola en caso de que el ID en el HTML esté mal escrito
    console.warn("Advertencia: No se encontró el elemento con ID 'btn-confirmar-asistencia' en esta página.");
  }