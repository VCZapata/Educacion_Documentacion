const ids = [
  'alumno','ciclo','empresa','desplazamiento','dias','kmDia','precioKm','fechas','horas','jornadas',
  'precioBillete','numBilletes','precioMenu','numMenus','ibanPais','ibanCtrlPais','ibanEntidad',
  'ibanOficina','ibanDc','ibanCuenta','fechaDia','fechaMes','fechaAnio'
];

const $ = (id) => document.getElementById(id);
const toNum = (v) => Number.parseFloat(v) || 0;
const toInt = (v) => Number.parseInt(v, 10) || 0;
const money = (n) => (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
const txt = (v) => (v ?? '').toString().trim();
const digitAt = (value, index) => ((value ?? '').toString().replace(/\D/g, '').charAt(index) || '')

function readData() {
  return {
    alumno: txt($('alumno').value),
    ciclo: txt($('ciclo').value),
    empresa: txt($('empresa').value),
    desplazamiento: txt($('desplazamiento').value),
    dias: toInt($('dias').value),
    kmDia: toNum($('kmDia').value),
    precioKm: toNum($('precioKm').value),
    fechas: txt($('fechas').value),
    horas: txt($('horas').value),
    jornadas: txt($('jornadas').value),
    precioBillete: toNum($('precioBillete').value),
    numBilletes: toInt($('numBilletes').value),
    precioMenu: toNum($('precioMenu').value),
    numMenus: toInt($('numMenus').value),
    ibanPais: txt($('ibanPais').value).toUpperCase(),
    ibanCtrlPais: txt($('ibanCtrlPais').value),
    ibanEntidad: txt($('ibanEntidad').value),
    ibanOficina: txt($('ibanOficina').value),
    ibanDc: txt($('ibanDc').value),
    ibanCuenta: txt($('ibanCuenta').value),
    fechaDia: txt($('fechaDia').value),
    fechaMes: txt($('fechaMes').value),
    fechaAnio: txt($('fechaAnio').value)
  };
}

function compute(data) {
  const kmTotal = data.dias * data.kmDia;
  const totalBilletes = data.precioBillete * data.numBilletes;
  const precioMenuAplicado = Math.min(data.precioMenu, 9);
  const totalMenus = precioMenuAplicado * data.numMenus;
  const totalVehiculo = data.dias * data.kmDia * data.precioKm;
  const totalGeneral = totalBilletes + totalMenus + totalVehiculo;
  const fechaAnioCorto = data.fechaAnio ? String(data.fechaAnio).slice(-2) : '';

  return {
    ...data,
    kmDia: data.kmDia ? String(data.kmDia) : '',
    kmTotal: kmTotal ? String(Number(kmTotal.toFixed(2))) : '',
    jornadas: data.dias ? String(data.dias) : '',
    ibanCtrlPais1: digitAt(data.ibanCtrlPais, 0),
    ibanCtrlPais2: digitAt(data.ibanCtrlPais, 1),
    ibanEntidad1: digitAt(data.ibanEntidad, 0),
    ibanEntidad2: digitAt(data.ibanEntidad, 1),
    ibanEntidad3: digitAt(data.ibanEntidad, 2),
    ibanEntidad4: digitAt(data.ibanEntidad, 3),
    ibanOficina1: digitAt(data.ibanOficina, 0),
    ibanOficina2: digitAt(data.ibanOficina, 1),
    ibanOficina3: digitAt(data.ibanOficina, 2),
    ibanOficina4: digitAt(data.ibanOficina, 3),
    ibanDc1: digitAt(data.ibanDc, 0),
    ibanDc2: digitAt(data.ibanDc, 1),
    ibanCuenta1: digitAt(data.ibanCuenta, 0),
    ibanCuenta2: digitAt(data.ibanCuenta, 1),
    ibanCuenta3: digitAt(data.ibanCuenta, 2),
    ibanCuenta4: digitAt(data.ibanCuenta, 3),
    ibanCuenta5: digitAt(data.ibanCuenta, 4),
    ibanCuenta6: digitAt(data.ibanCuenta, 5),
    ibanCuenta7: digitAt(data.ibanCuenta, 6),
    ibanCuenta8: digitAt(data.ibanCuenta, 7),
    ibanCuenta9: digitAt(data.ibanCuenta, 8),
    ibanCuenta10: digitAt(data.ibanCuenta, 9),
    precioKm: data.precioKm ? money(data.precioKm) : '',
    totalBilletes: totalBilletes ? money(totalBilletes) : '',
    totalMenus: totalMenus ? money(totalMenus) : '',
    totalVehiculo: totalVehiculo ? money(totalVehiculo) : '',
    totalGeneral: totalGeneral ? money(totalGeneral) : '0.00',
    fechaAnioCorto
  };
}

function render() {
  const data = compute(readData());
  document.querySelectorAll('[data-out]').forEach(el => {
    const key = el.dataset.out;
    el.textContent = data[key] ?? '';
  });
}

function saveState() {
  const state = {};
  ids.forEach(id => state[id] = $(id).value);
  localStorage.setItem('hoja_gastos_state', JSON.stringify(state));
}

function restoreState() {
  const raw = localStorage.getItem('hoja_gastos_state');
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    ids.forEach(id => {
      if (state[id] !== undefined) $(id).value = state[id];
    });
  } catch {}
}

async function downloadPDF() {
  const btn = $('btnPdf');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generando PDF...';
  try {
    const target = $('documento');
    const canvas = await html2canvas(target, {
      scale: 2.4,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
    const alumnoName = txt(document.getElementById('alumno').value) || 'sin_nombre';
    const safeName = alumnoName.replace(/[/\?%*:|"<>]/g, '').replace(/\s+/g, '');
    const filename = 'Hojadegastos_' + safeName + '.pdf';
    pdf.save(filename)
  } catch (err) {
    console.error(err);
    alert('No se pudo generar el PDF automáticamente. Usa el botón Imprimir y elige “Guardar como PDF”.');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

function clearForm() {
  if (!confirm('¿Quieres borrar todos los datos?')) return;
  ids.forEach(id => {
    const el = $(id);
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else if (id === 'ibanPais') el.value = 'ES';
    else if (['dias','kmDia','precioKm','horas','jornadas','precioBillete','numBilletes','precioMenu','numMenus'].includes(id)) {
      el.value = id === 'precioKm' ? '0.12' : '0';
    } else {
      el.value = '';
    }
  });
  localStorage.removeItem('hoja_gastos_state');
  render();
}

ids.forEach(id => {
  $(id).addEventListener('input', () => {
    render();
    saveState();
  });
  $(id).addEventListener('change', () => {
    render();
    saveState();
  });
});

$('btnPdf').addEventListener('click', downloadPDF);
$('btnPrint').addEventListener('click', () => window.print());
$('btnClear').addEventListener('click', clearForm);

restoreState();
render();
