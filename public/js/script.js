// ==========================================
// 1. CONFIGURACIÓN GLOBAL
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwaI0l_GYU11y7UgBYSAluj4obmCcjgAJoM6YDxHcAh-_8reIaszdjI-cXhsM4DBSUHKA/exec";
const validadorURL = "https://xvnancy.vercel.app/validador.html";
let datosGlobal = null;

// ==========================================
// 2. INICIALIZACIÓN Y NAVEGACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const idInvitado = params.get('id');
    const esPaginaConfirmacion = document.getElementById('loader') !== null;

    // Lógica para cargar datos según la página
    if (idInvitado) {
        if (esPaginaConfirmacion) {
            llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=recibirDatos`);
        } else {
            llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=actualizarNombreSobre`);
        }
    } else {
        const nombreSobre = document.getElementById('nombre-invitado-sobre');
        if (nombreSobre) nombreSobre.innerText = "¡Te esperamos!";
    }

    // Listener para el botón de confirmar dentro de la invitación
    const btnConfirmar = document.getElementById('btn-confirmar-asistencia');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', (e) => {
            e.preventDefault();
            irAConfirmacion(e);
        });
    }
});

function irAConfirmacion(event) {
    if (event) event.stopPropagation();
    const params = new URLSearchParams(window.location.search);
    const idInvitado = params.get('id');
    
    if (idInvitado) {
        // Redirección absoluta para evitar errores en Vercel
        window.location.href = `/confirmacion?id=${encodeURIComponent(idInvitado)}`;
    } else {
        alert("Error: No se encontró el ID del invitado.");
    }
}

function abrirSobre() {
    const sobre = document.getElementById('envelope');
    if (sobre && !sobre.classList.contains('open')) {
        sobre.classList.add('open');
    }
}

function abrirInvitacion() {
    const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
    const audio = document.getElementById('musica-fondo');

    if (audio) {
        const randomIndex = Math.floor(Math.random() * canciones.length);
        audio.src = canciones[randomIndex]; 
        audio.load(); 
        audio.volume = 0.5;
        audio.play().catch(() => console.warn("Interacción requerida para audio"));
    }

    const pantallaSobre = document.getElementById("pantalla-sobre");
    const contenido = document.getElementById('contenido') || document.getElementById('contenido-invitacion');

    if (pantallaSobre) {
        pantallaSobre.style.transform = "translateY(-100%)";
        pantallaSobre.style.opacity = "0";
        setTimeout(() => {
            pantallaSobre.style.display = "none";
            if (contenido) {
                contenido.classList.add('visible');
                contenido.style.display = 'block';
                iniciarPetalos();
            }
        }, 1200);
    }

    if (typeof ScrollReveal !== "undefined") {
        ScrollReveal().reveal('.reveal', { delay: 200, duration: 800, distance: '20px', origin: 'bottom', interval: 100 });
    }
}

// ==========================================
// 3. COMUNICACIÓN CON GOOGLE (JSONP)
// ==========================================

function llamarGoogle(url) {
    const s = document.createElement('script');
    s.src = url;
    document.body.appendChild(s);
}

window.actualizarNombreSobre = function(data) {
    const elementoNombre = document.getElementById('nombre-invitado-sobre');
    const btnAbrir = document.getElementById('btn-abrir') || document.querySelector('.boton-abrir');
    if (data && data.familia) {
        if (elementoNombre) elementoNombre.innerText = data.familia;
    }
    if (btnAbrir) btnAbrir.style.display = "inline-block";
};

window.recibirDatos = function(data) {
    const loader = document.getElementById('loader');
    const cont = document.getElementById('contenido');
    if (loader) loader.style.display = 'none';
    if (cont) cont.style.display = 'block';
    
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

// ==========================================
// 4. GESTIÓN DE FORMULARIO Y QR
// ==========================================

function generarFormulario() {
    document.getElementById('vistaConfirmada').style.display = 'none';
    document.getElementById('formularioConfirmacion').style.display = 'block';
    
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
    document.getElementById('listaIntegrantes').innerHTML = html;
}

function mostrarVistaConfirmada(resumen) {
    document.getElementById('formularioConfirmacion').style.display = 'none';
    document.getElementById('vistaConfirmada').style.display = 'block';
    document.getElementById('resumenTexto').innerText = "Tu respuesta actual: " + resumen;
    
    const qrContainer = document.getElementById('qr-container');
    qrContainer.innerHTML = "";

    datosGlobal.integrantes.forEach((nom, i) => {
        if (resumen.includes(`${nom.trim()}: Asistirá`)) {
            const qrDiv = document.createElement('div');
            qrDiv.className = "pase-qr";
            qrDiv.innerHTML = `<strong>PASE</strong><br>${nom.trim()}<br><div id="qr-code-${i}"></div>`;
            qrContainer.appendChild(qrDiv);

            new QRCode(document.getElementById(`qr-code-${i}`), {
                text: `${validadorURL}?id=${encodeURIComponent(nom.trim())}`,
                width: 100, height: 100
            });
        }
    });
}

function enviarConfirmacion() {
    const btn = document.getElementById('btnEnviar');
    btn.innerText = "Guardando...";
    btn.disabled = true;

    let respuestas = [];
    datosGlobal.integrantes.forEach((nom, i) => {
        respuestas.push(`${nom.trim()}: ${document.getElementById('status-'+i).value}`);
    });

    const id = new URLSearchParams(window.location.search).get('id');
    const finalResp = respuestas.join(" | ");
    
    llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardado`);
}

window.procesarGuardado = function(res) {
    if (res.estatus === "ok") location.reload();
};

function habilitarEdicion() {
    if(confirm("¿Deseas cambiar tu respuesta de asistencia?")) {
        generarFormulario();
    }
}

// ==========================================
// 5. EFECTOS VISUALES (PÉTALOS Y CUENTA REGRESIVA)
// ==========================================

function iniciarPetalos() {
    const contenedor = document.createElement('div');
    contenedor.id = 'sakura-container';
    Object.assign(contenedor.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '9999', overflow: 'hidden'
    });
    document.body.appendChild(contenedor);

    const style = document.createElement('style');
    style.innerHTML = `
        .petalo {
            position: absolute; background-color: #ffb7c5;
            border-radius: 150% 0 150% 0; opacity: 0;
            transform-origin: center; animation: caer-fluido linear forwards;
        }
        @keyframes caer-fluido {
            0% { top: -10%; transform: translateX(0) rotate(0deg) scale(0.7); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { top: 105%; transform: translateX(120px) rotate(360deg) scale(1); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    const crearPetalo = () => {
        const p = document.createElement('div');
        p.className = 'petalo';
        const size = Math.random() * 8 + 10; 
        const duration = Math.random() * 5 + 6;
        Object.assign(p.style, {
            width: `${size}px`, height: `${size}px`,
            left: `${Math.random() * 100}vw`, animationDuration: `${duration}s`
        });
        contenedor.appendChild(p);
        setTimeout(() => p.remove(), duration * 1000);
    };
    setInterval(crearPetalo, 500);
}

// Cuenta Regresiva
const fechaEvento = new Date("Aug 15, 2026 18:00:00").getTime();
setInterval(() => {
    const ahora = new Date().getTime();
    const distancia = fechaEvento - ahora;
    if (distancia < 0) return;
    const dias = document.getElementById("dias");
    if (dias) {
        dias.innerText = Math.floor(distancia / (1000 * 60 * 60 * 24));
        document.getElementById("horas").innerText = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById("minutos").innerText = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById("segundos").innerText = Math.floor((distancia % (1000 * 60)) / 1000);
    }
}, 1000);

// Slider
let sliderIndex = 0;
setInterval(() => {
    const slider = document.getElementById('slider');
    if (!slider || slider.children.length === 0) return;
    sliderIndex = (sliderIndex + 1) % slider.children.length;
    slider.style.transform = `translateX(-${sliderIndex * 100}%)`;
}, 3000);