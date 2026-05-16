// ===============================
// URL GOOGLE APPS SCRIPT
// ===============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrFGoUqKJK2xzXqIztaggMq4u3pq-KtFu9pdHlb-ZdwjpJk3fvIOyycV_sbZDr24GcZQ/exec";

// ===============================
// ABRIR INVITACIÓN (Solo para index.html)
// ===============================
function abrirInvitacion() {
    /* 1. MÚSICA RANDOM */
    const canciones = ["audio/cancion1.mp3", "audio/cancion2.mp3"];
    const audio = document.getElementById('musica-fondo');

    if (audio) {
        const randomIndex = Math.floor(Math.random() * canciones.length);
        audio.src = canciones[randomIndex]; 
        audio.load(); 
        audio.volume = 0.5;

        audio.play().then(() => {
            console.log("Reproduciendo: " + canciones[randomIndex]);
        }).catch(error => {
            console.warn("El navegador bloqueó el autoplay. Se requiere interacción.");
        });
    }

    /* 2. ANIMACIÓN DEL SOBRE Y CONTENIDO */
    const pantallaSobre = document.getElementById("pantalla-sobre");
    const contenido = document.getElementById('contenido');

    if (pantallaSobre) {
        pantallaSobre.style.transform = "translateY(-100%)";
        pantallaSobre.style.opacity = "0";

        setTimeout(() => {
            pantallaSobre.style.display = "none";
            if (contenido) {
                contenido.classList.add('visible');
                contenido.style.display = 'block';
            }
        }, 1200);
    }

    /* 3. INICIAR EFECTOS (Pétalos y ScrollReveal) */
    iniciarPetalos();

    if (typeof ScrollReveal !== "undefined") {
        ScrollReveal().reveal('.reveal', {
            delay: 200, duration: 800, distance: '20px', origin: 'bottom', interval: 100
        });
    }
}

// ==========================================
// EFECTO DE PÉTALOS
// ==========================================
function iniciarPetalos() {
    // Si ya existe el contenedor duro en el HTML, lo usamos, si no, lo creamos.
    let contenedor = document.getElementById('contenedor-petalos');
    if(!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'contenedor-petalos';
        Object.assign(contenedor.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '9999', overflow: 'hidden'
        });
        document.body.appendChild(contenedor);
    }

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
            width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}vw`,
            animationDuration: `${duration}s`, filter: `hue-rotate(${Math.random() * 25}deg)`
        });
        contenedor.appendChild(p);
        setTimeout(() => { if (p.parentNode) p.remove(); }, duration * 1000);
    };

    for(let i = 0; i < 15; i++) { setTimeout(crearPetalo, Math.random() * 4000); }
    setInterval(crearPetalo, 500);
}

// ===============================
// EJECUCIÓN CONDICIONAL POR PÁGINA (EVITA ERRORES DE CONSOLA)
// ===============================
const rutaActual = window.location.pathname;

// ---------------------------------------------------------
// BLOQUE 1: CÓDIGO EXCLUSIVO PARA LA INVITACIÓN (index.html)
// ---------------------------------------------------------
if (!rutaActual.includes("validador") && !rutaActual.includes("confirmacion")) {
    
    // Cuenta Regresiva
    const fechaEvento = new Date("Aug 15, 2026 18:00:00").getTime();
    setInterval(() => {
        const ahora = new Date().getTime();
        const distancia = fechaEvento - ahora;
        if (distancia < 0) return;

        const dias = document.getElementById("dias");
        const horas = document.getElementById("horas");
        const minutos = document.getElementById("minutos");
        const segundos = document.getElementById("segundos");

        if (dias) dias.innerText = Math.floor(distancia / (1000 * 60 * 60 * 24));
        if (horas) horas.innerText = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (minutos) minutos.innerText = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        if (segundos) segundos.innerText = Math.floor((distancia % (1000 * 60)) / 1000);
    }, 1000);

    // Slider de Fotos
    let sliderIndex = 0;
    setInterval(() => {
        const slider = document.getElementById('slider');
        if (!slider) return;
        const totalFotos = slider.children.length;
        if (totalFotos === 0) return;
        sliderIndex = (sliderIndex + 1) % totalFotos;
        slider.style.transform = `translateX(-${sliderIndex * 100}%)`;
    }, 3000);

    // Carga de Nombre en el Sobre
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const idInvitado = params.get('id');
        const nombreSobre = document.getElementById('nombre-invitado-sobre');
        const btnAbrir = document.querySelector('.boton-abrir');

        if (idInvitado) {
            const script = document.createElement('script');
            script.src = `${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=actualizarNombreSobre`;
            document.body.appendChild(script);
        } else {
            if (nombreSobre) nombreSobre.innerText = "¡Te esperamos!";
            if (btnAbrir) btnAbrir.style.display = "flex"; // Usa flex por tu CSS
        }
        
        // Listener para el botón de confirmar
        const btnConfirmar = document.getElementById('btn-confirmar-asistencia');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', function(e) {
                e.preventDefault();
                if (idInvitado) {
                    window.location.href = `confirmacion.html?id=${encodeURIComponent(idInvitado)}`;
                } else {
                    alert("Error: No se encontró el ID del invitado en el enlace.");
                }
            });
        }
    });

    window.actualizarNombreSobre = function(data) {
        const elementoNombre = document.getElementById('nombre-invitado-sobre');
        const btnAbrir = document.querySelector('.boton-abrir');

        if (data && data.familia) {
            if (elementoNombre) elementoNombre.innerText = data.familia;
        } else {
            if (elementoNombre) elementoNombre.innerText = "¡Te esperamos!";
        }
        if (btnAbrir) btnAbrir.style.display = "flex";
    };
}

// ---------------------------------------------------------
// BLOQUE 2: CÓDIGO EXCLUSIVO PARA VALIDADOR (validador.html)
// ---------------------------------------------------------
if (rutaActual.includes("validador.html")) {
    let statusDiv;
    let html5QrcodeScanner;

    window.recibirRespuesta = function(data) {
        if (data.familia) {
            mostrarMensaje("✅ ACCESO PERMITIDO:<br>" + data.familia, "exito");
        } else if (data.error) {
            mostrarMensaje("❌ " + data.error, "error");
        } else {
            mostrarMensaje("❌ INVITADO NO ENCONTRADO", "error");
        }
    };

    window.onScanSuccess = function(decodedText) {
        if (html5QrcodeScanner) html5QrcodeScanner.clear();
        
        let idInvitado;
        try {
            const url = new URL(decodedText);
            idInvitado = url.searchParams.get("id") || decodedText;
        } catch (e) {
            idInvitado = decodedText;
        }

        mostrarMensaje("Consultando lista en tiempo real...", "consultando");
        const script = document.createElement('script');
        script.src = `${SCRIPT_URL}?id=${encodeURIComponent(idInvitado)}&callback=recibirRespuesta`;
        script.onerror = () => mostrarMensaje("Error de red.", "error");
        document.body.appendChild(script);
    };

    function mostrarMensaje(texto, clase) {
        if (statusDiv) {
            statusDiv.innerHTML = texto;
            statusDiv.className = "mensaje " + clase;
            statusDiv.style.display = "block";
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        statusDiv = document.getElementById('status');
        if (typeof Html5QrcodeScanner !== "undefined") {
            html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            html5QrcodeScanner.render(window.onScanSuccess);
        }
    });
}

// ---------------------------------------------------------
// BLOQUE 3: CÓDIGO EXCLUSIVO PARA CONFIRMACIÓN (confirmacion.html)
// ---------------------------------------------------------
if (rutaActual.includes("confirmacion.html")) {
    const validadorURL = "https://xvnancy.vercel.app/validador.html";
    let datosGlobal = null;

    window.recibirDatos = function(data) {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('contenido').style.display = 'block';
        
        if (data.error) { alert("Error: " + data.error); return; }

        datosGlobal = data;
        document.getElementById('tituloFamilia').innerText = "Familia " + data.familia;

        if (data.confirmacionAnterior && data.confirmacionAnterior !== "") {
            mostrarVistaConfirmada(data.confirmacionAnterior);
        } else {
            generarFormulario();
        }
    };

    window.generarFormulario = function() {
        document.getElementById('vistaConfirmada').style.display = 'none';
        document.getElementById('formularioConfirmacion').style.display = 'block';
        document.getElementById('statusBadge').style.display = 'none';
        
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
    };

    window.mostrarVistaConfirmada = function(resumen) {
        document.getElementById('formularioConfirmacion').style.display = 'none';
        document.getElementById('vistaConfirmada').style.display = 'block';
        document.getElementById('statusBadge').style.display = 'block';
        document.getElementById('resumenTexto').innerText = "Tu respuesta actual: " + resumen;
        
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = "";

        datosGlobal.integrantes.forEach((nom) => {
            if (resumen.includes(`${nom.trim()}: Asistirá`)) {
                const qrDiv = document.createElement('div');
                qrDiv.className = "pase-qr";
                qrDiv.innerHTML = `<strong>PASE</strong><br>${nom.trim()}<br><div id="qr-${nom.trim()}"></div>`;
                qrContainer.appendChild(qrDiv);
                
                if (typeof QRCode !== "undefined") {
                    new QRCode(document.getElementById(`qr-${nom.trim()}`), {
                        text: `${validadorURL}?id=${encodeURIComponent(nom.trim())}`,
                        width: 100, height: 100
                    });
                }
            }
        });
    };

    window.habilitarEdicion = function() {
        if(confirm("¿Deseas cambiar tu respuesta de asistencia?")) generarFormulario();
    };

    window.enviarConfirmacion = function() {
        const btn = document.getElementById('btnEnviar');
        btn.innerText = "Guardando..."; btn.disabled = true;

        let respuestas = [];
        datosGlobal.integrantes.forEach((nom, i) => {
            respuestas.push(`${nom.trim()}: ${document.getElementById('status-'+i).value}`);
        });

        const id = new URLSearchParams(window.location.search).get('id');
        const finalResp = respuestas.join(" | ");
        
        const s = document.createElement('script');
        s.src = `${SCRIPT_URL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardado`;
        document.body.appendChild(s);
    };

    window.procesarGuardado = function(res) {
        if (res.estatus === "ok") location.reload(); 
    };

    window.onload = function() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) {
            const s = document.createElement('script');
            s.src = `${SCRIPT_URL}?id=${encodeURIComponent(id)}&callback=recibirDatos`;
            document.body.appendChild(s);
        }
    };
}