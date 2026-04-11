const state = {
  selectedFace: null,
  filteredPosts: [...demoPosts],
  alerts: [...demoAlerts]
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

function cosineLikeSimilarity(a, b) {
  const score = a.reduce((acc, value, idx) => {
    const distance = Math.abs(value - b[idx]);
    return acc + (1 - distance);
  }, 0);

  return Math.round((score / a.length) * 100);
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

function applyFilters(posts) {
  const minRisk = Number(elements.riskThreshold.value);
  const allowInstagram = elements.filterInstagram.checked;
  const allowTikTok = elements.filterTikTok.checked;
  const allowFacebook = elements.filterFacebook.checked;

  return posts.filter((post) => {
    const platformAllowed =
      (allowInstagram && post.platform === 'Instagram') ||
      (allowTikTok && post.platform === 'TikTok') ||
      (allowFacebook && post.platform === 'Facebook');
    return platformAllowed && post.riskScore >= minRisk;
  });
}

function renderResults(posts, reason = 'general') {
  const sorted = [...posts].sort((a, b) => b.riskScore - a.riskScore);
  state.filteredPosts = sorted;

  elements.resultsSummary.innerHTML = `
    <p><strong>${sorted.length}</strong> coincidencias detectadas (${reason}).</p>
  `;

  elements.resultsList.innerHTML = '';
  sorted.forEach((post) => {
    const item = document.createElement('article');
    item.className = 'result-item';
    item.innerHTML = `
      <div>
        <div class="platform">${post.platform} · ${post.author}</div>
        <p>${post.caption}</p>
        <p><strong>Niño:</strong> ${post.childName} · <strong>Ciudad:</strong> ${post.location.city}</p>
        <p><small>${new Date(post.postedAt).toLocaleString('es-ES', { timeZone: 'UTC' })} UTC</small></p>
        <a href="${post.publicUrl}" target="_blank" rel="noreferrer">Ver publicación</a>
      </div>
      <div>
        <span class="badge">Riesgo ${post.riskScore}</span><br /><br />
        <a class="delete-link" href="${post.deleteRequestUrl}" target="_blank" rel="noreferrer">
          Solicitar borrado
        </a>
      </div>
    `;

    elements.resultsList.appendChild(item);
  });

  renderMap(sorted);
  renderMetrics();
}

function renderMap(posts) {
  markerLayer.clearLayers();
  if (!posts.length) {
    map.setView([39.5, -98.35], 4);
    return;
  }

  const bounds = [];
  posts.forEach((post) => {
    const marker = L.marker([post.location.lat, post.location.lng]).bindPopup(`
      <strong>${post.childName}</strong><br />
      ${post.platform} · Riesgo ${post.riskScore}<br />
      <a href="${post.deleteRequestUrl}" target="_blank" rel="noreferrer">Solicitar borrado</a>
    `);
    markerLayer.addLayer(marker);
    bounds.push([post.location.lat, post.location.lng]);
  });

  map.fitBounds(bounds, { padding: [30, 30] });
}

function renderMetrics() {
  const total = state.filteredPosts.length;
  const highRisk = state.filteredPosts.filter((p) => p.riskScore >= 75).length;
  const uniqueChildren = new Set(state.filteredPosts.map((p) => p.childName)).size;

  elements.metrics.innerHTML = `
    <li>Posts visibles: <strong>${total}</strong></li>
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
  const matches = demoPosts.filter((post) => post.childName.toLowerCase().includes(normalized));
  renderResults(applyFilters(matches), `búsqueda por nombre: ${name}`);
}

function runFaceScan() {
  if (!state.selectedFace) return;
  const postsWithScore = demoPosts.map((post) => ({
    ...post,
    faceMatch: cosineLikeSimilarity(state.selectedFace.embedding, post.embedding)
  }));

  const matched = postsWithScore.filter((post) => post.faceMatch >= 75);
  const withRiskBoost = matched.map((post) => ({
    ...post,
    riskScore: Math.min(100, post.riskScore + Math.round((post.faceMatch - 70) / 2))
  }));

  renderResults(applyFilters(withRiskBoost), `match facial para ${state.selectedFace.childName}`);
}

function generateBulkDelete() {
  if (!state.filteredPosts.length) {
    alert('No hay posts filtrados para generar solicitudes.');
    return;
  }

  const links = state.filteredPosts.map((post) => `• ${post.deleteRequestUrl}`).join('\n');
  alert(`Solicitudes de borrado preparadas (${state.filteredPosts.length}):\n${links}`);
}

function simulateAlert() {
  const seed = state.filteredPosts[Math.floor(Math.random() * state.filteredPosts.length)] || demoPosts[0];
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
      renderResults(applyFilters(state.filteredPosts), 'filtros actualizados');
    });
  });

  elements.simulateAlert.addEventListener('click', simulateAlert);
  elements.bulkDelete.addEventListener('click', generateBulkDelete);
}

function initialize() {
  renderFaceGallery();
  renderResults(applyFilters(demoPosts), 'dataset inicial');
  renderAlerts();
  bindEvents();
}

initialize();
