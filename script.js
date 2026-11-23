/* 1. State & Constants */
let userTarget = parseFloat(localStorage.getItem('my_budget_target')) || 0;
let records = JSON.parse(localStorage.getItem('my_budget_records')) || [];

const SUGGESTIONS = {
  expense: ['🍔 Lunch', '☕ Coffee', '🚗 Metro', '🛒 Groceries', '⚡ Wi-Fi Bill', '💊 Pharmacy'],
  income: ['💼 Monthly Salary', '💻 Freelance Work', '🎓 Stipend', '📈 Investment', '🎁 Bonus']
};

const fmt = n => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const form = document.getElementById('tx-form');
const toggleOptions = document.querySelectorAll('.toggle-switch label');

/* 2. Dynamic Suggestions Pop-up & Chips */
function renderSuggestions(type) {
  const box = document.getElementById('suggest-box');
  const dlist = document.getElementById('title-suggestions');
  box.innerHTML = '';
  dlist.innerHTML = '';

  SUGGESTIONS[type].forEach(item => {
    // Dropdown pop-up option
    const opt = document.createElement('option');
    opt.value = item;
    dlist.appendChild(opt);

    // Quick tap chip
    const chip = document.createElement('span');
    chip.className = 's-chip';
    chip.innerText = item;
    chip.onclick = () => document.getElementById('tx-title').value = item;
    box.appendChild(chip);
  });
}

/* 3. Sync Dashboard & Calculations */
function sync() {
  let inTotal = 0, outTotal = 0;
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = '';

  if (records.length === 0) {
    feed.innerHTML = '<li style="justify-content:center; color:#64748b; font-size:11px;">No transactions recorded yet.</li>';
  }

  records.forEach(r => {
    r.type === 'income' ? inTotal += r.amount : outTotal += r.amount;
    const li = document.createElement('li');
    li.innerHTML = `
      <div><span class="item-title">${r.title}</span><span class="item-category">${r.cat}</span></div>
      <div class="item-right">
        <span class="amount-val ${r.type}">${r.type === 'income' ? '+' : '-'}${fmt(r.amount)}</span>
        <button class="trash-btn" onclick="delItem(${r.id})">✕</button>
      </div>`;
    feed.appendChild(li);
  });

  const remaining = userTarget > 0 ? (userTarget - outTotal) : (inTotal - outTotal);
  const burn = userTarget > 0 ? Math.min(Math.round((outTotal / userTarget) * 100), 100) : (inTotal > 0 ? Math.min(Math.round((outTotal / inTotal) * 100), 100) : 0);

  document.getElementById('target-val').innerText = userTarget > 0 ? fmt(userTarget) : 'Set Target';
  document.getElementById('net-balance').innerText = fmt(remaining);
  document.getElementById('inflow-val').innerText = '+' + fmt(inTotal);
  document.getElementById('outflow-val').innerText = '-' + fmt(outTotal);
  document.getElementById('entry-count').innerText = `${records.length} items`;
  document.getElementById('burn-percentage').innerText = userTarget > 0 ? `${burn}% spent` : 'Set a target';
  document.getElementById('meter-fill').style.width = `${burn}%`;

  localStorage.setItem('my_budget_records', JSON.stringify(records));
  localStorage.setItem('my_budget_target', userTarget);
}

/* 4. Target Setter */
window.setTarget = function() {
  const val = prompt('Set your monthly spending target budget (₹):', userTarget || 10000);
  if (val !== null && !isNaN(val) && parseFloat(val) >= 0) {
    userTarget = parseFloat(val);
    sync();
  }
};

/* 5. Event Listeners */
toggleOptions.forEach(opt => opt.addEventListener('click', () => {
  toggleOptions.forEach(o => o.classList.remove('active'));
  opt.classList.add('active');
  const type = opt.querySelector('input').value;
  renderSuggestions(type);
}));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('tx-title').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const type = document.querySelector('input[name="tx-type"]:checked').value;
  const cat = document.querySelector('input[name="cat"]:checked').value;

  records.unshift({ id: Date.now(), title, amount, type, cat });
  form.reset();
  toggleOptions[0].click();
  sync();
});

window.delItem = id => { records = records.filter(r => r.id !== id); sync(); };

// Boot
renderSuggestions('expense');
sync();
