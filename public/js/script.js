/* =========================================
   SCRIPT.JS — XV Nancy Paola
   
   ========================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzMcv2WdDu8w-wlThJU05INiky5Bg1DhEsr8_ZUzMD_jSans3VTtrIU-MDxLbjr2gXow/exec";
const VALIDADOR_URL = "https://xvnancy.vercel.app/validador.html";

/* =========================================
   UTILIDAD: JSONP
   ========================================= */
function llamarGoogle(url) {
  const s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

/* =========================================
   ABRIR INVITACIÓN (index.html)
   ========================================= */
function abrirInvitacion() {
  // 1. Música aleatoria
  const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
  const audio = document.getElementById('musica-fondo');
  if (audio) {
    audio.src = canciones[Math.floor(Math.random() * canciones.length)];
    audio.volume = 0.5;
    audio.load();
    audio.play().catch(() => {});
  }

  // 2. Animación del sobre
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

  // 3. Pétalos
  iniciarPetalos();
}

/* =========================================
   PÉTALOS (index.html)
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
   CUENTA REGRESIVA (index.html)
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
   CARRUSEL (index.html)
   ========================================= */
function initCarrusel() {
  const slider      = document.getElementById('slider');
  const dotsWrapper = document.querySelector('.carousel-dots');
  if (!slider) return;

  const imgs  = Array.from(slider.children);
  const total = imgs.length;
  let idx     = 0;
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
   CARGA DE INVITADO JSONP (index.html)
   ========================================= */
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
   DOM READY — index.html
   ========================================= */
function initIndex() {
  if (!document.getElementById('pantalla-sobre')) return;

  const params     = new URLSearchParams(window.location.search);
  const idInvitado = params.get('id');
  const nombreSobre = document.getElementById('nombre-invitado-sobre');

  if (idInvitado) {
    llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=actualizarNombreSobre`);
  } else {
    if (nombreSobre) nombreSobre.innerText = '¡Te esperamos!';
  }

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

  initCarrusel();
}

/* =========================================
   CONFIRMACIÓN — confirmacion.html
   ========================================= */
let datosGlobal = null;

window.recibirDatosConfirmacion = function(data) {
  console.log('[XV] Datos recibidos del Google Script:', JSON.stringify(data));

  const loader    = document.getElementById('confirmacion-loader');
  const contenido = document.getElementById('confirmacion-contenido');
  if (loader)    loader.style.display = 'none';
  if (contenido) contenido.style.display = 'block';

  if (data.error) {
    alert("Error: " + data.error);
    return;
  }

  if (typeof data.integrantes === 'string') {
    data.integrantes = data.integrantes.split(',').map(n => n.trim()).filter(Boolean);
  } else if (!Array.isArray(data.integrantes)) {
    data.integrantes = [data.familia]; 
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

function generarFormulario() {
  const vistaConfirmada   = document.getElementById('vistaConfirmada');
  const formulario        = document.getElementById('formularioConfirmacion');
  const badge             = document.getElementById('statusBadge');
  const listaIntegrantes  = document.getElementById('listaIntegrantes');

  if (vistaConfirmada) vistaConfirmada.style.display = 'none';
  if (formulario)      formulario.style.display = 'block';
  if (badge)           badge.style.display = 'none';

  if (!listaIntegrantes || !datosGlobal) return;

  let html = "";
  datosGlobal.integrantes.forEach((nom, i) => {
    html += `<div class="familiar-row">
      <span class="familiar-nombre">${nom.trim()}</span>
      <select id="status-${i}">
        <option value="Asistirá">Asistirá ✅</option>
        <option value="No asistirá">No asistirá ❌</option>
      </select>
    </div>`;
  });
  listaIntegrantes.innerHTML = html;
}

function mostrarVistaConfirmada(resumen) {
  const formulario      = document.getElementById('formularioConfirmacion');
  const vistaConfirmada = document.getElementById('vistaConfirmada');
  const badge           = document.getElementById('statusBadge');
  const resumenTexto    = document.getElementById('resumenTexto');
  const qrContainer     = document.getElementById('qr-container');

  if (formulario)      formulario.style.display = 'none';
  if (vistaConfirmada) vistaConfirmada.style.display = 'block';

  const partes = resumen.split('|');
  const hayAsistentes = partes.some(p => {
    const limpio = p.replace('No asistirá', '');
    return limpio.includes('Asistirá');
  });

  if (badge) {
    badge.style.display = 'block';
    if (hayAsistentes) {
      badge.className = 'status-badge status-asiste';
      badge.innerHTML = '✅ ¡Asistencia confirmada! Te esperamos con gusto.';
    } else {
      badge.className = 'status-badge status-no-asiste';
      badge.innerHTML = '🙏 Gracias por avisarnos. ¡Los tendremos en nuestros corazones!';
    }
  }

  if (resumenTexto) resumenTexto.innerText = "Tu respuesta actual: " + resumen;

  // Lógica de inyección del Número de Mesa
  const contenedorMesa = document.getElementById('contenedor-mesa');
  const spanNumeroMesa = document.getElementById('numero-mesa');
  
  if (contenedorMesa && spanNumeroMesa && datosGlobal) {
    if (datosGlobal.mesa && datosGlobal.mesa !== "" && datosGlobal.mesa !== "0") {
      spanNumeroMesa.innerText = datosGlobal.mesa;
      contenedorMesa.style.display = "block";
    } else {
      contenedorMesa.style.display = "none";
    }
  }

  if (!qrContainer || !datosGlobal) return;
  qrContainer.innerHTML = "";

  datosGlobal.integrantes.forEach((nom) => {
    if (resumen.includes(`${nom.trim()}: Asistirá`)) {
      const qrDiv = document.createElement('div');
      qrDiv.className = "pase-qr";
      const qrId = `qr-${nom.trim().replace(/\s+/g, '-')}`;
      qrDiv.innerHTML = `<strong>PASE</strong><br>${nom.trim()}<br><div id="${qrId}"></div>`;
      qrContainer.appendChild(qrDiv);

      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById(qrId), {
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
  if (btn) { btn.innerText = "Guardando..."; btn.disabled = true; }

  const respuestas = [];
  if (datosGlobal) {
    datosGlobal.integrantes.forEach((nom, i) => {
      const sel = document.getElementById('status-' + i);
      if (sel) respuestas.push(`${nom.trim()}: ${sel.value}`);
    });
  }

  const id = new URLSearchParams(window.location.search).get('id');
  const finalResp = respuestas.join(" | ");
  llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardado`);
}

window.procesarGuardado = function(res) {
  if (res.estatus === "ok") {
    location.reload();
  }
};

function initConfirmacion() {
  if (!document.getElementById('confirmacion-loader')) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (id) {
    llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&callback=recibirDatosConfirmacion`);
  }

  window.habilitarEdicion   = habilitarEdicion;
  window.enviarConfirmacion = enviarConfirmacion;
}

/* =========================================
   VALIDADOR — validador.html
   ========================================= */
function initValidador() {
  const reader = document.getElementById('reader');
  if (!reader || typeof Html5QrcodeScanner === 'undefined') return;

  const statusDiv = document.getElementById('validador-status');

  function mostrarMensajeValidador(texto, clase) {
    if (!statusDiv) return;
    statusDiv.innerHTML = texto;
    statusDiv.className = "validador-mensaje " + clase;
    statusDiv.style.display = "block";
  }

  function onScanSuccess(decodedText) {
    html5QrcodeScanner.clear();

    let idInvitado;
    try {
      const url = new URL(decodedText);
      idInvitado = url.searchParams.get("id") || decodedText;
    } catch (e) {
      idInvitado = decodedText;
    }

    mostrarMensajeValidador("Consultando lista en tiempo real...", "validador-consultando");

    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?id=${encodeURIComponent(idInvitado)}&callback=recibirRespuestaValidador`;
    script.onerror = () => mostrarMensajeValidador("Error de red: No se pudo conectar con el servidor.", "validador-error");
    document.body.appendChild(script);
  }

  // Lógica adaptada para mostrar el Número de Mesa en el Escáner
  window.recibirRespuestaValidador = function(data) {
    if (data.familia) {
      let mensajeHTML = "✅ ACCESO PERMITIDO:<br><strong>" + data.familia + "</strong>";
      
      if (data.mesa && data.mesa !== "" && data.mesa !== "0") {
        mensajeHTML += `<br><span style="font-size: 1.3em; color: #b58d3d; display: block; margin-top: 8px;">🪑 MESA: ${data.mesa}</span>`;
      }
      
      mostrarMensajeValidador(mensajeHTML, "validador-exito");
    } else if (data.error) {
      mostrarMensajeValidador("❌ " + data.error, "validador-error");
    } else {
      mostrarMensajeValidador("❌ INVITADO NO ENCONTRADO", "validador-error");
    }
  };

  const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  html5QrcodeScanner.render(onScanSuccess);
}

/* =========================================
   DOM READY — enrutador de páginas
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  initIndex();
  initConfirmacion();
  initValidador();
});