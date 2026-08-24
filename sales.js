let currentCart = [];
let selectedPaymentMethod = "cash";
let selectedTable = null;

function showSales() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("salesPage").classList.add("active");
  setPageHeader("🛒", "Punto de Venta", "Realiza ventas rápidamente");
  setActiveNav("sales");
  
  renderDynamicSelector();
  loadPosProducts();
  renderCart();
  closeSidebar();
}

function renderDynamicSelector() {
  const container = document.getElementById("posDynamicSelector");
  const type = window.currentBusiness?.businessType;
  
  if (type === "restaurant" || type === "pizzeria") {
    container.classList.remove("hidden");
    const tables = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Para Llevar"];
    container.innerHTML = `
      <div class="tables-selector">
        <strong>🪑 Selección:</strong>
        ${tables.map(t => `<button class="chip-btn ${selectedTable === t ? 'active' : ''}" onclick="selectTable('${t}')">${t}</button>`).join('')}
      </div>
    `;
  } else {
    container.classList.add("hidden");
  }
}

function selectTable(tableName) {
  selectedTable = selectedTable === tableName ? null : tableName;
  const badge = document.getElementById("selectedTableBadge");
  if (selectedTable) {
    badge.textContent = selectedTable;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
  renderDynamicSelector();
}

async function loadPosProducts() {
  const products = await dbGetAll("products");
  const query = document.getElementById("posProductSearch").value.trim().toLowerCase();
  const filtered = products.filter(p => !query || `${p.name} ${p.sku || ""}`.toLowerCase().includes(query));
  
  const grid = document.getElementById("posProductsGrid");
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-list"><div>📦</div><p>No hay productos disponibles</p></div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(p => `
    <div class="pos-product-card" onclick="addToCart(${p.id})">
      <div class="pos-product-icon">${p.icon || '📦'}</div>
      <strong class="pos-product-name">${escapeHtml(p.name)}</strong>
      <span class="pos-product-price">${formatMoney(p.price)}</span>
      <small class="pos-product-stock">Stock: ${p.stock}</small>
    </div>
  `).join('');
}

async function addToCart(productId) {
  const product = await dbGet("products", productId);
  if (!product) return;
  
  if (product.stock <= 0) {
    showToast("⚠️ Producto agotado");
    return;
  }
  
  const existing = currentCart.find(item => item.id === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast("⚠️ Stock máximo alcanzado");
      return;
    }
    existing.quantity += 1;
  } else {
    currentCart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      stock: product.stock
    });
  }
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cartItemsList");
  if (!currentCart.length) {
    list.innerHTML = `<div class="empty-cart"><p>Carrito vacío</p></div>`;
    updateTotals(0);
    return;
  }
  
  list.innerHTML = currentCart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${formatMoney(item.price)} c/u</span>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateItemQuantity(${index}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateItemQuantity(${index}, 1)">+</button>
      </div>
      <strong class="cart-item-total">${formatMoney(item.price * item.quantity)}</strong>
    </div>
  `).join('');
  
  const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  updateTotals(subtotal);
}

function updateItemQuantity(index, change) {
  const item = currentCart[index];
  item.quantity += change;
  if (item.quantity <= 0) {
    currentCart.splice(index, 1);
  } else if (item.quantity > item.stock) {
    item.quantity = item.stock;
    showToast("⚠️ No hay más stock disponible");
  }
  renderCart();
}

function updateTotals(subtotal) {
  const tax = subtotal * 0.19;
  const total = subtotal + tax;
  
  document.getElementById("cartSubtotal").textContent = formatMoney(subtotal);
  document.getElementById("cartTax").textContent = formatMoney(tax);
  document.getElementById("cartTotal").textContent = formatMoney(total);
}

async function processSale() {
  if (!currentCart.length) {
    showToast("⚠️ El carrito está vacío");
    return;
  }
  
  const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;
  
  const sale = {
    date: new Date().toISOString(),
    items: [...currentCart],
    subtotal,
    tax,
    total,
    paymentMethod: selectedPaymentMethod,
    table: selectedTable || null,
    businessType: window.currentBusiness.businessType
  };
  
  await dbPut("sales", sale);
  
  for (const item of currentCart) {
    const product = await dbGet("products", item.id);
    if (product) {
      product.stock = Number(product.stock) - item.quantity;
      await dbPut("products", product);
      await dbPut("inventoryMovements", {
        productId: product.id,
        type: "sale",
        quantity: -item.quantity,
        previousStock: product.stock + item.quantity,
        newStock: product.stock,
        date: new Date().toISOString()
      });
    }
  }
  
  showToast("🎉 ¡Venta completada con éxito!");
  currentCart = [];
  selectedTable = null;
  renderCart();
  renderDynamicSelector();
  loadPosProducts();
  await updateDashboard();
}

document.getElementById("posProductSearch")?.addEventListener("input", loadPosProducts);
document.getElementById("clearCartBtn")?.addEventListener("click", () => {
  currentCart = [];
  renderCart();
});

document.querySelectorAll(".pay-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    selectedPaymentMethod = e.target.dataset.method;
  });
});

document.getElementById("completeSaleBtn")?.addEventListener("click", processSale);
