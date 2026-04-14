const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8000);
const ROOT_DIR = path.resolve(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const DATA_FILE = path.join(ROOT_DIR, "database", "data.json");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(payload);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function createId(prefix, records) {
  const highest = records.reduce((max, record) => {
    const value = Number(String(record.id || "").replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

function computeSummary(data) {
  const totalSupplies = data.supplies.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const activeShelters = data.shelters.filter((item) => item.status !== "Closed").length;
  const totalCapacity = data.shelters.reduce((sum, item) => sum + Number(item.capacity || 0), 0);
  const totalOccupied = data.shelters.reduce((sum, item) => sum + Number(item.occupied || 0), 0);
  const completedDeliveries = data.deliveries.filter((item) =>
    ["Delivered", "Completed"].includes(item.status)
  ).length;
  const inTransitDeliveries = data.deliveries.filter((item) => item.status === "In Transit").length;
  const delayedDeliveries = data.deliveries.filter((item) => item.status === "Delayed").length;
  const activeAlerts = data.alerts.filter((item) => item.active).length;
  const categoryTotals = data.supplies.reduce((totals, item) => {
    totals[item.category] = (totals[item.category] || 0) + Number(item.quantity || 0);
    return totals;
  }, {});

  return {
    totalSupplies,
    activeShelters,
    totalCapacity,
    totalOccupied,
    availableBeds: Math.max(totalCapacity - totalOccupied, 0),
    occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    deliveriesToday: data.deliveries.length,
    completedDeliveries,
    inTransitDeliveries,
    delayedDeliveries,
    activeAlerts,
    categoryTotals,
    users: data.meta.users,
    shelterLimit: data.meta.shelterLimit,
    systemHealth: data.meta.systemHealth,
    supplyCapacity: totalCapacity ? Math.round((totalSupplies / totalCapacity) * 100) : 0,
  };
}

function addActivity(data, entry) {
  data.activity.unshift({
    id: createId("ACT", data.activity),
    timestamp: new Date().toISOString(),
    ...entry,
  });
  data.activity = data.activity.slice(0, 20);
}

function validateRequired(fields) {
  return fields.every((field) => typeof field === "string" && field.trim());
}

async function handleApi(request, response, pathname) {
  const method = request.method || "GET";
  const data = readData();

  if (method === "GET" && pathname === "/api/summary") {
    sendJson(response, 200, computeSummary(data));
    return true;
  }

  if (method === "GET" && pathname === "/api/dashboard") {
    sendJson(response, 200, {
      summary: computeSummary(data),
      recentActivity: data.activity.slice(0, 8),
      supplies: data.supplies,
      shelters: data.shelters,
    });
    return true;
  }

  if (method === "GET" && pathname === "/api/supplies") {
    sendJson(response, 200, data.supplies);
    return true;
  }

  if (method === "POST" && pathname === "/api/supplies") {
    const payload = await readJsonBody(request);

    if (!validateRequired([payload.type, payload.location]) || Number(payload.quantity) <= 0) {
      sendJson(response, 400, { error: "Type, quantity, and location are required." });
      return true;
    }

    const supply = {
      id: createId("S", data.supplies),
      type: payload.type.trim(),
      category: String(payload.category || "Other").trim(),
      quantity: Number(payload.quantity),
      location: payload.location.trim(),
      status: String(payload.status || "Available").trim(),
    };

    data.supplies.unshift(supply);
    addActivity(data, {
      user: "Admin",
      action: "Added supply inventory",
      resource: supply.type,
      status: "Success",
    });
    writeData(data);
    sendJson(response, 201, supply);
    return true;
  }

  if (method === "PUT" && pathname.startsWith("/api/supplies/")) {
    const supplyId = pathname.split("/").pop();
    const payload = await readJsonBody(request);
    const supply = data.supplies.find((item) => item.id === supplyId);

    if (!supply) {
      sendJson(response, 404, { error: "Supply not found." });
      return true;
    }

    if (payload.quantity !== undefined) {
      const quantity = Number(payload.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        sendJson(response, 400, { error: "Quantity must be a non-negative number." });
        return true;
      }
      supply.quantity = quantity;
    }

    if (typeof payload.location === "string" && payload.location.trim()) {
      supply.location = payload.location.trim();
    }

    if (typeof payload.status === "string" && payload.status.trim()) {
      supply.status = payload.status.trim();
    }

    addActivity(data, {
      user: "Admin",
      action: "Updated supply inventory",
      resource: supply.type,
      status: "Success",
    });
    writeData(data);
    sendJson(response, 200, supply);
    return true;
  }

  if (method === "GET" && pathname === "/api/shelters") {
    sendJson(response, 200, data.shelters);
    return true;
  }

  if (method === "POST" && pathname === "/api/shelters") {
    const payload = await readJsonBody(request);

    if (!validateRequired([payload.name, payload.address]) || Number(payload.capacity) <= 0) {
      sendJson(response, 400, { error: "Name, address, and capacity are required." });
      return true;
    }

    const shelter = {
      id: createId("SH", data.shelters),
      name: payload.name.trim(),
      locationType: String(payload.locationType || "Other").trim(),
      address: payload.address.trim(),
      capacity: Number(payload.capacity),
      occupied: Number(payload.occupied || 0),
      contact: String(payload.contact || "Not provided").trim(),
      status: String(payload.status || "Accepting").trim(),
      facilities: Array.isArray(payload.facilities) ? payload.facilities : [],
      lat: Number(payload.lat ?? data.meta.mapCenter.lat),
      lng: Number(payload.lng ?? data.meta.mapCenter.lng),
      distanceKm: Number(payload.distanceKm || 0),
    };

    data.shelters.unshift(shelter);
    addActivity(data, {
      user: "Coordinator",
      action: "Added new shelter",
      resource: shelter.name,
      status: "Success",
    });
    writeData(data);
    sendJson(response, 201, shelter);
    return true;
  }

  if (method === "GET" && pathname === "/api/deliveries") {
    sendJson(response, 200, data.deliveries);
    return true;
  }

  if (method === "POST" && pathname === "/api/deliveries") {
    const payload = await readJsonBody(request);

    if (
      !validateRequired([payload.pickup, payload.destination, payload.driver]) ||
      Number(payload.quantity) <= 0
    ) {
      sendJson(response, 400, { error: "Pickup, destination, driver, and quantity are required." });
      return true;
    }

    const delivery = {
      id: createId("TRK", data.deliveries),
      pickup: payload.pickup.trim(),
      destination: payload.destination.trim(),
      driver: payload.driver.trim(),
      contact: String(payload.contact || "N/A").trim(),
      cargoType: String(payload.cargoType || "Mixed Supplies").trim(),
      quantity: Number(payload.quantity),
      eta: String(payload.eta || "Pending").trim(),
      status: String(payload.status || "Scheduled").trim(),
      deliveredAt: payload.deliveredAt || null,
    };

    data.deliveries.unshift(delivery);
    addActivity(data, {
      user: "Volunteer",
      action: "Scheduled delivery",
      resource: delivery.id,
      status: "Success",
    });
    writeData(data);
    sendJson(response, 201, delivery);
    return true;
  }

  if (method === "GET" && pathname === "/api/map") {
    const shelterLocations = data.shelters.map((item) => ({
      id: item.id,
      name: item.name,
      type: "Shelter",
      lat: item.lat,
      lng: item.lng,
      status: item.status,
      capacity: item.capacity,
      occupied: item.occupied,
      address: item.address,
      distanceKm: item.distanceKm,
    }));

    sendJson(response, 200, {
      center: data.meta.mapCenter,
      locations: [...shelterLocations, ...data.mapLocations],
    });
    return true;
  }

  if (method === "GET" && pathname === "/api/admin") {
    sendJson(response, 200, {
      summary: computeSummary(data),
      activity: data.activity,
      supplies: data.supplies,
      shelters: data.shelters,
      alerts: data.alerts,
    });
    return true;
  }

  return false;
}

function serveStatic(response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(FRONTEND_DIR, requestedPath);
  const normalizedPath = path.normalize(filePath);

  if (!normalizedPath.startsWith(FRONTEND_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.readFile(normalizedPath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendText(response, 404, "Not Found");
        return;
      }

      sendText(response, 500, "Internal Server Error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[path.extname(normalizedPath).toLowerCase()] || "application/octet-stream",
    });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  try {
    const handled = await handleApi(request, response, url.pathname);
    if (handled) {
      return;
    }

    serveStatic(response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Internal Server Error" });
  }
});

// Start server when running directly (not in serverless)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Crisis Supply Navigator running at http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = server;
