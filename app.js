/* =============================================
   GADGETGRID — app.js
   ============================================= */

// ── Admin password (change this!) ────────────
const ADMIN_PASSWORD = 'sree@12$8086';   // ← change to your own password

// ── Admin session (in-memory only) ───────────
let isAdmin = false;

// ── Default sample products ──────────────────
const DEFAULTS = [
  { 
    id: 1, 
    name: "Realme Robot Vacuum", 
    category: "Home", 
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXbXW91SeaCOOy3FXmHQj_DmOnZenEizIux5gpb8qSnQ&s=10", 
    link: "https://amzn.in/d/091CNCHR", 
    store: "Amazon", 
    price: "₹10,499" 
  },
  { 
    id: 2, 
    name: "Wireless Charger",    
    category: "Gadgets", 
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnjbSbgeaYeYeKdm6EL9mTMd5aON-OfuKUyxqFNU936bf8oFHGYEGy5Z-O&s=10", 
    link: "https://amzn.in/d/0bIkCHUv", 
    store: "Amazon", 
    price: "₹1,599" 
  },
  { 
    id: 3, 
    name: "G-Shock Watch",       
    category: "Watches", 
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500", 
    link: "https://amzn.in/d/04MTt664", 
    store: "Amazon", 
    price: "₹19,395" 
  },
  { 
    id: 4, 
    name: "RGB Keyboard",        
    category: "PC", 
    image: "https://vlebazaar.in/image/cache/catalog/Ant-Esports-MK700-V2-Membrane-TKL-Wired-Gaming-Keyboard-87-UV-Coated-Mec/Ant-Esports-MK700-V2-Membrane-TKL-Wired-Gaming-Keyboard-87-UV-Coated-Mechanical--1200x630h.jpg", 
    link: "https://amzn.in/d/06hMe17C", 
    store: "Amazon", 
    price: "₹699" 
  },
  { 
    id: 5, 
    name: "Gaming Mouse",        
    category: "PC", 
    image: "https://rukminim2.flixcart.com/image/480/640/xif0q/headphone/a/v/z/-original-imagwmkfnyabtwhb.jpeg?q=90", 
    link: "https://amzn.in/d/0g8L3zkL", 
    store: "Amazon", 
    price: "₹1,899" 
  },
  { 
    id: 6, 
    name: "Gaming Controller",      
    category: "Gadget", 
    image: "https://m.media-amazon.com/images/I/81fDtejS4IL._SL1500_.jpg", 
    link: "https://amzn.in/d/04fnYZnR", 
    store: "Amazon", 
    price: "₹1,999" 
  }
];

// ── State ─────────────────────────────────────
let products   = [];
let editingId  = null;

// ── DOM refs ──────────────────────────────────
const grid         = document.getElementById('productGrid');
const emptyState   = document.getElementById('emptyState');
const searchInput  = document.getElementById('searchInput');
const catFilter    = document.getElementById('categoryFilter');
const storeFilter  = document.getElementById('storeFilter');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle   = document.getElementById('modalTitle');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn= document.getElementById('closeModalBtn');
const cancelBtn    = document.getElementById('cancelModalBtn');
const saveBtn      = document.getElementById('saveProductBtn');
const catDatalist  = document.getElementById('catSuggestions');

// admin refs
const adminLoginBtn  = document.getElementById('adminLoginBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const loginOverlay   = document.getElementById('loginOverlay');
const closeLoginBtn  = document.getElementById('closeLoginBtn');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const submitLoginBtn = document.getElementById('submitLoginBtn');
const adminPassword  = document.getElementById('adminPassword');
const loginError     = document.getElementById('loginError');
const siteHeader     = document.querySelector('.site-header');

// form fields
const fName     = document.getElementById('prodName');
const fCategory = document.getElementById('prodCategory');
const fImage    = document.getElementById('prodImage');
const fLink     = document.getElementById('prodLink');
const fStore    = document.getElementById('prodStore');
const fPrice    = document.getElementById('prodPrice');

// ── LocalStorage helpers ──────────────────────
function load() {
  try {
    const raw = localStorage.getItem('gadgetgrid_products');
    products = raw ? JSON.parse(raw) : [...DEFAULTS];
  } catch { products = [...DEFAULTS]; }
}

function save() {
  localStorage.setItem('gadgetgrid_products', JSON.stringify(products));
}

// ── Render ────────────────────────────────────
function render() {
  const q     = searchInput.value.toLowerCase().trim();
  const cat   = catFilter.value;
  const store = storeFilter.value;

  const filtered = products.filter(p => {
    const matchQ     = !q || p.name.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q);
    const matchCat   = cat   === 'all' || p.category === cat;
    const matchStore = store === 'all' || p.store === store;
    return matchQ && matchCat && matchStore;
  });

  grid.innerHTML = '';
  emptyState.style.display = filtered.length === 0 ? 'block' : 'none';

  filtered.forEach(p => {
    const badgeClass = p.store === 'Amazon' ? 'badge-amazon' : p.store === 'Flipkart' ? 'badge-flipkart' : 'badge-other';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${escHtml(p.image)}" alt="${escHtml(p.name)}" loading="lazy"
             onerror="this.src='https://placehold.co/200x200/1a1a1f/f5a623?text=No+Image'" />
      </div>
      ${isAdmin ? `<div class="card-actions" style="z-index: 10;">
        <button class="btn-edit" data-id="${p.id}" title="Edit">✏️</button>
        <button class="btn-del"  data-id="${p.id}" title="Delete">🗑</button>
      </div>` : ''}
      <div class="card-body">
        <div class="card-name">${escHtml(p.name)}</div>
        <div class="card-meta">
          <span class="badge ${badgeClass}">${escHtml(p.store)}</span>
          ${p.category ? `<span class="card-category">${escHtml(p.category)}</span>` : ''}
        </div>
        ${p.price ? `<div class="card-price">${escHtml(p.price)}</div>` : ''}
        <div class="card-link">
          <a href="${escHtml(p.link)}" target="_blank" rel="noopener">Buy Now ↗</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // attach card action listeners
  grid.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); openEdit(+btn.dataset.id); }));
  grid.querySelectorAll('.btn-del').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); deleteProduct(+btn.dataset.id); }));

  refreshCategories();
}

function escHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Category filter options ───────────────────
function refreshCategories() {
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const current = catFilter.value;
  catFilter.innerHTML = '<option value="all">All Categories</option>' +
    cats.map(c => `<option value="${escHtml(c)}" ${c===current?'selected':''}>${escHtml(c)}</option>`).join('');

  catDatalist.innerHTML = cats.map(c => `<option value="${escHtml(c)}"></option>`).join('');
}

// ── CRUD ──────────────────────────────────────
function deleteProduct(id) {
  if (!confirm('Remove this product?')) return;
  products = products.filter(p => p.id !== id);
  save();
  render();
}

function openAdd() {
  editingId = null;
  modalTitle.textContent = 'Add Product';
  [fName, fCategory, fImage, fLink, fPrice].forEach(el => el.value = '');
  fStore.value = 'Amazon';
  openModal();
}

function openEdit(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  modalTitle.textContent = 'Edit Product';
  fName.value     = p.name;
  fCategory.value = p.category || '';
  fImage.value    = p.image;
  fLink.value     = p.link;
  fStore.value    = p.store;
  fPrice.value    = p.price || '';
  openModal();
}

function saveProduct() {
  const name  = fName.value.trim();
  const image = fImage.value.trim();
  const link  = fLink.value.trim();
  if (!name || !image || !link) {
    alert('Name, Image URL, and Product Link are required.');
    return;
  }

  const data = {
    name,
    category: fCategory.value.trim(),
    image,
    link,
    store: fStore.value,
    price: fPrice.value.trim(),
  };

  if (editingId !== null) {
    products = products.map(p => p.id === editingId ? { ...p, ...data } : p);
  } else {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, ...data });
  }

  save();
  closeModal();
  render();
}

// ── Modal ─────────────────────────────────────
function openModal()  { modalOverlay.classList.add('open'); fName.focus(); }
function closeModal() { modalOverlay.classList.remove('open'); editingId = null; }

// ── Events ────────────────────────────────────
openModalBtn.addEventListener('click', openAdd);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveProduct);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

searchInput.addEventListener('input', render);
catFilter.addEventListener('change', render);
storeFilter.addEventListener('change', render);

// Enter key in modal fields
[fName, fCategory, fImage, fLink, fPrice].forEach(el =>
  el.addEventListener('keydown', e => { if (e.key === 'Enter') saveProduct(); }));

// ── Admin auth ────────────────────────────────
function setAdminUI(active) {
  isAdmin = active;
  openModalBtn.style.display  = active ? 'inline-block' : 'none';
  adminLoginBtn.style.display = active ? 'none' : 'inline-block';
  adminLogoutBtn.style.display= active ? 'inline-block' : 'none';
  siteHeader.classList.toggle('admin-active', active);
  render(); // re-render cards to show/hide edit+delete
}

function openLoginModal() {
  adminPassword.value = '';
  loginError.textContent = '';
  loginOverlay.classList.add('open');
  adminPassword.focus();
}
function closeLoginModal() {
  loginOverlay.classList.remove('open');
}
function attemptLogin() {
  if (adminPassword.value === ADMIN_PASSWORD) {
    closeLoginModal();
    setAdminUI(true);
  } else {
    loginError.textContent = 'Wrong password. Try again.';
    adminPassword.value = '';
    adminPassword.focus();
  }
}

adminLoginBtn.addEventListener('click', openLoginModal);
adminLogoutBtn.addEventListener('click', () => setAdminUI(false));
closeLoginBtn.addEventListener('click', closeLoginModal);
cancelLoginBtn.addEventListener('click', closeLoginModal);
submitLoginBtn.addEventListener('click', attemptLogin);
adminPassword.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
loginOverlay.addEventListener('click', e => { if (e.target === loginOverlay) closeLoginModal(); });

// ── Boot ──────────────────────────────────────
load();
render();