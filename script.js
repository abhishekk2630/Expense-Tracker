/* 1. App State & Local Storage */
let records = JSON.parse(localStorage.getItem('ledger')) || [
  { id: 1, title: 'Stipend', amount: 25000, type: 'income', cat: '💼 Work' },
  { id: 2, title: 'Groceries', amount: 3500, type: 'expense', cat: '🍔 Food' }
];

const fmt = n => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const form = document.getElementById('tx-form');
const toggleLabels = document.querySelectorAll('.type-toggle label');

/* 2. Core Dashboard Sync & Render */
function sync() {
  let inTotal = 0, outTotal = 0;
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = '';

  records.forEach(r => {
    r.type === 'income' ? inTotal += r.amount : outTotal += r.amount;
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item-meta">
        <span class="item-title">${r.title}</span>
        <span class="item-category">${r.cat}</span>
      </div>
      <div class="item-right">
        <span class="amount-val ${r.type}">${r.type === 'income' ? '+' : '-'}${fmt(r.amount)}</span>
        <button class="trash-btn" onclick="del(${r.id})">✕</button>
      </div>`;
    feed.appendChild(li);
  });

  const net = inTotal - outTotal;
  const burn = inTotal > 0 ? Math.min(Math.round((outTotal / inTotal) * 100), 100) : (outTotal > 0 ? 100 : 0);

  document.getElementById('net-balance').innerText = fmt(net);
  document.getElementById('inflow-val').innerText = '+' + fmt(inTotal);
  document.getElementById('outflow-val').innerText = '-' + fmt(outTotal);
  document.getElementById('entry-count').innerText = `${records.length} items`;
  document.getElementById('burn-percentage').innerText = `${burn}% spent`;
  document.getElementById('meter-fill').style.width = `${burn}%`;

  localStorage.setItem('ledger', JSON.stringify(records));
}

/* 3. Event Listeners & Actions */
toggleLabels.forEach(lbl => lbl.addEventListener('click', () => {
  toggleLabels.forEach(l => l.classList.remove('active'));
  lbl.classList.add('active');
}));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('tx-title').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const type = document.querySelector('input[name="tx-type"]:checked').value;
  const cat = document.querySelector('input[name="cat"]:checked').value;

  records.unshift({ id: Date.now(), title, amount, type, cat });
  form.reset();
  toggleLabels[0].click();
  sync();
});

window.del = id => { records = records.filter(r => r.id !== id); sync(); };

// Boot app
sync();