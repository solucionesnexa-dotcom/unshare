const API_BASE = 'http://localhost:3000/api/v1';
const AUTH_CREDENTIALS = { email: 'guardian@example.com', password: 'Password123!' };
const DEFAULT_CASE_ID = '00000000-0000-4000-8000-000000000001';

const state = {
  selectedFace: null,
  findings: [],
  filteredResults: [],
  alerts: [...demoAlerts],
  token: null,
  caseId: DEFAULT_CASE_ID,
  loading: false,
  error: null
};

const elements = {
  faceGallery: document.getElementById('face-gallery'),
  scanFaceBtn: document.getElementById('scan-face-btn'),
  faceSelected: document.getElementById('face-selected'),
  resultsSummary: document.getElementById('results-summary'),
  resultsList: document.getElementById('results-list'),
  metrics: document.getElementById('metrics'),
  alerts: document.getElementById('alerts'),
  nameSearchForm: document.getElementById('name-search-form'),
  childNameInput: document.getElementById('child-name'),
  filterInstagram: document.getElementById('filter-instagram'),
  filterTikTok: document.getElementById('filter-tiktok'),
  filterFacebook: document.getElementById('filter-facebook'),
  riskThreshold: document.getElementById('risk-threshold'),
  riskValue: document.getElementById('risk-value'),
  simulateAlert: document.getElementById('simulate-alert'),
  bulkDelete: document.getElementById('bulk-delete')
};

const map = L.map('map').setView([39.5, -98.35], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const markerLayer = L.layerGroup().addTo(map);

function stableHash(value) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  return fetch(`${API_BASE}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${text}`);
    }
    return response.json();
  });
}

async function login() {
  if (state.token) return;
  const session = await apiRequest('auth/login', { method: 'POST', body: AUTH_CREDENTIALS });
  state.token = session.accessToken;
}

function getLocationForFinding(finding) {
  const bases = {
    Instagram: [40.4168, -3.7038],
    TikTok: [41.3851, 2.1734],
    Facebook: [39.4699, -0.3763]
  };
  const [baseLat, baseLng] = bases[finding.platform] || bases.Instagram;
  const hash = stableHash(finding.id);
  return {
    city: finding.platform === 'Instagram' ? 'Madrid' : finding.platform === 'TikTok' ? 'Barcelona' : 'Valencia',
    lat: baseLat + ((hash % 120) - 60) / 100,
    lng: baseLng + (((hash >> 7) % 120) - 60) / 100
  };
}

function mapFindingToResult(finding) {
  const location = getLocationForFinding(finding);
  const childName = finding.childName || (Array.isArray(finding.aliases) ? finding.aliases[0] : 'Niño');

  return {
    id: finding.id,
    platform: finding.platform,
    author: `Guardian de ${childName}`,
    caption: `Detección de contenido publicado en ${finding.platform}`,
    childName,
    location,
    publicUrl: finding.url,
    deleteRequestUrl: `mailto:privacy@unshare.example.com?subject=Solicitud de borrado&body=Detecté una publicación de ${encodeURIComponent(childName)}: ${encodeURIComponent(finding.url)}`,
    riskScore: finding.riskScore,
    postedAt: finding.createdAt,
    status: finding.status,
    findingId: finding.id
  };
}

function setLoading(loading) {
  state.loading = loading;
  renderSummary();
}

function setError(message) {
  state.error = message;
  renderSummary();
}

function renderSummary() {
  if (state.loading) {
    elements.resultsSummary.innerHTML = '<p>Cargando hallazgos desde el backend...</p>';
    return;
  }

  if (state.error) {
    elements.resultsSummary.innerHTML = `<p class="error">${state.error}</p>`;
    return;
  }
}

function renderFaceGallery() {
  elements.faceGallery.innerHTML = '';
  demoFaces.forEach((face) => {
    const card = document.createElement('button');
    card.className = 'face-card';
    card.type = 'button';
    card.innerHTML = `
      <img src="${face.avatarUrl}" alt="Foto de prueba de ${face.childName}" />
      <strong>${face.childName}</strong>
      <p class="hint">Perfil sintético</p>
    `;

    card.addEventListener('click', () => {
      state.selectedFace = face;
      elements.scanFaceBtn.disabled = false;
      elements.faceSelected.textContent = `Foto seleccionada: ${face.childName}`;
      [...elements.faceGallery.children].forEach((child) => child.classList.remove('active'));
      card.classList.add('active');
    });

    elements.faceGallery.appendChild(card);
  });
}

function applyFilters(items) {
  const minRisk = Number(elements.riskThreshold.value);
  const allowInstagram = elements.filterInstagram.checked;
  const allowTikTok = elements.filterTikTok.checked;
  const allowFacebook = elements.filterFacebook.checked;

  return items.filter((item) => {
    const platformAllowed =
      (allowInstagram && item.platform === 'Instagram') ||
      (allowTikTok && item.platform === 'TikTok') ||
      (allowFacebook && item.platform === 'Facebook');
    return platformAllowed && item.riskScore >= minRisk;
  });
}

function renderResults(items, reason = 'general') {
  if (state.loading || state.error) {
    elements.resultsList.innerHTML = '';
    markerLayer.clearLayers();
    renderSummary();
    return;
  }

  const sorted = [...items].sort((a, b) => b.riskScore - a.riskScore);
  state.filteredResults = sorted;

  elements.resultsSummary.innerHTML = `<p><strong>${sorted.length}</strong> hallazgos cargados (${reason}).</p>`;

  elements.resultsList.innerHTML = '';
  sorted.forEach((item) => {
    const entry = document.createElement('article');
    entry.className = 'result-item';
    entry.innerHTML = `
      <div>
        <div class="platform">${item.platform} · ${item.author}</div>
        <p>${item.caption}</p>
        <p><strong>Niño:</strong> ${item.childName} · <strong>Ciudad:</strong> ${item.location.city}</p>
        <p><small>${new Date(item.postedAt).toLocaleString('es-ES', { timeZone: 'UTC' })} UTC</small></p>
        <a href="${item.publicUrl}" target="_blank" rel="noreferrer">Ver publicación</a>
      </div>
      <div>
        <span class="badge">Riesgo ${item.riskScore}</span><br /><br />
        <a class="delete-link" href="${item.deleteRequestUrl}" target="_blank" rel="noreferrer">
          Solicitar borrado
        </a>
      </div>
    `;

    elements.resultsList.appendChild(entry);
  });

  renderMap(sorted);
  renderMetrics();
}

function renderMap(items) {
  markerLayer.clearLayers();
  if (!items.length) {
    map.setView([39.5, -98.35], 4);
    return;
  }

  const bounds = [];
  items.forEach((item) => {
    const marker = L.marker([item.location.lat, item.location.lng]).bindPopup(`
      <strong>${item.childName}</strong><br />
      ${item.platform} · Riesgo ${item.riskScore}<br />
      <a href="${item.deleteRequestUrl}" target="_blank" rel="noreferrer">Solicitar borrado</a>
    `);
    markerLayer.addLayer(marker);
    bounds.push([item.location.lat, item.location.lng]);
  });

  map.fitBounds(bounds, { padding: [30, 30] });
}

function renderMetrics() {
  const total = state.filteredResults.length;
  const highRisk = state.filteredResults.filter((item) => item.riskScore >= 75).length;
  const uniqueChildren = new Set(state.filteredResults.map((item) => item.childName)).size;

  elements.metrics.innerHTML = `
    <li>Hallazgos visibles: <strong>${total}</strong></li>
    <li>Alto riesgo (>=75): <strong>${highRisk}</strong></li>
    <li>Niños con exposición: <strong>${uniqueChildren}</strong></li>
  `;
}

function renderAlerts() {
  elements.alerts.innerHTML = '';
  state.alerts
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .forEach((alert) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>[${alert.severity}]</strong> ${alert.message} <small>(${new Date(alert.at).toLocaleString('es-ES', { timeZone: 'UTC' })} UTC)</small>`;
      elements.alerts.appendChild(li);
    });
}

function runNameSearch(name) {
  const normalized = name.trim().toLowerCase();
  const matches = state.findings.filter((finding) => finding.childName.toLowerCase().includes(normalized));
  renderResults(applyFilters(matches), `búsqueda por nombre: ${name}`);
}

function computeFaceMatch(face, item) {
  const hash = stableHash(`${face.childName}|${item.id}`);
  return 60 + (hash % 41);
}

function runFaceScan() {
  if (!state.selectedFace) return;

  const scored = state.findings.map((item) => ({
    ...item,
    faceMatch: computeFaceMatch(state.selectedFace, item)
  }));

  const matched = scored.filter((item) => item.faceMatch >= 75);
  const withRiskBoost = matched.map((item) => ({
    ...item,
    riskScore: Math.min(100, item.riskScore + Math.round((item.faceMatch - 70) / 2))
  }));

  renderResults(applyFilters(withRiskBoost), `match facial para ${state.selectedFace.childName}`);
}

function generateBulkDelete() {
  if (!state.filteredResults.length) {
    alert('No hay hallazgos filtrados para generar solicitudes.');
    return;
  }

  const links = state.filteredResults.map((item) => `• ${item.deleteRequestUrl}`).join('\n');
  alert(`Solicitudes de borrado preparadas (${state.filteredResults.length}):\n${links}`);
}

function simulateAlert() {
  const seed = state.filteredResults[Math.floor(Math.random() * state.filteredResults.length)] || state.findings[0] || { childName: 'Niño', platform: 'Instagram', riskScore: 50 };
  const newAlert = {
    id: `AL-${Math.floor(Math.random() * 1000)}`,
    message: `Nueva detección pública para ${seed.childName} en ${seed.platform}.`,
    severity: seed.riskScore >= 75 ? 'Alta' : 'Media',
    at: new Date().toISOString()
  };

  state.alerts.unshift(newAlert);
  renderAlerts();
}

function bindEvents() {
  elements.nameSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runNameSearch(elements.childNameInput.value);
  });

  elements.scanFaceBtn.addEventListener('click', runFaceScan);

  [elements.filterInstagram, elements.filterTikTok, elements.filterFacebook, elements.riskThreshold].forEach((control) => {
    control.addEventListener('change', () => {
      elements.riskValue.textContent = elements.riskThreshold.value;
      renderResults(applyFilters(state.filteredResults), 'filtros actualizados');
    });
  });

  elements.simulateAlert.addEventListener('click', simulateAlert);
  elements.bulkDelete.addEventListener('click', generateBulkDelete);
}

async function loadFindings() {
  try {
    setError(null);
    setLoading(true);
    await login();

    const findings = await apiRequest(`cases/${state.caseId}/findings`);
    state.findings = findings.map(mapFindingToResult);
    const filtered = applyFilters(state.findings);
    renderResults(filtered, 'datos cargados desde el backend');
  } catch (error) {
    state.findings = [];
    state.filteredResults = [];
    setError(error.message || 'Error de conexión con el backend');
    renderResults([], '');
  } finally {
    setLoading(false);
  }
}

function initialize() {
  renderFaceGallery();
  renderAlerts();
  bindEvents();
  loadFindings();
}

initialize();
