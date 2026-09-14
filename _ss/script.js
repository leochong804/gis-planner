// Initialize map bounds
const bounds = [
    [22.3247, 114.18645], // Top-Left (North-West)
    [22.28451, 114.24934] // Bottom-Right (South-East)
];

// Map configuration
const map = L.map('map', {
    zoomControl: true,
    maxBounds: [[22.1, 113.8], [22.6, 114.5]], // Restrict roughly to HK
    minZoom: 10,
    maxZoom: 20
}).fitBounds(bounds);

// LandsD API endpoints
const API_VERSION = 'v1.0.0';
const BASEMAP_URL = `https://mapapi.geodata.gov.hk/gs/api/${API_VERSION}/xyz/basemap/WGS84/{z}/{x}/{y}.png`;
const LABEL_EN_URL = `https://mapapi.geodata.gov.hk/gs/api/${API_VERSION}/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png`;
const LABEL_TC_URL = `https://mapapi.geodata.gov.hk/gs/api/${API_VERSION}/xyz/label/hk/tc/WGS84/{z}/{x}/{y}.png`;

// Add Basemap Layer
L.tileLayer(BASEMAP_URL, {
    attribution: '<a href="https://mapapi.geodata.gov.hk/" target="_blank">Map from Lands Department</a>',
    maxZoom: 20
}).addTo(map);

// Add Label Layer
let currentLabelLayer = L.tileLayer(LABEL_EN_URL, { maxZoom: 20 }).addTo(map);

// Application State
let projectState = {
    activeRouteId: 'Route 1',
    routes: {
        'Route 1': []
    }
};

let stateHistory = [];
let historyIndex = -1;

let markers = [];
let polylines = [];
let distanceTooltips = [];
let currentColor = '#ef4444'; // default red

// DOM Elements
const coordinateListEl = document.getElementById('coordinate-list');
const emptyStateEl = document.getElementById('empty-state');
const totalDistanceEl = document.getElementById('total-distance');
const lineColorInput = document.getElementById('line-color');
const colorSwatches = document.querySelectorAll('.color-swatch');
const btnUndo = document.getElementById('btn-undo');
const btnRedo = document.getElementById('btn-redo');
const langEnBtn = document.getElementById('lang-en');
const langTcBtn = document.getElementById('lang-tc');
const routeSelector = document.getElementById('route-selector');
const btnNewRoute = document.getElementById('btn-new-route');
const btnFitView = document.getElementById('btn-fit-view');
const btnExportJson = document.getElementById('btn-export-json');
const btnImportJson = document.getElementById('btn-import-json');
const fileImport = document.getElementById('file-import');
const btnExportCsv = document.getElementById('btn-export-csv');

const btnDimAuto = document.getElementById('dim-auto');
const btnDimOn = document.getElementById('dim-on');
const btnDimOff = document.getElementById('dim-off');
let dimensionMode = 'auto';

btnFitView.addEventListener('click', () => {
    map.fitBounds(bounds);
});

function setDimensionMode(mode) {
    dimensionMode = mode;
    btnDimAuto.classList.toggle('active', mode === 'auto');
    btnDimOn.classList.toggle('active', mode === 'on');
    btnDimOff.classList.toggle('active', mode === 'off');
    updateMapDrawing();
}

btnDimAuto.addEventListener('click', () => setDimensionMode('auto'));
btnDimOn.addEventListener('click', () => setDimensionMode('on'));
btnDimOff.addEventListener('click', () => setDimensionMode('off'));

let dimensionMeasureMode = 'segment'; // 'segment' or 'cumulative'
const btnDimSegment = document.getElementById('dim-mode-segment');
const btnDimCumulative = document.getElementById('dim-mode-cumulative');

function setDimensionMeasureMode(mode) {
    dimensionMeasureMode = mode;
    btnDimSegment.classList.toggle('active', mode === 'segment');
    btnDimCumulative.classList.toggle('active', mode === 'cumulative');
    updateMapDrawing();
}

btnDimSegment.addEventListener('click', () => setDimensionMeasureMode('segment'));
btnDimCumulative.addEventListener('click', () => setDimensionMeasureMode('cumulative'));

// Language Toggle
function setLanguage(lang) {
    if (currentLabelLayer) {
        map.removeLayer(currentLabelLayer);
    }
    const url = lang === 'en' ? LABEL_EN_URL : LABEL_TC_URL;
    currentLabelLayer = L.tileLayer(url, { maxZoom: 20 }).addTo(map);
    
    if (lang === 'en') {
        langEnBtn.classList.add('active');
        langTcBtn.classList.remove('active');
    } else {
        langTcBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    }
}

langEnBtn.addEventListener('click', () => setLanguage('en'));
langTcBtn.addEventListener('click', () => setLanguage('tc'));

// Color Selection
function setActiveColor(color, el) {
    currentColor = color;
    colorSwatches.forEach(s => s.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        colorSwatches.forEach(s => s.classList.remove('active'));
    }
}

colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        setActiveColor(e.target.dataset.color, e.target);
    });
});

lineColorInput.addEventListener('input', (e) => {
    setActiveColor(e.target.value, null);
});

const lineThicknessInput = document.getElementById('line-thickness');
const thicknessVal = document.getElementById('thickness-val');

lineThicknessInput.addEventListener('input', (e) => {
    thicknessVal.innerText = `${e.target.value}px`;
    updateMapDrawing();
});

// State Management (Undo/Redo)
function saveState() {
    if (historyIndex < stateHistory.length - 1) {
        stateHistory = stateHistory.slice(0, historyIndex + 1);
    }
    
    stateHistory.push(JSON.stringify(projectState));
    historyIndex++;
    updateState();
}

btnUndo.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        projectState = JSON.parse(stateHistory[historyIndex]);
        updateState();
    }
});

btnRedo.addEventListener('click', () => {
    if (historyIndex < stateHistory.length - 1) {
        historyIndex++;
        projectState = JSON.parse(stateHistory[historyIndex]);
        updateState();
    }
});

// Routing Management
function updateRouteDropdown() {
    routeSelector.innerHTML = '';
    Object.keys(projectState.routes).forEach(routeId => {
        const option = document.createElement('option');
        option.value = routeId;
        option.innerText = routeId;
        if (routeId === projectState.activeRouteId) option.selected = true;
        routeSelector.appendChild(option);
    });
}

routeSelector.addEventListener('change', (e) => {
    projectState.activeRouteId = e.target.value;
    saveState();
});

btnNewRoute.addEventListener('click', () => {
    const routeNum = Object.keys(projectState.routes).length + 1;
    const newRouteId = `Route ${routeNum}`;
    projectState.routes[newRouteId] = [];
    projectState.activeRouteId = newRouteId;
    saveState();
});

// Map Click -> Popup
let popupCoordinate = null;
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    popupCoordinate = { lat, lng };

    const popupContent = `
        <div class="popup-container">
            <div class="popup-title">Add to ${projectState.activeRouteId}</div>
            <div class="popup-coords">Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}</div>
            <button class="popup-btn" onclick="addPointToList()">Add to List</button>
        </div>
    `;

    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
});

window.highlightTableRow = function(index) {
    document.querySelectorAll('#coordinate-list tr').forEach(tr => {
        tr.classList.remove('highlighted');
    });
    
    const targetRow = document.getElementById(`row-${index}`);
    if (targetRow) {
        targetRow.classList.add('highlighted');
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

window.addPointToList = function() {
    if (!popupCoordinate) return;
    
    projectState.routes[projectState.activeRouteId].push({
        lat: popupCoordinate.lat,
        lng: popupCoordinate.lng,
        color: currentColor
    });
    
    map.closePopup();
    saveState();
    
    const newIndex = projectState.routes[projectState.activeRouteId].length - 1;
    setTimeout(() => highlightTableRow(newIndex), 10);
};

window.removePoint = function(index) {
    projectState.routes[projectState.activeRouteId].splice(index, 1);
    saveState();
};

window.changeSegmentColor = function(index, color) {
    projectState.routes[projectState.activeRouteId][index].color = color;
    saveState();
}

function getActivePoints() {
    return projectState.routes[projectState.activeRouteId];
}

function updateState() {
    btnUndo.disabled = historyIndex === 0;
    btnRedo.disabled = historyIndex === stateHistory.length - 1;
    
    updateRouteDropdown();
    updateSidebarList();
    updateMapDrawing();
}

function updateSidebarList() {
    coordinateListEl.innerHTML = '';
    const points = getActivePoints();
    
    if (points.length === 0) {
        emptyStateEl.style.display = 'block';
        totalDistanceEl.innerText = '0';
        document.getElementById('coordinate-table').style.display = 'none';
        return;
    }
    
    emptyStateEl.style.display = 'none';
    document.getElementById('coordinate-table').style.display = 'table';
    let totalDist = 0;
    let colorDistances = {};
    
    points.forEach((pt, index) => {
        let distFromPrev = 0;
        if (index > 0) {
            distFromPrev = map.distance(
                [points[index - 1].lat, points[index - 1].lng], 
                [pt.lat, pt.lng]
            );
            totalDist += distFromPrev;
            
            if (!colorDistances[pt.color]) colorDistances[pt.color] = 0;
            colorDistances[pt.color] += distFromPrev;
        }

        const tr = document.createElement('tr');
        tr.id = `row-${index}`;
        
        // Allow clicking the row itself to highlight its map point (optional, but good UX)
        tr.addEventListener('click', () => {
            highlightTableRow(index);
        });
        
        let colorHtml = '';
        if (index > 0) {
            colorHtml = `<button class="color-swatch" style="background-color: ${pt.color}; width: 20px; height: 20px; cursor: pointer;" onclick="openColorPopup(event, ${index})" title="Change segment color"></button>`;
        } else {
            colorHtml = `<span style="color:var(--text-muted);font-size:10px;">Start</span>`;
        }

        tr.innerHTML = `
            <td class="row-index">${index + 1}</td>
            <td class="row-coords">${pt.lat.toFixed(5)}<br>${pt.lng.toFixed(5)}</td>
            <td class="row-dist">${index > 0 ? distFromPrev.toFixed(1) : '-'}</td>
            <td>${colorHtml}</td>
            <td>
                <button class="btn-icon" onclick="removePoint(${index})" title="Remove">✕</button>
            </td>
        `;
        coordinateListEl.appendChild(tr);
    });

    totalDistanceEl.innerText = totalDist.toFixed(1);
    
    const breakdownEl = document.getElementById('color-breakdown');
    if (breakdownEl) {
        if (Object.keys(colorDistances).length > 0) {
            breakdownEl.style.display = 'flex';
            breakdownEl.innerHTML = Object.keys(colorDistances).map(color => {
                return `<div style="display: flex; align-items: center; gap: 4px;">
                            <span style="display:inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; border: 1px solid rgba(0,0,0,0.1);"></span>
                            <span style="color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${colorDistances[color].toFixed(1)}m</span>
                        </div>`;
            }).join('');
        } else {
            breakdownEl.style.display = 'none';
        }
    }
}

function updateMapDrawing() {
    // Clear existing markers, lines, tooltips
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    polylines.forEach(pl => map.removeLayer(pl));
    polylines = [];
    
    distanceTooltips.forEach(t => map.removeLayer(t));
    distanceTooltips = [];

    // Determine scale based on current zoom level
    const currentZoom = map.getZoom();
    const baseWeight = parseInt(document.getElementById('line-thickness').value) || 4;
    let config = { size: 12, border: 3, weight: baseWeight, showMarkers: true };
    
    // Zoom 14 or lower is usually the "fit bounds" view for this small area
    if (currentZoom <= 14) {
        config = { size: 0, border: 0, weight: Math.max(1, baseWeight - 2), showMarkers: false };
    } else if (currentZoom === 15) {
        config = { size: 8, border: 2, weight: Math.max(1, baseWeight - 1), showMarkers: true };
    }

    let showTooltips = true;
    if (dimensionMode === 'auto') {
        showTooltips = currentZoom > 14;
    } else if (dimensionMode === 'on') {
        showTooltips = true;
    } else {
        showTooltips = false;
    }

    // Draw all routes
    Object.keys(projectState.routes).forEach(routeId => {
        const points = projectState.routes[routeId];
        const isActive = routeId === projectState.activeRouteId;
        const opacity = isActive ? 0.8 : 0.3; // Fade inactive routes

        // Identify streaks for cumulative mode
        let streaks = [];
        let currentStreak = null;

        points.forEach((pt, index) => {
            if (index > 0) {
                const prevPt = points[index - 1];
                const dist = map.distance([prevPt.lat, prevPt.lng], [pt.lat, pt.lng]);
                
                if (!currentStreak || pt.color !== currentStreak.color) {
                    if (currentStreak) streaks.push(currentStreak);
                    currentStreak = { color: pt.color, totalDist: dist, segments: [index] };
                } else {
                    currentStreak.totalDist += dist;
                    currentStreak.segments.push(index);
                }
            }
        });
        if (currentStreak) streaks.push(currentStreak);

        points.forEach((pt, index) => {
            // Draw segment leading to this point
            if (index > 0) {
                const prevPt = points[index - 1];
                const dist = map.distance([prevPt.lat, prevPt.lng], [pt.lat, pt.lng]);
                
                // Draw segment line
                const pl = L.polyline([
                    [prevPt.lat, prevPt.lng], 
                    [pt.lat, pt.lng]
                ], {
                    color: pt.color,
                    weight: isActive ? config.weight : config.weight - 1,
                    opacity: opacity,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(map);
                polylines.push(pl);

                // Draw tooltip for Segment Mode
                if (isActive && showTooltips && dimensionMeasureMode === 'segment') {
                    const midLat = (prevPt.lat + pt.lat) / 2;
                    const midLng = (prevPt.lng + pt.lng) / 2;
                    
                    // Calculate pixel coordinates to find exact rotation
                    const p1 = map.latLngToLayerPoint([prevPt.lat, prevPt.lng]);
                    const p2 = map.latLngToLayerPoint([pt.lat, pt.lng]);
                    
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
                    let offsetY = -15;
                    
                    if (angleDeg > 90 || angleDeg <= -90) {
                        angleDeg += 180;
                        offsetY = 15;
                    }

                    let labelHtml = `${dist.toFixed(1)} m`;
                    if (currentZoom >= 16) {
                        labelHtml += ` <strong style="color:var(--primary);">(+)</strong>`;
                    }

                    const iconHtml = `<div style="width: 120px; height: 24px; display: flex; align-items: center; justify-content: center; transform: rotate(${angleDeg}deg) translateY(${offsetY}px);">
                        <div class="dimension-label" style="padding: 0 4px; white-space: nowrap;">
                            ${labelHtml}
                        </div>
                    </div>`;

                    const dimensionIcon = L.divIcon({
                        html: iconHtml,
                        className: '',
                        iconSize: [120, 24],
                        iconAnchor: [60, 12]
                    });

                    const dimensionMarker = L.marker([midLat, midLng], {
                        icon: dimensionIcon,
                        interactive: true
                    }).addTo(map);

                    dimensionMarker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        projectState.routes[projectState.activeRouteId].splice(index, 0, {
                            lat: midLat,
                            lng: midLng,
                            color: pt.color
                        });
                        saveState();
                    });

                    distanceTooltips.push(dimensionMarker);
                }
            }

            // Draw Marker (Active route is draggable, inactive is static)
            if (config.showMarkers) {
                const markerColor = index === 0 && points.length > 1 ? points[1].color : pt.color;
                const totalSize = isActive ? config.size + (config.border * 2) : config.size;
                const anchorOffset = totalSize / 2;

                const markerHtml = `<div style="
                    width: ${config.size}px;
                    height: ${config.size}px;
                    background-color: white;
                    border: ${isActive ? config.border : 1}px solid ${markerColor};
                    border-radius: 50%;
                    box-shadow: 0 0 4px rgba(0,0,0,${isActive ? 0.3 : 0.1});
                    box-sizing: content-box;
                    opacity: ${opacity};
                "></div>`;
                
                const icon = L.divIcon({
                    html: markerHtml,
                    className: '',
                    iconSize: [totalSize, totalSize],
                    iconAnchor: [anchorOffset, anchorOffset]
                });

                const marker = L.marker([pt.lat, pt.lng], {
                    icon: icon,
                    draggable: isActive
                }).addTo(map);

                if (isActive) {
                    marker.on('dragend', function(event) {
                        const newLatLng = event.target.getLatLng();
                        points[index].lat = newLatLng.lat;
                        points[index].lng = newLatLng.lng;
                        saveState();
                    });
                    
                    // Allow clicking the marker to highlight its table row
                    marker.on('click', function() {
                        highlightTableRow(index);
                    });
                }

                markers.push(marker);
            }
        });

        // Draw tooltips for Cumulative Mode
        if (isActive && showTooltips && dimensionMeasureMode === 'cumulative') {
            streaks.forEach(streak => {
                const halfDist = streak.totalDist / 2;
                let walkedDist = 0;
                let targetSegIdx = streak.segments[0];
                let midLat = 0, midLng = 0;
                let angleDeg = 0;
                
                for (let i = 0; i < streak.segments.length; i++) {
                    const segIdx = streak.segments[i];
                    const prev = points[segIdx - 1];
                    const curr = points[segIdx];
                    const d = map.distance([prev.lat, prev.lng], [curr.lat, curr.lng]);
                    
                    if (walkedDist + d >= halfDist || i === streak.segments.length - 1) {
                        targetSegIdx = segIdx;
                        let ratio = d === 0 ? 0.5 : (halfDist - walkedDist) / d;
                        ratio = Math.max(0, Math.min(1, ratio)); // bound it
                        
                        midLat = prev.lat + (curr.lat - prev.lat) * ratio;
                        midLng = prev.lng + (curr.lng - prev.lng) * ratio;
                        
                        const p1 = map.latLngToLayerPoint([prev.lat, prev.lng]);
                        const p2 = map.latLngToLayerPoint([curr.lat, curr.lng]);
                        angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
                        break;
                    }
                    walkedDist += d;
                }

                let offsetY = -15;
                if (angleDeg > 90 || angleDeg <= -90) {
                    angleDeg += 180;
                    offsetY = 15;
                }

                let labelHtml = `${streak.totalDist.toFixed(1)} m`;
                if (currentZoom >= 16) {
                    labelHtml += ` <strong style="color:var(--primary);">(+)</strong>`;
                }

                const iconHtml = `<div style="width: 120px; height: 24px; display: flex; align-items: center; justify-content: center; transform: rotate(${angleDeg}deg) translateY(${offsetY}px);">
                    <div class="dimension-label" style="padding: 0 4px; white-space: nowrap;">
                        ${labelHtml}
                    </div>
                </div>`;

                const dimensionIcon = L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [120, 24],
                    iconAnchor: [60, 12]
                });

                const dimensionMarker = L.marker([midLat, midLng], {
                    icon: dimensionIcon,
                    interactive: true
                }).addTo(map);

                dimensionMarker.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    projectState.routes[projectState.activeRouteId].splice(targetSegIdx, 0, {
                        lat: midLat,
                        lng: midLng,
                        color: streak.color
                    });
                    saveState();
                });

                distanceTooltips.push(dimensionMarker);
            });
        }
    });
}

// Redraw when zoom changes to update scale
map.on('zoomend', updateMapDrawing);

// Initialize State
saveState();

// Import / Export Logic
btnExportJson.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "gis_planner_project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

btnImportJson.addEventListener('click', () => {
    fileImport.click();
});

fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.routes && importedState.activeRouteId) {
                projectState = importedState;
                saveState();
            } else {
                alert("Invalid project file format.");
            }
        } catch (err) {
            alert("Error parsing JSON file.");
        }
    };
    reader.readAsText(file);
});

btnExportCsv.addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,Route,Point_Index,Latitude,Longitude,Segment_Color\n";
    
    Object.keys(projectState.routes).forEach(routeId => {
        const points = projectState.routes[routeId];
        points.forEach((pt, index) => {
            csvContent += `"${routeId}",${index + 1},${pt.lat},${pt.lng},${pt.color}\n`;
        });
    });
    
    const encodedUri = encodeURI(csvContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", encodedUri);
    downloadAnchorNode.setAttribute("download", "gis_coordinates.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// --- Color Popup Logic for Table Rows ---
const colorPopup = document.getElementById('color-popup');
const popupColorInput = document.getElementById('popup-color-input');
const popupSwatches = document.querySelectorAll('.popup-swatch');
let activePopupSegmentIndex = null;

window.openColorPopup = function(event, index) {
    activePopupSegmentIndex = index;
    
    // Position the popup near the clicked button
    const rect = event.target.getBoundingClientRect();
    colorPopup.style.display = 'block';
    
    // Calculate position (below the button)
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX - 60; // center slightly
    
    // Check bounds
    if (left < 10) left = 10;
    
    colorPopup.style.top = top + 'px';
    colorPopup.style.left = left + 'px';
    
    // Set custom color input to current segment color
    popupColorInput.value = projectState.routes[projectState.activeRouteId][index].color;
    
    // Stop propagation so the body click doesn't close it immediately
    event.stopPropagation();
};

// Handle Swatch Clicks inside Popup
popupSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        if (activePopupSegmentIndex !== null) {
            changeSegmentColor(activePopupSegmentIndex, e.target.dataset.color);
            colorPopup.style.display = 'none';
        }
    });
});

// Handle Custom Color Input inside Popup
popupColorInput.addEventListener('input', (e) => {
    if (activePopupSegmentIndex !== null) {
        changeSegmentColor(activePopupSegmentIndex, e.target.value);
    }
});

// Close popup when clicking outside
document.addEventListener('click', (e) => {
    if (colorPopup.style.display === 'block' && !colorPopup.contains(e.target)) {
        colorPopup.style.display = 'none';
    }
});
