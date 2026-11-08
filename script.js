const ENDPOINT = "HIER_DIE_APPS_SCRIPT_URL_EINTRAGEN";

const names = document.getElementById("names");
document.getElementById("add").addEventListener("click", () => {
  const row = document.createElement("div");
  row.className = "name-row";
  row.innerHTML = '<input name="guest" required placeholder="Vor- und Nachname">' +
                  '<button type="button" aria-label="Entfernen">✕</button>';
  row.querySelector("button").onclick = () => row.remove();
  names.appendChild(row);
  row.querySelector("input").focus();
});

document.getElementById("rsvp").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, status = document.getElementById("status");
  if (f.website.value) return;                       // Honeypot: Bots füllen es aus
  const data = {
    guests: [...f.querySelectorAll('input[name="guest"]')]
              .map(i => i.value.trim()).filter(Boolean),
    attending: f.attending.value,
    note: f.note.value.trim()
  };
  f.querySelector('button[type="submit"]').disabled = true;
  status.textContent = "Wird gesendet …";
  try {
    await fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    status.textContent = "Danke! Eure Antwort ist angekommen 💙";
    f.reset();
  } catch (err) {
    status.textContent = "Das hat nicht geklappt. Bitte versucht es nochmal.";
    f.querySelector('button[type="submit"]').disabled = false;
  }
});