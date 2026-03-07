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



const API_URL = "https://script.google.com/macros/s/AKfycbwLnTTp9ebq2Lo7gzvK_MSBtXicwp9NcQpGpXInjYkGGMC49ML23y16O15nnKLhrVy9/exec";

function buscarInvitado() {
  const nombreInput = document.getElementById("buscador").value.trim();
  const resultadoDiv = document.getElementById("resultado");

  if (nombreInput.length < 3) {
    resultadoDiv.innerHTML = "<p>Escribe al menos 3 letras.</p>";
    return;
  }

  resultadoDiv.innerHTML = "<p>Buscando...</p>";

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors", // Intentar primero con el modo estándar, si falla usa el código de abajo
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: nombreInput,
      accion: "buscar"
    }),
  })
  .then(res => {
     // Google Apps Script a veces requiere un manejo especial de redirección
     return fetch(API_URL + "?accion=buscar&nombre=" + encodeURIComponent(nombreInput));
  })
  .then(res => res.json())
  .then(data => {
    console.log("Datos recibidos:", data); // Esto te dirá qué llega del Excel
    resultadoDiv.innerHTML = "";

    if (!data.encontrado || !data.resultados || data.resultados.length === 0) {
      resultadoDiv.innerHTML = "<p>No encontramos coincidencias.</p>";
      return;
    }

    const lista = document.createElement("div");
    lista.innerHTML = `<p><strong>${data.modo === "coincidencias" ? "Selecciona tu nombre:" : "Personas de tu grupo:"}</strong></p>`;

    data.resultados.forEach(persona => {
      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.padding = "15px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "8px";
      card.style.backgroundColor = "#fff";

      // Contenido de la tarjeta
      let contenido = `
        <div style="margin-bottom: 10px;">
          <strong style="font-size: 1.1em;">${persona.nombreOriginal}</strong><br>
          <span style="color: #666;">Mesa asignada: <strong>${persona.mesa || "Por asignar"}</strong></span>
        </div>
      `;
      card.innerHTML = contenido;

      // Lógica de botones
      if (data.modo === "coincidencias") {
        const btnElegir = document.createElement("button");
        btnElegir.textContent = "Este soy yo";
        btnElegir.className = "btn"; 
        btnElegir.onclick = () => {
          document.getElementById("buscador").value = persona.nombreOriginal;
          buscarInvitado();
        };
        card.appendChild(btnElegir);
      } else {
        if (persona.confirmado === "Sí" || persona.confirmado === "No") {
          const estado = document.createElement("p");
          estado.innerHTML = `Estado: <strong>${persona.confirmado === "Sí" ? "Confirmado ✅" : "No asistirá ❌"}</strong>`;
          card.appendChild(estado);
        } else {
          const acciones = document.createElement("div");
          acciones.innerHTML = `
            <button class="btn" onclick="responder('${persona.fila}', 'Sí')">Asistiré</button>
            <button class="btn btn-ghost" onclick="responder('${persona.fila}', 'No')">No asistiré</button>
          `;
          card.appendChild(acciones);
        }
      }
      lista.appendChild(card);
    });

    resultadoDiv.appendChild(lista);
  })
  .catch(err => {
    console.error("Error detallado:", err);
    resultadoDiv.innerHTML = "<p>Error de conexión. Revisa que el Script esté publicado como 'Cualquier persona'.</p>";
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

function responder(fila, estado) {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accion: "responder",
      fila: parseInt(fila),
      estado: estado
    }),
  })
    .then(res => res.json())
    .then(data => {
      const resultado = document.getElementById("resultado");

      if (data.bloqueado) {
        resultado.innerHTML = `
          <p>
            <strong>${data.nombre}</strong> ya había respondido: ${data.estado}<br>
            Mesa: <strong>${data.mesa ? data.mesa : "Sin asignar"}</strong>
          </p>
        `;
        return;
      }

      if (data.guardado) {
        resultado.innerHTML = `
          <p>
            Gracias <strong>${data.nombre}</strong> por confirmar ❤️<br>
            Tu mesa es la <strong>${data.mesa ? data.mesa : "Sin asignar"}</strong>
          </p>
        `;
      } else {
        resultado.innerHTML = "<p>Ocurrió un error al confirmar. Intenta de nuevo.</p>";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("resultado").innerHTML =
        "<p>Error de conexión con el servidor.</p>";
    });
}





