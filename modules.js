function renderNavigation(){
  const nav=document.getElementById("mainNavigation");
  nav.innerHTML="";
  const b=window.currentBusiness;
  if(!b)return;
  const all={...BASE_MODULES,...(SPECIAL_MODULES[b.businessType]||{})};
  Object.keys(all).forEach(id=>{
    if(!b.modules[id])return;
    const m=all[id],button=document.createElement("button");
    button.className="nav-item";
    button.dataset.page=id;
    button.innerHTML=`<span class="nav-icon">${m.icon}</span><span>${m.name}</span>`;
    button.onclick=()=>openModule(id);
    nav.appendChild(button);
  });
}

function renderQuickActions(){
  const c=document.getElementById("quickActions");
  c.innerHTML="";
  [{id:"sales",icon:"🛒",name:"Nueva venta"},{id:"products",icon:"📦",name:"Producto"},{id:"customers",icon:"👥",name:"Cliente"},{id:"cash",icon:"💰",name:"Caja"}].forEach(a=>{
    const b=document.createElement("button");
    b.className="quick-action";
    b.innerHTML=`<span class="quick-action-icon">${a.icon}</span><strong>${a.name}</strong>`;
    b.onclick=()=>openModule(a.id);
    c.appendChild(b);
  });
}

function openModule(id){
  if(id==="dashboard"){showDashboard();return}
  if(id==="sales"){showSales();return}
  if(id==="products"){showProducts();return}
  if(id==="inventory"){showInventory();return}
  if(id==="cash"){showCash();return}
  if(id==="customers"){showCustomers();return}
  if(id==="suppliers"){showSuppliers();return}
  
  const b=window.currentBusiness,all={...BASE_MODULES,...(SPECIAL_MODULES[b.businessType]||{})},m=all[id];
  if(!m)return;
  setPageHeader(m.icon,m.name,m.description);
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("dynamicPage").classList.add("active");
  document.getElementById("dynamicTitle").textContent=m.name;
  document.getElementById("dynamicDescription").textContent=`El módulo de ${m.name.toLowerCase()} está preparado para la siguiente fase.`;
  setActiveNav(id);
  closeSidebar();
}

function setPageHeader(icon,title,subtitle){document.getElementById("pageIcon").textContent=icon;document.getElementById("pageTitle").textContent=title;document.getElementById("pageSubtitle").textContent=subtitle}
function setActiveNav(id){document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===id))}
function showDashboard(){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.getElementById("dashboardPage").classList.add("active");setPageHeader("🏠","Dashboard","Resumen de tu negocio");setActiveNav("dashboard");closeSidebar()}
function activateDashboardNavigation(){setActiveNav("dashboard")}
