function parseCSV() {
  const fileInput = document.getElementById('csvFile');
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    lines.shift();
    lines.forEach(line => {
      const [codice, descrizione, netto, trasporto, installazione] = line.split(',');
      if (!codice) return;
      addCard(codice, descrizione || '', parseFloat(netto), parseFloat(trasporto), parseFloat(installazione), 0);
      addToDropdown(codice);
    });
  };
  reader.readAsText(fileInput.files[0]);
}

function addCard(codice, descrizione, netto, trasporto, installazione, margine) {
  const container = document.getElementById('listino');
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-code', codice);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () => updateSelectedList());

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
    prezzoVendita.innerHTML = `<strong>Prezzo Vendita:</strong> ${isFinite(prezzo) ? prezzo.toFixed(2) + ' €' : 'NaN €'}`;
  }

  margineInput.addEventListener('input', updatePrezzo);

  card.appendChild(checkbox);
  card.appendChild(blocco('Codice', codice));
  card.appendChild(blocco('Descrizione', descrizione));
  card.appendChild(blocco('Prezzo Netto', isNaN(netto) ? 'NaN €' : netto.toFixed(2) + ' €'));
  card.appendChild(blocco('Trasporto', isNaN(trasporto) ? 'NaN €' : trasporto.toFixed(2) + ' €'));
  card.appendChild(blocco('Installazione', isNaN(installazione) ? 'NaN €' : installazione.toFixed(2) + ' €'));

  const margineBlock = document.createElement('p');
  margineBlock.innerHTML = '<strong>Margine %:</strong> ';
  margineBlock.appendChild(margineInput);
  card.appendChild(margineBlock);
  updatePrezzo();
  card.appendChild(prezzoVendita);

  container.appendChild(card);
}

function addToDropdown(codice) {
  const select = document.getElementById('searchSelect');
  const option = document.createElement('option');
  option.value = codice;
  option.textContent = codice;
  select.appendChild(option);
}

function updateSelectedList() {
  const selectedArea = document.getElementById('selectedList');
  selectedArea.innerHTML = '';
  document.querySelectorAll('#listino .card').forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
      const clone = card.cloneNode(true);
      clone.querySelector('input[type="checkbox"]').remove();
      selectedArea.appendChild(clone);
    }
  });
}

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
  addToDropdown(codice);
  e.target.reset();
});

document.getElementById('searchInput').addEventListener('input', function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll('#listino .card').forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? '' : 'none';
  });
});

document.getElementById('searchSelect').addEventListener('change', function () {
  const val = this.value;
  document.querySelectorAll('#listino .card').forEach(card => {
    const match = card.getAttribute('data-code') === val;
    card.style.display = match || val === '' ? '' : 'none';
  });
});
