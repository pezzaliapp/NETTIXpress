function parseCSV() {
  const fileInput = document.getElementById('csvFile');
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    lines.shift(); // rimuove intestazione
    lines.forEach(line => {
      const [codice, descrizione, netto, trasporto, installazione] = line.split(',');
      if (!codice) return;
      addCard(codice, descrizione, parseFloat(netto), parseFloat(trasporto), parseFloat(installazione), 0);
    });
  };
  reader.readAsText(fileInput.files[0]);
}

function addCard(codice, descrizione, netto, trasporto, installazione, margine) {
  const container = document.getElementById('listino');

  const card = document.createElement('div');
  card.className = 'card';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const blocco = (label, value) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${label}:</strong> ${value}`;
    return p;
  };

  const margineInput = document.createElement('input');
  margineInput.type = 'number';
  margineInput.value = margine;
  margineInput.style.width = '80px';

  const prezzoVendita = document.createElement('p');

  function updatePrezzo() {
    const m = parseFloat(margineInput.value) || 0;
    const prezzo = netto / (1 - (m / 100));
    prezzoVendita.innerHTML = `<strong>Prezzo Vendita:</strong> ${prezzo.toFixed(2)} €`;
  }

  margineInput.addEventListener('input', updatePrezzo);

  card.appendChild(checkbox);
  card.appendChild(blocco('Codice', codice));
  card.appendChild(blocco('Descrizione', descrizione));
  card.appendChild(blocco('Prezzo Netto', netto.toFixed(2) + ' €'));
  card.appendChild(blocco('Trasporto', trasporto.toFixed(2) + ' €'));
  card.appendChild(blocco('Installazione', installazione.toFixed(2) + ' €'));

  const margineBlock = document.createElement('p');
  margineBlock.innerHTML = '<strong>Margine %:</strong> ';
  margineBlock.appendChild(margineInput);
  card.appendChild(margineBlock);
  updatePrezzo();
  card.appendChild(prezzoVendita);

  container.appendChild(card);
}

// Inserimento manuale
document.getElementById('manualForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const codice = document.getElementById('codice').value;
  const descrizione = document.getElementById('descrizione').value;
  const netto = parseFloat(document.getElementById('netto').value);
  const trasporto = parseFloat(document.getElementById('trasporto').value);
  const installazione = parseFloat(document.getElementById('installazione').value);
  const margine = parseFloat(document.getElementById('margine').value);
  if (!codice || isNaN(netto)) return;
  addCard(codice, descrizione, netto, trasporto || 0, installazione || 0, margine || 0);
  e.target.reset();
});

// Ricerca dinamica
document.getElementById('searchInput').addEventListener('input', function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll('#listino .card').forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? '' : 'none';
  });
});
