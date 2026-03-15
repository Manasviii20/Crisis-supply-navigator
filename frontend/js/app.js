// Crisis Supply Navigator - Main JavaScript

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Crisis Supply Navigator initialized!');
    
    // Initialize charts if on dashboard page
    if (document.getElementById('suppliesChart')) {
        initSuppliesChart();
    }
    if (document.getElementById('shelterChart')) {
        initShelterChart();
    }
    
    // Initialize map if on map page
    if (document.getElementById('map')) {
        initMap();
    }
});

// Chart.js - Supplies Distribution Chart
function initSuppliesChart() {
    const suppliesCtx = document.getElementById('suppliesChart');
    if (!suppliesCtx) return;
    
    new Chart(suppliesCtx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Clothes', 'Medicine', 'Water', 'Other'],
            datasets: [{
                data: [300, 150, 100, 200, 50],
                backgroundColor: [
                    '#007bff',
                    '#28a745',
                    '#dc3545',
                    '#17a2b8',
                    '#ffc107'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    display: true
                }
            }
        }
    });
}

// Chart.js - Shelter Occupancy Chart
function initShelterChart() {
    const shelterCtx = document.getElementById('shelterChart');
    if (!shelterCtx) return;
    
    new Chart(shelterCtx, {
        type: 'bar',
        data: {
            labels: ['Shelter A', 'Shelter B', 'Shelter C', 'Shelter D', 'Shelter E', 'Shelter F'],
            datasets: [{
                label: 'Occupancy',
                data: [80, 120, 40, 195, 350, 105],
                backgroundColor: [
                    '#28a745',
                    '#ffc107',
                    '#007bff',
                    '#dc3545',
                    '#17a2b8',
                    '#6c757d'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 200,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Leaflet Map Initialization
function initMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded!');
        return;
    }
    
    // Default coordinates (example: Chennai, India - you can change this)
    const defaultLat = 12.82;
    const defaultLng = 80.04;
    const defaultZoom = 10;
    
    // Create map
    const map = L.map('map').setView([defaultLat, defaultLng], defaultZoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Sample shelter markers
    const shelters = [
        {
            name: 'Shelter A - Community Center',
            lat: 12.82,
            lng: 80.04,
            capacity: 100,
            occupied: 80,
            status: 'Accepting'
        },
        {
            name: 'Shelter B - School Gymnasium',
            lat: 12.85,
            lng: 80.07,
            capacity: 150,
            occupied: 120,
            status: 'Limited Space'
        },
        {
            name: 'Shelter C - Church Hall',
            lat: 12.79,
            lng: 80.02,
            capacity: 80,
            occupied: 40,
            status: 'Accepting'
        },
        {
            name: 'Hospital B - Medical Center',
            lat: 12.83,
            lng: 80.06,
            capacity: 200,
            occupied: 150,
            status: 'Emergency Available'
        },
        {
            name: 'Supply Center C - Warehouse',
            lat: 12.81,
            lng: 80.03,
            type: 'supply'
        }
    ];
    
    // Add markers to map
    shelters.forEach(shelter => {
        let markerColor = 'green';
        if (shelter.status === 'Full' || shelter.occupied / shelter.capacity > 0.95) {
            markerColor = 'red';
        } else if (shelter.status === 'Limited Space' || shelter.occupied / shelter.capacity > 0.75) {
            markerColor = 'orange';
        }
        
        const popupContent = `
            <div style="min-width: 200px;">
                <h6 style="margin-bottom: 5px;"><strong>${shelter.name}</strong></h6>
                ${shelter.capacity ? `<p>Capacity: ${shelter.capacity} people</p>` : ''}
                ${shelter.occupied ? `<p>Occupied: ${shelter.occupied} people</p>` : ''}
                ${shelter.status ? `<p>Status: <span style="color: ${markerColor}; font-weight: bold;">${shelter.status}</span></p>` : ''}
                ${shelter.type === 'supply' ? '<p>Type: Supply Distribution Center</p>' : ''}
            </div>
        `;
        
        L.marker([shelter.lat, shelter.lng])
            .addTo(map)
            .bindPopup(popupContent)
            .openPopup();
    });
    
    // Add a circle for safe zones
    L.circle([defaultLat, defaultLng], {
        color: 'blue',
        fillColor: '#007bff',
        fillOpacity: 0.1,
        radius: 5000
    }).addTo(map).bindPopup('Safe Zone Area');
    
    console.log('Map initialized successfully!');
}

// Utility Functions
function formatNumber(num) {
    return num.toLocaleString();
}

function getStatusBadge(status) {
    const badges = {
        'Available': 'bg-success',
        'Low Stock': 'bg-warning',
        'In Transit': 'bg-info',
        'Completed': 'bg-success',
        'In Progress': 'bg-warning',
        'Active': 'bg-info',
        'Full': 'bg-danger',
        'Accepting': 'bg-success',
        'Limited Space': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
}

// Fetch API wrapper (for future backend integration)
async function fetchData(endpoint) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Example: Load supplies from API (when backend is ready)
async function loadSupplies() {
    const supplies = await fetchData('supplies');
    if (supplies) {
        console.log('Loaded supplies:', supplies);
        // Update UI with supplies data
    }
}

// Example: Load shelters from API (when backend is ready)
async function loadShelters() {
    const shelters = await fetchData('shelters');
    if (shelters) {
        console.log('Loaded shelters:', shelters);
        // Update UI with shelters data
    }
}

// Chat functionality (from original script.js)
function sendMessage() {
    const input = document.getElementById("userInput");
    if (!input) return;
    
    const message = input.value.toLowerCase();

    if (message.trim() === "") return;

    addMessage(message, "user");

    let botReply = "";

    if (message.includes("food") || message.includes("hungry") || message.includes("ration")) {
        botReply = "🍚 Food assistance is available. Nearest relief centers are distributing meals.";
    } 
    else if (message.includes("room") || message.includes("shelter") || message.includes("stay")) {
        botReply = "🏠 Temporary shelters are available. Please share your location.";
    } 
    else if (message.includes("medicine") || message.includes("fever") || message.includes("injury")) {
        botReply = "💊 Medical help is on the way. Emergency health camps are active nearby.";
    } 
    else if (message.includes("flood") || message.includes("rain") || message.includes("cyclone")) {
        botReply = "⚠️ Stay safe. Disaster response teams are monitoring the situation.";
    } 
    else {
        botReply = "I'm here to help. Please describe your emergency clearly.";
    }

    setTimeout(() => {
        addMessage(botReply, "bot");
    }, 500);

    input.value = "";
}

function addMessage(text, sender) {
    const chatbox = document.getElementById("chatbox");
    if (!chatbox) return;
    
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.innerText = text;
    chatbox.appendChild(messageDiv);
}

// Export functions for use in other scripts
window.CrisisNavigator = {
    initMap,
    initSuppliesChart,
    initShelterChart,
    fetchData,
    loadSupplies,
    loadShelters,
    sendMessage,
    addMessage
};

console.log('✅ All systems ready! Crisis Supply Navigator is fully operational.');
