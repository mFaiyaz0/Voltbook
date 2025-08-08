// Voltbook front-end app script
// Data & placeholders
const placeholderSVG = (title, bg = '#111', fg = '#00aaff') => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
    <rect width='100%' height='100%' fill='${bg}' rx='12'/>
    <text x='50%' y='50%' font-size='40' text-anchor='middle' fill='${fg}' font-family='Arial'>${title}</text>
  </svg>`)}`;
};

const products = [
  {
    id: 'air-2025',
    name: 'Voltbook Air',
    price: 69999,
    desc: 'Lightweight for students and commuters — 14" FHD, 12hrs battery, 8GB RAM, 256GB SSD.',
    img: placeholderSVG('Voltbook Air', '#071129', '#00aaff'),
    specs: ['14" FHD', '8 GB RAM', '256 GB SSD', '12 hrs battery']
  },
  {
    id: 'pro-2025',
    name: 'Voltbook Pro',
    price: 99999,
    desc: 'For creators — 16" QHD, 16GB RAM, 512GB SSD, dedicated GPU option.',
    img: placeholderSVG('Voltbook Pro', '#121017', '#00ff88'),
    specs: ['16" QHD', '16 GB RAM', '512 GB SSD', 'Dedicated GPU']
  },
  {
    id: 'max-2025',
    name: 'Voltbook Max',
    price: 129999,
    desc: 'Performance & gaming — 16" 165Hz, 32GB RAM, 1TB SSD, long-life battery.',
    img: placeholderSVG('Voltbook Max', '#0b0a12', '#ffd166'),
    specs: ['16" 165Hz', '32 GB RAM', '1 TB SSD', 'High perf GPU']
  }
];

// Reviews
const reviews = [
  {name:'Aisha R.', text:'The Air is perfect for my college work. Battery lasts days!', rate:5},
  {name:'Rahul S.', text:'Pro handled my video editing workflow smoothly — great value.', rate:5},
  {name:'Neha K.', text:'Max is a beast for gaming and rendering. Happy with the screen.', rate:4},
];

// App state
let state = {
  products: [...products],
  cart: [], // {id, qty}
  reviewIndex: 0,
  saleEnd: Date.now() + 1000 * 60 * 60 // 1 hour from load
};

// UTILITIES
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Render Products */
function renderProducts(list = state.products) {
  const container = qs('#product-container');
  container.innerHTML = '';
  const template = qs('#productTemplate');
  list.forEach(p => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('article');
    article.dataset.id = p.id;
    node.querySelector('.prod-img').src = p.img;
    node.querySelector('.prod-title').textContent = p.name;
    node.querySelector('.prod-desc').textContent = p.desc;
    node.querySelector('.price.small').textContent = `₹${p.price.toLocaleString()}`;
    // buttons
    const addBtn = node.querySelector('.add-btn');
    const viewBtn = node.querySelector('.view-btn');
    addBtn.addEventListener('click', () => addToCart(p.id));
    viewBtn.addEventListener('click', () => openModal(p.id));
    container.appendChild(node);
  });
}

/* Search, Filter, Sort */
function applyFilters() {
  const q = qs('#searchInput').value.trim().toLowerCase();
  const filterVal = qs('#priceFilter').value;
  const sortVal = qs('#sortSelect').value;
  let list = products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  // price filter
  if (filterVal !== 'all') {
    const [min, max] = filterVal.split('-').map(Number);
    list = list.filter(p => p.price >= min && p.price <= max);
  }
  // sort
  if (sortVal === 'low-high') list.sort((a,b) => a.price - b.price);
  if (sortVal === 'high-low') list.sort((a,b) => b.price - a.price);
  state.products = list;
  renderProducts(list);
}

/* Modal (product detail) */
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  qs('#modalImg').src = p.img;
  qs('#modalTitle').textContent = p.name;
  qs('#modalDesc').textContent = `${p.desc}\n\nSpecs: ${p.specs.join(' • ')}`;
  qs('#modalPrice').textContent = `₹${p.price.toLocaleString()}`;
  qs('#modalAddCart').onclick = () => { addToCart(p.id); closeModal(); };
  qs('#productModal').style.display = 'flex';
  qs('#productModal').setAttribute('aria-hidden','false');
}
function closeModal() {
  qs('#productModal').style.display = 'none';
  qs('#productModal').setAttribute('aria-hidden','true');
}

/* CART */
function addToCart(id) {
  const item = state.cart.find(c => c.id === id);
  if (item) item.qty += 1;
  else state.cart.push({id, qty: 1});
  updateCartCount();
  showToast('Item added to cart');
}
function updateCartCount() {
  const total = state.cart.reduce((s,i)=>s+i.qty,0);
  qs('#cart-count').textContent = total;
}
function openCart() {
  renderCart();
  qs('#cartPage').style.display = 'flex';
  qs('#cartPage').setAttribute('aria-hidden','false');
}
function closeCart() {
  qs('#cartPage').style.display = 'none';
  qs('#cartPage').setAttribute('aria-hidden','true');
}
function renderCart() {
  const container = qs('#cartItems');
  container.innerHTML = '';
  if (state.cart.length === 0) {
    container.innerHTML = `<div class="card">Your cart is empty.</div>`;
    qs('#cartTotal').textContent = `₹0`;
    return;
  }
  let total = 0;
  state.cart.forEach(ci => {
    const p = products.find(x => x.id === ci.id);
    if (!p) return;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <div style="color:var(--muted);font-size:0.9rem">₹${p.price.toLocaleString()} × ${ci.qty}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn small dec">-</button>
        <div>${ci.qty}</div>
        <button class="btn small inc">+</button>
        <button class="btn small btn-ghost remove">Remove</button>
      </div>
    `;
    // events
    row.querySelector('.inc').addEventListener('click', ()=> { ci.qty++; renderCart(); updateCartCount(); });
    row.querySelector('.dec').addEventListener('click', ()=> { if(ci.qty>1) ci.qty--; else state.cart = state.cart.filter(x=>x!==ci); renderCart(); updateCartCount(); });
    row.querySelector('.remove').addEventListener('click', ()=> { state.cart = state.cart.filter(x=>x!==ci); renderCart(); updateCartCount(); });
    container.appendChild(row);
    total += p.price * ci.qty;
  });
  qs('#cartTotal').textContent = `₹${total.toLocaleString()}`;
}

/* Checkout (fake) */
function checkout() {
  if (state.cart.length === 0) { showToast('Cart is empty'); return; }
  // fake checkout flow: prompt for minimal info
  const name = prompt('Enter your name for checkout');
  if (!name) return;
  const email = prompt('Enter your email');
  if (!email) return;
  // Reset cart
  state.cart = [];
  updateCartCount();
  closeCart();
  showToast(`Thanks ${name}! Order placed (mock). A confirmation was sent to ${email}.`);
}

/* Reviews slider */
function renderReview() {
  const r = reviews[state.reviewIndex];
  const el = qs('#reviewSlider');
  el.innerHTML = `<div class="review card"><strong>${r.name}</strong> <div style="color:var(--accent-2)"> ${'★'.repeat(r.rate)}</div><p>${r.text}</p></div>`;
}

/* Countdown timer */
function updateTimer() {
  const now = Date.now();
  const diff = state.saleEnd - now;
  const timerEl = qs('#timer');
  if (diff <= 0) { timerEl.textContent = 'SALE ENDED'; clearInterval(timerInt); return; }
  const hrs = Math.floor(diff / (1000*60*60));
  const mins = Math.floor((diff / (1000*60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  timerEl.textContent = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}
const timerInt = setInterval(updateTimer, 1000);

/* Newsletter popup */
function showNewsletter() {
  qs('#newsletterPopup').style.display = 'flex';
  qs('#newsletterPopup').setAttribute('aria-hidden','false');
}
function hideNewsletter() {
  qs('#newsletterPopup').style.display = 'none';
  qs('#newsletterPopup').setAttribute('aria-hidden','true');
}

/* simple toast */
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.right = '18px';
  t.style.bottom = '18px';
  t.style.background = 'var(--card)';
  t.style.color = 'var(--text)';
  t.style.padding = '10px 12px';
  t.style.borderRadius = '8px';
  t.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2400);
}

/* Dark mode */
function toggleDark() {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  qs('#darkModeToggle').textContent = isLight ? '🌞' : '🌙';
  localStorage.setItem('volt_light', isLight ? '1' : '0');
}

/* Contact form validation */
function handleContact(e) {
  e.preventDefault();
  const name = qs('#name').value.trim();
  const email = qs('#email').value.trim();
  const message = qs('#message').value.trim();
  if (!name || !email || !message) { alert('Please fill all fields'); return; }
  // fake send
  showToast(`Thanks ${name}! We'll reply to ${email}.`);
  e.target.reset();
}

/* Clear cart */
function clearCart() {
  if (!confirm('Clear all items from cart?')) return;
  state.cart = [];
  updateCartCount();
  renderCart();
}

/* EVENTS */
document.addEventListener('DOMContentLoaded', () => {
  // initial render
  renderProducts();
  renderReview();
  updateCartCount();
  updateTimer();

  // search inputs
  qs('#searchInput').addEventListener('input', applyFilters);
  qs('#priceFilter').addEventListener('change', applyFilters);
  qs('#sortSelect').addEventListener('change', applyFilters);
  qs('#miniSearch').addEventListener('input', (e) => { qs('#searchInput').value = e.target.value; applyFilters(); });

  // modal close
  qs('#closeModal').addEventListener('click', closeModal);
  qs('#productModal').addEventListener('click', (ev) => { if (ev.target === qs('#productModal')) closeModal(); });

  // cart
  qs('#goToCart').addEventListener('click', openCart);
  qs('#closeCart').addEventListener('click', closeCart);
  qs('#checkoutBtn').addEventListener('click', checkout);
  qs('#clearCart').addEventListener('click', clearCart);

  // reviews
  qs('#nextReview').addEventListener('click', ()=> { state.reviewIndex = (state.reviewIndex+1)%reviews.length; renderReview(); });
  qs('#prevReview').addEventListener('click', ()=> { state.reviewIndex = (state.reviewIndex-1+reviews.length)%reviews.length; renderReview(); });

  // newsletter popup logic
  setTimeout(showNewsletter, 4500);
  qs('#closePopup').addEventListener('click', hideNewsletter);
  qs('#noThanks').addEventListener('click', hideNewsletter);
  qs('#subscribeBtn').addEventListener('click', () => {
    const email = qs('#newsletterEmail').value.trim();
    if (!email) { alert('Enter an email'); return; }
    hideNewsletter();
    showToast(`${email} subscribed! Use code VOLT10 at checkout.`);
  });

  // open newsletter via button in contact area
  qs('#openNewsletter').addEventListener('click', showNewsletter);

  // contact form
  qs('#contactForm').addEventListener('submit', handleContact);

  // dark mode toggle
  qs('#darkModeToggle').addEventListener('click', toggleDark);
  // persist dark/light
  if (localStorage.getItem('volt_light') === '1') {
    document.documentElement.classList.add('light');
    qs('#darkModeToggle').textContent = '🌞';
  }

  // keyboard shortcuts (optional)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) { openCart(); e.preventDefault(); }
  });
});
