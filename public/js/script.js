// ===============================
// URL GOOGLE APPS SCRIPT
// ===============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrFGoUqKJK2xzXqIztaggMq4u3pq-KtFu9pdHlb-ZdwjpJk3fvIOyycV_sbZDr24GcZQ/exec";

// ===============================
// ABRIR INVITACIÓN
// ===============================
function abrirInvitacion() {
    /* =========================================
       1. MÚSICA RANDOM
    ========================================= */
    const canciones = [
        "audio/cancion1.mp3",
        "audio/cancion2.mp3"
    ];

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

    /* =========================================
       2. ANIMACIÓN DEL SOBRE Y CONTENIDO
    ========================================= */
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
            }
        }, 1200);
    }

    /* =========================================
       3. INICIAR EFECTOS (Pétalos y ScrollReveal)
    ========================================= */
    iniciarPetalos();

    if (typeof ScrollReveal !== "undefined") {
        ScrollReveal().reveal('.reveal', {
            delay: 200,
            duration: 800,
            distance: '20px',
            origin: 'bottom',
            interval: 100
        });
    }
}

// ==========================================
// EFECTO DE PÉTALOS MEJORADO (FLUJO CONTINUO)
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
            position: absolute;
            background-color: #ffb7c5;
            border-radius: 150% 0 150% 0;
            opacity: 0;
            transform-origin: center;
            /* Usamos 'forwards' para que mantengan su estado invisible al final */
            animation: caer-fluido linear forwards;
        }
        @keyframes caer-fluido {
            0% { 
                top: -10%; 
                transform: translateX(0) rotate(0deg) scale(0.7); 
                opacity: 0; 
            }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { 
                top: 105%; 
                transform: translateX(120px) rotate(360deg) scale(1); 
                opacity: 0; 
            }
        }
    `;
    document.head.appendChild(style);

    const crearPetalo = () => {
        const p = document.createElement('div');
        p.className = 'petalo';
        
        const size = Math.random() * 8 + 10; 
        const duration = Math.random() * 5 + 6; // Movimiento suave entre 6 y 11 segundos

        Object.assign(p.style, {
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}vw`,
            animationDuration: `${duration}s`,
            filter: `hue-rotate(${Math.random() * 25}deg)`
        });

        contenedor.appendChild(p);

        // Eliminación automática para no saturar el navegador
        setTimeout(() => {
            if (p.parentNode) p.remove();
        }, duration * 1000);
    };

    // Ráfaga inicial para que no empiece vacío
    for(let i = 0; i < 15; i++) {
        setTimeout(crearPetalo, Math.random() * 4000);
    }
    
    // Generación constante cada medio segundo
    setInterval(crearPetalo, 500);
}

// ===============================
// CUENTA REGRESIVA
// ===============================
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

// ===============================
// SLIDER DE FOTOS
// ===============================
let sliderIndex = 0;
setInterval(() => {
    const slider = document.getElementById('slider');
    if (!slider) return;
    const totalFotos = slider.children.length;
    if (totalFotos === 0) return;
    sliderIndex = (sliderIndex + 1) % totalFotos;
    slider.style.transform = `translateX(-${sliderIndex * 100}%)`;
}, 3000);

// ===============================
// PERSONALIZACIÓN Y CARGA INVITADO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const nombreURL = params.get('n');
    const idInvitado = params.get('id');
    const saludoH3 = document.getElementById('saludo-personalizado');
    const nombreSobre = document.getElementById('nombre-invitado-sobre');
    const btnAbrir = document.getElementById('btn-abrir') || document.getElementById('btn-abrir-sobre');

    if (nombreURL) {
        const nombreLimpio = nombreURL.replace(/_/g, ' ');
        const nombreFormateado = nombreLimpio.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (saludoH3) saludoH3.innerText = `¡Hola ${nombreFormateado}!`;
    }

    if (idInvitado) {
        const script = document.createElement('script');
        script.src = `${SCRIPT_URL}?id=${encodeURIComponent(idInvitado.toUpperCase())}&callback=actualizarNombreSobre`;
        document.body.appendChild(script);
    } else {
        if (nombreSobre) nombreSobre.innerText = "¡Te esperamos!";
        if (btnAbrir) btnAbrir.style.display = "inline-block";
    }
});

// ===============================
// CALLBACK GLOBAL JSONP
// ===============================
window.actualizarNombreSobre = function(data) {
    const elementoNombre = document.getElementById('nombre-invitado-sobre');
    const saludo = document.getElementById('saludo-personalizado');
    const btnAbrir = document.getElementById('btn-abrir') || document.getElementById('btn-abrir-sobre');

    if (data && data.familia) {
        if (elementoNombre) elementoNombre.innerText = data.familia;
        if (saludo) saludo.innerText = `¡Hola ${data.familia}!`;
    } else {
        if (elementoNombre) elementoNombre.innerText = "¡Te esperamos!";
    }

    if (btnAbrir) btnAbrir.style.display = "inline-block";
};

function showInvite(data) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('contenido').style.display = 'block';
    const nombreLimpio = data.familia.replace(/_/g, ' ');
    const nombreFormateado = nombreLimpio.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    document.getElementById('tituloFamilia').innerText = "Bienvenidos, " + nombreFormateado;
}

document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmar = document.getElementById('btn-confirmar-asistencia');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function(e) {
            e.preventDefault();
            const urlActual = new URL(window.location.href);
            const idInvitado = urlActual.searchParams.get('id');
            if (idInvitado) {
                window.location.href = `confirmacion?id=${encodeURIComponent(idInvitado)}`;
            } else {
                alert("Error: No se encontró el nombre del invitado en el enlace.");
            }
        });
    }
});

/* validator.html */

// 1. Configuración de URLs y Elementos (se asignarán correctamente al cargar el DOM)
let statusDiv;
let html5QrcodeScanner;

// 2. Función que procesa la respuesta del Excel (Debe ser global para JSONP)
window.recibirRespuesta = function(data) {
    if (data.familia) {
        mostrarMensaje("✅ ACCESO PERMITIDO:<br>" + data.familia, "exito");
    } else if (data.error) {
        mostrarMensaje("❌ " + data.error, "error");
    } else {
        mostrarMensaje("❌ INVITADO NO ENCONTRADO", "error");
    }
};

// 3. Función que se ejecuta al escanear con éxito
function onScanSuccess(decodedText) {
    // Apagamos el escáner (ahora la variable ya existe arriba)
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
    
    let idInvitado;
    try {
        // Extrae el ID si el QR viene como URL completa, si no, toma el texto
        const url = new URL(decodedText);
        idInvitado = url.searchParams.get("id") || decodedText;
    } catch (e) {
        idInvitado = decodedText;
    }

    mostrarMensaje("Consultando lista en tiempo real...", "consultando");

    // Técnica JSONP para evitar bloqueos de seguridad (CORS)
    const finalURL = `${scriptURL}?id=${encodeURIComponent(idInvitado)}&callback=recibirRespuesta`;
    
    const script = document.createElement('script');
    script.src = finalURL;
    script.onerror = () => mostrarMensaje("Error de red: No se pudo conectar con el servidor.", "error");
    document.body.appendChild(script);
}

// 4. Función auxiliar para mostrar mensajes en pantalla
function mostrarMensaje(texto, clase) {
    if (statusDiv) {
        statusDiv.innerHTML = texto;
        statusDiv.className = "mensaje " + clase;
        statusDiv.style.display = "block";
    } else {
        console.log("Mensaje:", texto); // Respaldo en consola si no encuentra el div
    }
}

// 5. Inicialización segura cuando el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    statusDiv = document.getElementById('status');
    
    // Inicializamos el escáner apuntando al contenedor con id="reader"
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
});

//* confirmacion js

    const validadorURL = "https://xvnancy.vercel.app/validador.html";
    let datosGlobal = null;

    window.recibirDatos = function(data) {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('contenido').style.display = 'block';
        
        if (data.error) {
            alert("Error: " + data.error);
            return;
        }

        datosGlobal = data;
        document.getElementById('tituloFamilia').innerText = "Familia " + data.familia;

        // Si ya hay algo escrito en la columna de asistencia (confirmacion)
        if (data.confirmacionAnterior && data.confirmacionAnterior !== "") {
            mostrarVistaConfirmada(data.confirmacionAnterior);
        } else {
            generarFormulario();
        }
    };

    function generarFormulario() {
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
    }

    function mostrarVistaConfirmada(resumen) {
        document.getElementById('formularioConfirmacion').style.display = 'none';
        document.getElementById('vistaConfirmada').style.display = 'block';
        document.getElementById('statusBadge').style.display = 'block';
        document.getElementById('resumenTexto').innerText = "Tu respuesta actual: " + resumen;
        
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = "";

        // Generar QRs solo para los que dicen "Asistirá" en el resumen
        datosGlobal.integrantes.forEach((nom) => {
            if (resumen.includes(`${nom.trim()}: Asistirá`)) {
                const qrDiv = document.createElement('div');
                qrDiv.className = "pase-qr";
                qrDiv.innerHTML = `<strong>PASE</strong><br>${nom.trim()}<br><div id="qr-${nom.trim()}"></div>`;
                qrContainer.appendChild(qrDiv);

                new QRCode(document.getElementById(`qr-${nom.trim()}`), {
                    text: `${validadorURL}?id=${encodeURIComponent(nom.trim())}`,
                    width: 100, height: 100
                });
            }
        });
    }

    function habilitarEdicion() {
        if(confirm("¿Deseas cambiar tu respuesta de asistencia?")) {
            generarFormulario();
        }
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
        
        llamarGoogle(`${scriptURL}?id=${encodeURIComponent(id)}&confirmacion=${encodeURIComponent(finalResp)}&callback=procesarGuardado`);
    }

    window.procesarGuardado = function(res) {
        if (res.estatus === "ok") {
            location.reload(); // Recargamos para que muestre los QRs actualizados
        }
    };

    window.onload = function() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) llamarGoogle(`${scriptURL}?id=${encodeURIComponent(id)}&callback=recibirDatos`);
    };

    function llamarGoogle(url) {
        const s = document.createElement('script');
        s.src = url;
        document.body.appendChild(s);
    }

