let suppliesChartInstance;
let shelterChartInstance;

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "dashboard.html") loadDashboardPage();
  if (page === "supplies.html") loadSuppliesPage();
  if (page === "shelters.html") loadSheltersPage();
  if (page === "deliveries.html") loadDeliveriesPage();
  if (page === "map.html") loadMapPage();
  if (page === "admin.html") loadAdminPage();
});

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }

  return response.json();
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function showMessage(id, message, tone = "success") {
  const element = document.getElementById(id);
  if (element) element.innerHTML = `<div class="alert alert-${tone}">${escapeHtml(message)}</div>`;
}

function clearMessage(id) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function badgeClass(status) {
  const map = {
    Available: "bg-success",
    "Low Stock": "bg-warning text-dark",
    "In Transit": "bg-primary",
    Delivered: "bg-success",
    Completed: "bg-success",
    Scheduled: "bg-primary",
    Delayed: "bg-warning text-dark",
    Accepting: "bg-success",
    "Limited Space": "bg-warning text-dark",
    Full: "bg-dark",
    Success: "bg-success",
    Info: "bg-primary",
    "Emergency Available": "bg-dark",
    "Food & Water": "bg-primary",
  };
  return map[status] || "bg-secondary";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadDashboardPage() {
  try {
    clearMessage("dashboardMessage");
    const data = await apiRequest("/api/dashboard");
    setText("totalSuppliesValue", formatNumber(data.summary.totalSupplies));
    setText("activeSheltersValue", formatNumber(data.summary.activeShelters));
    setText("deliveriesTodayValue", formatNumber(data.summary.deliveriesToday));
    setText("deliveriesCompletedText", `Completed ${formatNumber(data.summary.completedDeliveries)}`);
    setText("alertsValue", formatNumber(data.summary.activeAlerts));
    renderDashboardActivity(data.recentActivity);
    renderSuppliesChart(data.summary.categoryTotals);
    renderShelterChart(data.shelters);
  } catch (error) {
    showMessage("dashboardMessage", error.message, "danger");
  }
}

function renderDashboardActivity(items) {
  const container = document.getElementById("dashboardActivityBody");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(formatTimestamp(item.timestamp))}</td>
          <td>${escapeHtml(item.action)}${item.resource ? ` - ${escapeHtml(item.resource)}` : ""}</td>
          <td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderSuppliesChart(categoryTotals) {
  const canvas = document.getElementById("suppliesChart");
  if (!canvas || typeof Chart === "undefined") return;

  suppliesChartInstance?.destroy();
  const labels = ["Food", "Water", "Clothing", "Medicine", "Other"];
  const values = labels.map((label) => categoryTotals[label] || 0);

  suppliesChartInstance = new Chart(canvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#213547", "#b6794f", "#d9c8b3", "#213547", "#8f9aa3"],
          borderColor: "#fcfaf6",
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function renderShelterChart(shelters) {
  const canvas = document.getElementById("shelterChart");
  if (!canvas || typeof Chart === "undefined") return;

  shelterChartInstance?.destroy();
  shelterChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: shelters.map((item) => item.name.replace("Shelter ", "S ")),
      datasets: [
        {
          data: shelters.map((item) => item.occupied),
          backgroundColor: shelters.map((item) => {
            if (item.status === "Full") return "#213547";
            if (item.status === "Limited Space") return "#d9c8b3";
            return "#b6794f";
          }),
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

async function loadSuppliesPage() {
  try {
    clearMessage("suppliesMessage");
    const supplies = await apiRequest("/api/supplies");
    renderSuppliesPage(supplies);
    bindAddSupplyForm();
  } catch (error) {
    showMessage("suppliesMessage", error.message, "danger");
  }
}

function renderSuppliesPage(supplies) {
  const totals = supplies.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.quantity || 0);
    return accumulator;
  }, {});

  setText("foodWaterUnits", formatNumber((totals.Food || 0) + (totals.Water || 0)));
  setText("clothingUnits", formatNumber(totals.Clothing || 0));
  setText("medicineUnits", formatNumber(totals.Medicine || 0));

  const body = document.getElementById("suppliesTableBody");
  if (!body) return;

  body.innerHTML = supplies
    .map(
      (item) => `
        <tr>
          <td>#${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.type)}</td>
          <td>${escapeHtml(item.category)}</td>
          <td>${formatNumber(item.quantity)}</td>
          <td>${escapeHtml(item.location)}</td>
          <td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
          <td><span class="table-note">Live</span></td>
        </tr>
      `
    )
    .join("");
}

function bindAddSupplyForm() {
  const form = document.getElementById("addSupplyForm");
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage("supplyFormMessage");

    try {
      await apiRequest("/api/supplies", {
        method: "POST",
        body: JSON.stringify({
          type: form.type.value,
          category: form.category.value,
          quantity: Number(form.quantity.value),
          location: form.location.value,
          status: form.status.value,
        }),
      });

      form.reset();
      closeModal("addSupplyModal");
      showMessage("suppliesMessage", "Supply added successfully.");
      loadSuppliesPage();
    } catch (error) {
      showMessage("supplyFormMessage", error.message, "danger");
    }
  });
}

async function loadSheltersPage() {
  try {
    clearMessage("sheltersMessage");
    const shelters = await apiRequest("/api/shelters");
    const totalCapacity = shelters.reduce((sum, item) => sum + Number(item.capacity || 0), 0);
    const occupied = shelters.reduce((sum, item) => sum + Number(item.occupied || 0), 0);

    setText("totalSheltersCount", formatNumber(shelters.length));
    setText("totalCapacityCount", formatNumber(totalCapacity));
    setText("currentOccupancyCount", formatNumber(occupied));
    setText("occupancyRateText", `${totalCapacity ? Math.round((occupied / totalCapacity) * 100) : 0}% occupied`);
    setText("availableBedsCount", formatNumber(Math.max(totalCapacity - occupied, 0)));

    const grid = document.getElementById("sheltersGrid");
    if (!grid) return;

    grid.innerHTML = shelters
      .map((item) => {
        const percent = item.capacity ? Math.round((item.occupied / item.capacity) * 100) : 0;
        return `
          <div class="col-md-6 col-lg-4">
            <article class="card shelter-card h-100">
              <div class="card-body">
                <p class="eyebrow">${escapeHtml(item.locationType)}</p>
                <h3 class="section-card-title">${escapeHtml(item.name)}</h3>
                <p class="muted-copy">${escapeHtml(item.address)}</p>
                <div class="progress stat-progress mb-3">
                  <div class="progress-bar" role="progressbar" style="width: ${percent}%">${percent}%</div>
                </div>
                <p><strong>Capacity:</strong> ${formatNumber(item.capacity)}</p>
                <p><strong>Occupied:</strong> ${formatNumber(item.occupied)}</p>
                <p><strong>Contact:</strong> ${escapeHtml(item.contact)}</p>
                <p><strong>Status:</strong> <span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></p>
              </div>
            </article>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    showMessage("sheltersMessage", error.message, "danger");
  }
}

async function loadDeliveriesPage() {
  try {
    clearMessage("deliveriesMessage");
    const deliveries = await apiRequest("/api/deliveries");
    const completed = deliveries.filter((item) => ["Delivered", "Completed"].includes(item.status));
    const transit = deliveries.filter((item) => item.status === "In Transit");
    const delayed = deliveries.filter((item) => item.status === "Delayed");

    setText("deliveriesScheduledCount", formatNumber(deliveries.length));
    setText("deliveriesCompletedCount", formatNumber(completed.length));
    setText("deliveriesTransitCount", formatNumber(transit.length));
    setText("deliveriesDelayedCount", formatNumber(delayed.length));

    renderDeliveryRows("activeDeliveriesBody", transit, false);
    renderDeliveryRows("completedDeliveriesBody", [...completed, ...delayed], true);
    bindDeliveryForm();
  } catch (error) {
    showMessage("deliveriesMessage", error.message, "danger");
  }
}

function renderDeliveryRows(targetId, items, completedView) {
  const body = document.getElementById(targetId);
  if (!body) return;

  body.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>#${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.driver)}</td>
          <td>${escapeHtml(item.destination)}</td>
          <td>${escapeHtml(item.cargoType)} (${formatNumber(item.quantity)} units)</td>
          <td>${escapeHtml(completedView ? item.deliveredAt || item.eta : item.eta)}</td>
          <td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
          ${completedView ? "" : "<td><span class='table-note'>Tracking on</span></td>"}
        </tr>
      `
    )
    .join("");
}

function bindDeliveryForm() {
  const form = document.getElementById("scheduleDeliveryForm");
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage("deliveryFormMessage");

    const etaValue = form.eta.value ? new Date(form.eta.value).toLocaleString("en-IN") : "Pending";

    try {
      await apiRequest("/api/deliveries", {
        method: "POST",
        body: JSON.stringify({
          pickup: form.pickup.value,
          destination: form.destination.value,
          driver: form.driver.value,
          contact: form.contact.value,
          cargoType: form.cargoType.value,
          quantity: Number(form.quantity.value),
          eta: etaValue,
          status: "Scheduled",
        }),
      });

      form.reset();
      closeModal("scheduleDeliveryModal");
      showMessage("deliveriesMessage", "Delivery scheduled successfully.");
      loadDeliveriesPage();
    } catch (error) {
      showMessage("deliveryFormMessage", error.message, "danger");
    }
  });
}

async function loadMapPage() {
  try {
    clearMessage("mapMessage");
    const data = await apiRequest("/api/map");
    renderNearbyLocations(data.locations);
    renderMap(data);
  } catch (error) {
    showMessage("mapMessage", error.message, "danger");
  }
}

function renderNearbyLocations(items) {
  const list = document.getElementById("nearbyLocationsList");
  if (!list) return;

  list.innerHTML = items
    .sort((left, right) => Number(left.distanceKm || 99) - Number(right.distanceKm || 99))
    .slice(0, 5)
    .map(
      (item) => `
        <div class="list-group-item">
          <strong>${escapeHtml(item.name)}</strong><br>
          <small class="text-muted">${escapeHtml(item.address || "Response point")} - ${escapeHtml(
            item.distanceKm ? `${item.distanceKm} km` : "Pending"
          )}</small><br>
          <span class="badge ${badgeClass(item.status || item.type)}">${escapeHtml(item.status || item.type)}</span>
        </div>
      `
    )
    .join("");
}

function renderMap(data) {
  const mapRoot = document.getElementById("map");
  if (!mapRoot || typeof L === "undefined" || mapRoot.dataset.initialized === "true") return;

  mapRoot.dataset.initialized = "true";
  const map = L.map("map").setView([data.center.lat, data.center.lng], data.center.zoom || 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  data.locations.forEach((item) => {
    const popup = `
      <div>
        <strong>${escapeHtml(item.name)}</strong><br>
        <span>${escapeHtml(item.address || "Operational location")}</span><br>
        <span>Status: ${escapeHtml(item.status || item.type)}</span>
      </div>
    `;

    L.marker([item.lat, item.lng]).addTo(map).bindPopup(popup);
  });
}

async function loadAdminPage() {
  try {
    clearMessage("adminMessage");
    const data = await apiRequest("/api/admin");
    renderAdminSummary(data.summary);
    renderAdminLogs(data.activity);
    populateSupplySelect(data.supplies);
    populateLocationSelect(data.supplies);
    bindInventoryForm();
    bindShelterForm();
  } catch (error) {
    showMessage("adminMessage", error.message, "danger");
  }
}

function renderAdminSummary(summary) {
  setText("adminTotalUsers", formatNumber(summary.users));
  setText("adminShelterSummary", `${formatNumber(summary.activeShelters)} / ${formatNumber(summary.shelterLimit)}`);
  setText("adminSupplyCapacity", `${formatNumber(summary.totalSupplies)} units`);
  setText("adminSystemHealth", summary.systemHealth);

  const shelterProgress = document.getElementById("adminShelterProgressBar");
  const supplyProgress = document.getElementById("adminSupplyProgressBar");
  const healthProgress = document.getElementById("adminHealthProgressBar");

  if (shelterProgress) shelterProgress.style.width = `${Math.round((summary.activeShelters / summary.shelterLimit) * 100)}%`;
  if (supplyProgress) supplyProgress.style.width = `${Math.min(summary.supplyCapacity, 100)}%`;
  if (healthProgress) healthProgress.style.width = "95%";
}

function renderAdminLogs(items) {
  const body = document.getElementById("adminLogsBody");
  if (!body) return;

  body.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(formatTimestamp(item.timestamp))}</td>
          <td>${escapeHtml(item.user)}</td>
          <td>${escapeHtml(item.action)}</td>
          <td>${escapeHtml(item.resource)}</td>
          <td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
        </tr>
      `
    )
    .join("");
}

function populateSupplySelect(items) {
  const select = document.getElementById("inventorySupplySelect");
  if (!select) return;

  select.innerHTML = items
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.type)}</option>`)
    .join("");
}

function populateLocationSelect(items) {
  const select = document.getElementById("inventoryLocationSelect");
  if (!select) return;

  const locations = [...new Set(items.map((item) => item.location))];
  select.innerHTML = locations
    .map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`)
    .join("");
}

function bindInventoryForm() {
  const form = document.getElementById("inventoryUpdateForm");
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await apiRequest(`/api/supplies/${form.supplyId.value}`, {
        method: "PUT",
        body: JSON.stringify({
          quantity: Number(form.quantity.value),
          location: form.location.value,
        }),
      });

      showMessage("adminMessage", "Inventory updated successfully.");
      loadAdminPage();
    } catch (error) {
      showMessage("adminMessage", error.message, "danger");
    }
  });
}

function bindShelterForm() {
  const form = document.getElementById("addShelterForm");
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage("shelterFormMessage");

    const facilities = Array.from(form.querySelectorAll('input[name="facilities"]:checked')).map(
      (input) => input.value
    );

    try {
      await apiRequest("/api/shelters", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.value,
          locationType: form.locationType.value,
          address: form.address.value,
          capacity: Number(form.capacity.value),
          contact: form.contact.value,
          facilities,
          lat: form.lat.value ? Number(form.lat.value) : undefined,
          lng: form.lng.value ? Number(form.lng.value) : undefined,
          status: "Accepting",
          occupied: 0,
        }),
      });

      form.reset();
      closeModal("addShelterModal");
      showMessage("adminMessage", "Shelter added successfully.");
      loadAdminPage();
    } catch (error) {
      showMessage("shelterFormMessage", error.message, "danger");
    }
  });
}

function closeModal(id) {
  if (!window.bootstrap) return;
  const element = document.getElementById(id);
  const instance = element ? window.bootstrap.Modal.getInstance(element) : null;
  instance?.hide();
}
