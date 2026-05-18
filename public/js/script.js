/* =========================================
   SCRIPT.JS — XV Nancy Paola v4 (FIX TOTAL QR)
   index + confirmacion + validador unificados
   ========================================= */

const SCRIPT_URL  = "https://script.google.com/macros/s/AKfycbyeRpw-QAT79QffGz8aDBHbMfuxnm4GWWg2HsAhirW1y-xNMTBYZh780X6zC8cZLzUEfQ/exec";
const VALIDADOR_URL = "https://xvnancy.vercel.app/validador.html";

/* ── JSONP ── */
function llamarGoogle(url) {
  const s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

/* =========================================
   INDEX.HTML — abrir invitación
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

/* ── Pétalos ── */
function iniciarPetalos() {
  if (document.getElementById('sakura-container')) return;
  const contenedor = document.createElement('div');
  contenedor.id = 'sakura-container';
  Object.assign(contenedor.style, {
    position:'fixed', top:'0', left:'0', width:'100%', height:'100%',
    pointerEvents:'none', zIndex:'9998', overflow:'hidden'
  });
  document.body.appendChild(contenedor);

  const style = document.createElement('style');
  style.innerHTML = `
    .petalo { position:absolute; background-color:#ffb7c5; border-radius:150% 0 150% 0;
      opacity:0; transform-origin:center; animation:caer-fluido linear forwards; }
    @keyframes caer-fluido {
      0%   { top:-10%; transform:translateX(0) rotate(0deg) scale(0.7); opacity:0; }
      10%  { opacity:0.8; }
      90%  { opacity:0.8; }
      100% { top:105%; transform:translateX(120px) rotate(360deg) scale(1); opacity:0; }
    }`;
  document.head.appendChild(style);

  const crear = () => {
    const p = document.createElement('div');
    p.className = 'petalo';
    const size = Math.random() * 8 + 10;
    const dur  = Math.random() * 5 + 6;
    Object.assign(p.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${dur}s`,
      filter: `hue-rotate(${Math.random() * 25}deg)`
    });
    contenedor.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000);
  };
  for (let i = 0; i < 15; i++) setTimeout(crear, Math.random() * 4000);
  setInterval(crear, 500);
}

/* ── Cuenta regresiva ── */
const fechaEvento = new Date("Aug 15, 2026 18:00:00").getTime();
setInterval(() => {
  const d = fechaEvento - Date.now();
  if (d < 0) return;
  const get = id => document.getElementById(id);
  if (get('dias'))     get('dias').innerText     = Math.floor(d / 86400000);
  if (get('horas'))    get('horas').innerText    = Math.floor((d % 86400000) / 3600000);
  if (get('minutos'))  get('minutos').innerText  = Math.floor((d % 3600000)  / 60000);
  if (get('segundos')) get('segundos').innerText = Math.floor((d % 60000)    / 1000);
}, 1000);

/* ── Carrusel ── */
function initCarrusel() {
  const slider      = document.getElementById('slider');
  const dotsWrapper = document.querySelector('.carousel-dots');
  if (!slider) return;
  const imgs = Array.from(slider.children);
  const total = imgs.length;
  let idx = 0, timer;

  if (dotsWrapper) {
    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Foto ${i + 1}`);
      dot.addEventListener('click', () => ir(i));
      dotsWrapper.appendChild(dot);
    });
  }

  const actualizarDots = () => {
    if (!dotsWrapper) return;
    dotsWrapper.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  };
  const ir = nuevoIdx => {
    idx = (nuevoIdx + total) % total;
    slider.style.transform = `translateX(-${idx * 100}%)`;
    actualizarDots();
    reiniciarTimer();
  };
  const reiniciarTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => ir(idx + 1), 3500);
  };
  const prev = document.querySelector('.carousel-btn.prev');
  const next = document.querySelector('.carousel-btn.next');
  if (prev) prev.addEventListener('click', () => ir(idx - 1));
  if (next) next.addEventListener('click', () => ir(idx + 1));
  reiniciarTimer();
}

/* ── Nombre en el sobre ── */
window.actualizarNombreSobre = function(data) {
  const el = document.getElementById('nombre-invitado-sobre');
  if (el) el.innerText = (data && data.familia) ? data.familia : '¡Te esperamos!';
};

/* ── Init index ── */
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

  const btnConf = document.getElementById('btn-confirmar-asistencia');
  if (btnConf) {
    btnConf.addEventListener('click', e => {
      e.preventDefault();
      if (idInvitado) window.location.href = `confirmacion.html?id=${encodeURIComponent(idInvitado)}`;
      else alert('Error: No se encontró el ID en el enlace.');
    });
  }
  initCarrusel();
}

/* =========================================
   CONFIRMACION.HTML
   ========================================= */
let datosGlobal = null;

window.recibirDatosConfirmacion = function(data) {
  const loader    = document.getElementById('confirmacion-loader');
  const contenido = document.getElementById('confirmacion-contenido');
  if (loader)    loader.style.display = 'none';
  if (contenido) contenido.style.display = 'block';

  if (data.error) { alert("Error: " + data.error); return; }

  if (typeof data.integrantes === 'string') {
    data.integrantes = data.integrantes.split(',').map(n => n.trim()).filter(Boolean);
  } else if (!Array.isArray(data.integrantes)) {
    data.integrantes = [data.familia];
  }

  datosGlobal = data;
  const titulo = document.getElementById('tituloFamilia');
  if (titulo) {
    const nombreFamilia = data.familia || '';
    const prefijo = /^famili/i.test(nombreFamilia.trim()) ? '' : 'Familia ';
    titulo.innerText = prefijo + nombreFamilia;
  }

  if (data.confirmacionAnterior && data.confirmacionAnterior !== "") {
    mostrarVistaConfirmada(data.confirmacionAnterior);
  } else {
    generarFormulario();
  }
};

function generarFormulario() {
  const el = id => document.getElementById(id);
  if (el('vistaConfirmada'))        el('vistaConfirmada').style.display        = 'none';
  if (el('formularioConfirmacion')) el('formularioConfirmacion').style.display = 'block';
  if (el('statusBadge'))            el('statusBadge').style.display            = 'none';
  if (!el('listaIntegrantes') || !datosGlobal) return;

  let html = "";
  datosGlobal.integrantes.forEach((nom, i) => {
    html += `
      <div class="familiar-row">
        <span class="familiar-nombre">${nom.trim()}</span>
        <select id="status-${i}">
          <option value="Asistirá">Asistirá ✅</option>
          <option value="No asistirá">No asistirá ❌</option>
        </select>
      </div>`;
  });
  el('listaIntegrantes').innerHTML = html;
}

function mostrarVistaConfirmada(resumen) {
  const el = id => document.getElementById(id);
  if (el('formularioConfirmacion')) el('formularioConfirmacion').style.display = 'none';
  if (el('vistaConfirmada'))        el('vistaConfirmada').style.display        = 'block';

  const hayAsistentes = resumen.split('|').some(p =>
    /asistirá/i.test(p.replace(/No asistirá/gi, ''))
  );
  const badge = el('statusBadge');
  if (badge) {
    badge.style.display = 'block';
    if (hayAsistentes) {
      badge.className  = 'status-badge status-asiste';
      badge.innerHTML  = '✅ ¡Asistencia confirmada! Te esperamos con gusto.';
    } else {
      badge.className  = 'status-badge status-no-asiste';
      badge.innerHTML  = '🙏 Gracias por avisarnos. ¡Los tendremos en nuestros corazones!';
    }
  }

  if (el('resumenTexto')) el('resumenTexto').innerText = "Tu respuesta: " + resumen;

  const itSec = el('itinerario-section');
  if (itSec) itSec.style.display = hayAsistentes ? 'block' : 'none';

  const qrContainer = el('qr-container');
  if (!qrContainer || !datosGlobal) return;
  qrContainer.innerHTML = "";

  datosGlobal.integrantes.forEach(nom => {
    const nombre  = nom.trim();
    const partes  = resumen.split('|');
    const asiste  = partes.some(p => {
      const limpio = p.replace(/No asistirá/gi, '');
      return limpio.includes(nombre) && /asistirá/i.test(limpio);
    });
    if (!asiste) return;

    let mesaInd = '';
    if (datosGlobal.mesasIndividuales && datosGlobal.mesasIndividuales[nombre]) {
      mesaInd = datosGlobal.mesasIndividuales[nombre];
    } else {
      const idxIntegrante = datosGlobal.integrantes.indexOf(nom);
      const mesaRaw = datosGlobal.mesaFamilia || datosGlobal.mesa || '';
      if (mesaRaw.includes(',')) {
        const mesasArr = mesaRaw.split(',').map(m => m.trim());
        mesaInd = mesasArr[idxIntegrante] || mesasArr[0] || mesaRaw;
      } else {
        mesaInd = mesaRaw;
      }
    }

    const urlQR  = `${VALIDADOR_URL}?tipo=integrante&id=${encodeURIComponent(nombre)}&validar=validar`;
    const paseId = `pase-${nombre.replace(/\s+/g, '-')}`;
    const qrId   = `qr-${nombre.replace(/\s+/g, '-')}`;

    const tarjeta = document.createElement('div');
    tarjeta.className = 'pase-individual';
    tarjeta.id = paseId;
    tarjeta.innerHTML = `
      <div class="pase-header">
        <span class="pase-evento">XV Años · Nancy Paola</span>
        <span class="pase-fecha">15 · AGO · 2026</span>
      </div>
      <div class="pase-body">
        <p class="pase-nombre">${nombre}</p>
        ${mesaInd ? `<div class="pase-mesa">🪑 Mesa <strong>${mesaInd}</strong></div>` : ''}
        <div id="${qrId}" class="pase-qr-wrap"></div>
      </div>
      <div class="pase-footer">
        <span>Pase de acceso personal · No transferible</span>
      </div>
    `;
    qrContainer.appendChild(tarjeta);

    if (typeof QRCode !== 'undefined') {
      new QRCode(document.getElementById(qrId), {
        text: urlQR, width: 110, height: 110,
        colorDark: '#5A0D15', colorLight: '#ffffff'
      });
    }

    const btnGuardar = document.createElement('button');
    btnGuardar.className = 'btn-guardar-pase';
    btnGuardar.textContent = '💾 Guardar pase';
    btnGuardar.onclick = () => guardarPaseImagen(paseId, nombre);
    tarjeta.appendChild(btnGuardar);
  });
}

function guardarPaseImagen(paseId, nombre) {
  const el = document.getElementById(paseId);
  if (!el || typeof html2canvas === 'undefined') {
    alert('No se pudo guardar el pase. Por favor toma una captura de pantalla.');
    return;
  }
  html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    .then(canvas => {
      const link = document.createElement('a');
      link.download = `Pase-XV-${nombre.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    })
    .catch(() => {
      alert('Ocurrió un error al generar la imagen. Por favor toma una captura de pantalla.');
    });
}

function habilitarEdicion() {
  if (confirm("¿Deseas cambiar tu respuesta de asistencia?")) generarFormulario();
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
  if (!id) {
    if (btn) { btn.innerText = "Guardar Confirmación"; btn.disabled = false; }
    alert('Error: No se encontró el ID del invitado.');
    return;
  }

  const finalResp = respuestas.join(" | ");
  const url = `${SCRIPT_URL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardado`;
  
  const scriptJSONP = document.createElement('script');
  scriptJSONP.src = url;
  scriptJSONP.onerror = function() {
    if (btn) { btn.innerText = "Guardar Confirmación"; btn.disabled = false; }
    alert("Error de red al guardar. Verifica tu conexión e intenta de nuevo.");
  };
  document.body.appendChild(scriptJSONP);
}

window.procesarGuardado = function(res) {
  const btn = document.getElementById('btnEnviar');
  if (res && res.estatus === "ok") {
    lanzarConfeti();
    setTimeout(() => {
      if(datosGlobal) datosGlobal.confirmacionAnterior = _obtenerRespuestasActuales();
      location.reload();
    }, 2200);
  } else {
    if (btn) { btn.innerText = "Guardar Confirmación"; btn.disabled = false; }
    alert("Hubo un problema al guardar. Intenta de nuevo.");
  }
};

function _obtenerRespuestasActuales() {
  if (!datosGlobal) return '';
  return datosGlobal.integrantes.map((nom, i) => {
    const sel = document.getElementById('status-' + i);
    return `${nom.trim()}: ${sel ? sel.value : 'Asistirá'}`;
  }).join(' | ');
}

function lanzarConfeti() {
  const canvas = document.getElementById('confeti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const colores = ['#C5A059', '#5A0D15', '#ffb7c5', '#fff', '#f3e5ab', '#800020'];
  const particulas = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 200,
    w: Math.random() * 10 + 5,
    h: Math.random() * 5 + 3,
    color: colores[Math.floor(Math.random() * colores.length)],
    rot: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 3,
    vy: Math.random() * 4 + 2,
    vr: (Math.random() - 0.5) * 0.2
  }));

  let frame = 0;
  const animar = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.vr;
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animar);
    else canvas.style.display = 'none';
  };
  requestAnimationFrame(animar);
}

function initConfirmacion() {
  const loader = document.getElementById('confirmacion-loader');
  if (!loader) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    if (loader) loader.innerText = 'Enlace inválido. No se encontró el ID del invitado.';
    return;
  }

  llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&callback=recibirDatosConfirmacion`);
}

/* =========================================
   VALIDADOR.HTML (REESTRUCTURADO SIN BUGS)
   ========================================= */
const historialSesion = [];
let scannerLock = false; 
let html5QrCodeInstance = null; // Guardar la referencia del stream de video

function buscarManual() {
  const input = document.getElementById('busqueda-manual');
  if (!input || !input.value.trim()) return;
  const nombre = input.value.trim();

  _mostrarValidador('🔍 Consultando...', 'validador-consultando');

  const script = document.createElement('script');
  script.src = `${SCRIPT_URL}?tipo=integrante&id=${encodeURIComponent(nombre)}&confirmacion=validar&callback=recibirRespuestaValidador`;
  script.onerror = () => _mostrarValidador('❌ Error de conexión', 'validador-error');
  document.body.appendChild(script);
}

function _agregarHistorial(nombre, familia, mesa, ok, duplicado) {
  const ahora = new Date().toLocaleTimeString('es-MX');
  historialSesion.unshift({ nombre, familia, mesa, ok, duplicado, hora: ahora });

  const wrapper  = document.getElementById('historial-wrapper');
  const lista    = document.getElementById('historial-lista');
  const contador = document.getElementById('historial-contador');
  if (!lista || !wrapper) return;

  wrapper.style.display = 'block';
  if (contador) contador.textContent = historialSesion.length;

  const recientes = historialSesion.slice(0, 8);
  lista.innerHTML = recientes.map(h => `
    <div class="historial-item ${h.duplicado ? 'historial-dup' : h.ok ? 'historial-ok' : 'historial-err'}">
      <div class="historial-nombre">${h.nombre}</div>
      <div class="historial-detalle">
        ${h.mesa ? `🪑 Mesa ${h.mesa} · ` : ''}
        <span class="historial-hora">${h.hora}</span>
      </div>
    </div>
  `).join('');
}

function _mostrarValidador(texto, clase) {
  const div = document.getElementById('validador-status');
  if (!div) return;
  div.innerHTML = texto;
  div.className = 'validador-mensaje ' + clase;
  div.style.display = 'block';
}

function initValidador() {
  const reader = document.getElementById('reader');
  if (!reader) return;

  window.recibirRespuestaValidador = function(data) {
    scannerLock = false; 

    if (!data) { _mostrarValidador('❌ Sin respuesta del servidor', 'validador-error'); return; }

    if (data.error) {
      _mostrarValidador('❌ Error: ' + data.error, 'validador-error');
      return;
    }

    if (data.acceso === 'DUPLICADO') {
      _mostrarValidador(
        `⚠️ <strong>ACCESO YA REGISTRADO</strong><br>${data.nombre}<br><small>Escaneado: ${data.escaneadoEn}</small>`,
        'validador-error'
      );
      _agregarHistorial(data.nombre, data.familia||'', data.mesa||'', false, true);
      return;
    }

    if (data.nombre && data.acceso === 'OK') {
      _mostrarValidador(
        `✅ <strong>ACCESO PERMITIDO</strong><br>
         <span style="font-size:1.2rem;font-family:'Cormorant Garamond',serif">${data.nombre}</span><br>
         ${data.familia ? `👨‍👩‍👧 ${data.familia}<br>` : ''}
         ${data.mesa    ? `🪑 Mesa: <strong>${data.mesa}</strong>` : ''}`,
        'validador-exito'
      );
      _agregarHistorial(data.nombre, data.familia||'', data.mesa||'', true, false);
      return;
    }

    _mostrarValidador('❌ NO ENCONTRADO EN LISTA', 'validador-error');
  };

  // CASO A: El usuario llegó al validador vía link directo de su código QR nativo
  const params = new URLSearchParams(window.location.search);
  const idUrl = params.get('id');
  const validarUrl = params.get('validar');

  if (idUrl && validarUrl === 'validar') {
    _mostrarValidador('🔍 Consultando acceso...', 'validador-consultando');
    const tipoUrl = params.get('tipo') || 'integrante';
    const s = document.createElement('script');
    s.src = `${SCRIPT_URL}?tipo=${tipoUrl}&id=${encodeURIComponent(idUrl)}&confirmacion=validar&callback=recibirRespuestaValidador`;
    s.onerror = () => _mostrarValidador('❌ Error de conexión al servidor', 'validador-error');
    document.body.appendChild(s);
    reader.style.display = 'none'; 
    return;
  }

  // CASO B: Uso del escáner en vivo desde la página del validador
  if (typeof Html5Qrcode === 'undefined') {
    _mostrarValidador('❌ Error: Librería de QR no cargada.', 'validador-error');
    return;
  }

  const onScanSuccess = (decodedText) => {
    if (scannerLock) return; 
    scannerLock = true;

    _mostrarValidador('🔍 Consultando...', 'validador-consultando');

    let idInvitado, tipo = 'integrante';
    try {
      const url = new URL(decodedText);
      idInvitado = url.searchParams.get('id') || decodedText;
      tipo       = url.searchParams.get('tipo') || 'integrante';
    } catch (e) { idInvitado = decodedText; }

    const s = document.createElement('script');
    s.src = `${SCRIPT_URL}?tipo=${tipo}&id=${encodeURIComponent(idInvitado)}&confirmacion=validar&callback=recibirRespuestaValidador`;
    s.onerror = () => {
      _mostrarValidador('❌ Error de red', 'validador-error');
      scannerLock = false;
    };
    document.body.appendChild(s);

    // Apagamos el stream de video limpiamente tras leer para no colgar la cámara
    if (html5QrCodeInstance) {
      html5QrCodeInstance.stop().catch(err => console.log("Cámara detenida."));
    }
  };

  // Inicialización directa sobre el canvas/video sin código HTML inyectado de terceros
  try {
    html5QrCodeInstance = new Html5Qrcode("reader");
    html5QrCodeInstance.start(
      { facingMode: "environment" }, 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      () => { /* Mantener vacío para silenciar logs continuos en consola */ }
    ).catch(err => {
      console.error(err);
      _mostrarValidador('📷 Error de cámara. Concede permisos o cierra otras apps.', 'validador-error');
    });
  } catch (e) {
    console.error(e);
  }
}

/* =========================================
   DOM READY — inicializador global
   ========================================= */
window.enviarConfirmacion = enviarConfirmacion;
window.habilitarEdicion   = habilitarEdicion;
window.guardarPaseImagen  = guardarPaseImagen;
window.buscarManual       = buscarManual;

document.addEventListener('DOMContentLoaded', () => {
  initIndex();
  initConfirmacion();
  initValidador();
});