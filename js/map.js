document.addEventListener('DOMContentLoaded', async () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // --- ÍCONES PERSONALIZADOS ---
    const createUserIcon = (color) => L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    const blueIcon = createUserIcon('blue');
    const redIcon = createUserIcon('red');

    // --- VARIÁVEIS GLOBAIS ---
    let map;
    let allPharmacies = [];
    let userMarker = null;
    let routingControl = null;
    const pharmacyMarkersLayer = L.layerGroup();

    // --- ELEMENTOS DO DOM ---
    const cidadeInput = document.getElementById('cidade-input');
    const bairroInput = document.getElementById('bairro-input');
    const searchBtn = document.getElementById('address-search-btn');
    const resultDiv = document.getElementById('search-result');
    const routeSummaryDiv = document.getElementById('route-summary');

    // --- FUNÇÕES ---
    const normalizarString = (str) => !str ? '' : str.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const updateSearchResult = (message, type = 'info') => {
        resultDiv.textContent = message;
        if (type === 'error') resultDiv.style.color = 'red';
        else if (type === 'success') resultDiv.style.color = 'green';
        else resultDiv.style.color = 'var(--cor-texto)';
    };

    const adicionarMarcadorFarmacia = (farmacia) => {
        const marker = L.marker([farmacia.LATITUDE, farmacia.LONGITUDE], { icon: redIcon })
            .on('click', () => criarRotaParaFarmacia(farmacia));
        pharmacyMarkersLayer.addLayer(marker);
    };

    const criarRotaParaFarmacia = (farmacia) => {
        if (!userMarker) {
            alert('Não foi possível obter sua localização para criar a rota. Por favor, permita o acesso à sua localização.');
            return;
        }
        if (routingControl) {
            map.removeControl(routingControl);
        }
        
        routingControl = L.Routing.control({
            waypoints: [ userMarker.getLatLng(), L.latLng(farmacia.LATITUDE, farmacia.LONGITUDE) ],
            show: false,
            createMarker: () => null,
            lineOptions: { styles: [{ color: 'var(--cor-primaria)', opacity: 0.8, weight: 6 }] }
        }).on('routesfound', function(e) {
            const summary = e.routes[0].summary;
            const distance = (summary.totalDistance / 1000).toFixed(2);
            const time = Math.round(summary.totalTime / 60);
            
            const telefoneInfo = farmacia.TELEFONE ? `<p>📞 <strong>Telefone:</strong> ${farmacia.TELEFONE}</p>` : '';

            routeSummaryDiv.innerHTML = `
                <h3>${farmacia.FARMACIA}</h3>
                <p>📍 <strong>Endereço:</strong> ${farmacia.ENDERECO}</p>
                ${telefoneInfo}
                <hr>
                <p>🚗 <strong>Distância:</strong> ${distance} km &nbsp;&nbsp;|&nbsp;&nbsp; ⏱️ <strong>Tempo Estimado:</strong> ${time} minutos</p>
            `;
        }).addTo(map);
    };

    const buscarFarmacias = async () => {
        const cidade = cidadeInput.value.trim();
        const bairro = bairroInput.value.trim();
        if (!cidade) {
            updateSearchResult("Por favor, informe a cidade.", 'error');
            return;
        }
        updateSearchResult('Buscando...', 'info');
        pharmacyMarkersLayer.clearLayers();
        routeSummaryDiv.innerHTML = '';

        const cidadeNorm = normalizarString(cidade);
        const bairroNorm = normalizarString(bairro);

        // --- LÓGICA DE BUSCA SIMPLIFICADA ---
        // Adiciona "RJ" diretamente na busca para garantir a precisão dentro do estado.
        try {
            const searchQuery = bairroNorm 
                ? `${bairro}, ${cidade}, RJ` 
                : `${cidade}, RJ`;
                
            const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=br`);
            if (nominatimResponse.ok) {
                const geoData = await nominatimResponse.json();
                if (geoData.length > 0) {
                    map.setView(L.latLng(geoData[0].lat, geoData[0].lon), 14);
                }
            }
        } catch (error) { console.error("Erro ao geocodificar:", error); }

        // Filtra e exibe as farmácias
        let resultados = allPharmacies.filter(f => normalizarString(f.MUNICIPIO) === cidadeNorm);
        if (bairroNorm) {
            resultados = resultados.filter(f => normalizarString(f.BAIRRO).includes(bairroNorm));
        }

        if (resultados.length > 0) {
            resultados.forEach(adicionarMarcadorFarmacia);
            updateSearchResult(`${resultados.length} farmácia(s) encontrada(s).`, 'success');
        } else {
            updateSearchResult('Nenhuma farmácia encontrada para esta busca.', 'info');
        }
    };

    const sucessoGeolocalizacao = (position) => {
        const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
        map.setView(userLatLng, 15);
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker(userLatLng, { icon: blueIcon }).addTo(map);
    };

    const erroGeolocalizacao = (error) => {
        console.warn(`ERRO DE GEOLOCALIZAÇÃO (${error.code}): ${error.message}`);
        updateSearchResult("Não foi possível obter sua localização.", 'info');
    };

    const inicializar = async () => {
        map = L.map(mapContainer).setView([-22.9068, -43.1729], 12); // Padrão: Rio de Janeiro
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        map.addLayer(pharmacyMarkersLayer);

        try {
            const response = await fetch('../dados/farmacias.json');
            if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);
            allPharmacies = await response.json();
        } catch (error) {
            console.error("FALHA CRÍTICA AO CARREGAR farmacias.json:", error);
            updateSearchResult("Não foi possível carregar os dados das farmácias.", 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(sucessoGeolocalizacao, erroGeolocalizacao);
        searchBtn.addEventListener('click', buscarFarmacias);
    };

    inicializar();
});
