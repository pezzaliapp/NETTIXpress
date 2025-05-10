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

function addCard(codice, descrizione, netto, trasportoVal, installazioneVal, margine) {
  const container = document.getElementById('listino');
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.codice = codice;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const blocco = (label, element) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${label}:</strong> `;
    p.appendChild(element);
    return p;
  };

  const margineInput = document.createElement('input');
  margineInput.type = 'number';
  margineInput.value = margine;
  margineInput.style.width = '80px';

  const trasportoInput = document.createElement('input');
  trasportoInput.type = 'number';
  trasportoInput.value = trasportoVal;
  trasportoInput.style.width = '80px';

  const installazioneInput = document.createElement('input');
  installazioneInput.type = 'number';
  installazioneInput.value = installazioneVal;
  installazioneInput.style.width = '80px';

  const prezzoVendita = document.createElement('p');
  const prezzoConTrasporto = document.createElement('p');
  const prezzoConInstallazione = document.createElement('p');
  const prezzoTotale = document.createElement('p');
  let prezzoVenditaVal = 0;

  function updatePrezzi() {
    const m = parseFloat(margineInput.value) || 0;
    const t = parseFloat(trasportoInput.value) || 0;
    const i = parseFloat(installazioneInput.value) || 0;
    prezzoVenditaVal = netto / (1 - (m / 100));
    prezzoVendita.innerHTML = `<strong>Prezzo Vendita:</strong> ${prezzoVenditaVal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
    const totaleTrasporto = prezzoVenditaVal + t;
    const totaleInstallazione = prezzoVenditaVal + i;
    const totaleEntrambi = prezzoVenditaVal + t + i;
    prezzoConTrasporto.innerHTML = `<strong>+ Trasporto:</strong> ${totaleTrasporto.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
    prezzoConInstallazione.innerHTML = `<strong>+ Installazione:</strong> ${totaleInstallazione.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
    prezzoTotale.innerHTML = `<strong>Totale + I + T:</strong> ${totaleEntrambi.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  }

  margineInput.addEventListener('input', updatePrezzi);
  trasportoInput.addEventListener('input', updatePrezzi);
  installazioneInput.addEventListener('input', updatePrezzi);

  checkbox.addEventListener('change', () => {
    const vend = netto / (1 - (parseFloat(margineInput.value || 0) / 100));
    const tr = parseFloat(trasportoInput.value) || 0;
    const ins = parseFloat(installazioneInput.value) || 0;
    aggiornaRiepilogo(codice, descrizione, netto, tr, ins, parseFloat(margineInput.value), checkbox.checked, vend);
  });

  card.appendChild(checkbox);
  card.appendChild(blocco('Codice', document.createTextNode(codice)));
  card.appendChild(blocco('Descrizione', document.createTextNode(descrizione || '—')));
  card.appendChild(blocco('Prezzo Netto', document.createTextNode(netto.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €')));
  card.appendChild(blocco('Trasporto', trasportoInput));
  card.appendChild(blocco('Installazione', installazioneInput));

  const margineBlock = document.createElement('p');
  margineBlock.innerHTML = '<strong>Margine %:</strong> ';
  margineBlock.appendChild(margineInput);
  card.appendChild(margineBlock);

  updatePrezzi();
  card.appendChild(prezzoVendita);
  card.appendChild(prezzoConTrasporto);
  card.appendChild(prezzoConInstallazione);
  card.appendChild(prezzoTotale);

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

function aggiornaRiepilogo(codice, descrizione, netto, trasporto, installazione, margine, selezionato, prezzoVendita) {
  if (selezionato) {
    const prezzoConTrasporto = prezzoVendita + trasporto;
    const prezzoConInstallazione = prezzoVendita + installazione;
    const prezzoTotale = prezzoVendita + trasporto + installazione;
    prodottiSelezionati.push({ codice, descrizione, netto, trasporto, installazione, margine, prezzoVendita, prezzoConTrasporto, prezzoConInstallazione, prezzoTotale });
  } else {
    prodottiSelezionati = prodottiSelezionati.filter(p => p.codice !== codice);
  }

  const lista = document.getElementById('listaSelezionati');
  const totali = document.getElementById('totaliSelezionati');
  lista.innerHTML = '';

  let sommaNetto = 0, sommaVendita = 0, sommaConTrasporto = 0, sommaConInstallazione = 0, sommaTotale = 0, sommaMargine = 0;

  prodottiSelezionati.forEach(p => {
    sommaNetto += p.netto;
    sommaVendita += p.prezzoVendita;
    sommaConTrasporto += p.prezzoConTrasporto;
    sommaConInstallazione += p.prezzoConInstallazione;
    sommaTotale += p.prezzoTotale;
    sommaMargine += p.margine;

    const li = document.createElement('li');
    li.textContent = `${p.codice} - ${p.descrizione} | Netto: ${p.netto.toFixed(2)} € | Margine: ${p.margine.toFixed(2)}% | Vendita: ${p.prezzoVendita.toFixed(2)} € | +T: ${p.prezzoConTrasporto.toFixed(2)} € | +I: ${p.prezzoConInstallazione.toFixed(2)} € | Totale: ${p.prezzoTotale.toFixed(2)} €`;
    lista.appendChild(li);
  });

  const mediaMargine = prodottiSelezionati.length > 0 ? (sommaMargine / prodottiSelezionati.length) : 0;

  totali.innerHTML = `
    <strong>Totali:</strong><br>
    Netto: ${sommaNetto.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €<br>
    Margine medio: ${mediaMargine.toFixed(2)}%<br>
    Prezzo Vendita: ${sommaVendita.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €<br>
    + Trasporto: ${sommaConTrasporto.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €<br>
    + Installazione: ${sommaConInstallazione.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €<br>
    Totale Finale: ${sommaTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
  `;
}

function esportaSelezionati() {
  if (prodottiSelezionati.length === 0) return;
  const righe = prodottiSelezionati.map(p => `${p.codice};${p.descrizione};${p.netto};${p.trasporto};${p.installazione};${p.margine.toFixed(2)};${p.prezzoVendita};${p.prezzoConTrasporto};${p.prezzoConInstallazione};${p.prezzoTotale}`);

  let sommaVendita = 0, sommaConTrasporto = 0, sommaConInstallazione = 0, sommaTotale = 0;
  prodottiSelezionati.forEach(p => {
    sommaVendita += p.prezzoVendita;
    sommaConTrasporto += p.prezzoConTrasporto;
    sommaConInstallazione += p.prezzoConInstallazione;
    sommaTotale += p.prezzoTotale;
  });

  righe.push(`TOTALE;;;;;;${sommaVendita.toFixed(2)};${sommaConTrasporto.toFixed(2)};${sommaConInstallazione.toFixed(2)};${sommaTotale.toFixed(2)}`);

  const csvContent = 'data:text/csv;charset=utf-8,' + ['codice;descrizione;netto;trasporto;installazione;margine;prezzo_vendita;prezzo_con_trasporto;prezzo_con_installazione;totale_finale'].concat(righe).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'prodotti_selezionati.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function svuotaSelezione() {
  prodottiSelezionati = [];
  document.getElementById('listaSelezionati').innerHTML = '';
  document.getElementById('totaliSelezionati').innerHTML = '';
  document.querySelectorAll('#listino .card input[type="checkbox"]').forEach(cb => cb.checked = false);
}

function deselezionaTutti() {
  document.querySelectorAll('#listino .card input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.dispatchEvent(new Event('change'));
  });
}
