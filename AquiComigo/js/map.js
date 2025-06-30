document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  // --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
  const defaultCoords = [-22.9068, -43.1729];
  const defaultZoom = 12;
  let allPharmacies = [];
  let userMarker = null;
  let routeLine = null;

  // --- ELEMENTOS DO DOM ---
  const cidadeInput = document.getElementById('cidade-input');
  const bairroInput = document.getElementById('bairro-input');
  const ruaInput = document.getElementById('rua-input');
  const searchBtn = document.getElementById('address-search-btn');
  const resultDiv = document.getElementById('search-result');

  // --- INICIALIZAÇÃO DO MAPA ---
  const map = L.map(mapContainer).setView(defaultCoords, defaultZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  let pharmacyMarkers = L.layerGroup().addTo(map);

  // --- FUNÇÕES AUXILIARES ---
  function haversineDistance(coords1, coords2) {
      const toRad = (x) => x * Math.PI / 180; const R = 6371; const dLat = toRad(coords2.lat - coords1.lat); const dLon = toRad(coords2.lng - coords1.lng); const lat1 = toRad(coords1.lat); const lat2 = toRad(coords2.lat); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
  }

  function updateSearchResult(message, isError = false) {
      resultDiv.textContent = message;
      resultDiv.style.color = isError ? 'red' : 'var(--cor-primaria)';
  }

  // --- LÓGICA DE CARREGAMENTO DAS FARMÁCIAS ---
  function loadInitialData() {
      fetch('../dados/farmacias.json')
          .then(res => res.ok ? res.json() : Promise.reject(new Error(`Erro de rede: ${res.status}`)))
          .then(data => {
              allPharmacies = data;
              data.forEach(f => {
                  if (f.LATITUDE != null && f.LONGITUDE != null) {
                      const enderecoCompleto = `${f.ENDERECO}, ${f.BAIRRO}<br>${f.MUNICIPIO} - ${f.UF}`;
                      const telefoneInfo = f.TELEFONE ? `<br>Telefone: ${f.TELEFONE}` : '';
                      const popupContent = `<strong>${f.FARMACIA}</strong><br>${enderecoCompleto}${telefoneInfo}`;
                      L.marker([f.LATITUDE, f.LONGITUDE]).bindPopup(popupContent).addTo(pharmacyMarkers);
                  }
              });
          })
          .catch(error => console.error("FALHA AO CARREGAR farmacias.json:", error));
  }

  // --- LÓGICA DA BUSCA (VERSÃO FINAL COM ROTA E MARCADOR DO USUÁRIO) ---
  searchBtn.addEventListener('click', async () => {
      const cidade = cidadeInput.value.trim();
      const bairro = bairroInput.value.trim();
      const rua = ruaInput.value.trim();

      if (!cidade || !bairro) {
          updateSearchResult("Preencha os campos Cidade e Bairro.", true);
          return;
      }
      updateSearchResult("Localizando endereço de referência...");

      try {
          if (userMarker) map.removeLayer(userMarker);
          if (routeLine) map.removeLayer(routeLine);

          let geoData = [];
          
          if (rua) {
              const addressString1 = [rua, bairro, cidade, 'Brasil'].join(', ');
              const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString1)}`);
              if(nominatimResponse.ok) geoData = await nominatimResponse.json();
          }
          if (geoData.length === 0) {
              const addressString2 = [bairro, cidade, 'Brasil'].join(', ');
              const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString2)}`);
              if(nominatimResponse.ok) geoData = await nominatimResponse.json();
          }
          if (geoData.length === 0) {
              const addressString3 = [cidade, 'Brasil'].join(', ');
              const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString3)}`);
              if(nominatimResponse.ok) geoData = await nominatimResponse.json();
          }

          if (geoData.length === 0) throw new Error("Endereço de referência não localizado.");
          
          const userCoords = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };

          if (allPharmacies.length === 0) throw new Error("Dados das farmácias não carregados.");
          
          let closestPharmacy = null;
          let minDistance = Infinity;
          allPharmacies.forEach(f => {
              if (f.LATITUDE != null && f.LONGITUDE != null) {
                  const distance = haversineDistance(userCoords, { lat: f.LATITUDE, lng: f.LONGITUDE });
                  if (distance < minDistance) { minDistance = distance; closestPharmacy = f; }
              }
          });

          if (!closestPharmacy) throw new Error("Nenhuma farmácia encontrada próximo a este local.");
          
          updateSearchResult(`Próxima: ${closestPharmacy.FARMACIA} (${minDistance.toFixed(2)} km)`);

          // --- ETAPA FINAL: RE-ADICIONANDO MARCADOR DO USUÁRIO, ROTA E ZOOM ---
          
          const userPoint = [userCoords.lat, userCoords.lng];
          const pharmacyPoint = [closestPharmacy.LATITUDE, closestPharmacy.LONGITUDE];

          // 1. Adiciona o marcador do seu local
          userMarker = L.marker(userPoint).addTo(map).bindPopup(`<b>Sua Localização de Referência</b><br>${bairro}, ${cidade}`).openPopup();

          // 2. Adiciona a linha conectando os dois pontos
          routeLine = L.polyline([userPoint, pharmacyPoint], { color: 'var(--cor-sucesso)', weight: 4, opacity: 0.8 }).addTo(map);

          // 3. Ajusta o mapa para mostrar ambos os pontos
          map.fitBounds([userPoint, pharmacyPoint], { padding: [50, 50] });

          // 4. Encontra e abre o popup da farmácia
          pharmacyMarkers.eachLayer(marker => {
              if (marker.getLatLng().lat == closestPharmacy.LATITUDE && marker.getLatLng().lng == closestPharmacy.LONGITUDE) {
                  marker.openPopup();
              }
          });

      } catch (error) {
          console.error("Erro na busca:", error);
          updateSearchResult(error.message, true);
      }
  });

  loadInitialData();
});