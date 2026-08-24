const BUSINESS_TYPES = [
  { id: "store", name: "Tienda", icon: "🛒", description: "Venta general" },
  { id: "clothing", name: "Ropa", icon: "👕", description: "Tallas y colores" },
  { id: "restaurant", name: "Restaurante", icon: "🍔", description: "Mesas y cocina" },
  { id: "icecream", name: "Heladería", icon: "🍦", description: "Productos y sabores" },
  { id: "barbershop", name: "Barbería", icon: "💇", description: "Citas y servicios" },
  { id: "beauty", name: "Estética", icon: "💅", description: "Citas y servicios" },
  { id: "pharmacy", name: "Farmacia", icon: "💊", description: "Lotes y vencimientos" },
  { id: "workshop", name: "Taller", icon: "🔧", description: "Vehículos y órdenes" },
  { id: "technology", name: "Tecnología", icon: "📱", description: "Equipos y accesorios" },
  { id: "minimarket", name: "Minimercado", icon: "🏪", description: "Inventario y ventas" },
  { id: "bakery", name: "Panadería", icon: "🧁", description: "Productos y producción" },
  { id: "veterinary", name: "Veterinaria", icon: "🐶", description: "Mascotas y servicios" },
  { id: "distributor", name: "Distribuidora", icon: "📦", description: "Ventas por volumen" },
  { id: "services", name: "Servicios", icon: "🏢", description: "Servicios y clientes" },
  { id: "liquor", name: "Licorería", icon: "🍷", description: "Venta por botella o copa" },
  { id: "petshop", name: "Pet Shop", icon: "🐕", description: "Mascotas y alimento a granel" },
  { id: "bookstore", name: "Librería / Papelería", icon: "📚", description: "ISBN y combos escolares" },
  { id: "spa", name: "Spa / Estética", icon: "💆‍♀️", description: "Gestión de espacios" },
  { id: "pizzeria", name: "Pizzería", icon: "🍕", description: "Productos armables y toppings" },
  { id: "custom", name: "Personalizado", icon: "⚙️", description: "Configura tu sistema" }
];

const BASE_MODULES = {
  dashboard: { id: "dashboard", name: "Inicio", icon: "🏠", description: "Resumen de tu negocio" },
  sales: { id: "sales", name: "Ventas", icon: "🛒", description: "Realiza y consulta ventas" },
  products: { id: "products", name: "Productos", icon: "📦", description: "Administra tus productos" },
  inventory: { id: "inventory", name: "Inventario", icon: "📊", description: "Control de existencias" },
  customers: { id: "customers", name: "Clientes", icon: "👥", description: "Administra tus clientes" },
  suppliers: { id: "suppliers", name: "Proveedores", icon: "🚚", description: "Administra proveedores" },
  purchases: { id: "purchases", name: "Compras", icon: "🧾", description: "Registra compras" },
  cash: { id: "cash", name: "Caja", icon: "💰", description: "Control de caja" },
  reports: { id: "reports", name: "Reportes", icon: "📈", description: "Analiza tu negocio" }
};

const SPECIAL_MODULES = {
  restaurant: { tables: { id: "tables", name: "Mesas", icon: "🪑", description: "Gestiona las mesas" }, orders: { id: "orders", name: "Pedidos", icon: "🍽️", description: "Gestiona pedidos" }, kitchen: { id: "kitchen", name: "Cocina", icon: "👨‍🍳", description: "Control de cocina" } },
  clothing: { sizes: { id: "sizes", name: "Tallas", icon: "📏", description: "Gestiona tallas" }, colors: { id: "colors", name: "Colores", icon: "🎨", description: "Gestiona colores" } },
  barbershop: { appointments: { id: "appointments", name: "Citas", icon: "📅", description: "Agenda citas" }, services: { id: "services", name: "Servicios", icon: "💇", description: "Gestiona servicios" }, barbers: { id: "barbers", name: "Barberos", icon: "👨‍💼", description: "Gestiona barberos" } },
  beauty: { appointments: { id: "appointments", name: "Citas", icon: "📅", description: "Agenda citas" }, services: { id: "services", name: "Servicios", icon: "💅", description: "Gestiona servicios" } },
  pharmacy: { batches: { id: "batches", name: "Lotes", icon: "🧪", description: "Gestiona lotes" }, expiration: { id: "expiration", name: "Vencimientos", icon: "⏰", description: "Controla vencimientos" } },
  workshop: { vehicles: { id: "vehicles", name: "Vehículos", icon: "🚗", description: "Gestiona vehículos" }, workOrders: { id: "workOrders", name: "Órdenes", icon: "📋", description: "Órdenes de trabajo" } },
  veterinary: { pets: { id: "pets", name: "Mascotas", icon: "🐶", description: "Gestiona mascotas" }, appointments: { id: "appointments", name: "Citas", icon: "📅", description: "Agenda veterinaria" } },
  bakery: { production: { id: "production", name: "Producción", icon: "👨‍🍳", description: "Control de producción" } },
  distributor: { wholesale: { id: "wholesale", name: "Ventas mayoristas", icon: "📦", description: "Ventas por volumen" } },
  liquor: { bottles: { id: "bottles", name: "Fraccionado", icon: "🥂", description: "Venta por copas/medidas" } },
  petshop: { bulk: { id: "bulk", name: "Venta a granel", icon: "⚖️", description: "Pesaje e insumos" } },
  bookstore: { isbn: { id: "isbn", name: "Catálogo ISBN", icon: "📖", description: "Búsqueda por autor/editorial" } },
  spa: { cabins: { id: "cabins", name: "Cabinas / Salas", icon: "💆‍♀️", description: "Gestión de espacios" } },
  pizzeria: { toppings: { id: "toppings", name: "Ingredientes Extra", icon: "🍕", description: "Armado de pizzas" } }
};

function createBusinessConfig(type) {
  const modules = { dashboard: true, sales: true, products: true, inventory: true, customers: true, suppliers: true, purchases: true, cash: true, reports: true };
  Object.keys(SPECIAL_MODULES[type] || {}).forEach(k => modules[k] = true);
  return modules;
}

function getBusinessType(id) {
  return BUSINESS_TYPES.find(x => x.id === id);
}
