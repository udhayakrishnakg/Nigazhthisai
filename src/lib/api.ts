import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Replace with real FastAPI URL
});

// Mock Data
const MOCK_STATS = {
  today_trips: { total: 120, active: 45, completed: 75 },
  today_tickets: { total: 1450, app: 850, etm: 600 },
  today_revenue: { 
    total: 45000, 
    top_routes: [
      { route_name: 'Tiruppur - Avinashi', revenue: 12000 },
      { route_name: 'Chennai - Tambaram', revenue: 15000 },
      { route_name: 'Coimbatore - Ukadam', revenue: 8000 }
    ] 
  },
  alerts: [
    { id: '1', type: 'GPS_OFFLINE', message: 'Bus TN 39 AB 1234 GPS offline for 15m', timestamp: new Date().toISOString() },
    { id: '2', type: 'HIGH_LOAD', message: 'Route 102 showing 95% occupancy', timestamp: new Date().toISOString() },
    { 
      id: '3', 
      type: 'IDLE_BUS', 
      message: 'Bus TN 66 GH 3456 idle for 25m at unconventional location', 
      timestamp: new Date().toISOString(),
      bus_id: 'TN 66 GH 3456',
      idle_duration: 25,
      location: { lat: 11.0168, lng: 76.9558 }
    }
  ]
};

const INITIAL_ROUTES = [
  { 
    id: 1, 
    name: 'Tiruppur Old Bus Stand – Avinashi', 
    code: 'TUP-AVI', 
    num_stops: 5, 
    status: 'ACTIVE', 
    district: 'Tiruppur', 
    zone: 'West',
    stops: ['Old BS', 'Pushpa Theater', 'SAP Stop', 'Thendral Nagar', 'Avinashi BS'],
    day_schedules: {
      'FRIDAY': ['Old BS', 'Pushpa Theater', 'SAP Stop', 'Thendral Nagar', 'Temple Corner', 'Avinashi BS']
    }
  },
  { 
    id: 2, 
    name: 'Koyambedu – Tambaram', 
    code: 'CHE-TAM', 
    num_stops: 8, 
    status: 'ACTIVE', 
    district: 'Chennai', 
    zone: 'North',
    stops: ['Koyambedu', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Tambaram'],
    day_schedules: {
      'SUNDAY': ['Koyambedu', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Vandalur Zoo', 'Tambaram']
    }
  },
  { id: 3, name: 'Gandhipuram – Ukadam', code: 'CBE-UKD', num_stops: 4, status: 'ACTIVE', district: 'Coimbatore', zone: 'West', stops: ['Gandhipuram', 'Lakshmi Mills', 'Singanallur', 'Ukadam'] },
  { id: 4, name: 'Madurai – Periyar', code: 'MAD-PER', num_stops: 6, status: 'ACTIVE', district: 'Madurai', zone: 'South', stops: ['Mattuthavani', 'Goripalayam', 'Simmakkal', 'Periyar'] },
  { id: 5, name: 'Salem – Junction', code: 'SAL-JUN', num_stops: 7, status: 'INACTIVE', district: 'Salem', zone: 'Central', stops: ['New Bus Stand', 'Four Roads', 'Junction Railway Station'] }
];

const getStoredRoutes = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nigazhthisai_routes');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('nigazhthisai_routes', JSON.stringify(INITIAL_ROUTES));
  }
  return INITIAL_ROUTES;
};

let MOCK_ROUTES = getStoredRoutes();

const saveRoutesToStorage = (routesList: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nigazhthisai_routes', JSON.stringify(routesList));
  }
  MOCK_ROUTES = routesList;
};

const INITIAL_BUSES = [
  { id: 1, reg_no: 'TN 39 AB 1234', registration_number: 'TN 39 AB 1234', model: 'Leyland Viking', type: 'AC', status: 'ACTIVE', etm_id: 'ETM-001', district: 'Tiruppur', zone: 'West', controllingAdmin: 'Admin Manager' },
  { id: 2, reg_no: 'TN 01 CD 5678', registration_number: 'TN 01 CD 5678', model: 'Volvo 9400', type: 'NON-AC', status: 'ACTIVE', etm_id: 'ETM-002', district: 'Chennai', zone: 'North', controllingAdmin: 'Admin Manager' },
  { id: 3, reg_no: 'TN 37 EF 9012', registration_number: 'TN 37 EF 9012', model: 'Leyland Viking', type: 'AC', status: 'MAINTENANCE', etm_id: 'ETM-003', district: 'Coimbatore', zone: 'West', controllingAdmin: 'Operations Manager' },
  { id: 4, reg_no: 'TN 66 GH 3456', registration_number: 'TN 66 GH 3456', model: 'Eicher Pro', type: 'NON-AC', status: 'ACTIVE', etm_id: 'ETM-004', district: 'Coimbatore', zone: 'West', controllingAdmin: 'Operations Manager' }
];

const getStoredBuses = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nigazhthisai_buses');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('nigazhthisai_buses', JSON.stringify(INITIAL_BUSES));
  }
  return INITIAL_BUSES;
};

let MOCK_BUSES = getStoredBuses();

const saveBusesToStorage = (busesList: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nigazhthisai_buses', JSON.stringify(busesList));
  }
  MOCK_BUSES = busesList;
};

const INITIAL_ETMS = [
  { id: 1, device_id: 'ETM-001', serial_number: 'SN-90281', model: 'Verifone V240m', status: 'ACTIVE' },
  { id: 2, device_id: 'ETM-002', serial_number: 'SN-84192', model: 'Pax A920 Pro', status: 'ACTIVE' },
  { id: 3, device_id: 'ETM-003', serial_number: 'SN-73195', model: 'SZZT KS8223', status: 'MAINTENANCE' },
  { id: 4, device_id: 'ETM-004', serial_number: 'SN-29481', model: 'Verifone V240m', status: 'ACTIVE' },
  { id: 5, device_id: 'ETM-005', serial_number: 'SN-48192', model: 'Pax A920 Pro', status: 'ACTIVE' },
  { id: 6, device_id: 'ETM-006', serial_number: 'SN-10492', model: 'SZZT KS8223', status: 'ACTIVE' }
];

const getStoredEtms = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nigazhthisai_etms');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('nigazhthisai_etms', JSON.stringify(INITIAL_ETMS));
  }
  return INITIAL_ETMS;
};

let MOCK_ETMS = getStoredEtms();

const saveEtmsToStorage = (etmsList: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nigazhthisai_etms', JSON.stringify(etmsList));
  }
  MOCK_ETMS = etmsList;
};

let MOCK_TRIPS = [
  { id: 1, route_id: 1, bus_id: 1, driver_name: 'Ramesh', conductor_name: 'Suresh', start_time: '08:00 AM', status: 'RUNNING', occupancy: 45, district: 'Tiruppur', zone: 'West' },
  { id: 2, route_id: 2, bus_id: 2, driver_name: 'Kumar', conductor_name: 'Mani', start_time: '09:30 AM', status: 'SCHEDULED', occupancy: 0, district: 'Chennai', zone: 'North' },
  { id: 3, route_id: 3, bus_id: 4, driver_name: 'Anbu', conductor_name: 'Selvam', start_time: '10:15 AM', status: 'RUNNING', occupancy: 32, district: 'Coimbatore', zone: 'West' }
];

const MOCK_LIVE_TRIPS = [
  { id: 'LT-001', bus_id: 'TN 39 AB 1234', route_name: 'Tiruppur - Avinashi', current_lat: 11.1085, current_lng: 77.3411, speed: 45, occupancy: 65, status: 'ON_TIME', is_idle: false, idle_minutes: 0, district: 'Tiruppur', zone: 'West' },
  { id: 'LT-002', bus_id: 'TN 01 CD 5678', route_name: 'Chennai - Tambaram', current_lat: 12.9229, current_lng: 80.1275, speed: 30, occupancy: 85, status: 'DELAYED', is_idle: false, idle_minutes: 0, district: 'Chennai', zone: 'North' },
  { id: 'LT-003', bus_id: 'TN 66 GH 3456', route_name: 'Coimbatore - Ukadam', current_lat: 11.0168, current_lng: 76.9558, speed: 0, occupancy: 10, status: 'STATIONARY', is_idle: true, idle_minutes: 25, is_outside_geofence: true, district: 'Coimbatore', zone: 'West' }
];

const MOCK_REVENUE = {
  total_revenue: 1250000,
  monthly_data: [
    { month: 'Jan', revenue: 180000 },
    { month: 'Feb', revenue: 220000 },
    { month: 'Mar', revenue: 250000 },
    { month: 'Apr', revenue: 210000 },
    { month: 'May', revenue: 190000 },
    { month: 'Jun', revenue: 200000 }
  ],
  route_revenue: [
    { name: 'Tiruppur - Avinashi', revenue: 450000 },
    { name: 'Chennai - Tambaram', revenue: 550000 },
    { name: 'Coimbatore - Ukadam', revenue: 250000 }
  ]
};

let MOCK_STOPS = [
  { id: '1', name: 'Koyambedu (CMBT)', district: 'Chennai', lat: 13.0733, lng: 80.1914 },
  { id: '2', name: 'Central Railway Station', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { id: '3', name: 'Mattuthavani', district: 'Madurai', lat: 9.9400, lng: 78.1500 },
  { id: '4', name: 'Gandhipuram', district: 'Coimbatore', lat: 11.0183, lng: 76.9686 },
  { id: '5', name: 'New Bus Stand', district: 'Salem', lat: 11.6667, lng: 78.1667 },
];

let MOCK_SHOPS = [
  { id: '1', stop_id: '1', name: 'Hotel Annapoorna', description: 'Famous for coffee and breakfast', deal: 'Free Coffee', lat: 13.0733, lng: 80.1914, status: 'ACTIVE' },
  { id: '2', stop_id: '2', name: 'City Textiles', description: 'One stop for all clothing needs', deal: '10% Discount', lat: 13.0827, lng: 80.2707, status: 'ACTIVE' },
  { id: '3', stop_id: '3', name: 'Famous Jigarthanda', description: 'Iconic Madurai beverage', deal: 'BOGO on Mini', lat: 9.9400, lng: 78.1500, status: 'ACTIVE' }
];

const INITIAL_USERS = [
  { id: 1, name: 'Master Admin', email: 'master@nigazhthisai.com', mobile: '9876543210', role: 'MASTER_ADMIN', status: 'ACTIVE', password: 'master123', scope: 'Global' },
  { id: 2, name: 'Admin Manager', email: 'admin@nigazhthisai.com', mobile: '9876543211', role: 'ADMIN', status: 'ACTIVE', password: 'admin123', scope: 'Chennai' },
  { id: 3, name: 'Operations Manager', email: 'ops@nigazhthisai.com', mobile: '9876543212', role: 'OPERATIONS', status: 'ACTIVE', password: 'ops123', scope: 'Coimbatore' },
  { id: 4, name: 'Conductor Ramesh', email: 'conductor@nigazhthisai.com', mobile: '9876543213', role: 'CONDUCTOR', status: 'ACTIVE', password: 'conductor123', scope: 'Tiruppur' },
  { id: 5, name: 'Anand Kumar', email: 'passenger@nigazhthisai.com', mobile: '9876543214', role: 'PASSENGER', status: 'ACTIVE', password: 'passenger123', scope: 'Global' }
];

const getStoredUsers = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nigazhthisai_users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure default passenger is present
        if (!parsed.some((u: any) => u.email.toLowerCase() === 'passenger@nigazhthisai.com')) {
          parsed.push({ id: 5, name: 'Anand Kumar', email: 'passenger@nigazhthisai.com', mobile: '9876543214', role: 'PASSENGER', status: 'ACTIVE', password: 'passenger123', scope: 'Global' });
          localStorage.setItem('nigazhthisai_users', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('nigazhthisai_users', JSON.stringify(INITIAL_USERS));
  }
  return INITIAL_USERS;
};

let MOCK_USERS = getStoredUsers();

const saveUsersToStorage = (users: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nigazhthisai_users', JSON.stringify(users));
  }
  MOCK_USERS = users;
};

// Mock API Layer
export const adminApi = {
  login: async (credentials: any) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    const found = users.find((u: any) => u.email === credentials.email && u.password === credentials.password);
    if (found) {
      return { 
        token: `mock-${found.role.toLowerCase()}-token`, 
        user: { name: found.name, role: found.role, email: found.email, mobile: found.mobile, scope: found.scope } 
      };
    }
    throw new Error('Invalid credentials');
  },
  getDashboardStats: async (filters?: { district?: string; zone?: string }) => {
    await new Promise(r => setTimeout(r, 500));
    const multiplier = (!filters || filters.district === 'All') ? 1 : 0.4;
    return {
      today_trips: { 
        total: Math.floor(MOCK_STATS.today_trips.total * multiplier), 
        active: Math.floor(MOCK_STATS.today_trips.active * multiplier), 
        completed: Math.floor(MOCK_STATS.today_trips.completed * multiplier) 
      },
      today_tickets: { 
        total: Math.floor(MOCK_STATS.today_tickets.total * multiplier), 
        app: Math.floor(MOCK_STATS.today_tickets.app * multiplier), 
        etm: Math.floor(MOCK_STATS.today_tickets.etm * multiplier) 
      },
      today_revenue: { 
        total: Math.floor(MOCK_STATS.today_revenue.total * multiplier), 
        top_routes: MOCK_STATS.today_revenue.top_routes 
      },
      alerts: MOCK_STATS.alerts
    };
  },
  getRoutes: async () => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_ROUTES;
  },
  getBuses: async () => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_BUSES;
  },
  getTrips: async () => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_TRIPS;
  },
  getLiveTrips: async () => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_LIVE_TRIPS;
  },
  getRevenueData: async (filters?: { district?: string; zone?: string }) => {
    await new Promise(r => setTimeout(r, 500));
    const multiplier = (!filters || filters.district === 'All') ? 1 : 0.35;
    return {
      ...MOCK_REVENUE,
      total_revenue: Math.floor(MOCK_REVENUE.total_revenue * multiplier),
      monthly_data: MOCK_REVENUE.monthly_data.map(d => ({ ...d, revenue: Math.floor(d.revenue * multiplier) })),
      route_revenue: MOCK_REVENUE.route_revenue.map(r => ({ ...r, revenue: Math.floor(r.revenue * multiplier) }))
    };
  },
  acknowledgeAlert: async (id: any) => {
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
  },
  getUsers: async () => {
    await new Promise(r => setTimeout(r, 500));
    MOCK_USERS = getStoredUsers();
    return MOCK_USERS;
  },
  createUser: async (userData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    if (users.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }
    const newUser = {
      id: users.length + 1,
      status: 'ACTIVE',
      ...userData
    };
    const updated = [...users, newUser];
    saveUsersToStorage(updated);
    return newUser;
  },
  registerPassenger: async (passengerData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    if (users.some((u: any) => u.email.toLowerCase() === passengerData.email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }
    const newUser = {
      id: users.length + 1,
      ...passengerData,
      role: 'PASSENGER',
      status: 'ACTIVE',
      scope: 'Global'
    };
    const updated = [...users, newUser];
    saveUsersToStorage(updated);
    return newUser;
  },
  deleteUser: async (id: number) => {
    await new Promise(r => setTimeout(r, 500));
    const users = getStoredUsers();
    const updated = users.filter((u: any) => u.id !== id);
    saveUsersToStorage(updated);
    return { success: true };
  },
  getStops: async () => {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_STOPS;
  },
  createStop: async (stopData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const newStop = {
      id: String(MOCK_STOPS.length + 1),
      ...stopData
    };
    MOCK_STOPS = [...MOCK_STOPS, newStop];
    return newStop;
  },
  updateStop: async (id: string, stopData: any) => {
    await new Promise(r => setTimeout(r, 800));
    MOCK_STOPS = MOCK_STOPS.map(s => s.id === id ? { ...s, ...stopData } : s);
    return { success: true };
  },
  deleteStop: async (id: string) => {
    await new Promise(r => setTimeout(r, 500));
    MOCK_STOPS = MOCK_STOPS.filter(s => s.id !== id);
    return { success: true };
  },
  getShops: async () => {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_SHOPS;
  },
  addBus: async (busData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const newBus = {
      id: MOCK_BUSES.length + 1,
      ...busData,
      status: 'ACTIVE'
    };
    const updated = [...MOCK_BUSES, newBus];
    saveBusesToStorage(updated);
    return newBus;
  },
  createRoute: async (routeData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const newRoute = {
      id: MOCK_ROUTES.length + 1,
      ...routeData,
      num_stops: routeData.stops ? routeData.stops.length : 0,
      status: 'ACTIVE'
    };
    MOCK_ROUTES = [...MOCK_ROUTES, newRoute];
    saveRoutesToStorage(MOCK_ROUTES);
    return newRoute;
  },
  updateRoute: async (id: number, routeData: any) => {
    await new Promise(r => setTimeout(r, 800));
    MOCK_ROUTES = MOCK_ROUTES.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...routeData };
        if (routeData.stops) {
          updated.num_stops = routeData.stops.length;
        }
        return updated;
      }
      return r;
    });
    saveRoutesToStorage(MOCK_ROUTES);
    return { success: true };
  },
  scheduleTrip: async (tripData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const newTrip = {
      id: MOCK_TRIPS.length + 1,
      ...tripData,
      status: 'SCHEDULED',
      occupancy: 0
    };
    MOCK_TRIPS = [...MOCK_TRIPS, newTrip];
    return newTrip;
  },
  updateTrip: async (id: number, tripData: any) => {
    await new Promise(r => setTimeout(r, 800));
    MOCK_TRIPS = MOCK_TRIPS.map(t => t.id === id ? { ...t, ...tripData } : t);
    return { success: true };
  },
  addShop: async (shopData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const newShop = {
      id: String(MOCK_SHOPS.length + 1),
      ...shopData,
      status: 'ACTIVE'
    };
    MOCK_SHOPS = [...MOCK_SHOPS, newShop];
    return newShop;
  },
  updateShop: async (id: string, shopData: any) => {
    await new Promise(r => setTimeout(r, 800));
    MOCK_SHOPS = MOCK_SHOPS.map(s => s.id === id ? { ...s, ...shopData } : s);
    return { success: true };
  },
  updateBus: async (id: number | string, busData: any) => {
    await new Promise(r => setTimeout(r, 800));
    const updated = MOCK_BUSES.map(b => String(b.id) === String(id) ? { ...b, ...busData } : b);
    saveBusesToStorage(updated);
    return { success: true };
  },
  deleteBus: async (id: number | string) => {
    await new Promise(r => setTimeout(r, 500));
    const updated = MOCK_BUSES.filter(b => String(b.id) !== String(id));
    saveBusesToStorage(updated);
    return { success: true };
  },
  deleteRoute: async (id: number | string) => {
    await new Promise(r => setTimeout(r, 500));
    MOCK_ROUTES = MOCK_ROUTES.filter(r => String(r.id) !== String(id));
    saveRoutesToStorage(MOCK_ROUTES);
    return { success: true };
  },
  deleteTrip: async (id: number | string) => {
    await new Promise(r => setTimeout(r, 500));
    MOCK_TRIPS = MOCK_TRIPS.filter(t => String(t.id) !== String(id));
    return { success: true };
  },
  deleteShop: async (id: string) => {
    await new Promise(r => setTimeout(r, 500));
    MOCK_SHOPS = MOCK_SHOPS.filter(s => String(s.id) !== String(id));
    return { success: true };
  },
  getEtms: async () => {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_ETMS;
  },
  addEtm: async (etmData: any) => {
    await new Promise(r => setTimeout(r, 600));
    const newEtm = {
      id: MOCK_ETMS.length > 0 ? Math.max(...MOCK_ETMS.map(e => e.id)) + 1 : 1,
      ...etmData,
      status: etmData.status || 'ACTIVE'
    };
    MOCK_ETMS = [...MOCK_ETMS, newEtm];
    saveEtmsToStorage(MOCK_ETMS);
    return newEtm;
  },
  updateEtm: async (id: number | string, etmData: any) => {
    await new Promise(r => setTimeout(r, 600));
    MOCK_ETMS = MOCK_ETMS.map(e => String(e.id) === String(id) ? { ...e, ...etmData } : e);
    saveEtmsToStorage(MOCK_ETMS);
    return { success: true };
  },
  deleteEtm: async (id: number | string) => {
    await new Promise(r => setTimeout(r, 400));
    MOCK_ETMS = MOCK_ETMS.filter(e => String(e.id) !== String(id));
    saveEtmsToStorage(MOCK_ETMS);
    return { success: true };
  },
  // Add other methods as needed
};

export const conductorApi = {
  login: async (credentials: { email: string; password?: string }) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    const found = users.find((u: any) => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password);
    if (found && found.role === 'CONDUCTOR') {
      return { token: 'mock-conductor-token', user: { name: found.name, role: 'CONDUCTOR', email: found.email, mobile: found.mobile } };
    }
    if (credentials.email === 'conductor@nigazhthisai.com' && credentials.password === 'conductor123') {
      return { token: 'mock-conductor-token', user: { name: 'Conductor Ramesh', role: 'CONDUCTOR' } };
    }
    throw new Error('Invalid credentials');
  },
  sendOTP: async (phone: string) => {
    await new Promise(r => setTimeout(r, 800));
    console.log(`OTP sent to ${phone}: 123456`);
    return { success: true };
  },
  verifyOTP: async (phone: string, otp: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (otp === '123456') {
      return { token: 'mock-conductor-token', user: { name: 'Conductor Ramesh', role: 'CONDUCTOR' } };
    }
    throw new Error('Invalid OTP');
  },
  getTodayTrips: async () => {
    await new Promise(r => setTimeout(r, 500));
    // Filter trips for this conductor (mocked)
    return MOCK_TRIPS.map(trip => ({
      ...trip,
      route_name: MOCK_ROUTES.find(r => r.id === trip.route_id)?.name || 'Unknown Route',
      bus_no: MOCK_BUSES.find(b => b.id === trip.bus_id)?.reg_no || 'Unknown Bus'
    }));
  },
  startTrip: async (tripId: number) => {
    await new Promise(r => setTimeout(r, 500));
    const trip = MOCK_TRIPS.find(t => t.id === tripId);
    if (trip) trip.status = 'RUNNING';
    return { success: true };
  },
  issueTicket: async (tripId: number, fromStop: string, toStop: string, passengers: number) => {
    await new Promise(r => setTimeout(r, 800));
    const fare = passengers * 20; // Mock fare calculation
    const ticketId = `TKT-${Math.floor(Math.random() * 1000000)}`;
    return { ticketId, fare, fromStop, toStop, passengers };
  },
  scanQR: async (tripId: number, qrData: string) => {
    await new Promise(r => setTimeout(r, 800));
    // Mock QR validation
    if (qrData.includes('VALID')) {
      return { valid: true, message: 'Ticket Validated', passengerName: 'John Doe' };
    }
    return { valid: false, message: 'Invalid or Expired Ticket' };
  },
  updateGPS: async (tripId: number, lat: number, lng: number) => {
    // Silent update
    console.log(`GPS Update for Trip ${tripId}: ${lat}, ${lng}`);
    return { success: true };
  },
  endTrip: async (tripId: number) => {
    await new Promise(r => setTimeout(r, 500));
    const trip = MOCK_TRIPS.find(t => t.id === tripId);
    if (trip) trip.status = 'COMPLETED';
    return { success: true };
  }
};

export default api;
