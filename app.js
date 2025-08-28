// URL de tu Apps Script
const API_URL =
  "https://script.google.com/macros/s/AKfycbwJPgx_qbAIKm8e-IkLDw-b56VMlCfKCdMJZSMVIkujjRCEn3DKtA1hkYHQYHnMAC9b/exec"; // Cambia por la URL final

/* ---------------- Formularios ---------------- */

// Subcategorías dinámicas para gastos
const categorias = {
  Vivienda: ["Agua", "Luz", "Gas", "Empleada Doméstica", "Otros"],
  Coches: [
    "Combustible",
    "Seguros",
    "Trámites",
    "Mantenimiento",
    "Estacionamiento",
    "TAG",
    "Otros",
  ],
  Alimentación: ["Comestibles", "Vales", "Restaurantes", "Otros"],
  Educación: [
    "Colegiatura",
    "Inscripciones",
    "Útiles",
    "Clases tarde",
    "Terapias",
  ],
  "Ahorros o Inversiones": ["Seguro GMM", "Vacaciones", "Inversión", "Ahorro"],
  Edi: [
    "Comidas",
    "Cosas",
    "Ropa",
    "Medicinas",
    "Gimnasio",
    "Peluquería",
    "Otros",
  ],
  Frida: [
    "Comidas",
    "Cosas",
    "Pelucas",
    "Belleza",
    "Ropa",
    "Consulta Medica",
    "Medicinas",
    "Clases",
    "Otros",
  ],
  Niños: [
    "Pañales",
    "Consulta Medica",
    "Vacunas",
    "Medicinas",
    "Ropa",
    "Cosas",
    "Otros",
  ],
  "Regalos y Donativos": ["Donativos", "Regalos"],
};

// Llenar categorías al cargar la página de gastos
function cargarCategorias() {
  const catSel = document.getElementById("categoria");
  if (!catSel) return;
  catSel.innerHTML = "<option value=''>--Selecciona--</option>";
  for (let c in categorias) {
    let opt = document.createElement("option");
    opt.value = c;
    opt.text = c;
    catSel.add(opt);
  }
  cargarSubcategorias();
}

// Llenar subcategorías según categoría seleccionada
function cargarSubcategorias() {
  const cat = document.getElementById("categoria")?.value;
  const subcat = document.getElementById("subcategoria");
  if (!subcat || !cat) return;
  subcat.innerHTML = "";
  categorias[cat].forEach((s) => {
    let opt = document.createElement("option");
    opt.value = s;
    opt.text = s;
    subcat.add(opt);
  });
}

// Enviar gasto con GET
function enviarGasto(e) {
  e.preventDefault();
  const params = new URLSearchParams({
    action: "gasto",
    categoria: document.getElementById("categoria").value,
    subcategoria: document.getElementById("subcategoria").value,
    fecha: document.getElementById("fecha").value,
    monto: document.getElementById("monto").value,
    descripcion: document.getElementById("descripcion").value,
  });

  fetch(`${API_URL}?${params.toString()}`)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        alert("Gasto registrado ✅");
        document.getElementById("formGasto").reset();
      } else {
        alert("Error: " + (res.message || res.error));
      }
    })
    .catch(err => alert("Error al enviar: " + err.message));
}

// Enviar ingreso con GET
function enviarIngreso(e) {
  e.preventDefault();
  const params = new URLSearchParams({
    action: "ingreso",
    fuente: document.getElementById("fuente").value,
    fecha: document.getElementById("fecha").value,
    monto: document.getElementById("monto").value,
    descripcion: document.getElementById("descripcion").value,
  });

  fetch(`${API_URL}?${params.toString()}`)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        alert("Ingreso registrado ✅");
        document.getElementById("formIngreso").reset();
      } else {
        alert("Error: " + (res.message || res.error));
      }
    })
    .catch(err => alert("Error al enviar: " + err.message));
}

/* ---------------- Dashboard ---------------- */
google.charts.load("current", { packages: ["corechart", "bar"] });
google.charts.setOnLoadCallback(cargarDashboard);

function cargarDashboard() {
  google.script.run.withSuccessHandler(dibujarGraficos).obtenerDashboardData();
}

function dibujarGraficos(data) {
  // Barras: Ingresos vs Gastos
  const barData = google.visualization.arrayToDataTable([
    ["Tipo", "Monto"],
    ["Ingresos", data.totalIngresos],
    ["Gastos", data.totalGastos],
  ]);
  new google.visualization.ColumnChart(
    document.getElementById("barChart")
  ).draw(barData, {
    title: "Ingresos vs Gastos (Mes actual)",
    colors: ["#5cb85c", "#d9534f"],
    legend: { position: "none" },
  });

  // Pastel Gastos
  const pieGastos = google.visualization.arrayToDataTable(
    data.gastosPorCategoria
  );
  new google.visualization.PieChart(document.getElementById("pieGastos")).draw(
    pieGastos,
    { title: "Gastos por Categoría", pieHole: 0.3 }
  );

  // Pastel Ingresos
  const pieIngresos = google.visualization.arrayToDataTable(
    data.ingresosPorFuente
  );
  new google.visualization.PieChart(
    document.getElementById("pieIngresos")
  ).draw(pieIngresos, { title: "Ingresos por Fuente", pieHole: 0.3 });
}
