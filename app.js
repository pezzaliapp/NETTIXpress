function parseCSV() {
  const fileInput = document.getElementById('csvFile');
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    lines.shift(); // elimina intestazione
    lines.forEach(line => {
      const [codice, descrizione, netto, trasporto, installazione] = line.split(',');
      if (!codice) return;
      addRow(codice, descrizione, parseFloat(netto), parseFloat(trasporto), parseFloat(installazione), 0);
    });
  };
  reader.readAsText(fileInput.files[0]);
}

function addRow(codice, descrizione, netto, trasporto, installazione, margine) {
  const tbody = document.querySelector('#listino tbody');
  const tr = document.createElement('tr');

  function createCell(content, editable = false, onChange = null) {
    const td = document.createElement('td');
    if (editable) {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = content;
      input.addEventListener('input', onChange);
      td.appendChild(input);
    } else {
      td.textContent = content;
    }
    return td;
  }

  let prezzoVenditaCell = document.createElement('td');

  function updatePrezzoVendita() {
    const marg = parseFloat(tr.querySelector('.margine input').value) || 0;
    const vend = netto / (1 - (marg / 100));
    prezzoVenditaCell.textContent = vend.toFixed(2);
  }

  tr.appendChild(createCell(codice));
  tr.appendChild(createCell(descrizione));
  tr.appendChild(createCell(netto.toFixed(2)));
  tr.appendChild(createCell(trasporto.toFixed(2)));
  tr.appendChild(createCell(installazione.toFixed(2)));

  const margineCell = createCell(margine.toFixed(2), true, updatePrezzoVendita);
  margineCell.classList.add('margine');
  tr.appendChild(margineCell);
  tr.appendChild(prezzoVenditaCell);

  updatePrezzoVendita();
  tbody.appendChild(tr);
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
  addRow(codice, descrizione, netto, trasporto || 0, installazione || 0, margine || 0);
  e.target.reset();
});
