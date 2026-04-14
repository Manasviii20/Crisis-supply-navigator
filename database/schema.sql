CREATE TABLE supplies (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE shelters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  occupied INTEGER NOT NULL DEFAULT 0,
  contact TEXT,
  status TEXT NOT NULL,
  facilities TEXT,
  lat REAL,
  lng REAL
);

CREATE TABLE deliveries (
  id TEXT PRIMARY KEY,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  driver TEXT NOT NULL,
  contact TEXT,
  cargo_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  eta TEXT,
  status TEXT NOT NULL,
  delivered_at TEXT
);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
