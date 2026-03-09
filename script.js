const API_URL = "/.netlify/functions/rsvp";
const ALBUM_URL = "https://photos.app.goo.gl/JjdB7E5hck3wua1p9";
const EVENT_DATE = new Date("2026-05-02T15:00:00-06:00").getTime();

// ===== QR =====
const qrImg = document.getElementById("qrImg");
const albumLink = document.getElementById("albumLink");

if (qrImg) {
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ALBUM_URL)}`;
}
if (albumLink) {
  albumLink.href = ALBUM_URL;
}

// ===== MÚSICA =====
const btnMusic = document.getElementById("btnMusic");
const audioVals = document.getElementById("audioVals");

if (btnMusic && audioVals) {
  btnMusic.addEventListener("click", async () => {
    try {
      if (audioVals.paused) {
        await audioVals.play();
        btnMusic.textContent = "⏸ Pausar";
      } else {
        audioVals.pause();
        btnMusic.textContent = "▶ Reproducir";
      }
    } catch (e) {
      console.error(e);
    }
  });
}

// ===== CUENTA REGRESIVA =====
function updateCountdown() {
  const now = Date.now();
  const distance = EVENT_DATE - now;

  const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((distance / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((distance / (1000 * 60)) % 60));
  const seconds = Math.max(0, Math.floor((distance / 1000) % 60));

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ===== GALERÍA =====
const slides = document.getElementById("slides");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let currentSlide = 0;

function moveSlide(index) {
  if (!slides) return;
  const total = slides.children.length;
  currentSlide = (index + total) % total;
  slides.style.transform = `translateX(-${currentSlide * 100}%)`;
}

if (prev) prev.addEventListener("click", () => moveSlide(currentSlide - 1));
if (next) next.addEventListener("click", () => moveSlide(currentSlide + 1));

setInterval(() => {
  if (slides) moveSlide(currentSlide + 1);
}, 4500);

// ===== RSVP POR GRUPO =====
const resultado = document.getElementById("resultado");
const grupoInfo = document.getElementById("grupoInfo");

function getGroupIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("g");
}

function cargarGrupo() {
  const groupId = getGroupIdFromUrl();

  if (!groupId) {
    grupoInfo.innerHTML = "No se encontró el grupo de invitación.";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accion: "grupo",
      id_grupo: groupId
    })
  })
    .then(res => res.json())
    .then(data => {
      resultado.innerHTML = "";

      if (!data.encontrado || !data.integrantes || data.integrantes.length === 0) {
        grupoInfo.innerHTML = "No encontramos invitados para este grupo.";
        return;
      }

      grupoInfo.innerHTML = `
        <strong>${data.integrantes.length} invitación${data.integrantes.length > 1 ? "es" : ""}</strong>
        ${data.mesa ? ` · Mesa ${data.mesa}` : ""}
      `;

      data.integrantes.forEach(persona => {
        const card = document.createElement("div");
        card.className = "result-card";

        let content = `
          <p class="result-name">${persona.nombre}</p>
          <p class="result-mesa">Mesa: ${persona.mesa || "Por asignar"}</p>
        `;

        if (persona.confirmado === "Sí" || persona.confirmado === "No") {
          content += `<span class="status-tag">Ya respondió: ${persona.confirmado}</span>`;
          card.innerHTML = content;
        } else {
          content += `
            <div class="result-actions">
              <button class="btn-yes" data-fila="${persona.fila}" data-estado="Sí">Asistiré</button>
              <button class="btn-no" data-fila="${persona.fila}" data-estado="No">No asistiré</button>
            </div>
          `;
          card.innerHTML = content;
        }

        resultado.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      grupoInfo.innerHTML = "Ocurrió un error al cargar la invitación.";
    });
}

resultado.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const fila = e.target.dataset.fila;
    const estado = e.target.dataset.estado;
    responder(fila, estado);
  }
});

function responder(fila, estado) {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accion: "responder",
      fila: Number(fila),
      estado: estado
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.guardado || data.bloqueado) {
        cargarGrupo();
      }
    })
    .catch(err => {
      console.error(err);
    });
}

cargarGrupo();