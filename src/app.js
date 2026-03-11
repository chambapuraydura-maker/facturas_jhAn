/* ═══════════════════════════════════════════════════════════════
  app.js — Facturador Pro
  Alineado con schema Prisma real
═══════════════════════════════════════════════════════════════ */

/* ── ESTADO GLOBAL ── */
let invoices   = [];
let clients    = [];
let cartaItems = [];
let empresa    = {};
let categorias = [];

let currentCatId = null;
let currentInvoiceId = null;
let currentClientId  = null;
let pendingDeleteFn  = null;

/* ══════════════════════════════════════════════════════════════
  INIT
══════════════════════════════════════════════════════════════ */
async function init() {
  try {
    const [inv, cli, menu, emp, cats] = await Promise.all([
      window.api.facturas.getAll(),
      window.api.clientes.getAll(),
      window.api.menu.getAll(),
      window.api.empresas.getAll(),
      window.api.categorias.getAll(),
    ]);

    invoices   = inv  || [];
    clients    = cli  || [];
    cartaItems = menu || [];
    empresa    = (emp && emp[0]) || {};
    categorias = cats || [];
    currentCatId = categorias[0]?.id || null; 

    renderInvList();
    renderClientList();
    renderCartaCatList();
    renderCarta();
    loadEmpresaForm();
    renderQuickPills();

    document.getElementById('loadScreen').style.display = 'none';
    document.getElementById('appRoot').style.display    = '';

    if (invoices.length > 0) openInvoice(invoices[0].id);

  } catch (err) {
    console.error('Error en init:', err);
    showToast('❌ Error al cargar datos: ' + err.message, true);
    document.getElementById('loadScreen').style.display = 'none';
    document.getElementById('appRoot').style.display    = '';
  }
}

/* ══════════════════════════════════════════════════════════════
  NAVEGACIÓN
══════════════════════════════════════════════════════════════ */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');
  document.getElementById('tab-' + name)?.classList.add('active');
}

/* ══════════════════════════════════════════════════════════════
  TOAST
══════════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent       = msg;
  t.style.background  = isError ? 'var(--red-dim)' : 'var(--bg-raised)';
  t.style.borderColor = isError ? '#7f1d1d'        : 'var(--border-md)';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════════════════
  MODAL CONFIRM
══════════════════════════════════════════════════════════════ */
function openConfirm(title, text, onOk) {
  document.getElementById('confTitle').textContent = title;
  document.getElementById('confText').textContent  = text;
  pendingDeleteFn = onOk;
  document.getElementById('confirmOverlay').classList.add('open');
}
function closeOverlay(id) {
  document.getElementById(id)?.classList.remove('open');
}
document.getElementById('confOk').onclick = async () => {
  if (pendingDeleteFn) await pendingDeleteFn();
  closeOverlay('confirmOverlay');
};

/* ══════════════════════════════════════════════════════════════
  FACTURAS — lista lateral
══════════════════════════════════════════════════════════════ */
function renderInvList(filter = '') {
  const list = document.getElementById('invList');
  const f    = filter.toLowerCase();
  const filtered = invoices.filter(inv => {
    const cn = inv.cliente ? inv.cliente.nombre.toLowerCase() : '';
    return !f || cn.includes(f) || String(inv.numero).includes(f);
  });

  if (!filtered.length) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-4);font-size:.83rem">Sin resultados</div>';
    return;
  }

  list.innerHTML = filtered.map(inv => `
    <div class="f-item ${inv.id === currentInvoiceId ? 'active' : ''}" onclick="openInvoice('${inv.id}')">
      <div>
        <div class="fi-num">Nº ${String(inv.numero).padStart(4,'0')}</div>
        <div class="fi-client">${inv.cliente ? escHtml(inv.cliente.nombre) : '— Sin cliente —'}</div>
        <div class="fi-date">${formatDate(inv.createdAt)}</div>
      </div>
      <div class="fi-right">
        <span class="fi-total">${fmtEur(inv.total)}</span>
        <span class="badge ${badgeClass(inv.estado)}">${inv.estado}</span>
      </div>
    </div>
  `).join('');
}

function filterInv(val) { renderInvList(val); }

function badgeClass(estado) {
  return { borrador: 'b-draft', pendiente: 'b-pending', pagada: 'b-paid' }[estado] || 'b-draft';
}

/* ── ABRIR FACTURA ── */
function openInvoice(id) {
  currentInvoiceId = id;
  const inv = invoices.find(i => i.id === id);
  if (!inv) return;

  const esBorrador = inv.estado === 'borrador';
  const esPendiente = inv.estado === 'pendiente';
  const esPagada    = inv.estado === 'pagada';

  document.getElementById('emptyInv').style.display   = 'none';
  document.getElementById('editorWrap').style.display = '';

  // Banner solo lectura
  let banner = document.getElementById('invLockedBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'invLockedBanner';
    banner.style.cssText = 'background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:10px 16px;margin-bottom:16px;font-size:.83rem;color:var(--accent-lt);display:flex;align-items:center;gap:8px;';
    banner.innerHTML = '🔒 Factura emitida — solo lectura. Duplica para crear una nueva basada en esta.';
    document.getElementById('editorWrap').prepend(banner);
  }
  banner.style.display = esPagada ? 'none' : 'flex';

  // Toolbar
  document.getElementById('statusSel').value    = inv.estado;
  document.getElementById('statusSel').disabled = esPagada;

  const btnDel = document.querySelector('[onclick="delInvoice()"]');
  if (btnDel) btnDel.style.display = esPagada ? 'none' : '';

  // Número
  document.getElementById('pNum').textContent = String(inv.numero).padStart(4, '0');

  // Emisor desde empresa en BD
  document.getElementById('fromName').value  = empresa.nombre    || '';
  document.getElementById('fromNIF').value   = empresa.ruc       || '';
  document.getElementById('fromAddr').value  = empresa.direccion || '';
  document.getElementById('fromCity').value  = [empresa.cp, empresa.ciudad].filter(Boolean).join(' ');
  document.getElementById('fromPhone').value = empresa.telefono  || '';
  document.getElementById('fromEmail').value = empresa.email     || '';

  // Cliente — usar snapshot si existe, sino datos en vivo
  if (inv.clienteNombre) {
    fillClientFields({
      nombre:    inv.clienteNombre,
      nif:       inv.clienteNif,
      telefono:  inv.clienteTelefono,
      direccion: inv.clienteDireccion,
      cp:        inv.clienteCp,
      ciudad:    inv.clienteCiudad,
      email:     inv.clienteEmail,
    });
    document.getElementById('clientSearch').value = inv.clienteNombre;
  } else if (inv.cliente) {
    fillClientFields(inv.cliente);
    document.getElementById('clientSearch').value = inv.cliente.nombre;
  } else {
    clearClientFields();
    document.getElementById('clientSearch').value = '';
  }

  // Fechas
  document.getElementById('issueDate').value = inv.fechaEmision ? new Date(inv.fechaEmision).toISOString().slice(0,10) : today();

  // Notas
  document.getElementById('invNotes').value = inv.notas || '';

  // Totales — si ya está emitida usamos los guardados en BD
  if (!esBorrador) {
    document.getElementById('bFood').textContent   = fmtEur(inv.baseComida);
    document.getElementById('bDrink').textContent  = fmtEur(inv.baseBebida);
    document.getElementById('tBase').textContent   = fmtEur(inv.baseImponible);
    document.getElementById('tIvaF').textContent   = fmtEur(inv.ivaComida);
    document.getElementById('tIvaD').textContent   = fmtEur(inv.ivaBebida);
    document.getElementById('tIvaTot').textContent = fmtEur(inv.totalIva);
    document.getElementById('tIrpf').textContent   = `− ${fmtEur(inv.irpf)}`;
    document.getElementById('tTotal').textContent  = fmtEur(inv.total);
    document.getElementById('irpfRow').style.display  = inv.irpfPct > 0 ? '' : 'none';
    document.getElementById('irpfLabel').textContent  = `IRPF (${inv.irpfPct}%)`;
  }

  // Filas de items
  renderInvBody(inv.items || [], esBorrador);
  if (esBorrador) recalc();

  // Bloquear UI si no es borrador
  setInvoiceLocked(esPagada);
  renderInvList();
}

function setInvoiceLocked(locked) {
  document.querySelectorAll('#invPaper input, #invPaper textarea').forEach(el => {
    el.disabled = locked;
  });
  const cs = document.getElementById('clientSearch');
  if (cs) cs.disabled = locked;
  document.querySelectorAll('.qpill, .add-food-btn, .add-drink-btn').forEach(el => {
    el.style.pointerEvents = locked ? 'none' : '';
    el.style.opacity       = locked ? '0.4'  : '';
  });
}

function fillClientFields(c) {
  document.getElementById('toName').value  = c.nombre    || '';
  document.getElementById('toNIF').value   = c.nif       || '';
  document.getElementById('toAddr').value  = c.direccion || '';
  document.getElementById('toCity').value  = c.cp && c.ciudad ? `${c.cp} ${c.ciudad}` : (c.cp || c.ciudad || '');
  document.getElementById('toPhone').value = c.telefono  || '';
  document.getElementById('toEmail').value = c.email     || '';
}

function clearClientFields() {
  ['toName','toNIF','toAddr','toCity','toPhone','toEmail'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

/* ── NUEVA FACTURA ── */
async function newInvoice() {
  try {
    const inv = await window.api.facturas.create({
      total: 0, baseComida: 0, baseBebida: 0, baseImponible: 0,
      ivaComida: 0, ivaBebida: 0, totalIva: 0, irpf: 0, irpfPct: 0,
      estado: 'borrador',
      items: [],
    });
    invoices.unshift(inv);
    renderInvList();
    openInvoice(inv.id);
  } catch (err) {
    showToast('❌ Error al crear factura', true);
    console.error(err);
  }
}

/* ── AUTOGUARDADO (solo borradores) ── */
let saveTimer;
function sc() {
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv || inv.estado !== 'borrador') return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrentInvoice, 900);
}

async function saveCurrentInvoice() {
  if (!currentInvoiceId) return;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv || inv.estado !== 'borrador') return;

  const totals = collectTotals();
  const items  = collectRows();
  const clienteId = inv.clienteId || null;

  // Snapshot datos cliente
  const cl = clients.find(c => c.id === clienteId);
  const clienteSnapshot = cl ? JSON.stringify({
    clienteNombre:    cl?.nombre    || '',
    clienteNif:       cl?.nif       || '',
    clienteTelefono:  cl?.telefono  || '',
    clienteDireccion: cl?.direccion || '',
    clienteCp:        cl?.cp        || '',
    clienteCiudad:    cl?.ciudad    || '',
    clienteEmail:     cl?.email     || '',
  }) : (inv.clienteSnapshot || null);

  const data   = {
    fechaEmision: document.getElementById('issueDate').value || null,
    notas:        document.getElementById('invNotes').value  || null,
    clienteId:    inv.clienteId || null,
    items,
    ...totals,
  };

  try {
    const updated = await window.api.facturas.update(currentInvoiceId, data);
    const idx = invoices.findIndex(i => i.id === currentInvoiceId);
    if (idx !== -1) invoices[idx] = { ...invoices[idx], ...updated };
    renderInvList();
  } catch (err) {
    console.error('Error guardando:', err);
  }
}

function collectRows() {
  return Array.from(document.querySelectorAll('#invBody tr')).map(tr => ({
    descripcion: tr.querySelector('.ti-desc')?.value   || '',
    tipo:        tr.dataset.tipo === 'drink' ? 'BEBIDA' : 'COMIDA',
    cantidad:    parseInt(tr.querySelector('.ti-qty')?.value)    || 1,
    precio:      parseFloat(tr.querySelector('.ti-price')?.value) || 0,
    menuItemId:  tr.dataset.menuItemId || null,
  }));
}

function collectTotals() {
  let baseComida = 0, baseBebida = 0;
  document.querySelectorAll('#invBody tr').forEach(tr => {
    const qty   = parseFloat(tr.querySelector('.ti-qty')?.value)   || 0;
    const price = parseFloat(tr.querySelector('.ti-price')?.value) || 0;
    const base  = qty * price;
    if (tr.dataset.tipo === 'drink') baseBebida += base;
    else                              baseComida += base;
  });
  const baseImponible = baseComida + baseBebida;
  const ivaComida     = baseComida  * 0.10;
  const ivaBebida     = baseBebida  * 0.21;
  const totalIva      = ivaComida + ivaBebida;
  const irpfPct       = parseInt(empresa.irpf) || 0;
  const irpf          = baseImponible * (irpfPct / 100);
  const total         = baseImponible + totalIva - irpf;
  return { baseComida, baseBebida, baseImponible, ivaComida, ivaBebida, totalIva, irpf, irpfPct, total };
}

/* ── CAMBIO DE ESTADO → EMITIR ── */
async function updateStatus() {
  const nuevoEstado = document.getElementById('statusSel').value;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv) return;

  const orden = { borrador: 0, pendiente: 1, pagada: 2 };
  const labels = { borrador: '📝 Borrador', pendiente: '⏳ Pendiente de cobro', pagada: '✅ Pagada' };

  // No permitir bajar de estado
  if (orden[nuevoEstado] < orden[inv.estado]) {
    showToast('⛔ No puedes bajar el estado de una factura', true);
    document.getElementById('statusSel').value = inv.estado; // revertir
    return;
  }

  await saveSnapshotForce();
  try {
    const updated = await window.api.facturas.update(currentInvoiceId, { estado: nuevoEstado });
    const idx = invoices.findIndex(i => i.id === currentInvoiceId);
    if (idx !== -1) invoices[idx] = { ...invoices[idx], ...updated };
    renderInvList();
    openInvoice(currentInvoiceId);
    showToast(`Estado cambiado a: ${labels[nuevoEstado]}`);
  } catch (err) {
    showToast('❌ Error al cambiar estado', true);
    document.getElementById('statusSel').value = inv.estado; // revertir si falla
  }
}

/* ── ELIMINAR (solo borradores) ── */
async function delInvoice() {
  if (!currentInvoiceId) return;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv || inv.estado !== 'borrador') {
    showToast('⛔ Solo se pueden eliminar borradores', true);
    return;
  }
  openConfirm('¿Eliminar borrador?', 'Esta acción no se puede deshacer.', async () => {
    try {
      await window.api.facturas.delete(currentInvoiceId);
      invoices = invoices.filter(i => i.id !== currentInvoiceId);
      currentInvoiceId = null;
      document.getElementById('editorWrap').style.display = 'none';
      document.getElementById('emptyInv').style.display   = '';
      renderInvList();
      showToast('🗑 Borrador eliminado');
    } catch (err) {
      showToast('❌ Error al eliminar', true);
    }
  });
}

/* ── DUPLICAR ── */
async function dupInvoice() {
  if (!currentInvoiceId) return;
  const orig = invoices.find(i => i.id === currentInvoiceId);
  if (!orig) return;
  try {
    const dup = await window.api.facturas.create({
      clienteId:    orig.clienteId || null,
      estado:       'borrador',
      notas:        orig.notas     || null,
      total: 0, baseComida: 0, baseBebida: 0, baseImponible: 0,
      ivaComida: 0, ivaBebida: 0, totalIva: 0, irpf: 0, irpfPct: 0,
      items: (orig.items || []).map(it => ({
        descripcion: it.descripcion,
        tipo:        it.tipo,
        cantidad:    it.cantidad,
        precio:      it.precio,
        menuItemId:  it.menuItemId || null,
      })),
    });
    invoices.unshift(dup);
    renderInvList();
    openInvoice(dup.id);
    showToast('📋 Duplicada como nuevo borrador');
  } catch (err) {
    showToast('❌ Error al duplicar', true);
    console.error(err);
  }
}

/* ── FILAS DE ITEMS ── */
function renderInvBody(items, editable = true) {
  const tbody = document.getElementById('invBody');
  tbody.innerHTML = '';
  items.forEach(it => addRowFromItem(it, editable));
}

function addRow(tipo) {
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv || inv.estado !== 'borrador') return;
  addRowFromItem({ tipo: tipo === 'food' ? 'COMIDA' : 'BEBIDA', descripcion: '', cantidad: 1, precio: 0 }, true);
  recalc();
}

function addRowFromItem(it, editable = true) {
  const tbody = document.getElementById('invBody');
  const tipo  = (it.tipo === 'BEBIDA' || it.menuItem?.categoria?.tipo === 'BEBIDA') ? 'drink' : 'food';
  const iva   = tipo === 'drink' ? 21 : 10;
  const dis   = editable ? '' : 'disabled';
  const tr    = document.createElement('tr');
  tr.dataset.tipo       = tipo;
  tr.dataset.menuItemId = it.menuItemId || it.menuItem?.id || '';
  tr.innerHTML = `
    <td>
      <span class="type-pill tp-${tipo}" ${editable ? 'onclick="toggleRowType(this)"' : ''}>
        ${tipo === 'food' ? '🍽 Comida' : '🥤 Bebida'}
      </span>
    </td>
    <td><input class="ti ti-inv ti-desc" value="${escHtml(it.descripcion || it.menuItem?.nombre || '')}" placeholder="Descripción..." ${dis} oninput="recalc();sc()"></td>
    <td><input class="ti ti-inv ti-qty" type="number" min="1" value="${it.cantidad || 1}" ${dis} oninput="recalc();sc()"></td>
    <td><input class="ti ti-inv ti-price" type="number" min="0" step="0.01" value="${it.precio || 0}" ${dis} oninput="recalc();sc()"></td>
    <td class="td-r base-cell">0,00 €</td>
    <td class="td-c">${iva}%</td>
    <td>${editable ? '<button class="del-row" onclick="this.closest(\'tr\').remove();recalc();sc()">✕</button>' : ''}</td>
  `;
  tbody.appendChild(tr);
}

function toggleRowType(pill) {
  const tr  = pill.closest('tr');
  const t   = tr.dataset.tipo === 'food' ? 'drink' : 'food';
  tr.dataset.tipo  = t;
  pill.className   = `type-pill tp-${t}`;
  pill.textContent = t === 'food' ? '🍽 Comida' : '🥤 Bebida';
  tr.querySelector('td:nth-child(6)').textContent = t === 'drink' ? '21%' : '10%';
  recalc(); sc();
}

/* ── RECALCULAR ── */
function recalc() {
  let baseComida = 0, baseBebida = 0;
  document.querySelectorAll('#invBody tr').forEach(tr => {
    const qty   = parseFloat(tr.querySelector('.ti-qty')?.value)   || 0;
    const price = parseFloat(tr.querySelector('.ti-price')?.value) || 0;
    const base  = qty * price;
    tr.querySelector('.base-cell').textContent = fmtEur(base);
    if (tr.dataset.tipo === 'drink') baseBebida += base;
    else                              baseComida += base;
  });

  const baseImponible = baseComida + baseBebida;
  const ivaComida     = baseComida  * 0.10;
  const ivaBebida     = baseBebida  * 0.21;
  const totalIva      = ivaComida + ivaBebida;
  const irpfPct       = parseInt(empresa.irpf) || 0;
  const irpf          = baseImponible * (irpfPct / 100);
  const total         = baseImponible + totalIva - irpf;

  document.getElementById('bFood').textContent   = fmtEur(baseComida);
  document.getElementById('bDrink').textContent  = fmtEur(baseBebida);
  document.getElementById('tBase').textContent   = fmtEur(baseImponible);
  document.getElementById('tIvaF').textContent   = fmtEur(ivaComida);
  document.getElementById('tIvaD').textContent   = fmtEur(ivaBebida);
  document.getElementById('tIvaTot').textContent = fmtEur(totalIva);
  document.getElementById('tIrpf').textContent   = `− ${fmtEur(irpf)}`;
  document.getElementById('tTotal').textContent  = fmtEur(total);
  document.getElementById('irpfRow').style.display  = irpfPct > 0 ? '' : 'none';
  document.getElementById('irpfLabel').textContent  = `IRPF (${irpfPct}%)`;
}

/* ── QUICK PILLS ── */
function renderQuickPills() {}

function addPillToInvoice(menuItemId) {
  const item = cartaItems.find(i => i.id === menuItemId);
  if (!item) return;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv || inv.estado !== 'borrador') return;

  // Buscar si ya existe una fila con ese producto
  const filas = document.querySelectorAll('#invBody tr');
  for (const tr of filas) {
    if (tr.dataset.menuItemId === menuItemId) {
      const qtyInp = tr.querySelector('.ti-qty');
      if (qtyInp) {
        qtyInp.value = (parseFloat(qtyInp.value) || 0) + 1;
        // Flash visual
        tr.style.transition = 'background .15s';
        tr.style.background = item.categoria?.tipo === 'BEBIDA' ? '#0a1525' : '#0a1f0f';
        setTimeout(() => tr.style.background = '', 400);
        recalc(); sc();
        return;
      }
    }
  }

  // No existe — añadir nueva fila
  addRowFromItem({
    menuItem:    item,
    descripcion: item.nombre,
    tipo:        item.categoria?.tipo || 'COMIDA',
    cantidad:    1,
    precio:      item.precio,
    menuItemId:  item.id,
  }, true);
  recalc(); sc();
}

/* ── BÚSQUEDA CLIENTE EN FACTURA ── */
function onClientSearchInput(val) {
  const dd = document.getElementById('clientDropdown');
  const f  = val.toLowerCase();
  const matches = clients.filter(c =>
    c.nombre.toLowerCase().includes(f) || (c.nif||'').toLowerCase().includes(f)
  );
  if (!val) { dd.style.display = 'none'; return; }
  dd.style.display = '';
  dd.innerHTML = matches.length
    ? matches.slice(0,8).map(c => `
        <div class="cl-drop-item" onclick="selectClientInInvoice('${c.id}')">
          <div class="cl-drop-name">${escHtml(c.nombre)}</div>
          <div class="cl-drop-nif">${c.nif || '—'}</div>
        </div>`).join('')
    : '<div class="cl-drop-none">Sin resultados</div>';
}

function selectClientInInvoice(clientId) {
  const c = clients.find(c => c.id === clientId);
  if (!c) return;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (inv) inv.clienteId = c.id;
  document.getElementById('clientSearch').value           = c.nombre;
  document.getElementById('clientDropdown').style.display = 'none';
  fillClientFields(c);
  sc();
}

function clearClientSearch() {
  document.getElementById('clientSearch').value           = '';
  document.getElementById('clientDropdown').style.display = 'none';
  clearClientFields();
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (inv) inv.clienteId = null;
  sc();
}

document.addEventListener('click', e => {
  if (!e.target.closest('#clientSearch') && !e.target.closest('#clientDropdown')) {
    document.getElementById('clientDropdown').style.display = 'none';
  }
});

function doPrint()   { window.print(); }
function doSavePDF() { window.print(); }

/* ══════════════════════════════════════════════════════════════
  CLIENTES
══════════════════════════════════════════════════════════════ */
function renderClientList(filter = '') {
  const list = document.getElementById('clList');
  const f    = filter.toLowerCase();
  const filtered = clients.filter(c =>
    !f || c.nombre.toLowerCase().includes(f) || (c.nif||'').toLowerCase().includes(f)
  );
  if (!filtered.length) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-4);font-size:.83rem">Sin clientes</div>';
    return;
  }
  list.innerHTML = filtered.map(c => `
    <div class="cl-item ${c.id === currentClientId ? 'active' : ''}" onclick="openClient('${c.id}')">
      <div class="cl-avatar">${c.nombre.charAt(0).toUpperCase()}</div>
      <div class="cl-info">
        <div class="cl-name">${escHtml(c.nombre)}</div>
        <div class="cl-nif">${c.nif || '—'}</div>
      </div>
    </div>
  `).join('');
}

function filterClients(val) { renderClientList(val); }

function openClient(id) {
  currentClientId = id;
  const c = clients.find(c => c.id === id);
  if (!c) return;

  document.getElementById('emptyClient').style.display = 'none';
  document.getElementById('clForm').style.display      = '';
  document.getElementById('clCardTitle').textContent   = c.nombre;
  document.getElementById('clCardSub').textContent     = c.nif || 'Sin NIF';

  document.getElementById('cl_nombre').value = c.nombre    || '';
  document.getElementById('cl_nif').value    = c.nif       || '';
  document.getElementById('cl_dir').value    = c.direccion || '';
  document.getElementById('cl_cp').value     = c.cp        || '';
  document.getElementById('cl_ciudad').value = c.ciudad    || '';
  document.getElementById('cl_tel').value    = c.telefono  || '';
  document.getElementById('cl_email').value  = c.email     || '';
  document.getElementById('cl_notas').value  = c.notas     || '';

  const factClient   = invoices.filter(i => i.clienteId === id);
  const totalGastado = factClient.reduce((s, i) => s + (i.total || 0), 0);
  document.getElementById('clStats').innerHTML = `
    <div class="cl-stat"><div class="cl-stat-val">${factClient.length}</div><div class="cl-stat-label">Facturas</div></div>
    <div class="cl-stat"><div class="cl-stat-val">${fmtEur(totalGastado)}</div><div class="cl-stat-label">Total facturado</div></div>
    <div class="cl-stat"><div class="cl-stat-val">${factClient.filter(i=>i.estado==='pagada').length}</div><div class="cl-stat-label">Pagadas</div></div>
  `;
  renderClientList();
}

function newClient() {
  currentClientId = null;
  document.getElementById('emptyClient').style.display = 'none';
  document.getElementById('clForm').style.display      = '';
  document.getElementById('clCardTitle').textContent   = 'Nuevo Cliente';
  document.getElementById('clCardSub').textContent     = 'Rellena los datos del cliente';
  ['cl_nombre','cl_nif','cl_dir','cl_cp','cl_ciudad','cl_tel','cl_email','cl_notas'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('clStats').innerHTML = '';
}
// registrar clientes
async function saveClient() {


  const data = {
    nombre:    document.getElementById('cl_nombre').value.trim(),
    nif:       document.getElementById('cl_nif').value.trim()    || null,
    direccion: document.getElementById('cl_dir').value.trim()    || null,
    cp:        document.getElementById('cl_cp').value.trim()     || null,
    ciudad:    document.getElementById('cl_ciudad').value.trim() || null,
    telefono:  document.getElementById('cl_tel').value.trim()    || null,
    email:     document.getElementById('cl_email').value.trim()  || null,
    notas:     document.getElementById('cl_notas').value.trim()  || null,
  };
  // Validar obligatorios
  const errores = [];
  if (!data.nombre)   errores.push('cl_nombre');
  if (!data.nif)      errores.push('cl_nif');
  if (!data.telefono) errores.push('cl_tel');
  if (!data.direccion)errores.push('cl_dir');
  if (!data.cp)       errores.push('cl_cp');
  if (!data.ciudad)   errores.push('cl_ciudad');

  if (errores.length) {
    errores.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('field-error');
      setTimeout(() => el.classList.remove('field-error'), 2000);
    });
    showToast('❌ Completa los campos obligatorios', true);
    return;
  }
  
  try {
    if (currentClientId) {
      const updated = await window.api.clientes.update(currentClientId, data);
      const idx = clients.findIndex(c => c.id === currentClientId);
      if (idx !== -1) clients[idx] = updated;
      showToast('✅ Cliente actualizado');
    } else {
      const created = await window.api.clientes.create(data);
      clients.unshift(created);
      currentClientId = created.id;
      showToast('✅ Cliente creado');
    }
    renderClientList();
    openClient(currentClientId);
  } catch (err) {
    const msg = err?.message || 'Error al guardar cliente';
    showToast(`❌ ${msg}`, true);
    console.error(err);
  }
}
// borrar clientes
async function deleteClient() {
  if (!currentClientId) return;
  openConfirm('¿Eliminar cliente?', 'Esta acción no se puede deshacer.', async () => {
    try {
      await window.api.clientes.delete(currentClientId);
      clients = clients.filter(c => c.id !== currentClientId);
      currentClientId = null;
      document.getElementById('clForm').style.display      = 'none';
      document.getElementById('emptyClient').style.display = '';
      renderClientList();
      showToast('🗑 Cliente eliminado');
    } catch (err) {
      showToast('❌ Error al eliminar cliente', true);
    }
  });
}

function useClientInInvoice() {
  showPage('facturas');
  if (currentClientId) selectClientInInvoice(currentClientId);
}

/* ══════════════════════════════════════════════════════════════
  CARTA (MENÚ)
══════════════════════════════════════════════════════════════ */
function renderCarta() {
  const el = document.getElementById('cartaBody');
  if (!el) return;

  const cat = categorias.find(c => c.id === currentCatId);
  if (!cat) {
    el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-4)">Selecciona o crea una categoría</div>';
    return;
  }

  const items = cartaItems.filter(i => i.categoriaId === currentCatId);
  const isFood = cat.tipo !== 'BEBIDA';

  el.innerHTML = `
    <div class="cs-card">
      <div class="cs-header ${isFood ? 'food' : 'drink'}">
        <div class="cs-title">
          <span>${isFood ? '🍽' : '🥤'}</span> ${cat.nombre}
          <span class="cs-iva ${isFood ? 'cs-iva-food' : 'cs-iva-drink'}">${isFood ? '10%' : '21%'} IVA</span>
        </div>
        <button class="btn btn-accent btn-xs" onclick="openAddProducto()">＋ Producto</button>
      </div>
      <div class="cs-body">
        ${items.length ? items.map(renderCartaItem).join('') : '<div style="padding:16px;text-align:center;color:var(--text-4);font-size:.83rem">Sin productos. Añade el primero.</div>'}
      </div>
    </div>
  `;
}

function renderCartaItem(it) {
  return `
    <div class="ci" data-id="${it.id}">
      <label class="ci-toggle">
        <input type="checkbox" ${it.disponible ? 'checked' : ''} onchange="toggleDisponible('${it.id}', this.checked)">
        <span class="ci-sw"></span>
      </label>
      <input class="ci-name ti" value="${escHtml(it.nombre)}" onchange="updateCartaItem('${it.id}', 'nombre', this.value)">
      <input class="ci-price ti" type="number" step="0.01" min="0" value="${it.precio}" onchange="updateCartaItem('${it.id}', 'precio', parseFloat(this.value))">
      <span style="font-size:.8rem;color:var(--text-3)">€</span>
      <button class="del-row" onclick="deleteCartaItem('${it.id}')">✕</button>
    </div>
  `;
}

async function addCartaItem(tipo) {
  const isFood  = tipo === 'food';
  const nameId  = isFood ? 'nfName'  : 'ndName';
  const priceId = isFood ? 'nfPrice' : 'ndPrice';
  const nombre  = document.getElementById(nameId).value.trim();
  const precio  = parseFloat(document.getElementById(priceId).value) || 0;
  if (!nombre) return;

  try {
    const tipoMenu = isFood ? 'COMIDA' : 'BEBIDA';
    const cats     = await window.api.categorias.getAll();
    let cat        = cats.find(c => c.tipo === tipoMenu);
    if (!cat) {
      cat = await window.api.categorias.create({ nombre: isFood ? 'Comida' : 'Bebidas', tipo: tipoMenu });
    }
    const created = await window.api.menu.create({ nombre, precio, categoriaId: cat.id, disponible: true });
    cartaItems.push(created);
    renderCarta();
    document.getElementById(nameId).value  = '';
    document.getElementById(priceId).value = '';
    showToast('✅ ' + (isFood ? 'Plato' : 'Bebida') + ' añadido');
  } catch (err) {
    showToast('❌ Error al añadir item', true);
    console.error(err);
  }
}

async function updateCartaItem(id, field, value) {
  try {
    const updated = await window.api.menu.update(id, { [field]: value });
    const idx = cartaItems.findIndex(i => i.id === id);
    if (idx !== -1) cartaItems[idx] = { ...cartaItems[idx], ...updated };
  } catch (err) {
    showToast('❌ Error al actualizar item', true);
  }
}

async function toggleDisponible(id, value) {
  await updateCartaItem(id, 'disponible', value);
}

async function deleteCartaItem(id) {
  openConfirm('¿Eliminar item?', 'Se eliminará de la carta permanentemente.', async () => {
    try {
      await window.api.menu.delete(id);
      cartaItems = cartaItems.filter(i => i.id !== id);
      renderCarta();
      showToast('🗑 Item eliminado');
    } catch (err) {
      showToast('❌ Error al eliminar item', true);
    }
  });
}

function saveCarta() { showToast('✅ Carta guardada'); }

// ── CATEGORÍAS ────────────────────────────────────────────────
function renderCartaCatList() {
  const el = document.getElementById('cartaCatList');
  if (!el) return;
  if (!categorias.length) {
    el.innerHTML = '<div style="padding:16px;font-size:.8rem;color:var(--text-4);text-align:center">Sin categorías</div>';
    return;
  }
  el.innerHTML = categorias.map(cat => `
    <div class="carta-cat-item ${cat.id === currentCatId ? 'active' : ''}" onclick="selectCategoria('${cat.id}')">
      <div>
        <div>${cat.nombre}</div>
        <div class="cat-tipo">${cat.tipo === 'BEBIDA' ? '🥤 21% IVA' : '🍽 10% IVA'}</div>
      </div>
      <button class="cat-del" onclick="event.stopPropagation();deleteCategoria('${cat.id}')" title="Eliminar">✕</button>
    </div>
  `).join('');
}

function selectCategoria(id) {
  currentCatId = id;
  renderCartaCatList();
  renderCarta();
}

function openAddCategoria() {
  document.getElementById('cat_nombre').value = '';
  document.getElementById('cat_tipo').value   = 'COMIDA';
  document.getElementById('catModalTitle').textContent = 'Nueva Categoría';
  document.getElementById('catOverlay').classList.add('open');
}

async function saveCategoria() {
  const nombre = document.getElementById('cat_nombre').value.trim();
  const tipo   = document.getElementById('cat_tipo').value;
  if (!nombre) {
    document.getElementById('cat_nombre').classList.add('field-error');
    setTimeout(() => document.getElementById('cat_nombre').classList.remove('field-error'), 1500);
    return;
  }
  try {
    const created = await window.api.categorias.create({ nombre, tipo });
    categorias.push(created);
    document.getElementById('catOverlay').classList.remove('open');
    renderCartaCatList();
    selectCategoria(created.id);
    showToast('✅ Categoría creada');
  } catch (err) {
    showToast(`❌ ${err?.message || 'Error al crear categoría'}`, true);
  }
}

async function deleteCategoria(id) {
  openConfirm('¿Eliminar categoría?', 'Se eliminarán también todos sus productos.', async () => {
    try {
      await window.api.categorias.delete(id);
      categorias = categorias.filter(c => c.id !== id);
      cartaItems = cartaItems.filter(i => i.categoriaId !== id);
      if (currentCatId === id) currentCatId = categorias[0]?.id || null;
      renderCartaCatList();
      renderCarta();
      showToast('🗑 Categoría eliminada');
    } catch (err) {
      showToast(`❌ ${err?.message || 'Error al eliminar'}`, true);
    }
  });
}

// ── PRODUCTOS ─────────────────────────────────────────────────
function openAddProducto() {
  const sel = document.getElementById('prod_categoria');
  sel.innerHTML = categorias.map(c =>
    `<option value="${c.id}" ${c.id === currentCatId ? 'selected' : ''}>${c.nombre}</option>`
  ).join('');
  document.getElementById('prod_nombre').value  = '';
  document.getElementById('prod_precio').value  = '';
  document.getElementById('prodOverlay').classList.add('open');
}

async function saveProducto() {
  const categoriaId = document.getElementById('prod_categoria').value;
  const nombre      = document.getElementById('prod_nombre').value.trim();
  const precio      = parseFloat(document.getElementById('prod_precio').value) || 0;
  if (!nombre) {
    document.getElementById('prod_nombre').classList.add('field-error');
    setTimeout(() => document.getElementById('prod_nombre').classList.remove('field-error'), 1500);
    showToast('❌ El nombre es obligatorio', true);
    return;
  }
  try {
    const created = await window.api.menu.create({ nombre, precio, categoriaId, disponible: true });
    cartaItems.push(created);
    document.getElementById('prodOverlay').classList.remove('open');
    renderCarta();
    showToast('✅ Producto añadido');
  } catch (err) {
    showToast(`❌ ${err?.message || 'Error al crear producto'}`, true);
  }
}

/* ══════════════════════════════════════════════════════════════
  EMPRESA (BD)
══════════════════════════════════════════════════════════════ */
function loadEmpresaForm() {
  document.getElementById('e_nombre').value  = empresa.nombre    || '';
  document.getElementById('e_nif').value     = empresa.ruc       || '';
  document.getElementById('e_dir').value     = empresa.direccion || '';
  document.getElementById('e_cp').value      = empresa.cp        || '';
  document.getElementById('e_ciudad').value  = empresa.ciudad    || '';
  document.getElementById('e_tel').value     = empresa.telefono  || '';
  document.getElementById('e_email').value   = empresa.email     || '';
  document.getElementById('e_web').value     = empresa.web       || '';
  document.getElementById('e_banco').value   = empresa.banco     || '';
  document.getElementById('e_iban').value    = empresa.iban      || '';
  document.getElementById('e_irpf').value    = String(empresa.irpf ?? 15);
  document.getElementById('e_prefijo').value = empresa.prefijo   || '';

  if (empresa.nombre) {
    const parts = empresa.nombre.split(' ');
    const last  = parts.pop();
    document.getElementById('pBrandName').innerHTML  = `${escHtml(parts.join(' '))} <em>${escHtml(last)}</em>`;
    document.getElementById('pBrandSub').textContent = [empresa.direccion, empresa.ciudad].filter(Boolean).join(' · ');
  }
}
// registrar empresa
async function saveEmpresa() {
  const data = {
    nombre:    document.getElementById('e_nombre').value.trim().toUpperCase(),
    ruc:       document.getElementById('e_nif').value.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase(),
    telefono:  document.getElementById('e_tel').value.trim()                  || null,
    direccion: document.getElementById('e_dir').value.trim().toUpperCase()    || null,
    cp:        document.getElementById('e_cp').value.trim()                   || null,
    ciudad:    document.getElementById('e_ciudad').value.trim().toUpperCase() || null,
    email:     document.getElementById('e_email').value.trim()                || null,
    web:       document.getElementById('e_web').value.trim()                  || null,
    banco:     document.getElementById('e_banco').value.trim().toUpperCase()  || null,
    iban:      document.getElementById('e_iban').value.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase() || null,
    irpf:      parseInt(document.getElementById('e_irpf').value) || 0,
    prefijo:   document.getElementById('e_prefijo').value.trim() || null,
  };
  const errores = [];
  if (!data.nombre)    errores.push('e_nombre');
  if (!data.ruc)       errores.push('e_nif');
  if (!data.telefono)  errores.push('e_tel');
  if (!data.direccion) errores.push('e_dir');
  if (!data.cp)        errores.push('e_cp');
  if (!data.ciudad)    errores.push('e_ciudad');

  if (errores.length) {
    errores.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('field-error');
      setTimeout(() => el.classList.remove('field-error'), 2000);
    });
    showToast('❌ Completa los campos obligatorios', true);
    return;
  }

  try {
    let updated;
    if (empresa.id) {
      updated = await window.api.empresas.update(empresa.id, data);
    } else {
      updated = await window.api.empresas.create(data);
    }
    empresa = updated;
    loadEmpresaForm();
    document.getElementById('saveOk').style.display = 'block';
    setTimeout(() => document.getElementById('saveOk').style.display = 'none', 2500);
    showToast('✅ Datos de empresa guardados');
  } catch (err) {
    showToast('❌ Error al guardar empresa', true);
    console.error(err);
  }
}

/* ══════════════════════════════════════════════════════════════
  AI IMPORT
══════════════════════════════════════════════════════════════ */
let aiImageBase64 = null;
let aiResults     = [];

function openAIImport() {
  document.getElementById('aiOverlay').classList.add('open');
}

function pickCartaImage() {
  const input  = document.createElement('input');
  input.type   = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      aiImageBase64 = ev.target.result.split(',')[1];
      document.getElementById('aiPreview').src           = ev.target.result;
      document.getElementById('aiPreview').style.display = '';
      document.getElementById('aiAnalyzeBtn').disabled   = false;
      document.getElementById('aiNote').textContent      = file.name;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

async function analyzeCartaImage() {
  const apiKey = document.getElementById('aiApiKey').value.trim();
  if (!apiKey || !aiImageBase64) return;

  document.getElementById('aiIndicator').style.display = 'flex';
  document.getElementById('aiAnalyzeBtn').disabled     = true;

  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: aiImageBase64 } },
          { type: 'text', text: 'Extrae todos los platos/bebidas con sus precios de esta carta. Responde SOLO con JSON sin markdown: [{"nombre":"...","precio":0.00,"tipo":"COMIDA|BEBIDA"}]' }
        ]}]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';
    aiResults  = JSON.parse(text.replace(/```json|```/g,'').trim());

    document.getElementById('aiResultCount').textContent   = aiResults.length;
    document.getElementById('aiResultsWrap').style.display = '';
    document.getElementById('aiImportBtn').style.display   = '';
    document.getElementById('aiResultList').innerHTML = aiResults.map((it, i) => `
      <div class="ai-result-item">
        <input value="${escHtml(it.nombre)}" oninput="aiResults[${i}].nombre=this.value">
        <input class="ai-price" type="number" step="0.01" value="${it.precio}" oninput="aiResults[${i}].precio=parseFloat(this.value)">
        <button class="ai-type-toggle ai-tt-${it.tipo==='COMIDA'?'food':'drink'}" onclick="toggleAIType(${i},this)">${it.tipo==='COMIDA'?'🍽 Comida':'🥤 Bebida'}</button>
        <button class="ai-remove" onclick="aiResults.splice(${i},1);renderAIList()">✕</button>
      </div>`).join('');
  } catch (err) {
    showToast('❌ Error al analizar imagen', true);
    console.error(err);
  } finally {
    document.getElementById('aiIndicator').style.display = 'none';
    document.getElementById('aiAnalyzeBtn').disabled     = false;
  }
}

function toggleAIType(i, btn) {
  aiResults[i].tipo = aiResults[i].tipo === 'COMIDA' ? 'BEBIDA' : 'COMIDA';
  const isFood      = aiResults[i].tipo === 'COMIDA';
  btn.className     = `ai-type-toggle ai-tt-${isFood?'food':'drink'}`;
  btn.textContent   = isFood ? '🍽 Comida' : '🥤 Bebida';
}

function renderAIList() {
  document.getElementById('aiResultCount').textContent = aiResults.length;
}

async function importAIResults() {
  try {
    const cats = await window.api.categorias.getAll();
    for (const it of aiResults) {
      let cat = cats.find(c => c.tipo === it.tipo);
      if (!cat) {
        cat = await window.api.categorias.create({ nombre: it.tipo === 'COMIDA' ? 'Comida' : 'Bebidas', tipo: it.tipo });
        cats.push(cat);
      }
      const created = await window.api.menu.create({ nombre: it.nombre, precio: it.precio, categoriaId: cat.id, disponible: true });
      cartaItems.push(created);
    }
    renderCarta();
    closeOverlay('aiOverlay');
    showToast(`✅ ${aiResults.length} items importados`);
  } catch (err) {
    showToast('❌ Error al importar', true);
    console.error(err);
  }
}

/* ══════════════════════════════════════════════════════════════
  Exportar Excel de los clientes
══════════════════════════════════════════════════════════════ */
async function exportClientesExcel() {
  if (!clients.length) {
    showToast('⚠️ No hay clientes para exportar', true);
    return;
  }

  const data = clients.map(c => ({
    'Nombre':         c.nombre    || '',
    'NIF':            c.nif       || '',
    'Teléfono':       c.telefono  || '',
    'Dirección':      c.direccion || '',
    'CP':             c.cp        || '',
    'Ciudad':         c.ciudad    || '',
    'Email':          c.email     || '',
    'Notas':          c.notas     || '',
    'Fecha Registro': c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-ES') : '',
  }));

  const filename = `clientes_${new Date().toISOString().slice(0,10)}.xlsx`;
  const result   = await window.api.exportExcel(filename, data);

  if (result?.success) {
    showToast(`✅ Excel exportado con ${clients.length} clientes`);
  } else {
    showToast('Exportación cancelada');
  }
}

function openCartaModal() {
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv || inv.estado !== 'borrador') {
    showToast('⚠️ Solo puedes añadir productos a borradores', true);
    return;
  }

  // Llenar selector de categorías
  const sel = document.getElementById('cartaModalCat');
  sel.innerHTML = '<option value="">Todas las categorías</option>' +
    categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

  document.getElementById('cartaModalSearch').value = '';
  renderCartaModal();
  document.getElementById('cartaModal').classList.add('open');
}

function renderCartaModal() {
  const q      = document.getElementById('cartaModalSearch').value.toLowerCase();
  const catId  = document.getElementById('cartaModalCat').value;
  const el     = document.getElementById('cartaModalList');

  const items = cartaItems.filter(it => {
    if (!it.disponible) return false;
    if (catId && it.categoriaId !== catId) return false;
    if (q && !it.nombre.toLowerCase().includes(q)) return false;
    return true;
  });

  if (!items.length) {
    el.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-4)">Sin resultados</div>';
    return;
  }

  // Agrupar por categoría
  const grupos = {};
  items.forEach(it => {
    const cat = it.categoria?.nombre || 'Sin categoría';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(it);
  });

  el.innerHTML = Object.entries(grupos).map(([cat, prods]) => `
    <div style="margin-bottom:8px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
        color:var(--text-3);padding:6px 4px 4px;border-bottom:1px solid var(--border)">${cat}</div>
      ${prods.map(it => {
        const tipo = it.categoria?.tipo === 'BEBIDA' ? 'drink' : 'food';
        const color = tipo === 'food' ? 'var(--food-c)' : 'var(--drink-c)';
        return `
          <div class="carta-modal-item" onclick="addFromCartaModal('${it.id}')">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>
            <span style="flex:1">${escHtml(it.nombre)}</span>
            <span style="font-weight:600;color:var(--accent-lt)">${fmtEur(it.precio)}</span>
            <span style="font-size:.7rem;color:var(--text-4)">${tipo === 'food' ? '10%' : '21%'}</span>
          </div>`;
      }).join('')}
    </div>
  `).join('');
}

function addFromCartaModal(menuItemId) {
  addPillToInvoice(menuItemId);
  showToast('✅ Producto añadido');
}


async function saveSnapshotForce() {
  if (!currentInvoiceId) return;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv) return;

  const cl = clients.find(c => c.id === inv.clienteId);
  if (!cl) return;
  try {
    const updated = await window.api.facturas.update(currentInvoiceId, {
      clienteNombre:    cl.nombre    || '',
      clienteNif:       cl.nif       || '',
      clienteTelefono:  cl.telefono  || '',
      clienteDireccion: cl.direccion || '',
      clienteCp:        cl.cp        || '',
      clienteCiudad:    cl.ciudad    || '',
      clienteEmail:     cl.email     || '',
    });
    const idx = invoices.findIndex(i => i.id === currentInvoiceId);
    if (idx !== -1) invoices[idx] = { ...invoices[idx], ...updated };
  } catch (err) {
    console.error('Error guardando snapshot:', err);
  }
}
/* ══════════════════════════════════════════════════════════════
  UTILIDADES
══════════════════════════════════════════════════════════════ */
function fmtEur(n) {
  return (parseFloat(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


/* ══════════════════════════════════════════════════════════════
  ARRANQUE
══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', init);
