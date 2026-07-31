/* ===================================================
   FASHION_BAAY — MAIN.JS
=================================================== */

/* ---------- STATE ---------- */
let cart = JSON.parse(localStorage.getItem("fb_cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("fb_favorites") || "[]");
let currentFilters = { category: "", color: "", size: "", sort: "" };
let appliedCoupon = null;
let testimonialIndex = 0;
let activeProduct = null;

/* ---------- HELPERS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const formatBRL = (v) => "R$ " + v.toFixed(2).replace(".", ",");

function showToast(msg, icon = "fa-circle-check") {
  const toast = $("#toast");
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

function saveCart() { localStorage.setItem("fb_cart", JSON.stringify(cart)); updateCartUI(); }
function saveFavorites() { localStorage.setItem("fb_favorites", JSON.stringify(favorites)); updateFavUI(); }

function getProduct(id) { return PRODUCTS.find(p => p.id === id); }

/* ===================================================
   LOADING SCREEN
=================================================== */
window.addEventListener("load", () => {
  setTimeout(() => $("#loading-screen").classList.add("hidden"), 900);
});

/* ===================================================
   DARK MODE
=================================================== */
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("fb_theme", theme);
  const icon = theme === "dark" ? "fa-sun" : "fa-moon";
  $("#darkModeToggle").innerHTML = `<i class="fa-solid ${icon}"></i>`;
  const sw = $("#darkModeSwitch");
  if (sw) sw.checked = theme === "dark";
}
(function initTheme() {
  const saved = localStorage.getItem("fb_theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(saved);
})();
$("#darkModeToggle").addEventListener("click", () => {
  applyTheme(document.body.getAttribute("data-theme") === "dark" ? "light" : "dark");
});
document.addEventListener("change", (e) => {
  if (e.target.id === "darkModeSwitch") applyTheme(e.target.checked ? "dark" : "light");
});

/* ===================================================
   MOBILE MENU
=================================================== */
$("#mobileMenuBtn").addEventListener("click", () => {
  $("#navMobile").classList.toggle("show");
});
$all("#navMobile a").forEach(a => a.addEventListener("click", () => $("#navMobile").classList.remove("show")));

/* ===================================================
   SCROLL REVEAL + BACK TO TOP + PARALLAX
=================================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); });
}, { threshold: 0.15 });
$all(".reveal").forEach(el => revealObserver.observe(el));

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  $("#backToTop").classList.toggle("show", y > 500);
  $all(".hero-blob").forEach((blob, i) => {
    blob.style.transform = `translateY(${y * (0.08 + i * 0.04)}px)`;
  });
}, { passive: true });

$("#backToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===================================================
   CATEGORIES
=================================================== */
function renderCategories() {
  const grid = $("#categoriesGrid");
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card reveal active" data-cat="${cat.id}">
      <img src="${cat.img}" alt="${cat.name}" loading="lazy">
      <span>${cat.name}</span>
    </div>
  `).join("");
  $all(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      currentFilters.category = card.dataset.cat === "promocoes" ? "" : card.dataset.cat;
      if (card.dataset.cat === "promocoes") currentFilters.sort = "promo";
      $("#filterCategory").value = currentFilters.category;
      renderProducts();
      $("#produtos").scrollIntoView({ behavior: "smooth" });
    });
  });
  // populate category filter
  const sel = $("#filterCategory");
  CATEGORIES.filter(c => c.id !== "promocoes").forEach(c => {
    sel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`);
  });
  // colors + sizes filters
  const colorSel = $("#filterColor");
  Object.keys(COLORS).forEach(c => colorSel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));
  const sizeSet = new Set();
  PRODUCTS.forEach(p => p.sizes.forEach(s => sizeSet.add(s)));
  const sizeSel = $("#filterSize");
  Array.from(sizeSet).forEach(s => sizeSel.insertAdjacentHTML("beforeend", `<option value="${s}">${s}</option>`));
}

/* ===================================================
   PRODUCTS RENDER + FILTER + SORT
=================================================== */
function skeletonGrid(n = 8) {
  return Array.from({ length: n }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-media"></div>
      <div class="skeleton skeleton-line w60"></div>
      <div class="skeleton skeleton-line w40"></div>
    </div>
  `).join("");
}

function productCardHTML(p) {
  const isFav = favorites.includes(p.id);
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : 0;
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-media" data-open-product="${p.id}">
      <div class="product-badges">
        ${p.tag === "novo" ? '<span class="badge-tag">Novo</span>' : ""}
        ${discount > 0 ? `<span class="badge-tag">-${discount}%</span>` : ""}
        ${p.stock <= 5 ? '<span class="badge-tag stock-low">Últimas unidades</span>' : ""}
      </div>
      <button class="fav-btn ${isFav ? "active" : ""}" data-fav="${p.id}" aria-label="Favoritar">
        <i class="fa-${isFav ? "solid" : "regular"} fa-heart"></i>
      </button>
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      <div class="quick-add" data-open-product="${p.id}">Visualização Rápida</div>
    </div>
    <div class="product-info">
      <span class="product-cat">${CATEGORIES.find(c => c.id === p.category)?.name || ""}</span>
      <div class="product-name" data-open-product="${p.id}">${p.name}</div>
      <div class="product-rating">
        ${starIcons(p.rating)} <span>${p.rating} (${p.reviews})</span>
      </div>
      <div class="product-price">
        ${p.oldPrice ? `<span class="price-old">${formatBRL(p.oldPrice)}</span>` : ""}
        <span class="price-new">${formatBRL(p.price)}</span>
        ${discount > 0 ? `<span class="price-off">-${discount}%</span>` : ""}
      </div>
      <div class="product-swatches">
        ${p.colors.map(c => `<span class="swatch" style="background:${COLORS[c]}" title="${c}"></span>`).join("")}
      </div>
      <button class="add-cart-btn" data-add="${p.id}"><i class="fa-solid fa-bag-shopping"></i> Adicionar ao Carrinho</button>
    </div>
  </div>`;
}

function starIcons(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) html += `<i class="fa-${i <= Math.round(rating) ? "solid" : "regular"} fa-star"></i>`;
  return html;
}

function getFilteredProducts() {
  let list = [...PRODUCTS];
  const term = $("#searchInput").value.trim().toLowerCase();
  if (term) list = list.filter(p => p.name.toLowerCase().includes(term));
  if (currentFilters.category) list = list.filter(p => p.category === currentFilters.category);
  if (currentFilters.color) list = list.filter(p => p.colors.includes(currentFilters.color));
  if (currentFilters.size) list = list.filter(p => p.sizes.includes(currentFilters.size));
  if (currentFilters.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (currentFilters.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (currentFilters.sort === "promo") list = list.filter(p => p.oldPrice > 0);
  return list;
}

function renderProducts() {
  const grid = $("#productsGrid");
  grid.innerHTML = skeletonGrid(8);
  setTimeout(() => {
    const list = getFilteredProducts();
    $("#resultsCount").textContent = `${list.length} produto${list.length !== 1 ? "s" : ""} encontrado${list.length !== 1 ? "s" : ""}`;
    $("#productsEmpty").style.display = list.length ? "none" : "block";
    grid.innerHTML = list.map(productCardHTML).join("");
    grid.style.display = list.length ? "grid" : "none";
    bindProductEvents();
  }, 450);
}

function bindProductEvents() {
  $all("[data-open-product]").forEach(el => {
    el.addEventListener("click", () => openProductModal(parseInt(el.dataset.openProduct)));
  });
  $all("[data-fav]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(parseInt(el.dataset.fav));
    });
  });
  $all("[data-add]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const p = getProduct(parseInt(el.dataset.add));
      addToCart(p, p.sizes[0], p.colors[0], 1);
    });
  });
}

$("#filterCategory").addEventListener("change", (e) => { currentFilters.category = e.target.value; renderProducts(); });
$("#filterColor").addEventListener("change", (e) => { currentFilters.color = e.target.value; renderProducts(); });
$("#filterSize").addEventListener("change", (e) => { currentFilters.size = e.target.value; renderProducts(); });
$("#filterSort").addEventListener("change", (e) => { currentFilters.sort = e.target.value; renderProducts(); });
$("#clearFilters").addEventListener("click", () => {
  currentFilters = { category: "", color: "", size: "", sort: "" };
  $all(".filters select").forEach(s => s.value = "");
  $("#searchInput").value = "";
  renderProducts();
});

/* ===================================================
   SEARCH (instant)
=================================================== */
let searchTimeout;
$("#searchInput").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const term = e.target.value.trim().toLowerCase();
  const results = $("#searchResults");
  if (!term) { results.classList.remove("show"); renderProducts(); return; }
  searchTimeout = setTimeout(() => {
    const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(term)).slice(0, 6);
    results.innerHTML = matches.length
      ? matches.map(p => `
        <div class="search-result-item" data-open-product="${p.id}">
          <img src="${p.images[0]}" alt="${p.name}">
          <div class="sr-info"><strong>${p.name}</strong><span>${formatBRL(p.price)}</span></div>
        </div>`).join("")
      : `<div class="search-empty">Nenhum produto encontrado</div>`;
    results.classList.add("show");
    $all("[data-open-product]", results).forEach(el => {
      el.addEventListener("click", () => { openProductModal(parseInt(el.dataset.openProduct)); results.classList.remove("show"); });
    });
    renderProducts();
  }, 250);
});
document.addEventListener("click", (e) => {
  if (!$("#searchBox").contains(e.target)) $("#searchResults").classList.remove("show");
});

/* ===================================================
   FAVORITES
=================================================== */
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast("Removido dos favoritos", "fa-heart-crack");
  } else {
    favorites.push(id);
    showToast("Adicionado aos favoritos!", "fa-heart");
  }
  saveFavorites();
  renderProducts();
  renderFavoritesGrid();
}
function updateFavUI() { $("#favBadge").textContent = favorites.length; }

function renderFavoritesGrid() {
  const grid = $("#favoritesGrid");
  if (!grid) return;
  const items = PRODUCTS.filter(p => favorites.includes(p.id));
  grid.innerHTML = items.length ? items.map(productCardHTML).join("") : `<p style="color:var(--text-soft);font-size:.87rem;">Você ainda não tem favoritos.</p>`;
  bindProductEvents();
}

$("#favBtn").addEventListener("click", () => openAccountModal("favoritos"));

/* ===================================================
   CART
=================================================== */
function addToCart(product, size, color, qty = 1) {
  const existing = cart.find(i => i.id === product.id && i.size === size && i.color === color);
  if (existing) existing.qty += qty;
  else cart.push({ id: product.id, name: product.name, price: product.price, image: product.images[0], size, color, qty });
  saveCart();
  showToast(`${product.name} adicionado ao carrinho!`, "fa-bag-shopping");
  openCart();
}

function removeFromCart(index) { cart.splice(index, 1); saveCart(); }
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
}

function cartTotals() {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const frete = subtotal > 299 || subtotal === 0 ? 0 : 15;
  let discount = appliedCoupon ? subtotal * appliedCoupon.value : 0;
  const total = Math.max(subtotal - discount + frete, 0);
  return { subtotal, frete, discount, total };
}

function updateCartUI() {
  const itemsEl = $("#cartItems");
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartBadge").textContent = count;

  if (!cart.length) {
    itemsEl.style.display = "none";
    $("#cartEmpty").style.display = "flex";
    $("#cartFooter").style.display = "none";
    return;
  }
  itemsEl.style.display = "block";
  $("#cartEmpty").style.display = "none";
  $("#cartFooter").style.display = "block";

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>Tam: ${item.size} • Cor: ${item.color}</span>
        <div class="cart-item-price">${formatBRL(item.price * item.qty)}</div>
        <div class="qty-control">
          <button data-qty-down="${i}">−</button>
          <span>${item.qty}</span>
          <button data-qty-up="${i}">+</button>
          <span class="remove-item" data-remove="${i}" style="margin-left:10px;cursor:pointer;">Remover</span>
        </div>
      </div>
    </div>
  `).join("");

  $all("[data-qty-up]", itemsEl).forEach(b => b.addEventListener("click", () => changeQty(parseInt(b.dataset.qtyUp), 1)));
  $all("[data-qty-down]", itemsEl).forEach(b => b.addEventListener("click", () => changeQty(parseInt(b.dataset.qtyDown), -1)));
  $all("[data-remove]", itemsEl).forEach(b => b.addEventListener("click", () => removeFromCart(parseInt(b.dataset.remove))));

  const { subtotal, frete, total } = cartTotals();
  $("#cartFrete").textContent = frete === 0 ? "Grátis" : formatBRL(frete);
  $("#cartSubtotal").textContent = formatBRL(subtotal);
  $("#cartTotal").textContent = formatBRL(total);
}

function openCart() { $("#cartDrawer").classList.add("open"); $("#overlay").classList.add("show"); }
function closeCart() { $("#cartDrawer").classList.remove("open"); $("#overlay").classList.remove("show"); }

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", () => { closeCart(); closeAllModals(); });
$("#cartEmptyBtn").addEventListener("click", closeCart);

$("#applyCoupon").addEventListener("click", () => {
  const code = $("#couponInput").value.trim().toUpperCase();
  const msg = $("#couponMsg");
  if (COUPONS[code]) {
    appliedCoupon = { code, value: COUPONS[code] };
    msg.textContent = `Cupom ${code} aplicado! -${COUPONS[code] * 100}%`;
    msg.className = "coupon-msg ok";
    showToast("Cupom aplicado com sucesso!", "fa-tag");
  } else {
    appliedCoupon = null;
    msg.textContent = "Cupom inválido.";
    msg.className = "coupon-msg err";
  }
  updateCartUI();
});

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  showToast("Pedido enviado! Redirecionando para o WhatsApp...", "fa-check");
  const items = cart.map(i => `• ${i.name} (Tam ${i.size}, ${i.color}) x${i.qty}`).join("%0A");
  const { total } = cartTotals();
  const msg = `Olá! Gostaria de finalizar minha compra na Fashion_Baay:%0A${items}%0A%0ATotal: ${formatBRL(total)}`;
  setTimeout(() => window.open(`https://wa.me/5500000000000?text=${msg}`, "_blank"), 900);
});

/* ===================================================
   PRODUCT MODAL (quick view)
=================================================== */
function openProductModal(id) {
  const p = getProduct(id);
  if (!p) return;
  activeProduct = { ...p, selectedSize: p.sizes[0], selectedColor: p.colors[0] };
  renderProductModal();
  $("#productModalOverlay").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeProductModal() {
  $("#productModalOverlay").classList.remove("show");
  document.body.style.overflow = "";
}

function renderProductModal() {
  const p = activeProduct;
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : 0;
  const related = PRODUCTS.filter(r => r.category === p.category && r.id !== p.id).slice(0, 4);

  $("#productModalBody").innerHTML = `
    <div class="pm-gallery">
      <div class="pm-main-img" id="pmMainImg"><img src="${p.images[0]}" alt="${p.name}"></div>
      <div class="pm-thumbs">
        ${p.images.map((img, i) => `<img src="${img}" class="${i === 0 ? "active" : ""}" data-thumb="${i}">`).join("")}
      </div>
    </div>
    <div class="pm-details">
      <span class="product-cat">${CATEGORIES.find(c => c.id === p.category)?.name}</span>
      <h2>${p.name}</h2>
      <div class="product-rating">${starIcons(p.rating)} <span>${p.rating} (${p.reviews} avaliações)</span></div>
      <div class="pm-price">
        ${p.oldPrice ? `<span class="price-old">${formatBRL(p.oldPrice)}</span>` : ""}
        <span class="price-new">${formatBRL(p.price)}</span>
        ${discount > 0 ? `<span class="price-off">-${discount}%</span>` : ""}
      </div>
      <p class="pm-desc">${p.desc}</p>

      <div class="pm-option-label">Tamanho</div>
      <div class="pm-sizes">
        ${p.sizes.map(s => `<div class="size-opt ${s === p.selectedSize ? "active" : ""}" data-size="${s}">${s}</div>`).join("")}
      </div>

      <div class="pm-option-label">Cor</div>
      <div class="pm-colors">
        ${p.colors.map(c => `<span class="swatch ${c === p.selectedColor ? "active" : ""}" style="background:${COLORS[c]}" data-color="${c}" title="${c}"></span>`).join("")}
      </div>

      <div class="pm-stock ${p.stock <= 5 ? "low" : ""}">
        <i class="fa-solid fa-circle-check"></i> ${p.stock <= 5 ? `Últimas ${p.stock} unidades!` : `${p.stock} em estoque`}
      </div>

      <div class="pm-actions">
        <button class="btn btn-primary" id="pmAddCart"><i class="fa-solid fa-bag-shopping"></i> Adicionar ao Carrinho</button>
        <button class="fav-btn ${favorites.includes(p.id) ? "active" : ""}" id="pmFav" style="position:static;background:var(--bg-alt);width:48px;height:48px;">
          <i class="fa-${favorites.includes(p.id) ? "solid" : "regular"} fa-heart"></i>
        </button>
      </div>

      <div class="pm-tabs">
        <div class="pm-tab active" data-ptab="desc">Descrição</div>
        <div class="pm-tab" data-ptab="tamanhos">Tabela de Medidas</div>
        <div class="pm-tab" data-ptab="avaliacoes">Avaliações (${p.reviews})</div>
      </div>
      <div class="pm-tab-content active" data-pcontent="desc"><p>${p.desc}</p></div>
      <div class="pm-tab-content" data-pcontent="tamanhos">
        <table class="size-table">
          <tr><th>Tamanho</th><th>Busto (cm)</th><th>Cintura (cm)</th><th>Quadril (cm)</th></tr>
          <tr><td>PP</td><td>78</td><td>60</td><td>84</td></tr>
          <tr><td>P</td><td>82</td><td>64</td><td>88</td></tr>
          <tr><td>M</td><td>86</td><td>68</td><td>92</td></tr>
          <tr><td>G</td><td>90</td><td>72</td><td>96</td></tr>
          <tr><td>GG</td><td>94</td><td>76</td><td>100</td></tr>
        </table>
      </div>
      <div class="pm-tab-content" data-pcontent="avaliacoes">
        ${sampleReviews(p)}
      </div>
    </div>
    <div class="related-products">
      <h4>Você também pode gostar</h4>
      <div class="related-grid">${related.map(productCardHTML).join("")}</div>
    </div>
  `;

  bindProductModalEvents();
  bindProductEvents();
}

function sampleReviews(p) {
  const names = ["Ana P.", "Marcela S.", "Rafaela T.", "Bianca F."];
  let html = "";
  for (let i = 0; i < Math.min(3, p.reviews); i++) {
    html += `<div class="review-item">
      <div class="stars">${starIcons(4 + (i % 2 ? 0 : 1) - (i === 2 ? 1 : 0))}</div>
      <strong>${names[i]}</strong>
      <p style="margin:4px 0 0;">Peça linda, chegou rapidinho e o caimento é perfeito. Recomendo muito!</p>
    </div>`;
  }
  return html;
}

function bindProductModalEvents() {
  $all(".pm-thumbs img").forEach(t => t.addEventListener("click", () => {
    $all(".pm-thumbs img").forEach(i => i.classList.remove("active"));
    t.classList.add("active");
    $("#pmMainImg img").src = activeProduct.images[t.dataset.thumb];
  }));
  $("#pmMainImg").addEventListener("click", function () { this.classList.toggle("zoomed"); });

  $all(".size-opt").forEach(s => s.addEventListener("click", () => {
    activeProduct.selectedSize = s.dataset.size;
    $all(".size-opt").forEach(i => i.classList.remove("active"));
    s.classList.add("active");
  }));
  $all(".pm-colors .swatch").forEach(c => c.addEventListener("click", () => {
    activeProduct.selectedColor = c.dataset.color;
    $all(".pm-colors .swatch").forEach(i => i.classList.remove("active"));
    c.classList.add("active");
  }));

  $all(".pm-tab").forEach(tab => tab.addEventListener("click", () => {
    $all(".pm-tab").forEach(t => t.classList.remove("active"));
    $all(".pm-tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    $(`[data-pcontent="${tab.dataset.ptab}"]`).classList.add("active");
  }));

  $("#pmAddCart").addEventListener("click", () => {
    addToCart(activeProduct, activeProduct.selectedSize, activeProduct.selectedColor, 1);
  });
  $("#pmFav").addEventListener("click", () => {
    toggleFavorite(activeProduct.id);
    renderProductModal();
  });
}

$("#closeProductModal").addEventListener("click", closeProductModal);
$("#productModalOverlay").addEventListener("click", (e) => { if (e.target.id === "productModalOverlay") closeProductModal(); });

/* ===================================================
   COUNTDOWN
=================================================== */
function initCountdown() {
  let deadline = localStorage.getItem("fb_countdown");
  if (!deadline || new Date(deadline) < new Date()) {
    deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem("fb_countdown", deadline);
  }
  function tick() {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) { localStorage.removeItem("fb_countdown"); initCountdown(); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    $("#cd-days").textContent = String(d).padStart(2, "0");
    $("#cd-hours").textContent = String(h).padStart(2, "0");
    $("#cd-min").textContent = String(m).padStart(2, "0");
    $("#cd-sec").textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

/* ===================================================
   TESTIMONIALS CAROUSEL
=================================================== */
function renderTestimonials() {
  $("#testimonialsTrack").innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-inner">
        <i class="fa-solid fa-quote-left"></i>
        <p>"${t.text}"</p>
        <div class="testimonial-user">
          <img src="${t.avatar}" alt="${t.name}">
          <div>
            <strong>${t.name}</strong>
            <span style="font-size:.75rem;color:var(--text-soft);">${t.city}</span>
            <div class="stars">${starIcons(t.rating)}</div>
          </div>
        </div>
      </div>
    </div>
  `).join("");
  $("#testimonialsDots").innerHTML = TESTIMONIALS.map((_, i) => `<span class="t-dot ${i === 0 ? "active" : ""}" data-dot="${i}"></span>`).join("");
  $all(".t-dot").forEach(dot => dot.addEventListener("click", () => goToTestimonial(parseInt(dot.dataset.dot))));
  setInterval(() => goToTestimonial((testimonialIndex + 1) % TESTIMONIALS.length), 5000);
}
function goToTestimonial(i) {
  testimonialIndex = i;
  $("#testimonialsTrack").style.transform = `translateX(-${i * 100}%)`;
  $all(".t-dot").forEach((d, idx) => d.classList.toggle("active", idx === i));
}

/* ===================================================
   INSTAGRAM GRID
=================================================== */
function renderInstagram() {
  $("#instagramGrid").innerHTML = INSTAGRAM_IMAGES.map(src => `
    <div class="instagram-item"><img src="${src}" alt="Instagram Fashion_Baay" loading="lazy"></div>
  `).join("");
}

/* ===================================================
   LOGIN / CADASTRO / RECUPERAR MODAL
=================================================== */
function openLoginModal(tab = "entrar") {
  switchAuthTab(tab);
  $("#loginModalOverlay").classList.add("show");
}
function closeLoginModal() { $("#loginModalOverlay").classList.remove("show"); }
function switchAuthTab(tab) {
  $all(".auth-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
  $all(".auth-form").forEach(f => f.classList.toggle("active", f.dataset.form === tab));
}
$all(".auth-tab").forEach(t => t.addEventListener("click", () => switchAuthTab(t.dataset.tab)));
$all("[data-switch]").forEach(a => a.addEventListener("click", () => switchAuthTab(a.dataset.switch)));
$("#closeLoginModal").addEventListener("click", closeLoginModal);
$("#loginModalOverlay").addEventListener("click", (e) => { if (e.target.id === "loginModalOverlay") closeLoginModal(); });
$all(".auth-form").forEach(form => form.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = form.dataset.form;
  closeLoginModal();
  if (type === "entrar") showToast("Login realizado com sucesso!", "fa-user-check");
  if (type === "cadastro") showToast("Conta criada com sucesso! Bem-vinda 💜", "fa-user-plus");
  if (type === "recuperar") showToast("Link de recuperação enviado para seu e-mail!", "fa-envelope");
}));
$("#accountBtn").addEventListener("click", () => openLoginModal("entrar"));

/* ===================================================
   ACCOUNT MODAL
=================================================== */
function openAccountModal(tab = "pedidos") {
  switchAccountTab(tab);
  renderOrders();
  renderFavoritesGrid();
  $("#accountModalOverlay").classList.add("show");
}
function closeAccountModal() { $("#accountModalOverlay").classList.remove("show"); }
function switchAccountTab(tab) {
  $all(".account-tab").forEach(t => t.classList.toggle("active", t.dataset.atab === tab));
  $all(".account-pane").forEach(p => p.classList.toggle("active", p.dataset.apane === tab));
}
$all(".account-tab").forEach(t => t.addEventListener("click", () => switchAccountTab(t.dataset.atab)));
$("#closeAccountModal").addEventListener("click", closeAccountModal);
$("#accountModalOverlay").addEventListener("click", (e) => { if (e.target.id === "accountModalOverlay") closeAccountModal(); });

function renderOrders() {
  const orders = [
    { id: "#FB1042", date: "22/07/2026", status: "Entregue", cls: "", items: "Vestido Midi Floral, Cropped Ombro a Ombro" },
    { id: "#FB1039", date: "15/07/2026", status: "Em trânsito", cls: "transit", items: "Conjunto Fitness Bio Cós" },
    { id: "#FB1021", date: "02/07/2026", status: "Entregue", cls: "", items: "Calça Wide Leg Alfaiataria" }
  ];
  $("#ordersList").innerHTML = orders.map(o => `
    <div class="order-item">
      <div><strong>${o.id}</strong><p style="font-size:.8rem;color:var(--text-soft);margin-top:4px;">${o.items}<br>${o.date}</p></div>
      <span class="oi-status ${o.cls}">${o.status}</span>
    </div>
  `).join("");
}

/* ===================================================
   INFO MODAL (Sobre / Troca / Privacidade / FAQ)
=================================================== */
const INFO_CONTENT = {
  sobre: `
    <h2>Sobre a Fashion_Baay 💜</h2>
    <p>A Fashion_Baay nasceu da paixão por moda e pelo desejo de levar peças bonitas, atuais e acessíveis para mulheres que querem estar sempre em alta.</p>
    <p>Somos uma loja virtual e física, localizada em Potim-SP, com atendimento todos os dias da semana. Trabalhamos com curadoria cuidadosa de cada peça, buscando qualidade, caimento perfeito e tendências direto para o seu guarda-roupa.</p>
    <p>Esteja sempre na moda com a Fashion_Baay ✨</p>
  `,
  troca: `
    <h2>Política de Troca & Devolução</h2>
    <p>Você tem até <strong>3 dias corridos</strong> após o recebimento para solicitar troca ou devolução.</p>
    <h4>Troca</h4>
    <p>A primeira troca é gratuita. Basta nos informar via Direct ou WhatsApp.</p>
    <h4>Devolução</h4>
    <p>A devolução também é gratuita. O reembolso é feito conforme a forma de pagamento utilizada.</p>
    <h4>Não trocamos</h4>
    <ul>
      <li>Peças íntimas por questões de higiene</li>
      <li>Itens sem etiqueta ou com sinais de uso</li>
    </ul>
    <p><strong>Atenção:</strong> após a confirmação da troca com o motoboy, a peça deve estar exatamente como recebida, apenas experimentada.</p>
  `,
  privacidade: `
    <h2>Política de Privacidade</h2>
    <p>Levamos sua privacidade a sério. Seus dados pessoais (nome, e-mail, endereço e telefone) são utilizados exclusivamente para processar pedidos, entregas e comunicação sobre promoções, caso você opte por recebê-las.</p>
    <p>Não compartilhamos suas informações com terceiros, exceto parceiros de entrega necessários para completar sua compra.</p>
    <p>Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato conosco.</p>
  `,
  faq: `
    <h2>Perguntas Frequentes</h2>
    <div class="faq-item"><div class="faq-q">Qual o prazo de entrega? <i class="fa-solid fa-chevron-down"></i></div><div class="faq-a"><p>Enviamos para todo o Brasil. Em Potim-SP e região, a entrega é feita via motoboy no mesmo dia.</p></div></div>
    <div class="faq-item"><div class="faq-q">Como faço para comprar? <i class="fa-solid fa-chevron-down"></i></div><div class="faq-a"><p>Você pode comprar direto pelo site, pelo Direct do Instagram ou pelo WhatsApp.</p></div></div>
    <div class="faq-item"><div class="faq-q">Quais as formas de pagamento? <i class="fa-solid fa-chevron-down"></i></div><div class="faq-a"><p>Pix, cartão de crédito/débito e boleto.</p></div></div>
    <div class="faq-item"><div class="faq-q">Posso trocar o tamanho? <i class="fa-solid fa-chevron-down"></i></div><div class="faq-a"><p>Sim! A primeira troca é totalmente gratuita em até 3 dias corridos.</p></div></div>
  `
};
function openInfoModal(key) {
  $("#infoModalBody").innerHTML = INFO_CONTENT[key] || "";
  $("#infoModalOverlay").classList.add("show");
  $all(".faq-q", $("#infoModalBody")).forEach(q => q.addEventListener("click", () => q.parentElement.classList.toggle("open")));
}
$("#closeInfoModal").addEventListener("click", () => $("#infoModalOverlay").classList.remove("show"));
$("#infoModalOverlay").addEventListener("click", (e) => { if (e.target.id === "infoModalOverlay") $("#infoModalOverlay").classList.remove("show"); });
$all("[data-modal]").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); openInfoModal(a.dataset.modal); }));
$all("[data-open='account']").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); openAccountModal(a.dataset.tab || "pedidos"); }));
$all("[data-open='login']").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); openLoginModal(a.dataset.tab === "cadastro" ? "cadastro" : "entrar"); }));

function closeAllModals() {
  $all(".modal-overlay").forEach(m => m.classList.remove("show"));
  document.body.style.overflow = "";
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeAllModals(); closeCart(); } });

/* ===================================================
   NEWSLETTER
=================================================== */
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("Inscrição realizada! Fique de olho no seu e-mail 💜", "fa-envelope-circle-check");
  e.target.reset();
});

/* ===================================================
   INIT
=================================================== */
renderCategories();
renderProducts();
renderTestimonials();
renderInstagram();
initCountdown();
updateCartUI();
updateFavUI();
