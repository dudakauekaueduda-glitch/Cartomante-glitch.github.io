/* ===================================================
   FASHION_BAAY — ADMIN.JS
=================================================== */
const $ = (s, c = document) => c.querySelector(s);
const $all = (s, c = document) => Array.from(c.querySelectorAll(s));
const formatBRL = (v) => "R$ " + v.toFixed(2).replace(".", ",");

/* THEME */
(function initTheme() {
  const saved = localStorage.getItem("fb_theme") || "light";
  document.body.setAttribute("data-theme", saved);
  $("#adminDarkToggle").innerHTML = `<i class="fa-solid ${saved === "dark" ? "fa-sun" : "fa-moon"}"></i>`;
})();
$("#adminDarkToggle").addEventListener("click", () => {
  const t = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", t);
  localStorage.setItem("fb_theme", t);
  $("#adminDarkToggle").innerHTML = `<i class="fa-solid ${t === "dark" ? "fa-sun" : "fa-moon"}"></i>`;
});

/* SIDEBAR NAV */
$all(".admin-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    $all(".admin-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const panel = link.dataset.panel;
    $all(".admin-panel").forEach(p => p.classList.toggle("active", p.dataset.panelContent === panel));
    $("#panelTitle").textContent = link.textContent.trim();
    $("#adminSidebar").classList.remove("show");
  });
});
$("#adminMenuBtn").addEventListener("click", () => $("#adminSidebar").classList.toggle("show"));

/* MOCK ORDERS */
const ORDERS = [
  { id: "#FB1042", client: "Juliana Costa", date: "22/07/2026", total: 259.90, status: "entregue" },
  { id: "#FB1041", client: "Fernanda Lima", date: "21/07/2026", total: 139.90, status: "transito" },
  { id: "#FB1040", client: "Camila Santos", date: "20/07/2026", total: 429.80, status: "entregue" },
  { id: "#FB1039", client: "Beatriz Alves", date: "19/07/2026", total: 189.90, status: "pendente" },
  { id: "#FB1038", client: "Larissa Souza", date: "18/07/2026", total: 99.90, status: "cancelado" },
  { id: "#FB1037", client: "Patrícia Rocha", date: "17/07/2026", total: 349.70, status: "entregue" },
  { id: "#FB1036", client: "Vanessa Melo", date: "16/07/2026", total: 79.90, status: "transito" }
];

const CLIENTS = [
  { name: "Juliana Costa", email: "juliana.costa@email.com", orders: 8, spent: 1240.50 },
  { name: "Fernanda Lima", email: "fernanda.lima@email.com", orders: 5, spent: 890.30 },
  { name: "Camila Santos", email: "camila.santos@email.com", orders: 12, spent: 2140.00 },
  { name: "Beatriz Alves", email: "beatriz.alves@email.com", orders: 3, spent: 420.90 },
  { name: "Larissa Souza", email: "larissa.souza@email.com", orders: 6, spent: 760.40 }
];

const COUPONS_ADMIN = [
  { code: "BAAY10", discount: "10%", uses: 128, status: "ok", validity: "31/12/2026" },
  { code: "BAAY20", discount: "20%", uses: 64, status: "ok", validity: "31/08/2026" },
  { code: "BEMVINDA", discount: "15%", uses: 302, status: "ok", validity: "Sem expiração" },
  { code: "VERAO24", discount: "25%", uses: 45, status: "baixo", validity: "01/03/2026 (expirado)" }
];

const statusLabel = { entregue: "Entregue", transito: "Em trânsito", pendente: "Pendente", cancelado: "Cancelado" };

function statusPill(status) { return `<span class="status-pill ${status}">${statusLabel[status]}</span>`; }

/* DASHBOARD */
function renderSalesChart() {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const values = [40, 65, 50, 80, 95, 70, 55];
  const max = Math.max(...values);
  $("#salesChart").innerHTML = days.map((d, i) => `
    <div class="bar-col">
      <div class="bar" style="height:${(values[i] / max) * 100}%"></div>
      <span>${d}</span>
    </div>`).join("");
}

function renderCatLegend() {
  const data = [
    { name: "Vestidos", pct: 28, color: "#8b5cf6" },
    { name: "Conjuntos", pct: 22, color: "#ec4899" },
    { name: "Moda Fitness", pct: 18, color: "#a855f7" },
    { name: "Blusas", pct: 16, color: "#c4b5fd" },
    { name: "Outros", pct: 16, color: "#f0abfc" }
  ];
  $("#catLegend").innerHTML = data.map(d => `
    <div class="legend-row">
      <span class="legend-dot" style="background:${d.color}"></span>
      <span class="legend-name">${d.name}</span>
      <span class="legend-bar"><span class="legend-bar-fill" style="width:${d.pct}%;background:${d.color}"></span></span>
      <span class="legend-pct">${d.pct}%</span>
    </div>`).join("");
}

function renderRecentOrders() {
  $("#recentOrdersTable").innerHTML = `
    <tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th></tr>
    ${ORDERS.slice(0, 5).map(o => `
      <tr><td><strong>${o.id}</strong></td><td>${o.client}</td><td>${o.date}</td><td>${formatBRL(o.total)}</td><td>${statusPill(o.status)}</td></tr>
    `).join("")}
  `;
}

/* PRODUTOS */
function renderProductsTable(filter = "") {
  const list = PRODUCTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  $("#productsTable").innerHTML = `
    <tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Avaliação</th><th>Ações</th></tr>
    ${list.map(p => `
      <tr>
        <td style="display:flex;align-items:center;"><img src="${p.images[0]}" alt="${p.name}">${p.name}</td>
        <td>${CATEGORIES.find(c => c.id === p.category)?.name}</td>
        <td>${formatBRL(p.price)}</td>
        <td>${p.stock <= 5 ? `<span class="status-pill baixo">${p.stock} un.</span>` : `<span class="status-pill ok">${p.stock} un.</span>`}</td>
        <td>⭐ ${p.rating}</td>
        <td class="table-actions"><button><i class="fa-solid fa-pen"></i></button><button><i class="fa-solid fa-trash"></i></button></td>
      </tr>`).join("")}
  `;
}
$("#adminProductSearch").addEventListener("input", (e) => renderProductsTable(e.target.value));

/* PEDIDOS */
function renderOrdersTable() {
  $("#ordersTable").innerHTML = `
    <tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr>
    ${ORDERS.map(o => `
      <tr><td><strong>${o.id}</strong></td><td>${o.client}</td><td>${o.date}</td><td>${formatBRL(o.total)}</td><td>${statusPill(o.status)}</td>
      <td class="table-actions"><button><i class="fa-solid fa-eye"></i></button><button><i class="fa-solid fa-truck"></i></button></td></tr>
    `).join("")}
  `;
}

/* CLIENTES */
function renderClientsTable() {
  $("#clientsTable").innerHTML = `
    <tr><th>Cliente</th><th>E-mail</th><th>Pedidos</th><th>Total Gasto</th><th>Ações</th></tr>
    ${CLIENTS.map(c => `
      <tr><td><strong>${c.name}</strong></td><td>${c.email}</td><td>${c.orders}</td><td>${formatBRL(c.spent)}</td>
      <td class="table-actions"><button><i class="fa-solid fa-eye"></i></button></td></tr>
    `).join("")}
  `;
}

/* CUPONS */
function renderCouponsTable() {
  $("#couponsTable").innerHTML = `
    <tr><th>Código</th><th>Desconto</th><th>Usos</th><th>Validade</th><th>Status</th><th>Ações</th></tr>
    ${COUPONS_ADMIN.map(c => `
      <tr><td><strong>${c.code}</strong></td><td>${c.discount}</td><td>${c.uses}</td><td>${c.validity}</td>
      <td><span class="status-pill ${c.status}">${c.status === "ok" ? "Ativo" : "Expirado"}</span></td>
      <td class="table-actions"><button><i class="fa-solid fa-pen"></i></button><button><i class="fa-solid fa-trash"></i></button></td></tr>
    `).join("")}
  `;
}

/* PROMOÇÕES */
function renderPromoCards() {
  const promos = [
    { title: "Coleção de Inverno", desc: "Até 40% OFF em peças selecionadas", status: "ok", period: "01/08 – 15/08/2026" },
    { title: "Frete Grátis", desc: "Acima de R$299 em compras", status: "ok", period: "Permanente" },
    { title: "Liquidação Fitness", desc: "30% OFF na linha fitness", status: "baixo", period: "Encerrada em 15/07/2026" }
  ];
  $("#promoCards").innerHTML = promos.map(p => `
    <div class="promo-card-admin">
      <span class="status-pill ${p.status}">${p.status === "ok" ? "Ativa" : "Encerrada"}</span>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      <small style="color:var(--text-soft);font-size:.78rem;">${p.period}</small>
    </div>`).join("");
}

/* CATEGORIAS */
function renderCatAdmin() {
  $("#catAdminGrid").innerHTML = CATEGORIES.filter(c => c.id !== "promocoes").map(c => `
    <div class="cat-admin-card">
      <img src="${c.img}" alt="${c.name}">
      <div class="cat-admin-card-body">
        <strong>${c.name}</strong>
        <span>${PRODUCTS.filter(p => p.category === c.id).length} produtos</span>
      </div>
    </div>`).join("");
}

/* ESTOQUE */
function renderStockTable() {
  $("#stockTable").innerHTML = `
    <tr><th>Produto</th><th>Categoria</th><th>Estoque Atual</th><th>Status</th></tr>
    ${[...PRODUCTS].sort((a, b) => a.stock - b.stock).map(p => `
      <tr>
        <td style="display:flex;align-items:center;"><img src="${p.images[0]}" alt="${p.name}">${p.name}</td>
        <td>${CATEGORIES.find(c => c.id === p.category)?.name}</td>
        <td>${p.stock} un.</td>
        <td>${p.stock <= 5 ? '<span class="status-pill baixo">Estoque baixo</span>' : '<span class="status-pill ok">Normal</span>'}</td>
      </tr>`).join("")}
  `;
}

/* RELATÓRIOS */
function renderRevenueChart() {
  const months = ["Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
  const values = [55, 62, 70, 68, 85, 92];
  const max = Math.max(...values);
  $("#revenueChart").innerHTML = months.map((m, i) => `
    <div class="bar-col">
      <div class="bar" style="height:${(values[i] / max) * 100}%"></div>
      <span>${m}</span>
    </div>`).join("");
}

/* INIT */
renderSalesChart();
renderCatLegend();
renderRecentOrders();
renderProductsTable();
renderOrdersTable();
renderClientsTable();
renderCouponsTable();
renderPromoCards();
renderCatAdmin();
renderStockTable();
renderRevenueChart();
