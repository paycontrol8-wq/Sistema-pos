let selectedBusinessType=null;
document.addEventListener("DOMContentLoaded",async()=>{try{await openDatabase();const b=await dbGet("business","main");if(b){window.currentBusiness=b;showMainApp()}else showSetup()}catch(e){console.error(e);showToast("❌ No se pudo iniciar la base de datos")}});

function showSetup(){document.getElementById("setupScreen").classList.remove("hidden");document.getElementById("mainApp").classList.add("hidden");renderBusinessTypes()}
function renderBusinessTypes(){const c=document.getElementById("businessTypes");c.innerHTML="";BUSINESS_TYPES.forEach(b=>{const o=document.createElement("button");o.type="button";o.className="business-option";o.innerHTML=`<div class="business-icon">${b.icon}</div><div class="business-name">${b.name}</div>`;o.onclick=()=>{document.querySelectorAll(".business-option").forEach(x=>x.classList.remove("selected"));o.classList.add("selected");selectedBusinessType=b.id;document.getElementById("continueBusiness").disabled=false};c.appendChild(o)})}
document.getElementById("continueBusiness").onclick=()=>{if(!selectedBusinessType)return;document.getElementById("setupStep1").classList.remove("active");document.getElementById("setupStep2").classList.add("active");document.querySelector(".progress-active").style.flex="2"};
document.getElementById("backBusiness").onclick=()=>{document.getElementById("setupStep2").classList.remove("active");document.getElementById("setupStep1").classList.add("active")};
document.getElementById("saveBusiness").onclick=createBusiness;

async function createBusiness(){const name=document.getElementById("businessName").value.trim(),phone=document.getElementById("businessPhone").value.trim(),address=document.getElementById("businessAddress").value.trim(),currency=document.getElementById("businessCurrency").value;if(!name){showToast("⚠️ Escribe el nombre de tu negocio");return}const type=getBusinessType(selectedBusinessType);const business={id:"main",name,phone,address,currency,businessType:selectedBusinessType,businessTypeName:type.name,businessIcon:type.icon,modules:createBusinessConfig(selectedBusinessType),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await dbPut("business",business);window.currentBusiness=business;showToast("🎉 ¡Tu negocio fue configurado!");setTimeout(showMainApp,500)}

async function showMainApp(){const b=window.currentBusiness;document.getElementById("setupScreen").classList.add("hidden");document.getElementById("mainApp").classList.remove("hidden");document.getElementById("sidebarBusinessName").textContent=b.name;document.getElementById("sidebarLogo").textContent=b.businessIcon;document.getElementById("welcomeBusinessName").textContent=b.name;document.getElementById("systemBusinessType").textContent=b.businessTypeName;renderNavigation();renderQuickActions();activateDashboardNavigation();await updateDashboard()}
async function updateDashboard(){const products=await dbGetAll("products"),customers=await dbCount("customers");const low=products.filter(p=>Number(p.stock)<=Number(p.minStock||0)).length;document.getElementById("statProducts").textContent=products.length;document.getElementById("statCustomers").textContent=customers;document.getElementById("statLowStock").textContent=low;document.getElementById("statSales").textContent=formatMoney(0)}
function formatMoney(amount){return new Intl.NumberFormat("es-CO",{style:"currency",currency:window.currentBusiness?.currency||"COP"}).format(amount)}
function showToast(message){const c=document.getElementById("toastContainer"),t=document.createElement("div");t.className="toast";t.textContent=message;c.appendChild(t);setTimeout(()=>t.remove(),3000)}
function toggleTheme(){document.body.classList.toggle("dark");const dark=document.body.classList.contains("dark");localStorage.setItem("pos_theme",dark?"dark":"light");document.getElementById("themeButton").innerHTML=dark?"☀️ <span>Modo claro</span>":"🌙 <span>Modo oscuro</span>"}
document.getElementById("themeButton").onclick=toggleTheme;
function loadTheme(){if(localStorage.getItem("pos_theme")==="dark"){document.body.classList.add("dark");document.getElementById("themeButton").innerHTML="☀️ <span>Modo claro</span>"}}
document.getElementById("settingsButton").onclick=()=>showToast("⚙️ Configuración avanzada: próxima fase.");
document.getElementById("notificationButton").onclick=()=>showToast("🔔 No tienes nuevas notificaciones.");
document.getElementById("backDashboard").onclick=showDashboard;
document.getElementById("menuButton").onclick=()=>{document.getElementById("sidebar").classList.add("open");document.getElementById("sidebarOverlay").classList.add("active")};
document.getElementById("sidebarOverlay").onclick=closeSidebar;
function closeSidebar(){document.getElementById("sidebar").classList.remove("open");document.getElementById("sidebarOverlay").classList.remove("active")}
loadTheme();
