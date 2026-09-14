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
    maxZoom: 20,
    rotate: true,
    touchRotate: true,
    boxZoom: false // Disable default Shift+Drag zoom box to allow rotation
}).fitBounds(bounds);

// Custom Shift+Drag Rotation Handler
let isShiftRotating = false;
let rotateStartX = 0;
let rotateStartBearing = 0;

map.getContainer().addEventListener('mousedown', function(e) {
    if (e.shiftKey) {
        isShiftRotating = true;
        rotateStartX = e.clientX;
        rotateStartBearing = map.getBearing ? map.getBearing() : 0;
        map.dragging.disable(); // Prevent map panning
    }
});

document.addEventListener('mousemove', function(e) {
    if (isShiftRotating && map.setBearing) {
        let deltaX = e.clientX - rotateStartX;
        map.setBearing(rotateStartBearing + deltaX * 0.5); // 0.5 is rotation sensitivity
    }
});

document.addEventListener('mouseup', function(e) {
    if (isShiftRotating) {
        isShiftRotating = false;
        map.dragging.enable(); // Re-enable panning
    }
});

// Add North Arrow Control
L.Control.NorthArrow = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.backgroundColor = 'white';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.cursor = 'pointer';
        container.title = "Reset Rotation (Shift + Drag to Rotate)";

        // North Arrow Icon
        var arrow = L.DomUtil.create('div', '', container);
        arrow.innerHTML = '<div style="font-size:16px; margin-top:-2px;">⬆</div><div style="font-size:10px;line-height:0.8;font-weight:bold;margin-top:-4px;">N</div>';
        arrow.style.textAlign = 'center';
        arrow.style.transformOrigin = 'center center';
        arrow.style.transition = 'transform 0.1s ease';

        container.onclick = function(e) {
            e.stopPropagation();
            if (map.setBearing) {
                map.setBearing(0);
            }
        };

        map.on('rotate', function() {
            if (map.getBearing) {
                var bearing = map.getBearing();
                arrow.style.transform = 'rotate(' + bearing + 'deg)';
            }
        });

        return container;
    }
});
map.addControl(new L.Control.NorthArrow());

// LandsD API endpoints
const API_VERSION = 'v1.0.0';
const BASEMAP_URL = `https://mapapi.geodata.gov.hk/gs/api/${API_VERSION}/xyz/basemap/WGS84/{z}/{x}/{y}.png`;
const LABEL_EN_URL = `https://mapapi.geodata.gov.hk/gs/api/${API_VERSION}/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png`;
const LABEL_TC_URL = `https://mapapi.geodata.gov.hk/gs/api/${API_VERSION}/xyz/label/hk/tc/WGS84/{z}/{x}/{y}.png`;

// Add Basemap Layer
L.tileLayer(BASEMAP_URL, {
    attribution: '<a href="https://mapapi.geodata.gov.hk/" target="_blank">Map from Lands Department</a>',
    maxZoom: 20,
    crossOrigin: true
}).addTo(map);

// Add Label Layer
let currentLabelLayer = L.tileLayer(LABEL_EN_URL, { maxZoom: 20, crossOrigin: true }).addTo(map);

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
const btnUnloadJson = document.getElementById('btn-unload-json');
const btnScreenCapture = document.getElementById('btn-screen-capture');
const fileImport = document.getElementById('file-import');
const btnExportCsv = document.getElementById('btn-export-csv');

const btnDimAuto = document.getElementById('dim-auto');
const btnDimOn = document.getElementById('dim-on');
const btnDimOff = document.getElementById('dim-off');
let dimensionMode = 'auto';

const btnPtsAuto = document.getElementById('pts-auto');
const btnPtsOn = document.getElementById('pts-on');
const btnPtsOff = document.getElementById('pts-off');
let pointsVisibilityMode = 'auto';

function setPointsVisibility(mode) {
    pointsVisibilityMode = mode;
    if (btnPtsAuto) btnPtsAuto.classList.toggle('active', mode === 'auto');
    if (btnPtsOn) btnPtsOn.classList.toggle('active', mode === 'on');
    if (btnPtsOff) btnPtsOff.classList.toggle('active', mode === 'off');
    updateMapDrawing();
}

if (btnPtsAuto) btnPtsAuto.addEventListener('click', () => setPointsVisibility('auto'));
if (btnPtsOn) btnPtsOn.addEventListener('click', () => setPointsVisibility('on'));
if (btnPtsOff) btnPtsOff.addEventListener('click', () => setPointsVisibility('off'));

const btnRouteVisFaded = document.getElementById('route-vis-faded');
const btnRouteVisSolid = document.getElementById('route-vis-solid');
let routeVisibilityMode = 'faded';

function setRouteVisibility(mode) {
    routeVisibilityMode = mode;
    btnRouteVisFaded.classList.toggle('active', mode === 'faded');
    btnRouteVisSolid.classList.toggle('active', mode === 'solid');
    updateMapDrawing();
}

btnRouteVisFaded.addEventListener('click', () => setRouteVisibility('faded'));
btnRouteVisSolid.addEventListener('click', () => setRouteVisibility('solid'));

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
    currentLabelLayer = L.tileLayer(url, { maxZoom: 20, crossOrigin: true }).addTo(map);
    
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

// Reference Layers
let lotLayer = null;
let glaLayer = null;
let sttLayer = null;
let lotLabelLayer = L.layerGroup();
let glaLabelLayer = L.layerGroup();
let sttLabelLayer = L.layerGroup();
const layerLotCheckbox = document.getElementById('layer-lot');
const layerGlaCheckbox = document.getElementById('layer-gla');
const layerSttCheckbox = document.getElementById('layer-stt');
const layerLotNameCheckbox = document.getElementById('layer-lot-name');
const layerGlaNameCheckbox = document.getElementById('layer-gla-name');
const layerSttNameCheckbox = document.getElementById('layer-stt-name');

if (layerLotNameCheckbox) {
    layerLotNameCheckbox.addEventListener('change', (e) => {
        if (e.target.checked && layerLotCheckbox && layerLotCheckbox.checked) {
            lotLabelLayer.addTo(map);
        } else {
            lotLabelLayer.remove();
        }
    });
}
if (layerGlaNameCheckbox) {
    layerGlaNameCheckbox.addEventListener('change', (e) => {
        if (e.target.checked && layerGlaCheckbox && layerGlaCheckbox.checked) {
            glaLabelLayer.addTo(map);
        } else {
            glaLabelLayer.remove();
        }
    });
}

if (layerSttNameCheckbox) {
    layerSttNameCheckbox.addEventListener('change', (e) => {
        if (e.target.checked && layerSttCheckbox && layerSttCheckbox.checked) {
            sttLabelLayer.addTo(map);
        } else {
            sttLabelLayer.remove();
        }
    });
}

function showLoadingToast(text) {
    const toast = document.getElementById('loading-toast');
    const toastText = document.getElementById('loading-toast-text');
    if (toast && toastText) {
        toastText.innerText = text;
        toast.style.display = 'inline-flex';
    }
}

function hideLoadingToast() {
    const toast = document.getElementById('loading-toast');
    if (toast) toast.style.display = 'none';
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

if (layerLotCheckbox) {
    layerLotCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
            if (!lotLayer) {
                try {
                    showLoadingToast("Loading Lot Boundaries...");
                    await loadScript('data/lot_east_kowloon.js');
                    if (typeof lotData === 'undefined') throw new Error("lotData not loaded");
                    lotLayer = L.geoJSON(lotData, {
                        style: {
                            color: '#ff4dff', 
                            weight: 3,
                            fillColor: '#add8e6',
                            fillOpacity: 0.4
                        },
                        onEachFeature: function (feature, layer) {
                            if (feature.properties) {
                                let fullName = "";
                                let shortName = "";
                                if (feature.properties.ENGLotDescription) {
                                    fullName = feature.properties.ENGLotDescription.replace(/\r?\n|\r/g, " ").trim();
                                    const match = fullName.match(/\((.*)\)\s*$/);
                                    if (match) {
                                        shortName = match[1].trim();
                                    } else {
                                        shortName = fullName;
                                    }
                                } else if (feature.properties.LotCSUID) {
                                    fullName = "Lot: " + feature.properties.LotCSUID.trim();
                                    shortName = fullName;
                                }

                                if (shortName) {
                                    const pointOnFeature = turf.pointOnFeature(feature).geometry.coordinates;
                                    const center = [pointOnFeature[1], pointOnFeature[0]];
                                    const marker = L.marker(center, {
                                        icon: L.divIcon({
                                            className: 'land-label lot-land-label',
                                            html: `<div style="transform: translate(-50%, -50%); white-space: nowrap;">${shortName}</div>`,
                                            iconSize: [0, 0]
                                        }),
                                        interactive: false
                                    });
                                    lotLabelLayer.addLayer(marker);
                                }
                                if (fullName) {
                                    layer.bindTooltip(fullName, {
                                        sticky: true,
                                        direction: 'auto'
                                    });
                                    // Map-to-table highlight
                                    layer.on('click', () => {
                                        const rows = document.querySelectorAll('.conflict-row');
                                        rows.forEach(r => {
                                            if (r.innerText.includes(fullName)) {
                                                r.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                r.click();
                                            }
                                        });
                                    });
                                }
                            }
                        }
                    });
                } catch (err) {
                    console.error("Error loading Lot layer:", err);
                    alert("Failed to load Lot layer.");
                    e.target.checked = false;
                    return;
                }
            }
            lotLayer.addTo(map);
            lotLayer.bringToBack();
            if (layerLotNameCheckbox && layerLotNameCheckbox.checked) {
                lotLabelLayer.addTo(map);
            }
        } else {
            if (lotLayer) map.removeLayer(lotLayer);
            lotLabelLayer.remove();
        }
    });
}

if (layerGlaCheckbox) {
    layerGlaCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
            if (!glaLayer) {
                try {
                    await loadScript('data/gla_east_kowloon.js');
                    if (typeof glaData === 'undefined') throw new Error("glaData not loaded");
                    glaLayer = L.geoJSON(glaData, {
                        style: {
                            color: '#8b4513',
                            weight: 3,
                            fillColor: '#d2b48c',
                            fillOpacity: 0.4
                        },
                        onEachFeature: function (feature, layer) {
                            if (feature.properties && feature.properties.GLADisplayName) {
                                const tooltipText = feature.properties.GLADisplayName.trim();
                                const pointOnFeature = turf.pointOnFeature(feature).geometry.coordinates;
                                const center = [pointOnFeature[1], pointOnFeature[0]];
                                const marker = L.marker(center, {
                                    icon: L.divIcon({
                                        className: 'land-label gla-land-label',
                                        html: `<div style="transform: translate(-50%, -50%); white-space: nowrap;">${tooltipText}</div>`,
                                        iconSize: [0, 0]
                                    }),
                                    interactive: false
                                });
                                glaLabelLayer.addLayer(marker);

                                layer.bindTooltip(tooltipText, {
                                    sticky: true,
                                    direction: 'auto'
                                });
                                // Map-to-table highlight
                                layer.on('click', () => {
                                    const rows = document.querySelectorAll('.conflict-row');
                                    rows.forEach(r => {
                                        if (r.innerText.includes(tooltipText)) {
                                            r.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            r.click();
                                        }
                                    });
                                });
                            }
                        }
                    });
                } catch (err) {
                    console.error("Error loading GLA layer:", err);
                    alert("Failed to load GLA layer.");
                    e.target.checked = false;
                    return;
                }
            }
            glaLayer.addTo(map);
            glaLayer.bringToBack();
            if (layerGlaNameCheckbox && layerGlaNameCheckbox.checked) {
                glaLabelLayer.addTo(map);
            }
        } else {
            if (glaLayer) map.removeLayer(glaLayer);
            glaLabelLayer.remove();
        }
    });
}

if (layerSttCheckbox) {
    layerSttCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
            if (!sttLayer) {
                try {
                    await loadScript('data/stt_east_kowloon.js');
                    if (typeof sttData === 'undefined') throw new Error("sttData not loaded");
                    sttLayer = L.geoJSON(sttData, {
                        style: {
                            color: '#c19a6b',
                            weight: 3,
                            fillColor: '#deb887',
                            fillOpacity: 0.4
                        },
                        onEachFeature: function (feature, layer) {
                            if (feature.properties && feature.properties.STTNo) {
                                const tooltipText = feature.properties.STTNo.trim();
                                const pointOnFeature = turf.pointOnFeature(feature).geometry.coordinates;
                                const center = [pointOnFeature[1], pointOnFeature[0]];
                                const marker = L.marker(center, {
                                    icon: L.divIcon({
                                        className: 'land-label stt-land-label',
                                        html: `<div style="transform: translate(-50%, -50%); white-space: nowrap;">${tooltipText}</div>`,
                                        iconSize: [0, 0]
                                    }),
                                    interactive: false
                                });
                                sttLabelLayer.addLayer(marker);

                                layer.bindTooltip(tooltipText, {
                                    sticky: true,
                                    direction: 'auto'
                                });
                                // Map-to-table highlight
                                layer.on('click', () => {
                                    const rows = document.querySelectorAll('.conflict-row');
                                    rows.forEach(r => {
                                        if (r.innerText.includes(tooltipText)) {
                                            r.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            r.click();
                                        }
                                    });
                                });
                            }
                        }
                    });
                } catch (err) {
                    console.error("Error loading STT layer:", err);
                    alert("Failed to load STT layer.");
                    e.target.checked = false;
                    return;
                }
            }
            sttLayer.addTo(map);
            sttLayer.bringToBack();
            if (layerSttNameCheckbox && layerSttNameCheckbox.checked) {
                sttLabelLayer.addTo(map);
            }
        } else {
            if (sttLayer) map.removeLayer(sttLayer);
            sttLabelLayer.remove();
        }
    });
}

// ==========================================
// STATUTORY PLAN (OZP) INTEGRATION & LEGEND
// ==========================================
const OZP_COLOR_MAP = {
    'C': { fill: 'rgb(248, 152, 154)', border: '#e57373', name: 'Commercial' },
    'C/R': { fill: 'rgb(226, 132, 123)', border: '#d32f2f', name: 'Commercial/Residential' },
    'CA': { fill: 'rgb(194, 215, 120)', border: '#7cb342', name: 'Conservation Area' },
    'CDA': { fill: 'rgb(248, 117, 120)', border: '#ef5350', name: 'Comprehensive Development Area' },
    'G/IC': { fill: 'rgb(211, 255, 252)', border: '#00bcd4', name: 'Government, Institution or Community' },
    'GB': { fill: 'rgb(232, 255, 121)', border: '#9e9d24', name: 'Green Belt' },
    'O': { fill: 'rgb(157, 255, 121)', border: '#43a047', name: 'Open Space' },
    'OU': { fill: 'rgb(253, 211, 116)', border: '#f57c00', name: 'Other Specified Uses' },
    'OU(A)': { fill: 'rgb(246, 255, 161)', border: '#c0ca33', name: 'Other Specified Uses (Amenity Area)' },
    'R(A)': { fill: 'rgb(195, 120, 115)', border: '#8d6e63', name: 'Residential (Group A)' },
    'R(B)': { fill: 'rgb(217, 170, 119)', border: '#a1887f', name: 'Residential (Group B)' },
    'R(C)': { fill: 'rgb(240, 213, 125)', border: '#fbc02d', name: 'Residential (Group C)' },
    'R(D)': { fill: 'rgb(255, 235, 117)', border: '#fdd835', name: 'Residential (Group D)' },
    'R(E)': { fill: 'rgb(206, 120, 130)', border: '#b71c1c', name: 'Residential (Group E)' },
    'U': { fill: 'rgb(239, 240, 244)', border: '#9e9e9e', name: 'Undetermined' },
    'URA': { fill: 'rgb(223, 213, 116)', border: '#afb42b', name: 'Urban Renewal Authority Development' },
    'V': { fill: 'rgb(223, 213, 116)', border: '#afb42b', name: 'Village Type Development' },
    'AGR': { fill: 'rgb(194, 226, 168)', border: '#7cb342', name: 'Agriculture' },
    'CPA': { fill: 'rgb(188, 229, 208)', border: '#26a69a', name: 'Coastal Protection Area' }
};

function getOzpStyle(zoneLabel) {
    if (!zoneLabel) return { fillColor: '#cbd5e1', color: '#64748b', weight: 1.5, fillOpacity: 0.55 };
    
    // Direct match
    if (OZP_COLOR_MAP[zoneLabel]) {
        const item = OZP_COLOR_MAP[zoneLabel];
        return { fillColor: item.fill, color: item.border, weight: 1.5, fillOpacity: 0.55 };
    }
    
    // Strip trailing brackets/numbers
    let baseLabel = zoneLabel.replace(/\s*\(\d+\)$/, '').replace(/\d+$/, '').trim();
    if (OZP_COLOR_MAP[baseLabel]) {
        const item = OZP_COLOR_MAP[baseLabel];
        return { fillColor: item.fill, color: item.border, weight: 1.5, fillOpacity: 0.55 };
    }
    
    // Prefix match
    for (let key in OZP_COLOR_MAP) {
        if (zoneLabel.startsWith(key)) {
            const item = OZP_COLOR_MAP[key];
            return { fillColor: item.fill, color: item.border, weight: 1.5, fillOpacity: 0.55 };
        }
    }
    
    return { fillColor: '#e2e8f0', color: '#94a3b8', weight: 1.5, fillOpacity: 0.55 };
}

let ozpZoneLayer = null;
let ozpPlanLayer = null;
let ozpZoneLabelLayer = L.layerGroup();
let ozpPlanLabelLayer = L.layerGroup();

const layerOzpZoneCheckbox = document.getElementById('layer-ozp-zone');
const layerOzpZoneNameCheckbox = document.getElementById('layer-ozp-zone-name');
const layerOzpPlanCheckbox = document.getElementById('layer-ozp-plan');
const layerOzpPlanNameCheckbox = document.getElementById('layer-ozp-plan-name');

const ozpLegendContainer = document.getElementById('ozp-legend-container');
const ozpLegendBody = document.getElementById('ozp-legend-body');
const btnCloseOzpLegend = document.getElementById('btn-close-ozp-legend');

if (btnCloseOzpLegend) {
    btnCloseOzpLegend.addEventListener('click', () => {
        if (ozpLegendContainer) ozpLegendContainer.style.display = 'none';
    });
}

function updateOzpLegend() {
    if (!ozpLegendBody) return;
    ozpLegendBody.innerHTML = '';
    
    for (let code in OZP_COLOR_MAP) {
        const item = OZP_COLOR_MAP[code];
        const row = document.createElement('div');
        row.className = 'ozp-legend-item';
        row.innerHTML = `
            <div class="ozp-legend-swatch" style="background-color: ${item.fill}; border-color: ${item.border};"></div>
            <span class="ozp-legend-code">${code}</span>
            <span class="ozp-legend-desc" title="${item.name}">${item.name}</span>
        `;
        ozpLegendBody.appendChild(row);
    }
}
updateOzpLegend();

// OZP Zone Layer Event Listener
if (layerOzpZoneCheckbox) {
    layerOzpZoneCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
            if (!ozpZoneLayer) {
                try {
                    showLoadingToast("Loading Statutory Plan (OZP) data...");
                    if (typeof ozpZoneData === 'undefined') {
                        await loadScript('data/ozp_zone_hk.js');
                    }
                    if (typeof ozpZoneData === 'undefined') throw new Error("ozpZoneData not loaded");
                    ozpZoneLayer = L.geoJSON(ozpZoneData, {
                        style: function(feature) {
                            const lbl = feature.properties ? feature.properties.ZONE_LABEL : '';
                            return getOzpStyle(lbl);
                        },
                        onEachFeature: function(feature, layer) {
                            const props = feature.properties || {};
                            const planNo = props.PLAN_NO || '';
                            const zoneLabel = props.ZONE_LABEL || '';
                            const descEng = props.DESC_ENG || '';
                            const descCht = props.DESC_CHT || '';
                            const spUseEng = props.SPUSE_ENG || '';
                            
                            let popupHtml = `<div class="popup-container">`;
                            popupHtml += `<div class="popup-title">Statutory Zone: ${zoneLabel}</div>`;
                            if (planNo) popupHtml += `<div style="font-size:0.8rem; color:var(--text-muted);">Plan No: <b>${planNo}</b></div>`;
                            if (descEng) popupHtml += `<div style="font-size:0.8rem; margin-top:2px;">${descEng} (${descCht})</div>`;
                            if (spUseEng && spUseEng !== ' ') popupHtml += `<div style="font-size:0.75rem; color:#d97706; margin-top:2px;">Special Use: ${spUseEng}</div>`;
                            popupHtml += `</div>`;
                            
                            layer.bindPopup(popupHtml);
                            layer.bindTooltip(`${zoneLabel} - ${descEng}`, { sticky: true });
                            
                            // Map click to conflict panel highlight if present
                            layer.on('click', () => {
                                const rows = document.querySelectorAll('.conflict-row');
                                rows.forEach(r => {
                                    if (r.innerText.includes(zoneLabel)) {
                                        r.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        r.click();
                                    }
                                });
                            });

                            // Zone Label marker
                            if (zoneLabel) {
                                try {
                                    const pt = turf.pointOnFeature(feature).geometry.coordinates;
                                    const center = [pt[1], pt[0]];
                                    const marker = L.marker(center, {
                                        icon: L.divIcon({
                                            className: 'ozp-label',
                                            html: `<div style="transform: translate(-50%, -50%); white-space: nowrap;">${zoneLabel}</div>`,
                                            iconSize: [0, 0]
                                        }),
                                        interactive: false
                                    });
                                    ozpZoneLabelLayer.addLayer(marker);
                                } catch (err) {}
                            }
                        }
                    });
                } catch (err) {
                    console.error("Error loading OZP Zone layer:", err);
                    alert("Failed to load OZP Zone layer.");
                    e.target.checked = false;
                    hideLoadingToast();
                    return;
                } finally {
                    hideLoadingToast();
                }
            }
            if (ozpZoneLayer) {
                ozpZoneLayer.addTo(map);
                ozpZoneLayer.bringToBack();
            }
            if (layerOzpZoneNameCheckbox && layerOzpZoneNameCheckbox.checked) {
                ozpZoneLabelLayer.addTo(map);
            }
            if (ozpLegendContainer) ozpLegendContainer.style.display = 'flex';
        } else {
            if (ozpZoneLayer) ozpZoneLayer.remove();
            ozpZoneLabelLayer.remove();
            if (ozpLegendContainer) ozpLegendContainer.style.display = 'none';
        }
    });
}

if (layerOzpZoneNameCheckbox) {
    layerOzpZoneNameCheckbox.addEventListener('change', (e) => {
        if (e.target.checked && layerOzpZoneCheckbox && layerOzpZoneCheckbox.checked) {
            ozpZoneLabelLayer.addTo(map);
        } else {
            ozpZoneLabelLayer.remove();
        }
    });
}

// OZP Plan Scheme Area Boundaries Event Listener
if (layerOzpPlanCheckbox) {
    layerOzpPlanCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
            if (!ozpPlanLayer) {
                try {
                    showLoadingToast("Loading OZP Plan boundaries...");
                    if (typeof ozpPlanData === 'undefined') {
                        await loadScript('data/ozp_plan_hk.js');
                    }
                    if (typeof ozpPlanData === 'undefined') throw new Error("ozpPlanData not loaded");
                    ozpPlanLayer = L.geoJSON(ozpPlanData, {
                        style: {
                            color: '#334155',
                            weight: 2.5,
                            dashArray: '6, 6',
                            fill: false
                        },
                        onEachFeature: function(feature, layer) {
                            const props = feature.properties || {};
                            const planNo = props.PLAN_NO || '';
                            const nameEng = props.NAME_ENG || '';
                            const nameCht = props.NAME_CHT || '';
                            
                            let popupHtml = `<div class="popup-container">`;
                            popupHtml += `<div class="popup-title">OZP Plan: ${planNo}</div>`;
                            if (nameEng) popupHtml += `<div style="font-size:0.8rem; margin-top:2px;">${nameEng} (${nameCht})</div>`;
                            popupHtml += `</div>`;
                            
                            layer.bindPopup(popupHtml);
                            layer.bindTooltip(`OZP: ${planNo} ${nameEng}`, { sticky: true });
                            
                            if (planNo) {
                                try {
                                    const pt = turf.pointOnFeature(feature).geometry.coordinates;
                                    const center = [pt[1], pt[0]];
                                    const marker = L.marker(center, {
                                        icon: L.divIcon({
                                            className: 'ozp-plan-label',
                                            html: `<div style="transform: translate(-50%, -50%); white-space: nowrap;">${planNo}</div>`,
                                            iconSize: [0, 0]
                                        }),
                                        interactive: false
                                    });
                                    ozpPlanLabelLayer.addLayer(marker);
                                } catch (err) {}
                            }
                        }
                    });
                } catch (err) {
                    console.error("Error loading OZP Plan layer:", err);
                    alert("Failed to load OZP Plan layer.");
                    e.target.checked = false;
                    hideLoadingToast();
                    return;
                } finally {
                    hideLoadingToast();
                }
            }
            if (ozpPlanLayer) {
                ozpPlanLayer.addTo(map);
            }
            if (layerOzpPlanNameCheckbox && layerOzpPlanNameCheckbox.checked) {
                ozpPlanLabelLayer.addTo(map);
            }
        } else {
            if (ozpPlanLayer) ozpPlanLayer.remove();
            ozpPlanLabelLayer.remove();
        }
    });
}

if (layerOzpPlanNameCheckbox) {
    layerOzpPlanNameCheckbox.addEventListener('change', (e) => {
        if (e.target.checked && layerOzpPlanCheckbox && layerOzpPlanCheckbox.checked) {
            ozpPlanLabelLayer.addTo(map);
        } else {
            ozpPlanLabelLayer.remove();
        }
    });
}


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

    if (pointsVisibilityMode === 'on') {
        config.showMarkers = true;
        if (config.size === 0) {
            config.size = 8;
            config.border = 2;
        }
    } else if (pointsVisibilityMode === 'off') {
        config.showMarkers = false;
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
        const opacity = isActive ? 0.8 : (routeVisibilityMode === 'solid' ? 0.8 : 0.3);

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
    downloadAnchorNode.remove();
});

if (btnUnloadJson) {
    btnUnloadJson.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the project? All unsaved data will be lost.")) {
            projectState = {
                activeRouteId: 'Route 1',
                routes: {
                    'Route 1': []
                }
            };
            stateHistory = [];
            historyIndex = -1;
            saveState();
        }
    });
}

let screenshotter = L.simpleMapScreenshoter({
    hidden: true,
    preventDownload: true
}).addTo(map);

if (btnScreenCapture) {
    btnScreenCapture.addEventListener('click', () => {
        btnScreenCapture.innerText = "⏳";
        btnScreenCapture.disabled = true;

        screenshotter.takeScreen('blob')
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `Map_Capture_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = url;
                link.click();
                window.URL.revokeObjectURL(url);
                
                btnScreenCapture.innerText = "📸";
                btnScreenCapture.disabled = false;
            })
            .catch(err => {
                console.error("Screen capture failed:", err);
                alert("Failed to capture screen. Please try again.");
                btnScreenCapture.innerText = "📸";
                btnScreenCapture.disabled = false;
            });
    });
}

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

// --- Conflict Analysis Feature ---
const btnAnalyzeConflicts = document.getElementById('btn-analyze-conflicts');
const btnExportConflicts = document.getElementById('btn-export-conflicts');
const conflictList = document.getElementById('conflict-list');

let conflictHighlights = L.layerGroup().addTo(map);

if (btnAnalyzeConflicts) {
    btnAnalyzeConflicts.addEventListener('click', async () => {
        const originalBtnText = btnAnalyzeConflicts.innerText;
        btnAnalyzeConflicts.innerText = "⏳ Analyzing...";
        btnAnalyzeConflicts.disabled = true;

        try {
            if (typeof lotData === 'undefined') {
                await loadScript('data/lot_east_kowloon.js');
            }
            if (typeof glaData === 'undefined') {
                await loadScript('data/gla_east_kowloon.js');
            }
        } catch (e) {
            console.error("Failed to load reference data", e);
            alert("Failed to load reference data for analysis.");
            btnAnalyzeConflicts.innerText = originalBtnText;
            btnAnalyzeConflicts.disabled = false;
            return;
        }

        const currentRoutePts = projectState.routes[projectState.activeRouteId];
        if (!currentRoutePts || currentRoutePts.length < 2) {
            conflictList.innerHTML = '<tr><td colspan="2" style="text-align:center; color: var(--text-muted);">Please draw a route with at least 2 points first.</td></tr>';
            btnAnalyzeConflicts.innerText = originalBtnText;
            btnAnalyzeConflicts.disabled = false;
            return;
        }

        // Convert route to Turf LineString
        const lineCoords = currentRoutePts.map(pt => [pt.lng, pt.lat]);
        const routeLine = turf.lineString(lineCoords);

        const conflicts = [];

        // Check Lots
        if (typeof lotData !== 'undefined' && lotData.features) {
            lotData.features.forEach((feature) => {
                if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
                    if (turf.booleanIntersects(routeLine, feature)) {
                        let name = feature.properties.ENGLotDescription ? feature.properties.ENGLotDescription.replace(/\r?\n|\r/g, " ") : (feature.properties.LotCSUID ? "Lot: " + feature.properties.LotCSUID.trim() : "Unknown Lot");
                        conflicts.push({ type: 'Lot', name: name, feature: feature });
                    }
                }
            });
        }

        // Check GLAs
        if (typeof glaData !== 'undefined' && glaData.features) {
            glaData.features.forEach((feature) => {
                if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
                    if (turf.booleanIntersects(routeLine, feature)) {
                        let name = feature.properties.GLADisplayName ? feature.properties.GLADisplayName.trim() : (feature.properties.GLAID ? "GLA: " + feature.properties.GLAID : "Unknown GLA");
                        conflicts.push({ type: 'GLA', name: name, feature: feature });
                    }
                }
            });
        }

        // Check STTs
        if (typeof sttData !== 'undefined' && sttData.features) {
            sttData.features.forEach((feature) => {
                if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
                    if (turf.booleanIntersects(routeLine, feature)) {
                        let name = feature.properties.STTNo ? "STT: " + feature.properties.STTNo.trim() : "Unknown STT";
                        conflicts.push({ type: 'STT', name: name, feature: feature });
                    }
                }
            });
        }

        // Check OZP Zones
        if (typeof ozpZoneData !== 'undefined' && ozpZoneData.features) {
            ozpZoneData.features.forEach((feature) => {
                if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
                    if (turf.booleanIntersects(routeLine, feature)) {
                        let zoneCode = feature.properties.ZONE_LABEL || 'OZP';
                        let desc = feature.properties.DESC_ENG || '';
                        let name = `OZP Zone [${zoneCode}] ${desc}`.trim();
                        conflicts.push({ type: 'OZP', name: name, feature: feature });
                    }
                }
            });
        }

        // Render table
        conflictList.innerHTML = '';
        conflictHighlights.clearLayers();

        if (conflicts.length === 0) {
            conflictList.innerHTML = '<tr><td colspan="2" style="text-align:center; color: var(--text-muted);">No conflicts found for this route. 🎉</td></tr>';
            if (btnExportConflicts) btnExportConflicts.style.display = 'none';
        } else {
            if (btnExportConflicts) btnExportConflicts.style.display = 'block';
            // Open the panel if closed
            const panel = document.querySelector('.settings-panel:has(#conflict-table)');
            if (panel) panel.open = true;

            conflicts.forEach((c, idx) => {
                const tr = document.createElement('tr');
                tr.className = 'conflict-row';
                tr.id = `conflict-row-${idx}`;
                
                const tdType = document.createElement('td');
                tdType.innerText = c.type;
                tdType.style.fontWeight = '600';
                if (c.type === 'Lot') tdType.style.color = '#3b82f6';
                else if (c.type === 'GLA') tdType.style.color = '#f59e0b';
                else if (c.type === 'STT') tdType.style.color = '#c19a6b';
                else if (c.type === 'OZP') tdType.style.color = '#ef4444';
                
                const tdName = document.createElement('td');
                tdName.innerText = c.name;
                
                tr.appendChild(tdType);
                tr.appendChild(tdName);
                
                tr.addEventListener('click', () => {
                    // Highlight row
                    document.querySelectorAll('.conflict-row').forEach(r => r.classList.remove('active-conflict'));
                    tr.classList.add('active-conflict');
                    
                    // Highlight polygon on map
                    conflictHighlights.clearLayers();
                    const highlightLayer = L.geoJSON(c.feature, {
                        className: 'active-polygon'
                    }).addTo(conflictHighlights);
                    
                    // Zoom to polygon bounds with some padding
                    map.fitBounds(highlightLayer.getBounds(), { padding: [50, 50], maxZoom: 18 });
                });

                conflictList.appendChild(tr);
            });
        }

        btnAnalyzeConflicts.innerText = originalBtnText;
        btnAnalyzeConflicts.disabled = false;
    });
}

// Export Conflicts Handler
if (btnExportConflicts) {
    btnExportConflicts.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent toggling the details panel
        e.preventDefault();

        const rows = document.querySelectorAll('#conflict-list .conflict-row');
        if (rows.length === 0) {
            alert("No conflicts to export!");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        // CSV Header
        csvContent += "Type,Name\n";

        rows.forEach(row => {
            const type = row.children[0].innerText.replace(/"/g, '""');
            const name = row.children[1].innerText.replace(/"/g, '""');
            csvContent += `"${type}","${name}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Conflicted_Land_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// --- Floating Key Plan Logic ---
const keyplanContainer = document.getElementById('keyplan-container');
const btnToggleKeyplan = document.getElementById('btn-toggle-keyplan');
const btnCloseKeyplan = document.getElementById('btn-close-keyplan');
const keyplanHeader = document.getElementById('keyplan-header');

let keyplanMap = null;
let keyplanRect = null;

function initKeyplan() {
    if (keyplanMap) return;
    
    keyplanMap = L.map('keyplan-map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false
    });
    
    L.tileLayer(BASEMAP_URL, { maxZoom: 20, crossOrigin: true }).addTo(keyplanMap);
    keyplanMap.fitBounds(bounds);
    
    keyplanRect = L.rectangle(map.getBounds(), {
        color: '#ff4444',
        weight: 1,
        fillColor: '#ff8888',
        fillOpacity: 0.4,
        interactive: false
    }).addTo(keyplanMap);
    
    map.on('move', () => {
        if (keyplanContainer.style.display !== 'none' && keyplanRect) {
            keyplanRect.setBounds(map.getBounds());
        }
    });
}

function toggleKeyplan() {
    if (keyplanContainer.style.display === 'none' || keyplanContainer.style.display === '') {
        keyplanContainer.style.display = 'flex';
        initKeyplan();
        setTimeout(() => {
            keyplanMap.invalidateSize();
            keyplanRect.setBounds(map.getBounds());
        }, 50);
    } else {
        keyplanContainer.style.display = 'none';
    }
}

if (btnToggleKeyplan) btnToggleKeyplan.addEventListener('click', toggleKeyplan);
if (btnCloseKeyplan) btnCloseKeyplan.addEventListener('click', () => { keyplanContainer.style.display = 'none'; });

// Make keyplan draggable
let isDraggingKeyplan = false;
let keyplanDragStartX, keyplanDragStartY;
let keyplanInitialLeft, keyplanInitialTop;

if (keyplanHeader) {
    keyplanHeader.addEventListener('mousedown', (e) => {
        isDraggingKeyplan = true;
        keyplanDragStartX = e.clientX;
        keyplanDragStartY = e.clientY;
        
        const rect = keyplanContainer.getBoundingClientRect();
        keyplanInitialLeft = rect.left;
        keyplanInitialTop = rect.top;
        
        keyplanContainer.style.right = 'auto';
        keyplanContainer.style.left = keyplanInitialLeft + 'px';
        keyplanContainer.style.top = keyplanInitialTop + 'px';
        keyplanContainer.style.bottom = 'auto';
        
        keyplanHeader.style.cursor = 'grabbing';
    });
}

document.addEventListener('mousemove', (e) => {
    if (!isDraggingKeyplan) return;
    const dx = e.clientX - keyplanDragStartX;
    const dy = e.clientY - keyplanDragStartY;
    
    keyplanContainer.style.left = (keyplanInitialLeft + dx) + 'px';
    keyplanContainer.style.top = (keyplanInitialTop + dy) + 'px';
});

document.addEventListener('mouseup', () => {
    if (isDraggingKeyplan) {
        isDraggingKeyplan = false;
        if (keyplanHeader) keyplanHeader.style.cursor = 'grab';
    }
});

// ==========================================
// MOBILE RESPONSIVE DRAWER & TOUCH CONTROLS
// ==========================================
const btnMobileToggle = document.getElementById('btn-mobile-sidebar-toggle');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (sidebarBackdrop) {
        sidebarBackdrop.style.display = 'block';
        setTimeout(() => sidebarBackdrop.classList.add('active'), 10);
    }
}

function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (sidebarBackdrop) {
        sidebarBackdrop.classList.remove('active');
        setTimeout(() => { sidebarBackdrop.style.display = 'none'; }, 320);
    }
}

if (btnMobileToggle) btnMobileToggle.addEventListener('click', openMobileSidebar);
if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

// Close mobile sidebar on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('mobile-open')) {
        closeMobileSidebar();
    }
});

// ==========================================
// SMARTPHONE GPS "MY LOCATION" TRACKING
// ==========================================
const btnLocateMe = document.getElementById('btn-locate-me');
let userLocationMarker = null;
let userLocationCircle = null;

if (btnLocateMe) {
    btnLocateMe.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        showLoadingToast("Locating your position...");
        
        map.locate({
            setView: true,
            maxZoom: 18,
            enableHighAccuracy: true
        });
    });
}

map.on('locationfound', (e) => {
    hideLoadingToast();
    const radius = e.accuracy ? Math.round(e.accuracy / 2) : 10;

    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    if (userLocationCircle) {
        map.removeLayer(userLocationCircle);
    }

    const customGpsIcon = L.divIcon({
        className: 'gps-user-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    userLocationMarker = L.marker(e.latlng, { icon: customGpsIcon }).addTo(map)
        .bindPopup(`<b>You are here</b><br>Accuracy: ~${radius}m`).openPopup();

    userLocationCircle = L.circle(e.latlng, {
        radius: radius,
        color: '#2563eb',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.15
    }).addTo(map);
});

map.on('locationerror', (e) => {
    hideLoadingToast();
    console.warn("Location error:", e.message);
    alert("Could not access your GPS location. Please check browser location permissions.");
});

