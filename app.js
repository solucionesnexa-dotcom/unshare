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
    matchScore: finding.matchScore,
    confidenceScore: finding.confidenceScore,
    sourceType: finding.sourceType,
    sourceUrl: finding.sourceUrl,
    status: finding.status,
    matchingMetadata: finding.matchingMetadata,
    postedAt: finding.createdAt,
    findingId: finding.id
  };
}

async function createFaceReference(face) {
  return apiRequest(`cases/${state.caseId}/face-references`, {
    method: 'POST',
    body: {
      minorId: face.minorId,
      referenceType: 'image',
      normalizedVector: face.embedding,
      metadata: { childName: face.childName }
    }
  });
}

async function scanCaseWithReference(faceReferenceId) {
  return apiRequest(`cases/${state.caseId}/findings/scan`, {
    method: 'POST',
    body: { faceReferenceId, platform: 'Instagram' }
  });
}

async function scanCaseByName(name) {
  return apiRequest(`cases/${state.caseId}/findings/scan`, {
    method: 'POST',
    body: { nameQuery: name, platform: 'Instagram' }
  });
}

async function viewEvidence(findingId) {
  try {
    const evidence = await apiRequest(`findings/${findingId}/evidence`);
    if (!evidence.length) {
      alert('No se encontró evidencia asociada a este hallazgo.');
      return;
    }

    const list = evidence
      .map((item) => `• ${item.id} (${item.status}) - ${item.mimeType}`)
      .join('\n');
    alert(`Evidencia encontrada:\n${list}`);
  } catch (error) {
    alert(`Error al cargar evidencia: ${error.message}`);
  }
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
        <p><strong>Match:</strong> ${item.matchScore ?? 'N/A'} · <strong>Confianza:</strong> ${item.confidenceScore ?? 'N/A'}</p>
        <p><small>${new Date(item.postedAt).toLocaleString('es-ES', { timeZone: 'UTC' })} UTC</small></p>
        <a href="${item.publicUrl}" target="_blank" rel="noreferrer">Ver publicación</a>
      </div>
      <div>
        <span class="badge">Riesgo ${item.riskScore}</span><br /><br />
        <button class="evidence-link" data-finding-id="${item.findingId}" type="button">Ver evidencia</button><br /><br />
        <a class="delete-link" href="${item.deleteRequestUrl}" target="_blank" rel="noreferrer">
          Solicitar borrado
        </a>
      </div>
    `;

    elements.resultsList.appendChild(entry);
  });

  elements.resultsList.querySelectorAll('.evidence-link').forEach((button) => {
    button.addEventListener('click', async () => {
      const findingId = button.getAttribute('data-finding-id');
      if (!findingId) return;
      await viewEvidence(findingId);
    });
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

async function runNameSearch(name) {
  if (!name.trim()) {
    renderResults(applyFilters(state.findings), 'filtros restaurados');
    return;
  }

  setError(null);
  setLoading(true);
  try {
    await login();
    const finding = await scanCaseByName(name);
    const mapped = mapFindingToResult(finding);
    state.findings.unshift(mapped);
    const filtered = applyFilters(state.findings);
    renderResults(filtered, `búsqueda y escaneo por nombre: ${name}`);
  } catch (error) {
    setError(error.message || 'Error al buscar por nombre');
    renderResults([], '');
  } finally {
    setLoading(false);
  }
}

function computeFaceMatch(face, item) {
  const hash = stableHash(`${face.childName}|${item.id}`);
  return 60 + (hash % 41);
}

async function runFaceScan() {
  if (!state.selectedFace) return;

  setError(null);
  setLoading(true);
  try {
    await login();
    const faceReference = await createFaceReference(state.selectedFace);
    const finding = await scanCaseWithReference(faceReference.id);
    const mapped = mapFindingToResult(finding);
    state.findings.unshift(mapped);
    const filtered = applyFilters(state.findings);
    renderResults(filtered, `escaneo backend para ${state.selectedFace.childName}`);
  } catch (error) {
    setError(error.message || 'Error al escanear el caso');
  } finally {
    setLoading(false);
  }
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
