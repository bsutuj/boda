// ========= CUENTA REGRESIVA =========
const weddingDate = new Date("2026-05-02T00:00:00-06:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = weddingDate - now;

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const mins = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const secs = Math.max(0, Math.floor((diff / 1000) % 60));

  document.getElementById("cd-days").textContent = days;
  document.getElementById("cd-hours").textContent = hours;
  document.getElementById("cd-mins").textContent = mins;
  document.getElementById("cd-secs").textContent = secs;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ========= ANIMACIONES SUAVES (SCROLL REVEAL) =========
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ========= MÚSICA (VALS) =========
const audio = document.getElementById("audioVals");
const btnMusic = document.getElementById("btnMusic");

if (audio && btnMusic) {
  btnMusic.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
        btnMusic.textContent = "⏸ Pausar vals";
      } else {
        audio.pause();
        btnMusic.textContent = "▶ Reproducir vals";
      }
    } catch (e) {
      alert("Tu navegador bloqueó el audio automático. Presiona de nuevo.");
    }
  });

  audio.addEventListener("ended", () => {
    btnMusic.textContent = "▶ Reproducir vals";
  });
}

// ========= SLIDER DE FOTOS =========
const slides = document.getElementById("slides");
const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");

let index = 0;

function goTo(i) {
  if (!slides) return;
  const total = slides.children.length;
  index = (i + total) % total;
  slides.style.transform = `translateX(-${index * 100}%)`;
}

if (btnPrev) btnPrev.addEventListener("click", () => goTo(index - 1));
if (btnNext) btnNext.addEventListener("click", () => goTo(index + 1));

// Auto-movimiento cada 4s
setInterval(() => {
  if (slides) goTo(index + 1);
}, 4000);

// ========= QR DEL ÁLBUM (CAMBIA ESTA URL) =========
// Pon aquí tu link real del álbum (Google Photos recomendado)
const ALBUM_URL = "https://photos.app.goo.gl/JjdB7E5hck3wua1p9"; // <-- CAMBIAR

const qrImg = document.getElementById("qrImg");
const albumLink = document.getElementById("albumLink");

if (albumLink) albumLink.href = ALBUM_URL;

// Genera QR usando un servicio simple (solo para imagen)
if (qrImg) {
  const encoded = encodeURIComponent(ALBUM_URL);
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}



const API_URL = "https://script.google.com/macros/s/AKfycbzIsU6jWQUGryJ4JthosLZ2weJiOrmmxZulCpSKd4tHy9C_TZ06L7Vyjdob4nVupoXA/exec";

function buscarInvitado() {
  const nombre = document.getElementById("buscador").value.trim();

  if (nombre.length < 3) {
    document.getElementById("resultado").innerHTML =
      "<p>Escribe al menos 3 letras.</p>";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: nombre,
      accion: "buscar"
    }),
  })
    .then(res => res.json())
    .then(data => {
      const resultado = document.getElementById("resultado");
      resultado.innerHTML = "";

      if (!data.encontrado) {
        resultado.innerHTML = "<p>No encontramos coincidencias.</p>";
        return;
      }

      const lista = document.createElement("div");
      lista.innerHTML = "<p><strong>Personas de tu grupo:</strong></p>";

      data.resultados.forEach(persona => {
        const div = document.createElement("div");

        const info = document.createElement("div");
        info.innerHTML = `
          <strong>${persona.nombreOriginal}</strong><br>
          Mesa: ${persona.mesa}
        `;

        div.appendChild(info);

        if (persona.confirmado === "Sí" || persona.confirmado === "No") {
          const estado = document.createElement("p");
          estado.innerHTML = `Ya respondió: <strong>${persona.confirmado}</strong>`;
          div.appendChild(estado);
        } else {
          const acciones = document.createElement("div");

          const btnSi = document.createElement("button");
          btnSi.textContent = "Asistiré";
          btnSi.dataset.fila = persona.fila;
          btnSi.dataset.estado = "Sí";
          btnSi.dataset.nombre = persona.nombreOriginal;
          btnSi.dataset.mesa = persona.mesa;

          const btnNo = document.createElement("button");
          btnNo.textContent = "No asistiré";
          btnNo.dataset.fila = persona.fila;
          btnNo.dataset.estado = "No";
          btnNo.dataset.nombre = persona.nombreOriginal;
          btnNo.dataset.mesa = persona.mesa;

          acciones.appendChild(btnSi);
          acciones.appendChild(btnNo);
          div.appendChild(acciones);
        }

        lista.appendChild(div);
      });

      resultado.appendChild(lista);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("resultado").innerHTML =
        "<p>Error de conexión con el servidor.</p>";
    });
}

// Delegación de eventos para botones
document.getElementById("resultado").addEventListener("click", function(e) {
  if (e.target.tagName === "BUTTON") {
    const fila = e.target.dataset.fila;
    const estado = e.target.dataset.estado;
    responder(fila, estado);
  }
});

function responder(fila,estado){

  fetch(API_URL,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      accion:"responder",
      fila:parseInt(fila),
      estado:estado
    })
  })

  .then(res => res.json())

  .then(data => {

    const resultado = document.getElementById("resultado");

    if(data.bloqueado){

      resultado.innerHTML =
      `<p>${data.nombre} ya había respondido: ${data.estado}. Mesa ${data.mesa}</p>`;

      return;
    }

    if(data.guardado){

      resultado.innerHTML =
      `<p>Gracias ${data.nombre} por confirmar ❤️<br>
      Tu mesa es la <strong>${data.mesa}</strong></p>`;

    }

  });

}





