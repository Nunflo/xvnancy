// ==========================================
// 1. CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxr5pBVXdTzze-cBuFv0DnQZkllBFvbRfxLh44ZxbcBRvFLBBjBU4Vaj0TtBd4kSx-HZw/exec";
const validadorURL = "https://xvnancy.vercel.app/validador.html";
let datosGlobal = null;

// ==========================================
// 2. LÓGICA DE NAVEGACIÓN (SOBRE E INVITACIÓN)
// ==========================================

// Función para el botón del sobre (index.html)
function irAConfirmacion(event) {
    event.stopPropagation();
    const params = new URLSearchParams(window.location.search);
    const idInvitado = params.get('id');
    
    if (idInvitado) {
        // Redirige usando ruta absoluta / para Vercel
        window.location.href = `/confirmacion?id=${encodeURIComponent(idInvitado)}`;
    } else {
        alert("Error: No se encontró el ID del invitado en la URL.");
    }
}

function abrirSobre() {
    const sobre = document.getElementById('envelope');
    if (sobre && !sobre.classList.contains('open')) {
        sobre.classList.add('open');
    }
}

// Lógica de apertura con música y pétalos
function abrirInvitacion() {
    const audio = document.getElementById('musica-fondo');
    if (audio) {
        audio.src = "audio/cancion1.mp3"; // O tu lógica de música random
        audio.volume = 0.5;
        audio.play().catch(() => console.warn("Autoplay bloqueado"));
    }

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
                iniciarPetalos();
            }
        }, 1200);
    }
}

// ==========================================
// 3. LÓGICA DE CONFIRMACIÓN (API GOOGLE)
// ==========================================

// Se ejecuta al cargar la página de confirmación
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id && document.getElementById('loader')) {
        llamarGoogle(`${SCRIPT_URL}?id=${encodeURIComponent(id)}&callback=recibirDatos`);
    }
};

function llamarGoogle(url) {
    const s = document.createElement('script');
    s.src = url;
    document.body.appendChild(s);
}

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
    const titulo = document.getElementById('tituloFamilia');
    if (titulo) titulo.innerText = "Familia " + data.familia;

    if (data.confirmacionAnterior) {
        mostrarVistaConfirmada(data.confirmacionAnterior);
    } else {
        generarFormulario();
    }
};

// ... (Aquí puedes mantener tus funciones generarFormulario, enviarConfirmacion, etc.)