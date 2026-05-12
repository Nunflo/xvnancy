// ===============================
// URL GOOGLE APPS SCRIPT
// ===============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbza_eUt32I_EQIpUJfRGigpXw-Y-0HbmfkXrB0cZPsBP7OnyKS_RnFjnWijdoSxtdoQrQ/exec";

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
            
            // Hacer visible el contenido después de que el sobre se mueva
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

// ===============================
// CUENTA REGRESIVA
// ===============================
const fechaEvento =
    new Date("Aug 15, 2026 18:00:00").getTime();

setInterval(() => {

    const ahora = new Date().getTime();

    const distancia = fechaEvento - ahora;

    if (distancia < 0) return;

    const dias = document.getElementById("dias");
    const horas = document.getElementById("horas");
    const minutos = document.getElementById("minutos");
    const segundos = document.getElementById("segundos");

    if (dias) {
        dias.innerText = Math.floor(
            distancia / (1000 * 60 * 60 * 24)
        );
    }

    if (horas) {
        horas.innerText = Math.floor(
            (distancia % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );
    }

    if (minutos) {
        minutos.innerText = Math.floor(
            (distancia % (1000 * 60 * 60)) /
            (1000 * 60)
        );
    }

    if (segundos) {
        segundos.innerText = Math.floor(
            (distancia % (1000 * 60)) / 1000
        );
    }

}, 1000);


// ===============================
// SLIDER DE FOTOS
// ===============================
let sliderIndex = 0;

setInterval(() => {

    const slider = document.getElementById('slider');

    if (!slider) return;

    // Detecta automáticamente cuántas fotos hay
    const totalFotos = slider.children.length;

    if (totalFotos === 0) return;

    sliderIndex = (sliderIndex + 1) % totalFotos;

    slider.style.transform =
        `translateX(-${sliderIndex * 100}%)`;

}, 3000);


// ===============================
// PERSONALIZACIÓN Y CARGA INVITADO
// ===============================
document.addEventListener('DOMContentLoaded', () => {

    const params =
        new URLSearchParams(window.location.search);

    const nombreURL = params.get('n');
    const idInvitado = params.get('id');

    const saludoH3 =
        document.getElementById('saludo-personalizado');

    const nombreSobre =
        document.getElementById('nombre-invitado-sobre');

    const nombreInvitado =
        document.getElementById('nombre-invitado');

    const btnAbrir =
        document.getElementById('btn-abrir') ||
        document.getElementById('btn-abrir-sobre');



    // ==========================
    // NOMBRE DESDE URL (?n=)
    // ==========================
    if (nombreURL) {

        const nombreLimpio =
            nombreURL.replace(/_/g, ' ');

        // Formato:
        // "juan perez" -> "Juan Perez"
        const nombreFormateado =
            nombreLimpio
                .split(' ')
                .map(w =>
                    w.charAt(0).toUpperCase() +
                    w.slice(1).toLowerCase()
                )
                .join(' ');

        if (saludoH3) {
            saludoH3.innerText =
                `¡Hola ${nombreFormateado}!`;
        }
    }



    // ==========================
    // CONSULTA GOOGLE SHEETS
    // ==========================
    if (idInvitado) {

        // JSONP para evitar errores CORS
        const script = document.createElement('script');

        script.src =
            `${SCRIPT_URL}?id=${encodeURIComponent(
                idInvitado.toUpperCase()
            )}&callback=actualizarNombreSobre`;

        document.body.appendChild(script);

    } else {

        if (nombreSobre) {
            nombreSobre.innerText =
                "¡Te esperamos!";
        }

        if (btnAbrir) {
            btnAbrir.style.display =
                "inline-block";
        }
    }
});


// ===============================
// CALLBACK GLOBAL JSONP
// ===============================
window.actualizarNombreSobre = function(data) {

    const elementoNombre =
        document.getElementById(
            'nombre-invitado-sobre'
        );

    const saludo =
        document.getElementById(
            'saludo-personalizado'
        );

    const btnAbrir =
        document.getElementById('btn-abrir') ||
        document.getElementById('btn-abrir-sobre');


    if (data && data.familia) {

        if (elementoNombre) {
            elementoNombre.innerText =
                data.familia;
        }

        if (saludo) {
            saludo.innerText =
                `¡Hola ${data.familia}!`;
        }

    } else {

        if (elementoNombre) {
            elementoNombre.innerText =
                "¡Te esperamos!";
        }
    }

    if (btnAbrir) {
        btnAbrir.style.display =
            "inline-block";
    }
};

function showInvite(data) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('contenido').style.display = 'block';
    
    // Limpiar el nombre para que se vea elegante (Mayúsculas/Minúsculas)
    const nombreLimpio = data.familia.replace(/_/g, ' ');
    const nombreFormateado = nombreLimpio
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

    document.getElementById('tituloFamilia').innerText = "Bienvenidos, " + nombreFormateado;
    
    // ... resto de tu código de integrantes
}