let map, homeMarker = null;
let tempMarker = null;
let foodMarkers = [];
let clusterGroup;
let currentRoute = null;

// -----------------------------------------
// INIT – Run when the page loads
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initUI();
});

// -----------------------------------------
// MAP SETUP
// -----------------------------------------
function initMap() {
    // Initialize Leaflet map
    map = L.map("map", {
        center: [53.3498, -6.2603], // Default center (Dublin)
        zoom: 13
    });

    // OpenStreetMap base tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Marker cluster layer (groups markers together)
    clusterGroup = L.markerClusterGroup();
    map.addLayer(clusterGroup);

    // Add temp marker & auto-fill coordinates when map is clicked
    map.on("click", (e) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        document.getElementById("home-lat").value = lat;
        document.getElementById("home-lng").value = lng;

        showTempMarker(e.latlng);
    });
}

// -----------------------------------------
// TEMPORARY MARKER (shown on map click)
// -----------------------------------------
function showTempMarker(latlng) {
    // Remove previous temp marker
    if (tempMarker) map.removeLayer(tempMarker);

    // Add a small temporary marker at click point
    tempMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: "temp-marker",
            html: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        })
    }).addTo(map);

    // Remove marker after 3 seconds
    setTimeout(() => {
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    }, 3000);
}

// -----------------------------------------
// UI SETUP – Buttons, forms, controls
// -----------------------------------------
function initUI() {
    const sidebar = document.getElementById("sidebar");

    // Sidebar toggle
    document.getElementById("btn-toggle-sidebar")
        .addEventListener("click", () => sidebar.classList.toggle("closed"));

    document.getElementById("btn-close-sidebar")
        .addEventListener("click", () => sidebar.classList.add("closed"));

    // Set home location manually
    document.getElementById("home-location-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const lat = parseFloat(document.getElementById("home-lat").value);
        const lng = parseFloat(document.getElementById("home-lng").value);
        setHome(lat, lng);
    });

    // Use browser geolocation
    document.getElementById("btn-use-my-location").addEventListener("click", () => {
        navigator.geolocation.getCurrentPosition(pos => {
            setHome(pos.coords.latitude, pos.coords.longitude);
        });
    });

    // Search restaurants
    document.getElementById("restaurant-search-form")
        .addEventListener("submit", (e) => {
            e.preventDefault();
            searchRestaurants();
        });

    // Clear all markers / results
    document.getElementById("btn-clear-markers")
        .addEventListener("click", clearMarkers);
}

// -----------------------------------------
// SET HOME LOCATION
// -----------------------------------------
function setHome(lat, lng) {
    // Remove previous home marker
    if (homeMarker) clusterGroup.removeLayer(homeMarker);

    // Add new home marker
    homeMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: "home-marker",
            html: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(clusterGroup);

    map.setView([lat, lng], 14);
}

// -----------------------------------------
// SEARCH RESTAURANTS (simulated data)
// -----------------------------------------
function searchRestaurants() {
    if (!homeMarker) return alert("Set home first!");

    clearFoodMarkers();

    const home = homeMarker.getLatLng();
    const query = document.getElementById("restaurant-search").value.toLowerCase();

    // Simulated restaurant data
    const results = simulateRestaurants(home.lat, home.lng, query);

    // Create markers for each result
    results.forEach(r => {
        const marker = L.marker([r.lat, r.lng], {
            icon: L.divIcon({
                className: "food-marker",
                html: "",
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })
        }).addTo(clusterGroup);

        // Popup with route button
        marker.bindPopup(`
            <b>${r.name}</b><br>${r.type}<br><br>
            <button class="btn btn-primary btn-sm w-100 route-btn">Show Route</button>
        `);

        // Attach route-button inside popup
        marker.on("popupopen", () => {
            const btn = document.querySelector(".route-btn");
            btn.addEventListener("click", () => showRoute(home, r));
        });

        foodMarkers.push(marker);
    });

    renderResults(results);
}

// -----------------------------------------
// SHOW ROUTE (OSRM, no side panel)
// -----------------------------------------
function showRoute(start, dest) {
    // Remove existing route
    if (currentRoute) map.removeControl(currentRoute);

    // Create route using OSRM
    currentRoute = L.Routing.control({
        waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(dest.lat, dest.lng)
        ],
        router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            profile: "car"
        }),
        lineOptions: {
            styles: [{ color: "#0d6efd", weight: 5 }]
        },
        createMarker: () => null, // No endpoint markers
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,      // Hide side panel
        collapsible: false
    }).addTo(map);
}

// -----------------------------------------
// RENDER RESULTS LIST (sidebar)
// -----------------------------------------
function renderResults(results) {
    const container = document.getElementById("results");
    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML = `<div class="text-muted small p-2">No results</div>`;
        return;
    }

    // Create clickable list items
    results.forEach(r => {
        const item = document.createElement("button");
        item.className = "list-group-item list-group-item-action";
        item.textContent = `${r.name} (${r.type})`;

        item.addEventListener("click", () => {
            map.setView([r.lat, r.lng], 16);
        });

        container.appendChild(item);
    });
}

// -----------------------------------------
// CLEAR ALL MARKERS / ROUTES
// -----------------------------------------
function clearMarkers() {
    clearFoodMarkers();

    if (homeMarker) {
        clusterGroup.removeLayer(homeMarker);
        homeMarker = null;
    }

    if (currentRoute) {
        map.removeControl(currentRoute);
        currentRoute = null;
    }

    document.getElementById("results").innerHTML = "";
}

function clearFoodMarkers() {
    foodMarkers.forEach(m => clusterGroup.removeLayer(m));
    foodMarkers = [];
}

// -----------------------------------------
// SIMULATED RESTAURANTS (random positions)
// -----------------------------------------
function simulateRestaurants(lat, lng, query) {
    const names = ["Pizza Roma", "Burger House", "Café Latte", "Sushi Zen", "Taco Loco"];
    const types = ["Italian", "Fast Food", "Café", "Japanese", "Mexican"];

    const results = [];
    for (let i = 0; i < names.length; i++) {
        // Filter by text query
        if (query && !names[i].toLowerCase().includes(query) && !types[i].toLowerCase().includes(query))
            continue;

        // Simulated nearby random coordinates
        results.push({
            name: names[i],
            type: types[i],
            lat: lat + (Math.random() - 0.5) / 200,
            lng: lng + (Math.random() - 0.5) / 200
        });
    }
    return results;
}
