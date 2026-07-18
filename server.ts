import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database('/tmp/transport.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    route_name TEXT,
    current_lat REAL,
    current_lng REAL,
    occupancy TEXT, -- 'low', 'medium', 'high'
    current_occupancy INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 50,
    fare REAL DEFAULT 14.0,
    eta INTEGER DEFAULT 5,
    district TEXT DEFAULT 'Tiruppur',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id TEXT,
    type TEXT,
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT,
    stops TEXT -- JSON string of stops
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    bus_id TEXT,
    bus_name TEXT,
    from_stop TEXT,
    to_stop TEXT,
    seats INTEGER,
    fare REAL,
    date TEXT,
    status TEXT DEFAULT 'Booked', -- 'Booked', 'Onboard', 'Expired'
    qr_payload TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    bus_id TEXT,
    user_id TEXT,
    from_stop TEXT,
    to_stop TEXT,
    seats INTEGER,
    amount REAL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Failed'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS seat_segments (
    bus_id TEXT,
    from_stop TEXT,
    to_stop TEXT,
    occupied_seats INTEGER DEFAULT 0,
    PRIMARY KEY (bus_id, from_stop, to_stop)
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    bus_name TEXT,
    start_time TEXT,
    end_time TEXT,
    stops TEXT -- JSON string
  );
`);

// Seed data if empty
const busCount = db.prepare('SELECT COUNT(*) as count FROM buses').get() as { count: number };
if (busCount.count === 0) {
  const insertBus = db.prepare('INSERT INTO buses (id, route_name, current_lat, current_lng, occupancy, current_occupancy, capacity, fare, eta, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertBus.run('32', '32', 11.1085, 77.3411, 'medium', 18, 50, 14.0, 5, 'Tiruppur');
  insertBus.run('40C', '40C', 11.1100, 77.3500, 'low', 0, 50, 14.0, 7, 'Chennai');
  insertBus.run('101', '101', 11.1000, 77.3300, 'low', 0, 50, 14.0, 10, 'Coimbatore');
  insertBus.run('M1', 'M1', 9.9252, 78.1198, 'high', 45, 50, 20.0, 3, 'Madurai');
  insertBus.run('S1', 'S1', 10.7905, 78.7047, 'medium', 25, 50, 15.0, 8, 'Tiruchirappalli');

  const insertRoute = db.prepare('INSERT INTO routes (id, name, stops) VALUES (?, ?, ?)');
  insertRoute.run('R1', '32', JSON.stringify([
    { name: 'tiruppur old bus stand', lat: 11.1085, lng: 77.3411, district: 'Tiruppur' },
    { name: 'tiruppur railway station', lat: 11.1120, lng: 77.3450, district: 'Tiruppur' },
    { name: 'puspha theatre', lat: 11.1150, lng: 77.3500, district: 'Tiruppur' },
    { name: 'kumar nagar', lat: 11.1200, lng: 77.3550, district: 'Tiruppur' },
    { name: 'gandhi nagar', lat: 11.1250, lng: 77.3600, district: 'Tiruppur' },
    { name: 'anupparpalayam', lat: 11.1300, lng: 77.3650, district: 'Tiruppur' },
    { name: 'ammapalayam', lat: 11.1350, lng: 77.3700, district: 'Tiruppur' },
    { name: 'poondi', lat: 11.1400, lng: 77.3750, district: 'Tiruppur' },
    { name: 'anaiputhur', lat: 11.1450, lng: 77.3800, district: 'Tiruppur' },
    { name: 'avinashi', lat: 11.1500, lng: 77.3850, district: 'Tiruppur' }
  ]));

  const insertTrip = db.prepare('INSERT INTO trips (id, bus_name, start_time, end_time, stops) VALUES (?, ?, ?, ?, ?)');
  insertTrip.run('T1', '32', '2026-03-20 08:00:00', '2026-03-20 09:00:00', JSON.stringify(['tiruppur old bus stand', 'tiruppur railway station', 'puspha theatre']));

  // Seed seat segments for all routes and buses
  const allBuses = db.prepare('SELECT id, route_name FROM buses').all() as any[];
  const allRoutes = db.prepare('SELECT name, stops FROM routes').all() as any[];
  
  allBuses.forEach(bus => {
    const route = allRoutes.find(r => r.name === bus.route_name);
    if (route) {
      const stops = JSON.parse(route.stops);
      for (let i = 0; i < stops.length - 1; i++) {
        db.prepare('INSERT OR IGNORE INTO seat_segments (bus_id, from_stop, to_stop, occupied_seats) VALUES (?, ?, ?, ?)')
          .run(bus.id, stops[i].name, stops[i+1].name, Math.floor(Math.random() * 20));
      }
    }
  });
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // API Routes
  app.get('/api/stops', (req, res) => {
    const routes = db.prepare('SELECT stops FROM routes').all() as any[];
    const allStops = new Set<string>();
    routes.forEach(r => {
      const stops = JSON.parse(r.stops);
      stops.forEach((s: any) => allStops.add(s.name));
    });
    res.json(Array.from(allStops).sort());
  });

  app.get('/api/search-buses', (req, res) => {
    const { source, destination, time } = req.query;
    const buses = db.prepare('SELECT * FROM buses').all() as any[];
    const routes = db.prepare('SELECT * FROM routes').all() as any[];
    
    const results = buses.filter(bus => {
      const route = routes.find(r => r.name === bus.route_name);
      if (!route) return false;
      const stops = JSON.parse(route.stops);
      const sourceIdx = stops.findIndex((s: any) => s.name === source);
      const destIdx = stops.findIndex((s: any) => s.name === destination);
      return sourceIdx !== -1 && destIdx !== -1 && sourceIdx < destIdx;
    }).map(bus => {
      // Calculate availability
      const route = routes.find(r => r.name === bus.route_name);
      const stops = JSON.parse(route.stops);
      const sourceIdx = stops.findIndex((s: any) => s.name === source);
      const destIdx = stops.findIndex((s: any) => s.name === destination);
      
      let maxOccupied = 0;
      for (let i = sourceIdx; i < destIdx; i++) {
        const seg = db.prepare('SELECT occupied_seats FROM seat_segments WHERE bus_id = ? AND from_stop = ? AND to_stop = ?')
          .get(bus.id, stops[i].name, stops[i+1].name) as any;
        if (seg && seg.occupied_seats > maxOccupied) {
          maxOccupied = seg.occupied_seats;
        }
      }
      
      return {
        ...bus,
        available_seats: bus.capacity - maxOccupied,
        eta_source: bus.eta, // Simplified
        eta_destination: bus.eta + (destIdx - sourceIdx) * 5 // Simplified
      };
    });

    res.json(results);
  });

  app.post('/api/book', (req, res) => {
    const { bus_id, source_stop_id, destination_stop_id, num_seats, user_id, amount } = req.body;
    const bookingId = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    db.prepare('INSERT INTO bookings (id, bus_id, user_id, from_stop, to_stop, seats, amount) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(bookingId, bus_id, user_id, source_stop_id, destination_stop_id, num_seats, amount);
    
    res.json({ 
      success: true, 
      bookingId,
      paymentUrl: `https://checkout.example.com/pay?id=${bookingId}` // Mock payment URL
    });
  });

  app.post('/api/payment-webhook', (req, res) => {
    const { bookingId, status } = req.body;
    if (status === 'success') {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId) as any;
      if (booking) {
        db.prepare("UPDATE bookings SET status = 'Confirmed' WHERE id = ?").run(bookingId);
        
        const ticketId = 'TK' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const bus = db.prepare('SELECT route_name FROM buses WHERE id = ?').get(booking.bus_id) as any;
        
        if (!bus) {
          return res.status(404).json({ error: 'Bus not found' });
        }

        db.prepare('INSERT INTO tickets (id, bus_id, bus_name, from_stop, to_stop, seats, fare, date, qr_payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(ticketId, booking.bus_id, bus.route_name, booking.from_stop, booking.to_stop, booking.seats, booking.amount, new Date().toISOString().split('T')[0], ticketId);
        
        // Update seat matrix
        const route = db.prepare('SELECT stops FROM routes WHERE name = ?').get(bus.route_name) as any;
        if (route) {
          const stops = JSON.parse(route.stops);
          const sourceIdx = stops.findIndex((s: any) => s.name === booking.from_stop);
          const destIdx = stops.findIndex((s: any) => s.name === booking.to_stop);
          
          if (sourceIdx !== -1 && destIdx !== -1) {
            for (let i = sourceIdx; i < destIdx; i++) {
              db.prepare('UPDATE seat_segments SET occupied_seats = occupied_seats + ? WHERE bus_id = ? AND from_stop = ? AND to_stop = ?')
                .run(booking.seats, booking.bus_id, stops[i].name, stops[i+1].name);
            }
          }
        }

        res.json({ success: true, ticketId });
      } else {
        res.status(404).json({ error: 'Booking not found' });
      }
    } else {
      db.prepare("UPDATE bookings SET status = 'Failed' WHERE id = ?").run(bookingId);
      res.json({ success: false });
    }
  });

  app.get('/api/tickets/:id/live', (req, res) => {
    const { id } = req.params;
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const bus = db.prepare('SELECT * FROM buses WHERE id = ?').get(ticket.bus_id) as any;
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    res.json({
      bus_location: { lat: bus.current_lat, lng: bus.current_lng },
      eta_boarding: bus.eta,
      status: ticket.status
    });
  });

  app.get('/api/buses', (req, res) => {
    const buses = db.prepare('SELECT * FROM buses').all();
    res.json(buses);
  });

  app.get('/api/routes', (req, res) => {
    const routes = db.prepare('SELECT * FROM routes').all();
    const parsed = routes.map((r: any) => ({ ...r, stops: JSON.parse(r.stops) }));
    res.json(parsed);
  });

  app.get('/api/tickets', (req, res) => {
    const tickets = db.prepare('SELECT * FROM tickets ORDER BY timestamp DESC').all();
    res.json(tickets);
  });

  app.get('/api/trips', (req, res) => {
    const trips = db.prepare('SELECT * FROM trips ORDER BY start_time DESC').all();
    res.json(trips);
  });

  app.get('/api/buses/:id/segments', (req, res) => {
    const { id } = req.params;
    const segments = db.prepare('SELECT * FROM seat_segments WHERE bus_id = ?').all(id);
    res.json(segments);
  });

  app.post('/api/buses/:id/location', (req, res) => {
    const { id } = req.params;
    const { lat, lng } = req.body;
    db.prepare('UPDATE buses SET current_lat = ?, current_lng = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(lat, lng, id);
    io.emit('bus_update', { id, lat, lng });
    res.json({ success: true });
  });

  app.post('/api/buses/:id/occupancy', (req, res) => {
    const { id } = req.params;
    const { occupancy } = req.body;
    db.prepare('UPDATE buses SET occupancy = ? WHERE id = ?').run(occupancy, id);
    io.emit('occupancy_update', { id, occupancy });
    res.json({ success: true });
  });

  app.post('/api/complaints', (req, res) => {
    const { busId, type, description } = req.body;
    db.prepare('INSERT INTO complaints (bus_id, type, description) VALUES (?, ?, ?)').run(busId, type, description);
    io.emit('new_complaint', { busId, type, description });
    res.json({ success: true });
  });

  app.get('/api/complaints', (req, res) => {
    const complaints = db.prepare('SELECT * FROM complaints ORDER BY timestamp DESC').all();
    res.json(complaints);
  });

  app.delete('/api/complaints/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM complaints WHERE id = ?').run(id);
    io.emit('new_complaint'); // Trigger refresh
    res.json({ success: true });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Simulate bus movement
  setInterval(() => {
    const buses = db.prepare('SELECT * FROM buses').all() as any[];
    buses.forEach(bus => {
      // Small random movement
      const newLat = bus.current_lat + (Math.random() - 0.5) * 0.001;
      const newLng = bus.current_lng + (Math.random() - 0.5) * 0.001;
      db.prepare('UPDATE buses SET current_lat = ?, current_lng = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(newLat, newLng, bus.id);
      io.emit('bus_update', { id: bus.id, lat: newLat, lng: newLng });
    });
  }, 3000);
}

startServer();
