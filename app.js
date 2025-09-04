// URL de tu Apps Script
const API_URL =
  "https://script.google.com/macros/s/AKfycbwk8iMX5hY-x4VqwOiGIIRQaz6IiT9rhp3GuA6f2ELOiNVQx3w0CL7v2sjp3aAWtRyd/exec"; // Cambia por la URL final

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
    formaPago: document.getElementById("formaPago").value,
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
  fetch(API_URL + "?action=dashboard")
    .then((res) => res.json())
    .then((data) => dibujarGraficos(data))
    .catch((err) => console.error("Error cargando dashboard:", err));
}


function dibujarGraficos(data) {
  // Barras: Ingresos vs Gastos
  const barData = google.visualization.arrayToDataTable([
    ["Tipo", "Monto", { role: "style" }],
    ["Ingresos", data.totalIngresos, "color: #5cb85c"], // verde
    ["Gastos", data.totalGastos, "color: #d9534f"],     // rojo
  ]);
  new google.visualization.ColumnChart(
    document.getElementById("barChart")
  ).draw(barData, {
    title: "Ingresos vs Gastos (Mes actual)",
    backgroundColor: "transparent",
    titleTextStyle: { color: '#fff' },
    legend: { position: "none", textStyle: { color: "#fff" } },
    hAxis: { textStyle: { color: "#fff" } },
    vAxis: { textStyle: { color: "#fff" } }
  });

  // Pastel Gastos
  const pieGastos = google.visualization.arrayToDataTable(
    data.gastosPorCategoria
  );
  new google.visualization.PieChart(document.getElementById("pieGastos")).draw(
    pieGastos,
    { 
      title: "Gastos por Categoría", 
      pieHole: 0.3,
      backgroundColor: "transparent",
      titleTextStyle: { color: "#fff" },
      legend: { textStyle: { color: "#fff" } }
    }
  );

  // Pastel Ingresos
  const pieIngresos = google.visualization.arrayToDataTable(
    data.ingresosPorFuente
  );
  new google.visualization.PieChart(
    document.getElementById("pieIngresos")
  ).draw(pieIngresos, 
    { 
      title: "Gastos por Categoría", 
      pieHole: 0.3,
      backgroundColor: "transparent",
      titleTextStyle: { color: "#fff" },
      legend: { textStyle: { color: "#fff" } }
    });

//  Ingresos vs Gastos por Mes
const mensualData = google.visualization.arrayToDataTable(data.ingresosYGastosPorMes);

new google.visualization.ColumnChart(
  document.getElementById("barMeses")
).draw(mensualData, {
  title: "Ingresos vs Gastos por Mes (Año actual)",
  backgroundColor: "transparent",
  titleTextStyle: { color: "#fff" },
  legend: { textStyle: { color: "#fff" } },
  hAxis: { textStyle: { color: "#fff" } },
  vAxis: { textStyle: { color: "#fff" } },
  colors: ["#5cb85c", "#d9534f"] // ingresos verde, gastos rojo
});
}