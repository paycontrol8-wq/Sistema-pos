// ==========================================
// MÓDULO DE CAJA (ARQUEO Y CIERRES)
// ==========================================
let activeSession = null;

async function showCash() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("cashPage").classList.add("active");
  setPageHeader("💰", "Control de Caja", "Apertura, movimientos y arqueo de turno");
  setActiveNav("cash");
  await loadCashSession();
  closeSidebar();
}

async function loadCashSession() {
  const sessions = await dbGetAll("cash");
  activeSession = sessions.find(s => s.status === "open") || null;
  
  const statusBadge = document.getElementById("cashStatusBadge");
  const btnOpen = document.getElementById("btnOpenCash");
  const btnMov = document.getElementById("btnAddMovement");
  const btnClose = document.getElementById("btnCloseCash");
  
  if (activeSession) {
    statusBadge.textContent = `Estado: Abierta (Desde: ${new Date(activeSession.openedAt).toLocaleTimeString()})`;
    statusBadge.className = "cash-badge open";
    btnOpen.disabled = true;
    btnMov.disabled = false;
    btnClose.disabled = false;
    await calculateCashTotals();
  } else {
    statusBadge.textContent = "Estado: Cerrada";
    statusBadge.className = "cash-badge closed";
    btnOpen.disabled = false;
    btnMov.disabled = true;
    btnClose.disabled = true;
    resetCashSummary();
  }
}

async function calculateCashTotals() {
  if (!activeSession) return;
  const allSales = await dbGetAll("sales");
  const sessionSales = allSales.filter(s => new Date(s.date) >= new Date(activeSession.openedAt));
  
  let cashSales = 0, cardSales = 0, transferSales = 0;
  sessionSales.forEach(s => {
    if (s.paymentMethod === "cash") cashSales += s.total;
    else if (s.paymentMethod === "card") cardSales += s.total;
    else if (s.paymentMethod === "transfer") transferSales += s.total;
  });
  
  let inManual = 0, outManual = 0;
  (activeSession.movements || []).forEach(m => {
    if (m.type === "in") inManual += m.amount;
    else if (m.type === "out") outManual += m.amount;
  });
  
  const expectedCash = activeSession.initialAmount + cashSales + inManual - outManual;
  
  document.getElementById("cashInitAmount").textContent = formatMoney(activeSession.initialAmount);
  document.getElementById("cashSalesCash").textContent = formatMoney(cashSales);
  document.getElementById("cashSalesCard").textContent = formatMoney(cardSales);
  document.getElementById("cashSalesTransfer").textContent = formatMoney(transferSales);
  document.getElementById("cashInManual").textContent = formatMoney(inManual);
  document.getElementById("cashOutManual").textContent = formatMoney(outManual);
  document.getElementById("cashExpectedTotal").textContent = formatMoney(expectedCash);
}

function resetCashSummary() {
  ["cashInitAmount", "cashSalesCash", "cashSalesCard", "cashSalesTransfer", "cashInManual", "cashOutManual", "cashExpectedTotal"].forEach(id => {
    document.getElementById(id).textContent = formatMoney(0);
  });
}

document.getElementById("btnOpenCash")?.addEventListener("click", async () => {
  const amountStr = prompt("Ingrese el monto inicial de la caja (Base):", "0");
  if (amountStr === null) return;
  const initialAmount = Number(amountStr) || 0;
  
  const session = {
    openedAt: new Date().toISOString(),
    status: "open",
    initialAmount,
    movements: []
  };
  
  await dbPut("cash", session);
  showToast("🔓 Caja abierta correctamente");
  await loadCashSession();
});

document.getElementById("btnAddMovement")?.addEventListener("click", () => {
  document.getElementById("cashMovementForm").classList.toggle("hidden");
});

document.getElementById("btnSaveCashMov")?.addEventListener("click", async () => {
  if (!activeSession) return;
  const type = document.getElementById("cashMovType").value;
  const amount = Number(document.getElementById("cashMovAmount").value || 0);
  const reason = document.getElementById("cashMovReason").value.trim();
  
  if (amount <= 0 || !reason) {
    showToast("⚠️ Ingrese un monto válido y un concepto");
    return;
  }
  
  activeSession.movements.push({ type, amount, reason, date: new Date().toISOString() });
  await dbPut("cash", activeSession);
  showToast("💵 Movimiento guardado");
  document.getElementById("cashMovementForm").classList.add("hidden");
  document.getElementById("cashMovAmount").value = "";
  document.getElementById("cashMovReason").value = "";
  await calculateCashTotals();
});

document.getElementById("btnCloseCash")?.addEventListener("click", async () => {
  if (!activeSession) return;
  const expected = document.getElementById("cashExpectedTotal").textContent;
  if (!confirm(`¿Desea cerrar la caja? Efectivo esperado: ${expected}`)) return;
  
  activeSession.status = "closed";
  activeSession.closedAt = new Date().toISOString();
  await dbPut("cash", activeSession);
  showToast("🔒 Caja cerrada con éxito");
  await loadCashSession();
});


// ==========================================
// MÓDULO DE CLIENTES
// ==========================================
async function showCustomers() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("customersPage").classList.add("active");
  setPageHeader("👥", "Clientes", "Directorio y gestión de crédito");
  setActiveNav("customers");
  await loadCustomers();
  closeSidebar();
}

async function loadCustomers() {
  const customers = await dbGetAll("customers");
  const q = document.getElementById("customerSearch").value.trim().toLowerCase();
  const filtered = customers.filter(c => !q || `${c.name} ${c.phone}`.toLowerCase().includes(q));
  const list = document.getElementById("customersList");
  
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-list"><div>👥</div><p>No hay clientes registrados</p></div>`;
    return;
  }
  
  list.innerHTML = filtered.map(c => `
    <article class="product-card">
      <div class="product-main">
        <div class="product-avatar">👤</div>
        <div class="product-info">
          <h3>${escapeHtml(c.name)}</h3>
          <p>📞 ${escapeHtml(c.phone || "Sin teléfono")} • 🏠 ${escapeHtml(c.address || "Sin dirección")}</p>
        </div>
      </div>
      <div class="product-numbers">
        <div><span>Puntos</span><strong>${c.points || 0}</strong></div>
        <div><span>Crédito/Deuda</span><strong class="${c.debt > 0 ? 'stock-low' : ''}">${formatMoney(c.debt || 0)}</strong></div>
      </div>
    </article>
  `).join('');
}

document.getElementById("btnNewCustomer")?.addEventListener("click", async () => {
  const name = prompt("Nombre completo del cliente:");
  if (!name) return;
  const phone = prompt("Teléfono:");
  const address = prompt("Dirección:");
  
  await dbPut("customers", {
    name,
    phone: phone || "",
    address: address || "",
    debt: 0,
    points: 0,
    createdAt: new Date().toISOString()
  });
  
  showToast("🎉 Cliente registrado");
  await loadCustomers();
  await updateDashboard();
});

document.getElementById("customerSearch")?.addEventListener("input", loadCustomers);


// ==========================================
// MÓDULO DE PROVEEDORES Y COMPRAS
// ==========================================
async function showSuppliers() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("suppliersPage").classList.add("active");
  setPageHeader("🚚", "Proveedores", "Gestión de compras y reabastecimiento");
  setActiveNav("suppliers");
  await loadSuppliers();
  closeSidebar();
}

async function loadSuppliers() {
  const suppliers = await dbGetAll("suppliers");
  const list = document.getElementById("suppliersList");
  
  if (!suppliers.length) {
    list.innerHTML = `<div class="empty-list"><div>🚚</div><p>No hay proveedores registrados</p></div>`;
    return;
  }
  
  list.innerHTML = suppliers.map(s => `
    <article class="product-card">
      <div class="product-main">
        <div class="product-avatar">🏭</div>
        <div class="product-info">
          <h3>${escapeHtml(s.name)}</h3>
          <p>Contacto: ${escapeHtml(s.contact || "N/A")} • 📞 ${escapeHtml(s.phone || "Sin teléfono")}</p>
        </div>
      </div>
    </article>
  `).join('');
}

document.getElementById("btnNewSupplier")?.addEventListener("click", async () => {
  const name = prompt("Nombre de la empresa o proveedor:");
  if (!name) return;
  const contact = prompt("Nombre de contacto:");
  const phone = prompt("Teléfono de contacto:");
  
  await dbPut("suppliers", { name, contact: contact || "", phone: phone || "", createdAt: new Date().toISOString() });
  showToast("🎉 Proveedor registrado");
  await loadSuppliers();
});

document.getElementById("btnNewPurchase")?.addEventListener("click", async () => {
  const sku = prompt("Ingrese SKU o Código del producto a reabastecer:");
  if (!sku) return;
  
  const products = await dbGetAll("products");
  const product = products.find(p => p.sku === sku || p.name.toLowerCase() === sku.toLowerCase());
  
  if (!product) {
    showToast("❌ Producto no encontrado");
    return;
  }
  
  const qtyStr = prompt(`Reabastecer "${product.name}". Cantidad a ingresar:`, "10");
  const qty = Number(qtyStr);
  if (!qty || qty <= 0) return;
  
  product.stock = Number(product.stock) + qty;
  await dbPut("products", product);
  
  await dbPut("inventoryMovements", {
    productId: product.id,
    type: "purchase",
    quantity: qty,
    previousStock: product.stock - qty,
    newStock: product.stock,
    date: new Date().toISOString()
  });
  
  showToast(`📦 Inventario actualizado (+${qty} unidades)`);
});
