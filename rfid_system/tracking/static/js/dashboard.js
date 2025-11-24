// dashboard.js

const T_REFRESH_MS = 5000;
const tbody = document.querySelector('#detections tbody');
const message = document.getElementById('message');
const lastUpdated = document.getElementById('lastUpdated');
const searchBox = document.getElementById('searchBox');

let cacheLines = [];
let liveSummaryUrl = "";  // will be set from HTML

// Parse each RFID summary line into fields
function parseLine(line) {
  const parts = Object.create(null);
  line.split(' | ').forEach(seg => {
    const idx = seg.indexOf(': ');
    if (idx > -1) {
      const key = seg.slice(0, idx).trim();
      const val = seg.slice(idx + 2).trim();
      parts[key] = val;
    }
  });
  return {
    epc: parts['Received EPC'] || '',
    reader: parts['Reader'] || '',
    antenna: parts['Antenna'] || '',
    rssi: parts['RSSI'] || '',
    mac: parts['MAC'] || '',
    localTime: parts['Local Time (Finland)'] || ''
  };
}

function classifyFreshness(localTimeStr) {
  const d = new Date(localTimeStr.replace(' ', 'T'));
  const ageSec = (Date.now() - d.getTime()) / 1000;
  if (ageSec <= 60) return 'row-fresh';
  if (ageSec <= 600) return 'row-warm';
  return 'row-stale';
}

function renderRows(lines) {
  tbody.innerHTML = '';
  const q = searchBox.value.toLowerCase().trim();

  lines.forEach(line => {
    const rec = parseLine(line);
    const hay = `${rec.epc} ${rec.reader} ${rec.mac}`.toLowerCase();
    if (q && !hay.includes(q)) return;

    const tr = document.createElement('tr');
    tr.className = classifyFreshness(rec.localTime);
    [rec.epc, rec.reader, rec.antenna, rec.rssi, rec.mac, rec.localTime].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

async function refreshData() {
  message.textContent = '';
  try {
    const res = await fetch(liveSummaryUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cacheLines = Array.isArray(data.summary) ? data.summary : [];
    renderRows(cacheLines);
    lastUpdated.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
  } catch (err) {
    message.innerHTML = `<span class="error">Failed to load data: ${err.message}</span>`;
  }
}

function applyFilter() {
  renderRows(cacheLines);
}

function initDashboard(url) {
  liveSummaryUrl = url;
  refreshData();
  setInterval(refreshData, T_REFRESH_MS);
}
