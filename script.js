const ENDPOINT = "https://script.google.com/macros/s/AKfycbxipv8aLH9YeVD63zwDh5lEEYas-JSyRevGlPdUvWEPDdNP2iIsR-RpSMEWXqQmkcQ/exec";
const MEALS = ["keine Präferenz", "vegetarisch", "vegan"];

const form = document.getElementById("rsvp");
const names = document.getElementById("names");
const status = document.getElementById("status");
let counter = 0;

function addGuest(removable) {
  const id = counter++;
  const box = document.createElement("div");
  box.className = "guest";
  box.innerHTML = `
    <div class="name-row">
      <input name="guest" required placeholder="Vor- und Nachname" autocomplete="off">
      ${removable ? '<button type="button" class="remove" aria-label="Person entfernen">✕</button>' : ""}
    </div>
    <div class="meals">
      ${MEALS.map((m, i) =>
        `<label><input type="radio" name="meal-${id}" value="${m}" ${i === 0 ? "checked" : ""}> ${m}</label>`
      ).join("")}
    </div>`;
  if (removable) box.querySelector(".remove").onclick = () => box.remove();
  names.appendChild(box);
  return box;
}

function resetGuests() {
  names.innerHTML = "";
  counter = 0;
  names.classList.remove("no-meal");
  addGuest(false);
}

resetGuests();

document.getElementById("add").addEventListener("click", () => {
  addGuest(true).querySelector("input").focus();
});

// Bei Absage die Essenswahl ausblenden
form.addEventListener("change", (e) => {
  if (e.target.name === "attending") {
    names.classList.toggle("no-meal", e.target.value === "nein");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.website.value) return;               // Spam-Köder

  const attending = form.attending.value;
  const guests = [...names.querySelectorAll(".guest")].map((g) => ({
    name: g.querySelector('input[name="guest"]').value.trim(),
    meal: attending === "ja" ? g.querySelector('input[type="radio"]:checked').value : "-"
  })).filter((g) => g.name);

  if (!guests.length) {
    status.textContent = "Bitte mindestens einen Namen eintragen.";
    return;
  }

  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  status.textContent = "Wird gesendet …";

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ guests, attending, note: form.note.value.trim() })
    });
    status.textContent = "Danke! Eure Antwort ist angekommen 💙";
    form.reset();
    resetGuests();
  } catch (err) {
    status.textContent = "Das hat nicht geklappt. Bitte versucht es nochmal.";
  }
  submit.disabled = false;
});
// Hintergrund: ab dem zweiten Bildschirm wird die untere Bildhälfte endlos gespiegelt wiederholt
const tiles = document.getElementById("tiles");
let tileCount = 0;

function buildTiles() {
  const half = window.innerHeight / 2;
  const needed = Math.max(0,
    Math.ceil((document.documentElement.scrollHeight - window.innerHeight) / half) + 2);
  while (tileCount < needed) {
    const t = document.createElement("div");
    t.className = "tile";
    t.innerHTML = '<div class="bg"></div>';
    tiles.appendChild(t);
    tileCount++;
  }
  while (tileCount > needed) { tiles.lastChild.remove(); tileCount--; }
}

buildTiles();
window.addEventListener("load", buildTiles);
window.addEventListener("resize", buildTiles);
new ResizeObserver(buildTiles).observe(document.body);
// Countdown bis zur Hochzeit (Uhrzeit anpassen; Monat zählt ab 0, also Juli = 6)
const WEDDING = new Date(2027, 6, 3, 14, 0, 0);
const cd = document.getElementById("countdown");
if (cd) {
  const el = { d: cd.querySelector("#cd-d"), h: cd.querySelector("#cd-h"),
               m: cd.querySelector("#cd-m"), s: cd.querySelector("#cd-s") };
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const diff = WEDDING - new Date();
    if (diff <= 0) { cd.textContent = "Heute ist es so weit! 💍"; return; }
    el.d.textContent = Math.floor(diff / 86400000);
    el.h.textContent = pad(Math.floor(diff / 3600000) % 24);
    el.m.textContent = pad(Math.floor(diff / 60000) % 60);
    el.s.textContent = pad(Math.floor(diff / 1000) % 60);
  };
  tick();
  setInterval(tick, 1000);
}