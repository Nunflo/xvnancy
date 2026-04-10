// FUNCIÓN PARA ABRIR INVITACIÓN
function abrirInvitacion() {
    const audio = document.getElementById('musica-fondo');
    
    if (audio) {
        audio.play().catch(() => { 
            console.log("Audio bloqueado. Se activará tras interacción.");
        });
    }

    const sobre = document.getElementById('pantalla-sobre');
    sobre.style.transform = 'translateY(-100%)';
    
    document.getElementById('contenido').classList.add('visible');
    
    iniciarPetalos();
    
    // ScrollReveal para elementos internos
    ScrollReveal().reveal('.reveal', { 
        delay: 200, 
        duration: 800, 
        distance: '20px', 
        origin: 'bottom', 
        interval: 100 
    });

    setTimeout(() => { 
        sobre.style.display = 'none'; 
    }, 1200);
}

// EFECTO PÉTALOS
function iniciarPetalos() {
    const contenedor = document.getElementById('contenedor-petalos');
    if (!contenedor) return;

    for(let i=0; i<15; i++) {
        const p = document.createElement('div');
        p.className = 'petalo';
        p.style.setProperty('--left', Math.random() * 100 + '%');
        p.style.setProperty('--left-end', (Math.random() * 100 - 15) + '%');
        p.style.width = p.style.height = (Math.random() * 10 + 10) + 'px';
        p.style.animationDelay = (Math.random() * 7) + 's';
        contenedor.appendChild(p);
    }
}

// CUENTA REGRESIVA
const fechaEvento = new Date("Aug 15, 2026 18:00:00").getTime();

setInterval(function() {
    const ahora = new Date().getTime();
    const distancia = fechaEvento - ahora;
    
    if (distancia < 0) return;

    document.getElementById("dias").innerText = Math.floor(distancia / (1000 * 60 * 60 * 24));
    document.getElementById("horas").innerText = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById("minutos").innerText = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById("segundos").innerText = Math.floor((distancia % (1000 * 60)) / 1000);
}, 1000);

// SLIDER DE FOTOS
let sliderIndex = 0;
setInterval(() => {
    const slider = document.getElementById('slider');
    if(slider) {
        // Ajusta el '30' al número real de fotos
        sliderIndex = (sliderIndex + 1) % 30; 
        slider.style.transform = `translateX(-${sliderIndex * 100}%)`;
    }
}, 3000);

// PERSONALIZACIÓN POR URL
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let nombreURL = params.get('n');
    if (nombreURL) {
        const nombreLimpio = nombreURL.replace(/_/g, ' ');
        const saludoH3 = document.getElementById('saludo-personalizado');
        if (saludoH3) saludoH3.innerText = `¡Hola ${nombreLimpio}!`;
    }
});

function iniciarPetalos() {
    const contenedor = document.getElementById('contenedor-petalos');
    if (!contenedor || contenedor.childElementCount > 0) return; // Evita duplicados

    for(let i=0; i<20; i++) { // Subí a 20 para más realismo
        const p = document.createElement('div');
        p.className = 'petalo';
        // Usar variables CSS es genial para la personalización individual
        p.style.setProperty('--left', Math.random() * 100 + '%');
        p.style.setProperty('--left-end', (Math.random() * 100 - 15) + '%');
        p.style.width = p.style.height = (Math.random() * 10 + 10) + 'px';
        p.style.animationDelay = (Math.random() * 7) + 's';
        p.style.animationDuration = (Math.random() * 5 + 5) + 's'; // Variedad de velocidad
        contenedor.appendChild(p);
    }
}


const nombreLimpio = nombreURL.replace(/_/g, ' ');
// Formatear: "juan perez" -> "Juan Perez"
const nombreFormateado = nombreLimpio.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
if (saludoH3) saludoH3.innerText = `¡Hola ${nombreFormateado}!`;

// REEMPLAZA ESTA URL con la que te dio Google Apps Script
const SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1jeJq9zpHfoT_x-7k-WXQLZ5NbDJoGunyBlWzuRIWCQM/edit?usp=sharing";

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const invitadoId = urlParams.get('id'); // Busca el ?id=perez

    const nombreTxt = document.getElementById('nombre-invitado');
    const btnAbrir = document.getElementById('btn-abrir');

    if (invitadoId) {
        // Consultamos a Google Sheets mediante la URL del script
        fetch(`${SCRIPT_URL}?id=${invitadoId}`)
            .then(response => response.json())
            .then(data => {
                nombreTxt.innerText = data.nombre;
                btnAbrir.style.display = "flex"; // Mostramos el botón cuando cargue
            })
            .catch(error => {
                console.error("Error al cargar nombre:", error);
                nombreTxt.innerText = "Invitado Especial";
                btnAbrir.style.display = "flex";
            });
    } else {
        nombreTxt.innerText = "Invitado Especial";
        btnAbrir.style.display = "flex";
    }
});

function abrirInvitacion() {
    document.getElementById('pantalla-sobre').style.transform = "translateY(-100%)";
    setTimeout(() => {
        document.getElementById('contenido-invitacion').style.display = 'block';
    }, 500);
}