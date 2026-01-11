// ================== CONFIG ==================
const API_BASE = 'http://localhost:8080';
const API = {
  reportSave: `${API_BASE}/api/report/save`,
  // предполагаемые эндпойнты (если у тебя чуть иначе — поменяй тут)
  shiftStart: `${API_BASE}/api/shift/start`,
  shiftClose: (id) => `${API_BASE}/api/shift/close/${id}`,
  // опционально (см. ниже): список шаблонов для dropdown
  templates: `${API_BASE}/api/report/templates`,
};

const LS = {
  user: 'user',
  username: 'username',
  shiftSessionId: 'shiftSessionId',
  reportPrefix: 'report_',
};

// ================== STATE ==================
let activeFreeSpace = null;
let currentDate = new Date();
let currentZoom = 100;

// кастомные строки, чтобы корректно восстанавливать
let customFields = []; // [{id, name, unit, buildingId, templateId, inputId, rowNumber}]

// templates (опционально)
let templatesCache = []; // [{id,title,buildingId,unit,active,isInventory}]
let templatesLoaded = false;

// ================== DOM ==================
let dateDisplay, saveBtn, endShiftBtn, reportTitle, zoomOutBtn, zoomInBtn, zoomLevel, printBtn;
let reportContent, statusMessage, tableBody, currentUser;

let shiftGate, startShiftBtn, userIdInput, shiftIdInput, sectionIdInput, shiftBadge, shiftGateHint;

// ================== UTILS ==================
function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function showStatusMessage(message, type = 'info-message') {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3500);
}

function parseNumberOrNull(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function getUser() {
  const userJson = localStorage.getItem(LS.user);
  if (!userJson) return null;
  try { return JSON.parse(userJson); } catch { return null; }
}

function getShiftSessionId() {
  const v = localStorage.getItem(LS.shiftSessionId);
  const id = v ? Number(v) : null;
  return Number.isFinite(id) && id > 0 ? id : null;
}
function setShiftSessionId(id) {
  localStorage.setItem(LS.shiftSessionId, String(id));
}
function clearShiftSessionId() {
  localStorage.removeItem(LS.shiftSessionId);
}

function setEditingEnabled(enabled) {
  document.querySelectorAll('.data-input').forEach(inp => inp.disabled = !enabled);

  // блокируем добавление новых строк
  document.querySelectorAll('.free-space-row').forEach(row => {
    row.style.pointerEvents = enabled ? 'auto' : 'none';
    row.style.opacity = enabled ? '1' : '0.5';
  });

  if (saveBtn) saveBtn.disabled = !enabled;
  if (endShiftBtn) endShiftBtn.disabled = !enabled;

  if (!enabled) closeActiveFreeSpace();
}

function extractBuildingIdFromHeaderText(text) {
  // "Здание 1" -> 1
  const m = String(text || '').match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function getBuildingIdForRow(row) {
  // идём вверх до ближайшего building-header
  let prev = row.previousElementSibling;
  while (prev) {
    if (prev.classList.contains('building-header')) {
      return extractBuildingIdFromHeaderText(prev.textContent);
    }
    prev = prev.previousElementSibling;
  }
  return null;
}

function extractTitleAndUnitFromRow(row) {
  const firstTd = row.querySelector('td');
  if (!firstTd) return { title: '', unit: '' };

  // title берём из текста, выкидывая номер строки
  const clone = firstTd.cloneNode(true);
  // уберём sub-description из title, но используем для unit если есть
  const sub = clone.querySelector('.sub-description');
  const subText = sub ? sub.textContent.trim() : '';
  if (sub) sub.remove();
  const rowNum = clone.querySelector('.row-number');
  if (rowNum) rowNum.remove();

  let title = clone.textContent.replace(/\s+/g, ' ').trim();

  // unit:
  let unit = '';
  if (subText) {
    // часто "... , кг" или "... м³"
    const lastToken = subText.split(',').pop().trim();
    unit = lastToken;
  } else {
    // fallback: вытащим после последней запятой, если похоже на единицу
    const m = title.match(/,\s*(м³|м3|кг|шт\.?|л|м2|м²)\s*$/i);
    if (m) {
      unit = m[1];
      title = title.replace(m[0], '').trim();
    }
  }

  return { title, unit };
}

// очень простой “поиск похожего шаблона”, чтобы не зависеть от совпадения строк на 100%
function normalizeTokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
}
function findBestTemplateId(buildingId, title) {
  if (!templatesLoaded || !buildingId || !title) return null;
  const tokens = new Set(normalizeTokens(title));
  if (tokens.size === 0) return null;

  let best = { id: null, score: 0 };
  for (const t of templatesCache) {
    if (!t.active) continue;
    if (Number(t.buildingId) !== Number(buildingId)) continue;

    const tt = new Set(normalizeTokens(t.title));
    let inter = 0;
    for (const w of tt) if (tokens.has(w)) inter++;

    const score = inter / Math.max(1, Math.max(tokens.size, tt.size));
    if (score > best.score) best = { id: t.id, score };
  }

  return best.score >= 0.35 ? best.id : null; // порог можно подкрутить
}

async function safeFetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    const msg = (json && (json.message || json.error)) ? (json.message || json.error) : text || res.statusText;
    throw new Error(msg);
  }
  return json;
}

// ================== SHIFT ==================
function showShiftGate(show) {
  if (!shiftGate) return;
  shiftGate.style.display = show ? 'flex' : 'none';
}

function setShiftBadge(id) {
  if (!shiftBadge) return;
  shiftBadge.style.display = 'inline-block';
  shiftBadge.textContent = `ShiftSession #${id}`;
}

async function startShift() {
  const user = getUser();
  const userId =
    Number(user?.id) ||
    Number(user?.userId) ||
    Number(userIdInput?.value);

  const shiftId = Number(shiftIdInput?.value);
  const sectionId = Number(sectionIdInput?.value);

  if (!userId || !shiftId || !sectionId) {
    if (shiftGateHint) shiftGateHint.textContent = 'Заполни User ID / Shift ID / Section ID';
    return;
  }

  startShiftBtn.disabled = true;
  if (shiftGateHint) shiftGateHint.textContent = 'Создаю смену...';

  try {
    const data = await safeFetchJson(API.shiftStart, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, shiftId, sectionId }),
    });

    const sessionId = Number(data?.id ?? data?.shiftSessionId ?? data);
    if (!sessionId) throw new Error('Сервер не вернул id смены');

    setShiftSessionId(sessionId);
    setShiftBadge(sessionId);

    showShiftGate(false);
    setEditingEnabled(true);
    showStatusMessage('Смена начата', 'success-message');
  } catch (e) {
    if (shiftGateHint) shiftGateHint.textContent = `Ошибка: ${e.message}`;
  } finally {
    startShiftBtn.disabled = false;
  }
}

async function closeShift() {
  const sessionId = getShiftSessionId();
  if (!sessionId) throw new Error('Нет shiftSessionId');

  // сначала пробуем POST, если у тебя PUT — просто поменяй method
  try {
    await safeFetchJson(API.shiftClose(sessionId), { method: 'POST' });
    return;
  } catch (e) {
    // fallback: PUT (часто делают так)
    await safeFetchJson(API.shiftClose(sessionId), { method: 'PUT' });
  }
}

// ================== TEMPLATES (optional but recommended) ==================
async function loadTemplates() {
  try {
    const data = await safeFetchJson(API.templates, { method: 'GET' });
    if (Array.isArray(data)) {
      templatesCache = data;
      templatesLoaded = true;
    }
  } catch {
    templatesLoaded = false;
  }
}

function populateTemplatesSelect(selectEl, buildingId) {
  if (!selectEl) return;

  // базовые опции
  selectEl.innerHTML = `
    <option value="">------------------</option>
    <option value="manual">Ввести вручную</option>
  `;

  if (!templatesLoaded) return;

  const list = templatesCache
    .filter(t => t.active && Number(t.buildingId) === Number(buildingId))
    .sort((a, b) => String(a.title).localeCompare(String(b.title), 'ru'));

  if (list.length === 0) return;

  const optGroup = document.createElement('optgroup');
  optGroup.label = 'Сохранённые шаблоны';
  list.forEach(t => {
    const opt = document.createElement('option');
    opt.value = `tpl:${t.id}`;
    opt.textContent = t.title + (t.unit ? ` (${t.unit})` : '');
    optGroup.appendChild(opt);
  });
  selectEl.appendChild(optGroup);
}

// ================== LOCAL SAVE/LOAD ==================
function collectLocalReport() {
  const inputs = {};
  document.querySelectorAll('.data-input').forEach(inp => {
    if (inp.id) inputs[inp.id] = inp.value ?? '';
  });

  return {
    dateKey: formatDateKey(currentDate),
    inputs,
    customFields,
  };
}

function applyLocalReport(reportData) {
  if (!reportData) return;

  // сначала восстановим кастомные строки, чтобы были их инпуты
  if (Array.isArray(reportData.customFields)) {
    customFields = reportData.customFields;
    // добавим строки в таблицу
    customFields.forEach(field => {
      restoreCustomRow(field);
    });
    updateRowNumbers();
  }

  if (reportData.inputs) {
    Object.entries(reportData.inputs).forEach(([id, val]) => {
      const inp = document.getElementById(id);
      if (inp) inp.value = val ?? '';
    });
  }
}

function loadSavedReport() {
  const key = `${LS.reportPrefix}${formatDateKey(currentDate)}`;
  const saved = localStorage.getItem(key);
  if (!saved) return;
  try {
    applyLocalReport(JSON.parse(saved));
  } catch { /* ignore */ }
}

function saveLocalReport() {
  const key = `${LS.reportPrefix}${formatDateKey(currentDate)}`;
  localStorage.setItem(key, JSON.stringify(collectLocalReport()));
}

// ================== BUILD PAYLOAD + SAVE TO SERVER ==================
function buildItemsPayload() {
  const items = [];

  // стандартные строки (все строки с data-input, которые НЕ кастомные)
  document.querySelectorAll('#tableBody tr').forEach(row => {
    const input = row.querySelector('.data-input');
    if (!input) return;

    const isCustom = row.dataset.isCustom === 'true';
    const raw = input.value ?? '';
    const n = parseNumberOrNull(raw);

    const buildingId = isCustom
      ? Number(row.dataset.buildingId)
      : getBuildingIdForRow(row);

    if (!buildingId) return;

    if (isCustom) {
      const templateId = row.dataset.templateId ? Number(row.dataset.templateId) : null;
      const customTitle = row.dataset.title || 'Без названия';

      items.push({
        templateId: templateId || null,
        customTitle: templateId ? null : customTitle,
        buildingId,
        valueNumber: n,
        valueText: raw,
      });
      return;
    }

    const { title } = extractTitleAndUnitFromRow(row);

    // главное: НЕ хардкодим templateId 1..6 как раньше :contentReference[oaicite:6]{index=6}
    // ищем реальный id по шаблонам (если API.templates доступен)
    const templateId = findBestTemplateId(buildingId, title);

    items.push({
      templateId: templateId || null,
      customTitle: templateId ? null : title, // fallback: создастся неактивный шаблон
      buildingId,
      valueNumber: n,
      valueText: raw,
    });
  });

  return items;
}

async function saveToServer() {
  const shiftSessionId = getShiftSessionId();
  if (!shiftSessionId) {
    showStatusMessage('Смена не начата — нажми "Начать смену"', 'error-message');
    return;
  }

  const payload = {
    shiftSessionId,
    items: buildItemsPayload(),
  };

  await safeFetchJson(API.reportSave, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// сохранение (локально + в БД)
async function saveDate() {
  try {
    saveLocalReport();
    await saveToServer();
    showStatusMessage('Отчёт сохранён', 'success-message');
  } catch (e) {
    showStatusMessage(`Ошибка сохранения: ${e.message}`, 'error-message');
  }
}

// ================== END SHIFT ==================
async function endShift() {
  if (!confirm('Вы уверены, что хотите завершить смену? После завершения редактирование будет невозможно.')) return;

  try {
    // 1) сохранить отчёт (локально + в БД)
    await saveDate();

    // 2) закрыть смену в БД (иначе сервер всё ещё считает её OPEN)
    await closeShift();

    // 3) заблокировать UI
    setEditingEnabled(false);
    clearShiftSessionId();
    showStatusMessage('Смена закрыта', 'success-message');
  } catch (e) {
    showStatusMessage(`Не удалось закрыть смену: ${e.message}`, 'error-message');
  }
}

// ================== FREE SPACE / CUSTOM ROWS ==================
function closeActiveFreeSpace() {
  if (!activeFreeSpace) return;
  const expandedRow = activeFreeSpace.nextElementSibling;
  activeFreeSpace.classList.remove('active');
  if (expandedRow && expandedRow.classList.contains('expanded-row')) expandedRow.remove();
  activeFreeSpace = null;
}

function toggleFreeSpace(element) {
  const row = element.closest('tr') || element;

  if (activeFreeSpace && activeFreeSpace !== row) closeActiveFreeSpace();
  if (row.classList.contains('active')) { closeActiveFreeSpace(); return; }

  row.classList.add('active');
  activeFreeSpace = row;

  const buildingId = getBuildingIdForRow(row);

  const expandedRow = document.createElement('tr');
  expandedRow.className = 'expanded-row';
  expandedRow.innerHTML = `
    <td colspan="2">
      <div class="expanded-content">
        <select class="dropdown-menu" onchange="handleMenuChange(this)">
          <option value="">------------------</option>
          <option value="manual">Ввести вручную</option>
        </select>

        <div class="customFieldContainer"></div>
      </div>
    </td>
  `;

  row.parentNode.insertBefore(expandedRow, row.nextSibling);

  const select = expandedRow.querySelector('select.dropdown-menu');
  populateTemplatesSelect(select, buildingId);
}

function handleMenuChange(selectElement) {
  const expandedRow = selectElement.closest('tr.expanded-row');
  if (!expandedRow) return;

  const container = expandedRow.querySelector('.customFieldContainer');
  container.innerHTML = '';

  const freeSpaceRow = expandedRow.previousElementSibling;
  const buildingId = getBuildingIdForRow(freeSpaceRow);

  const val = selectElement.value;

  // выбрали шаблон из БД
  if (val.startsWith('tpl:')) {
    const templateId = Number(val.split(':')[1]);
    const tpl = templatesCache.find(t => Number(t.id) === templateId);
    const title = tpl?.title || 'Без названия';
    const unit = tpl?.unit || '';

    addCustomRow({
      buildingId,
      templateId,
      title,
      unit,
    });

    closeActiveFreeSpace();
    updateRowNumbers();
    return;
  }

  if (val !== 'manual') return;

  // manual ввод
  container.innerHTML = `
    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-top:10px;">
      <input type="text" class="data-input" id="manualTitle" placeholder="Название позиции" style="min-width:280px;">
      <input type="text" class="data-input" id="manualUnit" placeholder="Ед. изм (кг/м³/шт...)" style="width:180px;">
      <button class="btn btn-save" id="addManualBtn" style="padding:8px 12px;">Добавить</button>
    </div>
  `;

  container.querySelector('#addManualBtn').addEventListener('click', () => {
    const title = container.querySelector('#manualTitle').value.trim();
    const unit = container.querySelector('#manualUnit').value.trim();

    if (!title) {
      showStatusMessage('Введите название позиции', 'error-message');
      return;
    }

    addCustomRow({
      buildingId,
      templateId: null,
      title,
      unit,
    });

    closeActiveFreeSpace();
    updateRowNumbers();
  });
}

function addCustomRow({ buildingId, templateId, title, unit }) {
  // id для кастомного поля
  const fieldId = `custom_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  const inputId = `${fieldId}_shift`;

  const freeSpaceRow = activeFreeSpace || tableBody.querySelector('.free-space-row');
  if (!freeSpaceRow) return;

  const newRow = document.createElement('tr');
  newRow.dataset.isCustom = 'true';
  newRow.dataset.buildingId = String(buildingId || '');
  newRow.dataset.templateId = templateId ? String(templateId) : '';
  newRow.dataset.title = title;
  newRow.dataset.unit = unit;

  newRow.innerHTML = `
    <td>
      <span class="row-number"></span>
      ${title}
      ${unit ? `<div class="sub-description">${unit}</div>` : ''}
    </td>
    <td>
      <div style="display:flex; gap:5px; justify-content:center;">
        <input type="text" class="data-input" id="${inputId}">
      </div>
    </td>
  `;

  tableBody.insertBefore(newRow, freeSpaceRow);

  // сохраним мету, чтобы восстановить после reload
  customFields.push({
    id: fieldId,
    name: title,
    unit,
    buildingId,
    templateId: templateId || null,
    inputId,
    rowNumber: null,
  });
}

function restoreCustomRow(field) {
  // если строка уже есть — не дублируем
  if (tableBody.querySelector(`tr[data-is-custom="true"] input#${field.inputId}`)) return;

  // вставляем перед первой свободной строкой этой секции (или перед первой вообще)
  let freeSpaceRow = null;
  const rows = Array.from(tableBody.querySelectorAll('tr'));
  for (const r of rows) {
    if (r.classList.contains('free-space-row')) {
      freeSpaceRow = r;
      break;
    }
  }
  if (!freeSpaceRow) return;

  const newRow = document.createElement('tr');
  newRow.dataset.isCustom = 'true';
  newRow.dataset.buildingId = String(field.buildingId || '');
  newRow.dataset.templateId = field.templateId ? String(field.templateId) : '';
  newRow.dataset.title = field.name || '';
  newRow.dataset.unit = field.unit || '';

  newRow.innerHTML = `
    <td>
      <span class="row-number"></span>
      ${field.name || ''}
      ${field.unit ? `<div class="sub-description">${field.unit}</div>` : ''}
    </td>
    <td>
      <div style="display:flex; gap:5px; justify-content:center;">
        <input type="text" class="data-input" id="${field.inputId}">
      </div>
    </td>
  `;

  tableBody.insertBefore(newRow, freeSpaceRow);
}

function updateRowNumbers() {
  if (!tableBody) return;
  let rowNumber = 1;

  const rows = tableBody.querySelectorAll(
    'tr:not(.building-header):not(.separator):not(.free-space-row):not(.expanded-row)'
  );

  rows.forEach(row => {
    const rowNumberElement = row.querySelector('.row-number');
    if (rowNumberElement) {
      rowNumberElement.textContent = rowNumber;

      // если это custom — обновим rowNumber в customFields
      if (row.dataset.isCustom === 'true') {
        const title = row.dataset.title;
        const f = customFields.find(x => x.name === title && x.inputId && document.getElementById(x.inputId));
        if (f) f.rowNumber = rowNumber;
      }

      rowNumber++;
    }
  });
}

// ================== ZOOM / PRINT / NAV ==================
function updateZoom() {
  if (zoomLevel) zoomLevel.textContent = `${currentZoom}%`;
  if (reportContent) {
    reportContent.style.transform = `scale(${currentZoom / 100})`;
    reportContent.style.transformOrigin = 'top left';
  }
}
function zoomIn() { if (currentZoom < 150) { currentZoom += 10; updateZoom(); } }
function zoomOut() { if (currentZoom > 50) { currentZoom -= 10; updateZoom(); } }
function printReport() { window.print(); }

function logout() {
  if (confirm('Вы уверены, что хотите выйти?')) {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    clearShiftSessionId();
    window.location.href = 'index.html';
  }
}
function showMainPage() { alert('Вы находитесь на главной странице'); }
function showReports() { alert('Раздел "Рапорты" находится в разработке'); }
function showDocuments() { alert('Раздел "Отчеты" находится в разработке'); }

// ================== INIT ==================
function initDOM() {
  dateDisplay = document.getElementById('dateDisplay');
  saveBtn = document.getElementById('saveBtn');
  endShiftBtn = document.getElementById('endShiftBtn');
  reportTitle = document.getElementById('reportTitle');
  zoomOutBtn = document.getElementById('zoomOutBtn');
  zoomInBtn = document.getElementById('zoomInBtn');
  zoomLevel = document.getElementById('zoomLevel');
  printBtn = document.getElementById('printBtn');
  reportContent = document.getElementById('reportContent');
  statusMessage = document.getElementById('statusMessage');
  tableBody = document.getElementById('tableBody');
  currentUser = document.getElementById('currentUser');

  shiftGate = document.getElementById('shiftGate');
  startShiftBtn = document.getElementById('startShiftBtn');
  userIdInput = document.getElementById('userIdInput');
  shiftIdInput = document.getElementById('shiftIdInput');
  sectionIdInput = document.getElementById('sectionIdInput');
  shiftBadge = document.getElementById('shiftBadge');
  shiftGateHint = document.getElementById('shiftGateHint');
}

function updateDateDisplay() {
  if (dateDisplay) {
    dateDisplay.textContent = currentDate.toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }
  if (reportTitle) {
    reportTitle.textContent = 'Отчет за смену';
  }
}

function getCurrentSystemDate() {
  return new Date();
}

function init() {
  initDOM();

  // auth
  const user = getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  if (user.role && user.role !== 'ENGINEER') {
    alert('У вас нет прав для заполнения смены');
    window.location.href = 'index.html';
    return;
  }

  const username = localStorage.getItem(LS.username) || 'Иван Иванов';
  if (currentUser) currentUser.textContent = username;

  // date
  currentDate = getCurrentSystemDate();
  updateDateDisplay();

  // handlers
  if (saveBtn) saveBtn.addEventListener('click', saveDate);
  if (endShiftBtn) endShiftBtn.addEventListener('click', endShift);
  if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
  if (printBtn) printBtn.addEventListener('click', printReport);

  // hotkeys
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveDate(); }
    if (e.ctrlKey && e.key === 'p') { e.preventDefault(); printReport(); }
    if (e.ctrlKey && (e.key === '+' || e.key === '=')) { e.preventDefault(); zoomIn(); }
    if (e.ctrlKey && e.key === '-') { e.preventDefault(); zoomOut(); }
    if (e.key === 'Escape') closeActiveFreeSpace();
  });

  // click outside expanded
  document.addEventListener('click', function(event) {
    if (activeFreeSpace && !activeFreeSpace.contains(event.target)) {
      const expandedRow = activeFreeSpace.nextElementSibling;
      if (expandedRow && !expandedRow.contains(event.target)) closeActiveFreeSpace();
    }
  });

  // load templates in background (если добавишь API)
  loadTemplates();

  // load local saved
  loadSavedReport();
  updateRowNumbers();

  // shift gate logic
  const existingSessionId = getShiftSessionId();
  if (existingSessionId) {
    setShiftBadge(existingSessionId);
    showShiftGate(false);
    setEditingEnabled(true);
  } else {
    // предзаполним userId если есть
    const uid = Number(user?.id) || Number(user?.userId);
    if (uid && userIdInput) userIdInput.value = String(uid);

    showShiftGate(true);
    setEditingEnabled(false);
  }

  if (startShiftBtn) startShiftBtn.addEventListener('click', startShift);
}

document.addEventListener('DOMContentLoaded', init);

// чтобы onclick из html работал
window.toggleFreeSpace = toggleFreeSpace;
window.handleMenuChange = handleMenuChange;
window.logout = logout;
window.showMainPage = showMainPage;
window.showReports = showReports;
window.showDocuments = showDocuments;
