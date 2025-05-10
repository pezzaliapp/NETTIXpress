let elencoCodici = [];
let prodottiSelezionati = [];

function parseCSV() {
  const fileInput = document.getElementById('csvFile');
  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split('\n');
    lines.shift();
    lines.forEach(line => {
      const values = line.split(';');
      if (values.length < 6) return;
      const codice = values[0].trim();
      const descrizione = values[1].trim();
      const prezzoNetto = parseInt(values[3].replace(/[^0-9]/g, ''), 10) || 0;
      const installazione = parseInt(values[4].replace(/[^0-9]/g, ''), 10) || 0;
      const trasporto = parseInt(values[5].replace(/[^0-9]/g, ''), 10) || 0;
      addCard(codice, descrizione, prezzoNetto, trasporto, installazione, 0);
    });
  };
  reader.readAsText(fileInput.files[0]);
}

function addCard(codice, descrizione, netto, trasporto, installazione, margine) {
  const container = document.getElementById('listino');
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.codice = codice;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () =>
    aggiornaRiepilogo(codice, descrizione, netto, trasporto, installazione, margine, checkbox.checked)
  );

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
  const prezzoConTrasportoBlock = document.createElement('p');
  prezzoConTrasportoBlock.innerHTML = '<strong>Prezzo con Trasporto:</strong> ';
  const inputPrezzoTot = document.createElement('input');
  inputPrezzoTot.type = 'number';
  inputPrezzoTot.step = '0.01';
  inputPrezzoTot.style.width = '100px';

  function updatePrezzi() {
    const m = parseFloat(margineInput.value) || 0;
    const vend = netto / (1 - (m / 100));
    prezzoVendita.innerHTML = `<strong>Prezzo Vendita:</strong> ${isNaN(vend) ? '—' : vend.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
    const totale = vend + trasporto;
    inputPrezzoTot.value = isNaN(totale) ? '' : totale.toFixed(2);
  }

  margineInput.addEventListener('input', updatePrezzi);

  card.appendChild(checkbox);
  card.appendChild(blocco('Codice', codice));
  card.appendChild(blocco('Descrizione', descrizione || '—'));
  card.appendChild(blocco('Prezzo Netto', netto.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €'));
  card.appendChild(blocco('Trasporto', trasporto.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €'));
  card.appendChild(blocco('Installazione', installazione.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €'));

  const margineBlock = document.createElement('p');
  margineBlock.innerHTML = '<strong>Margine %:</strong> ';
  margineBlock.appendChild(margineInput);
  card.appendChild(margineBlock);

  updatePrezzi();
  card.appendChild(prezzoVendita);

  prezzoConTrasportoBlock.appendChild(inputPrezzoTot);
  card.appendChild(prezzoConTrasportoBlock);

  container.appendChild(card);

  if (!elencoCodici.includes(codice)) {
    elencoCodici.push(codice);
    aggiornaSelectFiltro();
  }
}

function aggiornaSelectFiltro() {
  const select = document.getElementById('filtroCodice');
  select.innerHTML = '<option value="">Tutti i prodotti</option>';
  elencoCodici.forEach(codice => {
    const opt = document.createElement('option');
    opt.value = codice;
    opt.textContent = codice;
    select.appendChild(opt);
  });
}

document.getElementById('filtroCodice').addEventListener('change', function () {
  const codice = this.value;
  document.querySelectorAll('#listino .card').forEach(card => {
    card.style.display = !codice || card.dataset.codice === codice ? '' : 'none';
  });
});

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

document.getElementById('searchInput').addEventListener('input', function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll('#listino .card').forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? '' : 'none';
  });
});

function aggiornaRiepilogo(codice, descrizione, netto, trasporto, installazione, margine, selezionato) {
  if (selezionato) {
    prodottiSelezionati.push({ codice, descrizione, netto, trasporto, installazione, margine });
  } else {
    prodottiSelezionati = prodottiSelezionati.filter(p => p.codice !== codice);
  }
  const lista = document.getElementById('listaSelezionati');
  lista.innerHTML = '';
  prodottiSelezionati.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.codice} - ${p.descrizione || '—'} - Prezzo Netto: ${p.netto.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
    lista.appendChild(li);
  });
}

function esportaSelezionati() {
  if (prodottiSelezionati.length === 0) return;
  const righe = prodottiSelezionati.map(p => `${p.codice};${p.descrizione};${p.netto};${p.trasporto};${p.installazione};${p.margine}`);
  const csvContent = 'data:text/csv;charset=utf-8,' + ['codice;descrizione;netto;trasporto;installazione;margine'].concat(righe).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'prodotti_selezionati.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
