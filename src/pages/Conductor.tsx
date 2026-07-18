import React, { useState, useEffect } from 'react';
import { 
  Bus as BusIcon, 
  Navigation, 
  Ticket, 
  User, 
  LogOut, 
  QrCode, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Loader2, 
  ChevronRight, 
  ArrowLeft, 
  Info, 
  Globe, 
  ChevronDown, 
  Check, 
  Search, 
  Phone, 
  Lock, 
  Printer, 
  History,
  TrendingUp,
  AlertTriangle,
  Trash2,
  BarChart3,
  Calendar,
  DollarSign,
  Filter,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../lib/i18n';

// Real-world historical ticket records across different months for analytics
const MOCK_HISTORICAL_TICKETS = [
  {
    ticket_id: "NIG-883921",
    trip_id: "TRIP-102938",
    origin_name: "Gandhipuram",
    destination_name: "Singanallur",
    seats: 1,
    ticket_type: "REGULAR",
    fare: 15,
    issued_at: "08:15 AM",
    date: "Jul 15, 2026"
  },
  {
    ticket_id: "NIG-583920",
    trip_id: "TRIP-102938",
    origin_name: "Gandhipuram",
    destination_name: "Ukkadam",
    seats: 2,
    ticket_type: "STUDENT",
    fare: 30,
    issued_at: "09:40 AM",
    date: "Jul 15, 2026"
  },
  {
    ticket_id: "NIG-293811",
    trip_id: "TRIP-102938",
    origin_name: "Singanallur",
    destination_name: "Ukkadam",
    seats: 3,
    ticket_type: "REGULAR",
    fare: 90,
    issued_at: "11:15 AM",
    date: "Jul 15, 2026"
  },
  {
    ticket_id: "NIG-100293",
    trip_id: "TRIP-992811",
    origin_name: "Gandhipuram",
    destination_name: "Ukkadam",
    seats: 2,
    ticket_type: "REGULAR",
    fare: 60,
    issued_at: "02:30 PM",
    date: "Jul 14, 2026"
  },
  {
    ticket_id: "NIG-993821",
    trip_id: "TRIP-992811",
    origin_name: "Singanallur",
    destination_name: "Ukkadam",
    seats: 1,
    ticket_type: "CONCESSION",
    fare: 10,
    issued_at: "04:10 PM",
    date: "Jul 14, 2026"
  },
  {
    ticket_id: "NIG-482931",
    trip_id: "TRIP-394829",
    origin_name: "Koyambedu (CMBT)",
    destination_name: "Adyar",
    seats: 2,
    ticket_type: "REGULAR",
    fare: 90,
    issued_at: "10:30 AM",
    date: "Jun 28, 2026"
  },
  {
    ticket_id: "NIG-283928",
    trip_id: "TRIP-394829",
    origin_name: "Central Railway Station",
    destination_name: "Egmore",
    seats: 4,
    ticket_type: "STUDENT",
    fare: 60,
    issued_at: "01:15 PM",
    date: "Jun 28, 2026"
  },
  {
    ticket_id: "NIG-382910",
    trip_id: "TRIP-394829",
    origin_name: "Koyambedu (CMBT)",
    destination_name: "Egmore",
    seats: 1,
    ticket_type: "REGULAR",
    fare: 30,
    issued_at: "03:45 PM",
    date: "Jun 15, 2026"
  },
  {
    ticket_id: "NIG-192837",
    trip_id: "TRIP-554627",
    origin_name: "Mattuthavani",
    destination_name: "Arapalayam",
    seats: 3,
    ticket_type: "REGULAR",
    fare: 135,
    issued_at: "11:20 AM",
    date: "May 25, 2026"
  },
  {
    ticket_id: "NIG-473928",
    trip_id: "TRIP-554627",
    origin_name: "Periyar Bus Stand",
    destination_name: "Arapalayam",
    seats: 2,
    ticket_type: "REGULAR",
    fare: 60,
    issued_at: "02:10 PM",
    date: "May 25, 2026"
  },
  {
    ticket_id: "NIG-918273",
    trip_id: "TRIP-554627",
    origin_name: "Mattuthavani",
    destination_name: "Periyar Bus Stand",
    seats: 1,
    ticket_type: "CONCESSION",
    fare: 15,
    issued_at: "04:30 PM",
    date: "May 10, 2026"
  },
  {
    ticket_id: "NIG-102938",
    trip_id: "TRIP-223192",
    origin_name: "Old Bus Stand",
    destination_name: "Avinashi",
    seats: 2,
    ticket_type: "REGULAR",
    fare: 90,
    issued_at: "09:15 AM",
    date: "Apr 20, 2026"
  },
  {
    ticket_id: "NIG-772839",
    trip_id: "TRIP-223192",
    origin_name: "New Bus Stand",
    destination_name: "Avinashi",
    seats: 1,
    ticket_type: "REGULAR",
    fare: 30,
    issued_at: "11:45 AM",
    date: "Apr 20, 2026"
  }
];

// Real-world bus fleet for Nigazhthisai
const BUS_FLEET = [
  { bus_id: 'CBE-BUS-1', number_plate: 'TN-37-BY-1111', route_name: 'Coimbatore Fast Track (CBE1)', stops: ['Gandhipuram', 'Singanallur', 'Ukkadam'] },
  { bus_id: 'MAS-BUS-1', number_plate: 'TN-01-DA-5555', route_name: 'Chennai Metro Connector (MAS1)', stops: ['Koyambedu (CMBT)', 'Central Railway Station', 'Egmore', 'Adyar'] },
  { bus_id: 'MDU-BUS-1', number_plate: 'TN-59-CA-3333', route_name: 'Madurai City Rider (MDU1)', stops: ['Mattuthavani', 'Periyar Bus Stand', 'Arapalayam'] },
  { bus_id: 'TPR-BUS-1', number_plate: 'TN-39-AA-1122', route_name: 'Tiruppur Avinashi Link (TPR1)', stops: ['Old Bus Stand', 'New Bus Stand', 'Avinashi'] }
];

const AUTHORIZED_MAP: Record<string, { id: string; name: string }> = {
  'CBE-BUS-1': { id: 'COND-CBE-01', name: 'Suresh Kumar' },
  'MAS-BUS-1': { id: 'COND-MAS-02', name: 'Mani Arumugam' },
  'MDU-BUS-1': { id: 'COND-MDU-03', name: 'Selvamurugan' },
  'TPR-BUS-1': { id: 'COND-TPR-04', name: 'Ramesh Krishnan' }
};

export const ConductorPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  // Navigation states
  // 'LOGIN' | 'TRIP_HOME' | 'ISSUE_TICKET' | 'TICKET_CONFIRMATION' | 'SCAN_QR' | 'SCAN_RESULT' | 'TRIP_HISTORY'
  const [currentView, setCurrentView] = useState<string>('LOGIN');

  // Custom confirmation dialog states
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEndTripConfirm, setShowEndTripConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // Bus QR scanner simulation state
  const [isBusQrModalOpen, setIsBusQrModalOpen] = useState(false);
  const [busQrScanLoading, setBusQrScanLoading] = useState(false);

  // Conductor authentication & session states
  const [jwt, setJwt] = useState<string | null>(() => localStorage.getItem('conductor_jwt'));
  const [scannedConductorId, setScannedConductorId] = useState<string | null>(() => localStorage.getItem('conductor_id') || null);
  const [scannedConductorName, setScannedConductorName] = useState<string | null>(() => localStorage.getItem('conductor_name') || null);
  const [isConductorAuthorized, setIsConductorAuthorized] = useState<boolean | null>(() => localStorage.getItem('conductor_id') ? true : null);
  const [startDutyLoading, setStartDutyLoading] = useState(false);

  // Active Session states (saved in localStorage to persist across refreshes)
  const [activeBusId, setActiveBusId] = useState<string | null>(() => localStorage.getItem('conductor_bus_id'));
  const [activeConductorId, setActiveConductorId] = useState<string | null>(() => localStorage.getItem('conductor_id'));
  const [activeTripId, setActiveTripId] = useState<string | null>(() => localStorage.getItem('conductor_trip_id'));
  const [activeRouteName, setActiveRouteName] = useState<string | null>(() => localStorage.getItem('conductor_route_name'));
  const [activeNumberPlate, setActiveNumberPlate] = useState<string | null>(() => localStorage.getItem('conductor_number_plate'));

  // Pre-populate tempSelectedBus if activeBusId is already loaded
  const [tempSelectedBus, setTempSelectedBus] = useState<any | null>(() => {
    const savedBusId = localStorage.getItem('conductor_bus_id');
    return savedBusId ? BUS_FLEET.find(b => b.bus_id === savedBusId) : null;
  });

  const [searchBusQuery, setSearchBusQuery] = useState('');

  // Tickets list & stats
  const [ticketsToday, setTicketsToday] = useState<any[]>(() => {
    const saved = localStorage.getItem('conductor_tickets_list');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('conductor_tickets_list', JSON.stringify(MOCK_HISTORICAL_TICKETS));
    return MOCK_HISTORICAL_TICKETS;
  });

  // Analytics states for the 3-dot menu and dashboard calculations
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('Jul 15, 2026');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');
  
  // Issue Ticket Form state
  const [boardingStop, setBoardingStop] = useState('');
  const [destinationStop, setDestinationStop] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [ticketType, setTicketType] = useState('REGULAR');
  const [farePreview, setFarePreview] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [lastIssuedTicket, setLastIssuedTicket] = useState<any | null>(null);

  // Scan QR flow states
  const [scanPayload, setScanPayload] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Language Picker dropdown state
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Resolve current active bus & stops
  const activeBus = BUS_FLEET.find(b => b.bus_id === activeBusId);
  const activeBusStops = activeBus ? activeBus.stops : [];

  const getProgressBarClass = (count: number) => {
    const pct = (count / 50) * 100;
    if (pct <= 30) {
      // starting it should be green
      return 'bg-gradient-to-r from-occupancy-green to-occupancy-green';
    } else if (pct <= 60) {
      // when the passengerscounts starts increasing it should move greenish gradient to orange
      return 'bg-gradient-to-r from-occupancy-green to-occupancy-orange';
    } else if (pct <= 80) {
      return 'bg-gradient-to-r from-occupancy-green via-occupancy-orange to-occupancy-orange';
    } else {
      // redishh gradient at the end
      return 'bg-gradient-to-r from-occupancy-green via-occupancy-orange to-occupancy-red';
    }
  };

  // Determine initial view based on saved credentials
  useEffect(() => {
    if (jwt && activeBusId && activeTripId) {
      setCurrentView('TRIP_HOME');
    } else {
      setCurrentView('LOGIN');
    }
  }, [jwt, activeBusId, activeTripId]);

  // Persist tickets helper
  const saveTicketsToStorage = (updatedTickets: any[]) => {
    setTicketsToday(updatedTickets);
    localStorage.setItem('conductor_tickets_list', JSON.stringify(updatedTickets));
  };

  // Stats calculation
  const totalTicketsCount = ticketsToday.length;
  const totalRevenueSum = ticketsToday.reduce((sum, t) => sum + t.fare, 0);

  // Helper to parse date key into Month Year, e.g. "Jul 15, 2026" -> "Jul 2026"
  const getMonthKey = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const parts = dateStr.trim().split(' ');
    if (parts.length >= 3) {
      return `${parts[0]} ${parts[2]}`; // e.g. "Jul 2026"
    }
    return 'Unknown';
  };

  // Get all unique dates in history (sorted newest first)
  const uniqueDates = Array.from(new Set(ticketsToday.map(t => t.date))).sort((a: any, b: any) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Get all unique months in history
  const uniqueMonths = Array.from(new Set(ticketsToday.map(t => getMonthKey(t.date))))
    .filter(m => m !== 'Unknown');

  // Daily statistics for selectedDateFilter
  const dailyTickets = ticketsToday.filter(t => t.date === selectedDateFilter);
  const dailyTicketsSold = dailyTickets.reduce((sum, t) => sum + t.seats, 0); // Total tickets (seats) sold in selected day
  const dailyRevenue = dailyTickets.reduce((sum, t) => sum + t.fare, 0); // Total revenue in selected day

  // Monthly statistics for selectedMonthFilter
  const monthlyTicketsFiltered = selectedMonthFilter === 'ALL'
    ? ticketsToday
    : ticketsToday.filter(t => getMonthKey(t.date) === selectedMonthFilter);

  const monthlyTicketsSold = monthlyTicketsFiltered.reduce((sum, t) => sum + t.seats, 0);
  const monthlyRevenue = monthlyTicketsFiltered.reduce((sum, t) => sum + t.fare, 0);

  const regularCount = monthlyTicketsFiltered.filter(t => t.ticket_type === 'REGULAR').reduce((sum, t) => sum + t.seats, 0);
  const studentCount = monthlyTicketsFiltered.filter(t => t.ticket_type === 'STUDENT').reduce((sum, t) => sum + t.seats, 0);
  const concessionCount = monthlyTicketsFiltered.filter(t => t.ticket_type === 'CONCESSION').reduce((sum, t) => sum + t.seats, 0);
  const totalMonthlySeats = regularCount + studentCount + concessionCount || 1;

  // Live GPS Tracking Loop simulation (POST /conductor/gps every 20-30 seconds)
  useEffect(() => {
    let gpsInterval: any = null;
    
    if (currentView === 'TRIP_HOME' && activeTripId && activeBusId) {
      const sendGPSLocation = () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const payload = {
                trip_id: activeTripId,
                bus_id: activeBusId,
                lat: latitude,
                lng: longitude,
                timestamp: new Date().toISOString()
              };
              
              // Simulate: POST /conductor/gps
              console.log("POST /conductor/gps", payload);
              
              // TODO: Replace with Android ETM SDK GPS coordinate readings later:
              // if (isEtmDevice) { lat = EtmGpsSDK.getLatitude(); lng = EtmGpsSDK.getLongitude(); }
            },
            (error) => {
              // Fallback simulated GPS coordinates in case of blocked browser permissions
              const simulatedLat = 11.0168 + (Math.random() - 0.5) * 0.01;
              const simulatedLng = 76.9558 + (Math.random() - 0.5) * 0.01;
              const payload = {
                trip_id: activeTripId,
                bus_id: activeBusId,
                lat: simulatedLat,
                lng: simulatedLng,
                timestamp: new Date().toISOString()
              };
              console.log("POST /conductor/gps (Simulated GPS Fallback)", payload);
            }
          );
        }
      };

      // Send initial GPS update instantly
      sendGPSLocation();

      // Send update every 25 seconds
      gpsInterval = setInterval(sendGPSLocation, 25000);
    }

    return () => {
      if (gpsInterval) {
        clearInterval(gpsInterval);
      }
    };
  }, [currentView, activeTripId, activeBusId]);

  // Automatic estimation of ticket fare (POST /conductor/tickets/preview preview)
  useEffect(() => {
    if (boardingStop && destinationStop && boardingStop !== destinationStop) {
      setPreviewLoading(true);
      const timer = setTimeout(() => {
        const boardingIndex = activeBusStops.indexOf(boardingStop);
        const destinationIndex = activeBusStops.indexOf(destinationStop);
        if (boardingIndex !== -1 && destinationIndex !== -1) {
          const distance = Math.abs(boardingIndex - destinationIndex);
          let baseFare = distance * 15; // 15 INR per stop
          if (ticketType === 'STUDENT') {
            baseFare = Math.ceil(baseFare * 0.5); // 50% Student discount
          } else if (ticketType === 'CONCESSION') {
            baseFare = Math.ceil(baseFare * 0.3); // 70% Concession discount
          }
          setFarePreview(baseFare * passengersCount);
        } else {
          setFarePreview(null);
        }
        setPreviewLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFarePreview(null);
    }
  }, [boardingStop, destinationStop, passengersCount, ticketType, activeBusStops]);

  // Unified Start Duty Trip Flow
  const handleStartDutyTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSelectedBus) {
      toast.error('Please scan the Bus Dashboard QR to register vehicle');
      return;
    }
    if (!scannedConductorId || !isConductorAuthorized) {
      toast.error('No authorized conductor verified for this trip');
      return;
    }

    setStartDutyLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const generatedTripId = `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;
      const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-jwt-token-nigazhthisai';

      localStorage.setItem('conductor_jwt', mockJwt);
      localStorage.setItem('conductor_id', scannedConductorId);
      localStorage.setItem('conductor_name', scannedConductorName || 'Authorized Conductor');
      localStorage.setItem('conductor_bus_id', tempSelectedBus.bus_id);
      localStorage.setItem('conductor_route_name', tempSelectedBus.route_name);
      localStorage.setItem('conductor_number_plate', tempSelectedBus.number_plate);
      localStorage.setItem('conductor_trip_id', generatedTripId);
      localStorage.removeItem('conductor_tickets_list');

      setJwt(mockJwt);
      setActiveConductorId(scannedConductorId);
      setActiveBusId(tempSelectedBus.bus_id);
      setActiveRouteName(tempSelectedBus.route_name);
      setActiveNumberPlate(tempSelectedBus.number_plate);
      setActiveTripId(generatedTripId);
      setTicketsToday([]);

      // Pre-fill default stops for the selected route
      if (tempSelectedBus.stops && tempSelectedBus.stops.length >= 2) {
        setBoardingStop(tempSelectedBus.stops[0]);
        setDestinationStop(tempSelectedBus.stops[1]);
      }

      setCurrentView('TRIP_HOME');
      toast.success(`Duty started. Real-time GPS tracking is now active.`);
    } catch (err) {
      toast.error('Failed to start duty trip.');
    } finally {
      setStartDutyLoading(false);
    }
  };

  // 3. Issue Ticket Flow Action
  const handleIssueTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardingStop || !destinationStop) {
      toast.error('Select valid boarding and destination stops');
      return;
    }
    if (boardingStop === destinationStop) {
      toast.error('Boarding and destination stops cannot be identical');
      return;
    }

    setIssueLoading(true);
    try {
      // POST /conductor/tickets simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const boardingIndex = activeBusStops.indexOf(boardingStop);
      const destinationIndex = activeBusStops.indexOf(destinationStop);
      const distance = Math.abs(boardingIndex - destinationIndex);
      let calculatedSingleFare = distance * 15;
      if (ticketType === 'STUDENT') {
        calculatedSingleFare = Math.ceil(calculatedSingleFare * 0.5);
      } else if (ticketType === 'CONCESSION') {
        calculatedSingleFare = Math.ceil(calculatedSingleFare * 0.3);
      }
      const totalCalculatedFare = calculatedSingleFare * passengersCount;

      const generatedTicketId = `NIG-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTicket = {
        ticket_id: generatedTicketId,
        trip_id: activeTripId,
        origin_stop_id: `stop-${boardingIndex}`,
        destination_stop_id: `stop-${destinationIndex}`,
        origin_name: boardingStop,
        destination_name: destinationStop,
        seats: passengersCount,
        ticket_type: ticketType,
        fare: totalCalculatedFare,
        issued_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      console.log("POST /conductor/tickets created payload:", newTicket);

      // Append ticket to storage
      const updatedList = [newTicket, ...ticketsToday];
      saveTicketsToStorage(updatedList);

      setLastIssuedTicket(newTicket);
      setCurrentView('TICKET_CONFIRMATION');
      toast.success(`Ticket ${generatedTicketId} Issued successfully!`);
    } catch (err) {
      toast.error('Failed to issue ticket.');
    } finally {
      setIssueLoading(false);
    }
  };

  // 4. Scan QR Code Action
  const handleScanQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanPayload.trim()) {
      toast.error('Please input a passenger ticket QR string or tap a simulator shortcut below');
      return;
    }

    setScanLoading(true);
    try {
      // POST /conductor/scan simulation
      await new Promise(resolve => setTimeout(resolve, 1100));
      console.log(`POST /conductor/scan payload: ${scanPayload} for Trip ${activeTripId}`);

      const cleanedPayload = scanPayload.toUpperCase();
      
      if (cleanedPayload.includes('VALID') || cleanedPayload.includes('NIG-') || cleanedPayload.includes('TKT-')) {
        const simulatedTicketId = cleanedPayload.includes('NIG-') ? cleanedPayload : `NIG-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Find if this QR matches any ticket in user_booked_tickets
        const bookedTicketsJSON = localStorage.getItem('user_booked_tickets');
        const bookedTickets = bookedTicketsJSON ? JSON.parse(bookedTicketsJSON) : [];
        
        // Match either the full reference code (e.g. TKT-LIVE-1234567) or the generated ref code
        const matchedTicket = bookedTickets.find((t: any) => 
          cleanedPayload.includes(t.ref.toUpperCase()) || 
          cleanedPayload.includes(t.id.toUpperCase())
        );

        let seatsScanned = 2; // default simulated seats
        let passengerName = 'Barath'; // Default name of user
        let targetBusNo = activeNumberPlate || 'TN-39-AA-1122';
        let boardingPt = boardingStop || 'Old Bus Stand';
        let destPt = destinationStop || 'New Bus Stand';

        if (matchedTicket) {
          seatsScanned = matchedTicket.seats;
          passengerName = 'Barath'; // User name
          targetBusNo = matchedTicket.busNo;
          boardingPt = matchedTicket.from;
          destPt = matchedTicket.to;

          // Update ticket status to Boarded
          matchedTicket.status = 'Boarded';
          localStorage.setItem('user_booked_tickets', JSON.stringify(bookedTickets));
        }

        // Update bus occupancy in localStorage
        const occupanciesSaved = localStorage.getItem('bus_occupancies');
        const occupancies = occupanciesSaved ? JSON.parse(occupanciesSaved) : {};
        const normalizedBusKey = targetBusNo.replace(/[^A-Z0-9]/ig, '').toUpperCase();

        const currentCount = occupancies[normalizedBusKey] !== undefined ? occupancies[normalizedBusKey] : 12;
        // Increment occupancy by the number of seats on the ticket
        const newCount = Math.min(50, currentCount + seatsScanned);
        occupancies[normalizedBusKey] = newCount;
        localStorage.setItem('bus_occupancies', JSON.stringify(occupancies));
        window.dispatchEvent(new Event('storage'));

        setScanResult({
          valid: true,
          ticket_info: {
            ticket_id: matchedTicket ? matchedTicket.ref : simulatedTicketId,
            origin: boardingPt,
            destination: destPt,
            seats: seatsScanned,
            status: 'BOARDED',
            passenger_name: passengerName,
            newOccupancy: newCount
          }
        });
        toast.success('Ticket Scanned & Validated!');
      } else if (cleanedPayload.includes('EXPIRED')) {
        setScanResult({
          valid: false,
          reason: 'Ticket expired. Validity expired 2 hours ago.'
        });
        toast.error('Invalid Ticket: Expired');
      } else if (cleanedPayload.includes('WRONGBUS')) {
        setScanResult({
          valid: false,
          reason: 'Wrong Route. This ticket is registered for Route 45: Coimbatore - Ukkadam.'
        });
        toast.error('Invalid Ticket: Wrong Bus/Route');
      } else {
        setScanResult({
          valid: false,
          reason: 'Invalid Signature. Security token validation failed.'
        });
        toast.error('Verification failed: Security warning');
      }
      
      setCurrentView('SCAN_RESULT');
    } catch (err) {
      toast.error('Verification scan failed.');
    } finally {
      setScanLoading(false);
    }
  };

  // 5. End Trip Action Flow
  const handleEndTrip = () => {
    setShowEndTripConfirm(true);
  };

  const confirmEndTrip = async () => {
    setShowEndTripConfirm(false);
    try {
      console.log(`POST /conductor/trip/end for Trip ${activeTripId}`);
      toast.info('Closing session and resetting GPS loop...');
      
      // Clear ONLY the active trip ID from localStorage and state
      localStorage.removeItem('conductor_trip_id');
      setActiveTripId(null);

      toast.success('Trip successfully completed. You can now start a new trip.');
      setCurrentView('LOGIN');
    } catch (err) {
      toast.error('Failed to close active session.');
    }
  };

  // Complete Logout Action
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('conductor_jwt');
    localStorage.removeItem('conductor_bus_id');
    localStorage.removeItem('conductor_route_name');
    localStorage.removeItem('conductor_number_plate');
    localStorage.removeItem('conductor_trip_id');
    localStorage.removeItem('conductor_id');
    localStorage.removeItem('conductor_name');
    localStorage.removeItem('conductor_tickets_list');

    setJwt(null);
    setActiveBusId(null);
    setActiveRouteName(null);
    setActiveNumberPlate(null);
    setActiveTripId(null);
    setActiveConductorId(null);
    setScannedConductorId(null);
    setScannedConductorName(null);
    setIsConductorAuthorized(null);
    setTicketsToday([]);
    setTempSelectedBus(null);

    toast.success('Successfully logged out.');
    setCurrentView('LOGIN');
  };

  const confirmClearHistory = () => {
    setShowClearHistoryConfirm(false);
    saveTicketsToStorage([]);
    toast.success('Sales log cleared');
  };

  // Filtered bus list based on plate or route name search query
  const filteredBuses = BUS_FLEET.filter(bus => 
    bus.number_plate.toLowerCase().includes(searchBusQuery.toLowerCase()) || 
    bus.route_name.toLowerCase().includes(searchBusQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased text-slate-800">
      
      {/* HEADER NAV */}
      <header className="bg-gradient-to-r from-[#0D2A5D] to-[#0a2149] text-white py-2.5 px-4 shadow-md shrink-0 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#D97F00] rounded-lg text-white shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/favicon.jpeg" className="w-full h-full object-cover" alt="Logo" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight leading-none flex items-center gap-1.5">
                {t('app.name')} 
                <span className="text-[9px] font-black tracking-wider text-white bg-orange-950/40 border border-[#D97F00]/50 px-1.5 py-0.5 rounded">
                  CON
                </span>
              </h1>
              <p className="text-[10px] text-slate-300 font-extrabold tracking-wider uppercase mt-0.5">
                {activeNumberPlate ? activeNumberPlate : 'Conductor Terminal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Lang Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 py-1.5 px-2.5 bg-slate-800 text-slate-200 font-extrabold text-[10px] rounded-lg hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
              >
                <Globe size={11} />
                <span>{language}</span>
                <ChevronDown size={10} className={`transition-transform duration-250 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 bg-slate-900 border border-slate-700 shadow-2xl z-50 w-32 overflow-hidden rounded-xl"
                  >
                    {[
                      { id: 'EN', name: 'English' },
                      { id: 'TA', name: 'தமிழ்' }
                    ].map((lang) => (
                      <button 
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id as any);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left py-2.5 px-4 text-xs font-bold ${language === lang.id ? 'bg-[#D97F00] text-white font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} transition-colors`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sales & Revenue Analytics Button */}
            {jwt && (
              <button 
                onClick={() => setIsAnalyticsModalOpen(true)}
                className="p-2 bg-slate-800/80 hover:bg-[#D97F00] hover:text-white text-slate-300 border border-slate-700 rounded-lg transition-all shadow-sm flex items-center justify-center"
                title="Sales & Revenue Analytics"
              >
                <BarChart3 size={15} />
              </button>
            )}

            {/* Logout button */}
            {jwt && (
              <button 
                onClick={handleLogout}
                className="p-2 bg-slate-800/80 hover:bg-rose-950 hover:text-rose-400 text-slate-300 border border-slate-700 rounded-lg transition-all shadow-sm"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE MOBILE CONTAINER FRAME */}
      <main className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-start">
        
        {/* STEPS TIMELINE FOR SETUP */}
        {['LOGIN', 'SELECT_BUS', 'CONDUCTOR_DETAILS'].includes(currentView) && (
          <div className="mb-6 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between">
              {[
                { key: 'LOGIN', label: 'Auth' },
                { key: 'SELECT_BUS', label: 'Assign Bus' },
                { key: 'CONDUCTOR_DETAILS', label: 'Duty Code' }
              ].map((step, idx, arr) => {
                const viewOrder = ['LOGIN', 'SELECT_BUS', 'CONDUCTOR_DETAILS', 'TRIP_HOME'];
                const currentIdx = viewOrder.indexOf(currentView);
                const stepIdx = viewOrder.indexOf(step.key);
                const isCompleted = stepIdx < currentIdx;
                const isActive = step.key === currentView;

                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : isActive 
                            ? 'bg-[#D97F00] text-white ring-4 ring-orange-100 shadow-md scale-110' 
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[11px] font-extrabold uppercase tracking-wider mt-2 transition-colors duration-300 ${
                        isActive ? 'text-[#D97F00]' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-[2px] flex-1 -mt-5 transition-colors duration-300 ${
                        stepIdx < currentIdx ? 'bg-emerald-600' : 'bg-slate-100'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {currentView === 'LOGIN' && 'Please authenticate to access the Conductor Terminal'}
                {currentView === 'SELECT_BUS' && 'Search and register your current assigned vehicle'}
                {currentView === 'CONDUCTOR_DETAILS' && 'Enter your employee identity code to activate GPS tracking'}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* 1.1 SINGLE-SCREEN LOGIN & REGISTRATION */}
          {currentView === 'LOGIN' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-6"
            >
              <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-indigo-50 text-[#0D2A5D] border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <User size={24} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Duty Authorization</h2>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Nigazhthisai Conductor Portal</p>
              </div>

              <form onSubmit={handleStartDutyTrip} className="space-y-6">
                {/* QR SCAN ONLY LOGIN MODULE */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <QrCode size={14} className="text-[#0D2A5D]" /> Trip Console QR Verification
                  </label>

                  {!tempSelectedBus ? (
                    /* Bus not selected: Show Scan QR action box */
                    <button
                      type="button"
                      onClick={() => setIsBusQrModalOpen(true)}
                      className="w-full p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-4 active:scale-[0.99] group text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#0D2A5D] flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform shadow-xs">
                        <QrCode size={28} className="animate-pulse" />
                      </div>
                      <div className="max-w-[280px]">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Scan Bus Console QR</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-relaxed">
                          Scan the dynamic QR code displayed on your assigned vehicle's console to authorize your duty trip.
                        </p>
                      </div>
                      <span className="mt-1 px-4 py-2 bg-[#0D2A5D] hover:bg-[#0a2149] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xs transition-colors">
                        Scan Console QR
                      </span>
                    </button>
                  ) : (
                    /* Bus selected: Show authorization verification status card */
                    <div className="space-y-4">
                      {/* Vehicle Pair Details Card */}
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs relative overflow-hidden">
                        <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                          VEHICLE INFORMATION
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-[#0D2A5D] text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-xs shrink-0">
                            {tempSelectedBus.number_plate}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate leading-tight">
                              {tempSelectedBus.route_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-bold uppercase">
                          <span>Route Stops: {tempSelectedBus.stops?.length || 0}</span>
                          <button
                            type="button"
                            onClick={() => setIsBusQrModalOpen(true)}
                            className="text-[#D97F00] hover:underline"
                          >
                            Rescan Console
                          </button>
                        </div>
                      </div>

                      {/* Conductor Authorization Status Badge */}
                      {isConductorAuthorized === true ? (
                        <div className="bg-emerald-50/60 border border-emerald-500/20 p-4 rounded-2xl space-y-2 shadow-xs relative overflow-hidden">
                          <div className="absolute right-3 top-3 text-emerald-600/10">
                            <CheckCircle2 size={40} />
                          </div>
                          <p className="text-[9px] font-black tracking-widest text-emerald-700 uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            AUTHORIZATION GRANTED
                          </p>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                              {scannedConductorName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Staff ID: {scannedConductorId}
                            </p>
                          </div>
                          <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider pt-1 border-t border-emerald-500/10">
                            Scheduled duty shift validated. GPS and ticketing systems ready.
                          </p>
                        </div>
                      ) : isConductorAuthorized === false ? (
                        <div className="bg-rose-50/60 border border-rose-500/20 p-4 rounded-2xl space-y-2 shadow-xs relative overflow-hidden">
                          <div className="absolute right-3 top-3 text-rose-600/10">
                            <XCircle size={40} />
                          </div>
                          <p className="text-[9px] font-black tracking-widest text-rose-700 uppercase flex items-center gap-1.5">
                            ✕ ACCESS DENIED
                          </p>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                              UNAUTHORIZED OPERATOR
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              No scheduling match found
                            </p>
                          </div>
                          <p className="text-[9px] text-rose-700 font-bold uppercase tracking-wider pt-1 border-t border-rose-500/10 leading-relaxed">
                            Access credentials rejected. Please scan the QR code of your assigned vehicle console or contact dispatch.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50/60 border border-amber-500/20 p-4 rounded-2xl space-y-2 shadow-xs flex items-center gap-3">
                          <Loader2 className="animate-spin text-amber-600" size={16} />
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase">Verifying Schedule...</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Querying Nigazhthisai dispatch roster</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button 
                  type="submit"
                  disabled={startDutyLoading || !tempSelectedBus || isConductorAuthorized !== true}
                  className="w-full py-4 bg-[#0D2A5D] hover:bg-[#0a2149] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all rounded-xl shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98]"
                >
                  {startDutyLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Initializing Duty...
                    </>
                  ) : (
                    'Activate Duty Trip'
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* 2. TRIP HOME SCREEN (MAIN CONDUCTOR TERMINAL) */}
          {currentView === 'TRIP_HOME' && (
            <motion.div
              key="trip-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5 w-full"
            >
              {/* HEADER TRIP BOARD */}
              <div className="bg-gradient-to-br from-[#0D2A5D] to-[#06132b] text-white p-6 rounded-3xl shadow-lg space-y-4 relative overflow-hidden border border-slate-800">
                <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                  <Navigation size={140} />
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="px-3 py-1 bg-[#D97F00] text-white text-xs font-extrabold uppercase tracking-widest rounded-lg border border-orange-500 shadow-sm">
                    {activeNumberPlate}
                  </span>
                  <span className="text-xs font-mono font-black text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-900/30">
                    TRIP: {activeTripId}
                  </span>
                </div>
                <div className="space-y-1 relative z-10 pt-2">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">ACTIVE ROUTE RUN</p>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white leading-snug">{activeRouteName}</h2>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300 border-t border-white/10 pt-4 relative z-10 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-[#D97F00]" /> Conductor {activeConductorId}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Active Trip Run
                  </span>
                </div>
              </div>

              {/* STATS SMALL CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between min-h-[110px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Ticket size={12} className="text-[#D97F00]" /> Tickets Today
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-3xl font-black text-slate-900">{totalTicketsCount}</span>
                    <span className="text-xs text-slate-400 font-extrabold uppercase">Issued</span>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between min-h-[110px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-600" /> Revenue Today
                  </p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-sm text-slate-500 font-extrabold">₹</span>
                    <span className="text-3xl font-black text-slate-900">{totalRevenueSum}</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase ml-1.5 bg-emerald-50 px-1.5 py-0.5 rounded-md">Cash</span>
                  </div>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <button 
                  onClick={() => setCurrentView('ISSUE_TICKET')}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 rounded-2xl shadow-md transition-all border border-emerald-500"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Issue Ticket
                </button>

                <button 
                  onClick={() => {
                    setScanPayload('');
                    setCurrentView('SCAN_QR');
                  }}
                  className="w-full py-5 bg-[#0D2A5D] hover:bg-[#0a2149] active:scale-[0.98] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 rounded-2xl shadow-md transition-all"
                >
                  <QrCode size={18} />
                  Scan QR Ticket
                </button>
              </div>

              {/* TRIP HISTORY & END TRIP PANEL */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <button 
                  onClick={() => setCurrentView('TRIP_HISTORY')}
                  className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 active:scale-[0.98] text-slate-700 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all"
                >
                  <History size={15} />
                  Trip History
                </button>

                <button 
                  onClick={handleEndTrip}
                  className="w-full py-3.5 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] text-rose-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all"
                >
                  <XCircle size={15} />
                  End Trip
                </button>
              </div>
            </motion.div>
          )}

          {/* 3.1 ISSUE TICKET FORM */}
          {currentView === 'ISSUE_TICKET' && (
            <motion.div
              key="issue-ticket"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full bg-white border border-slate-150 p-6 shadow-md rounded-3xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button 
                  onClick={() => setCurrentView('TRIP_HOME')}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-[#0D2A5D]">
                  New Ticket
                </span>
              </div>

              <form onSubmit={handleIssueTicket} className="space-y-4">
                {/* Boarding Stop Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={13} className="text-[#0D2A5D]" /> Boarding Stop
                  </label>
                  <div className="relative">
                    <select
                      value={boardingStop}
                      onChange={(e) => setBoardingStop(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D97F00] focus:bg-white cursor-pointer rounded-xl transition-all"
                    >
                      {activeBusStops.map((stop, idx) => (
                        <option key={idx} value={stop}>{stop}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination Stop Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={13} className="text-[#D97F00] animate-bounce" /> Destination Stop
                  </label>
                  <div className="relative">
                    <select
                      value={destinationStop}
                      onChange={(e) => setDestinationStop(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D97F00] focus:bg-white cursor-pointer rounded-xl transition-all"
                    >
                      {activeBusStops.map((stop, idx) => (
                        <option key={idx} value={stop}>{stop}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Passengers Count (Stepper 1-5) */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Passengers
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-[48px] bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                        className="w-14 h-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-lg transition-colors border-r border-slate-200"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-black text-base text-slate-900 select-none">
                        {passengersCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPassengersCount(Math.min(5, passengersCount + 1))}
                        className="w-14 h-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-lg transition-colors border-l border-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Ticket Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Ticket Type
                    </label>
                    <select
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D97F00] focus:bg-white cursor-pointer h-[48px] rounded-xl transition-all"
                    >
                      <option value="REGULAR">Regular</option>
                      <option value="STUDENT">Student (50%)</option>
                      <option value="CONCESSION">Concession</option>
                    </select>
                  </div>
                </div>

                {/* Fare Preview Display */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl mt-2 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Fare Breakdown</p>
                    <p className="text-xs text-slate-700 font-extrabold uppercase mt-0.5 leading-tight">
                      {boardingStop} ➜ {destinationStop}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{passengersCount} × {ticketType} Rate</p>
                  </div>
                  <div className="text-right">
                    {previewLoading ? (
                      <Loader2 className="animate-spin text-[#D97F00] inline-block" size={24} />
                    ) : farePreview !== null ? (
                      <p className="text-3xl font-black text-[#D97F00]">₹{farePreview}</p>
                    ) : (
                      <p className="text-xs text-rose-500 font-black uppercase">Invalid Stops</p>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={farePreview === null || issueLoading}
                  className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest transition-all rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {issueLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Issuing Ticket...
                    </>
                  ) : (
                    'Issue Ticket (Cash)'
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* 3.3 TICKET CONFIRMATION RECEIPT */}
          {currentView === 'TICKET_CONFIRMATION' && lastIssuedTicket && (
            <motion.div
              key="ticket-confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full space-y-5"
            >
              {/* Receipt Wrapper with custom border details */}
              <div className="bg-white border-2 border-dashed border-slate-300 p-6 shadow-md rounded-3xl relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Visual side punches */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-100 border-r border-slate-300 rounded-full transform -translate-y-1/2" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-100 border-l border-slate-300 rounded-full transform -translate-y-1/2" />

                <div className="text-center pb-4 border-b border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                    <CheckCircle2 size={26} />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-widest text-[#0D2A5D]">
                    Nigazhthisai E-Ticket
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">
                    TICKET ID: <span className="font-mono text-slate-800 font-black">{lastIssuedTicket.ticket_id}</span>
                  </p>
                </div>

                <div className="py-4 space-y-4 text-xs">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">Bus & Route</span>
                    <span className="text-slate-700 font-black text-right max-w-[200px] leading-tight text-sm">
                      {activeNumberPlate} • {activeRouteName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center gap-4 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">Boarding Stop</span>
                    <span className="text-slate-800 font-black text-sm">{lastIssuedTicket.origin_name}</span>
                  </div>

                  <div className="flex justify-between items-center gap-4 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">Destination Stop</span>
                    <span className="text-slate-800 font-black text-sm">{lastIssuedTicket.destination_name}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-b border-slate-200/60 py-4 my-2.5 bg-slate-50 rounded-2xl px-3.5 shadow-xs">
                    <div>
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider block">Quantity & Class</span>
                      <span className="text-slate-800 font-black text-sm uppercase">
                        {lastIssuedTicket.seats} Passenger{lastIssuedTicket.seats > 1 ? 's' : ''} ({lastIssuedTicket.ticket_type})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider block">Fare Paid</span>
                      <span className="text-xl font-black text-[#D97F00]">₹{lastIssuedTicket.fare}.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 font-extrabold uppercase tracking-wider pt-1">
                    <span>Date: {lastIssuedTicket.date}</span>
                    <span>Time: {lastIssuedTicket.issued_at}</span>
                  </div>
                </div>

                {/* MOCK ETM PRINTER BOX */}
                <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Printer size={14} className="text-[#D97F00]" />
                    ETM Printer Protocol
                  </div>
                  <p className="text-xs text-slate-300 leading-normal font-bold uppercase">
                    Connects directly to onboard printer. Supports thermal roll output.
                  </p>
                  
                  {/* Android ETM Device Printer trigger link */}
                  <button
                    type="button"
                    onClick={() => {
                      console.log("ETM Thermal Printer command triggered: printing ticket", lastIssuedTicket);
                      toast.success('ETM Print instruction sent to hardware', { icon: '🖨️' });
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-[#D97F00] hover:text-orange-300 font-black text-xs uppercase tracking-wider transition-colors border border-slate-700 rounded-xl"
                  >
                    Simulate Paper Print
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setPassengersCount(1);
                  setTicketType('REGULAR');
                  setCurrentView('TRIP_HOME');
                }}
                className="w-full py-4.5 bg-[#0D2A5D] hover:bg-[#0a2149] text-white font-black text-sm uppercase tracking-widest shadow-md transition-colors text-center rounded-xl active:scale-[0.98]"
              >
                Done (New Ticket)
              </button>
            </motion.div>
          )}

          {/* 4.1 SCAN QR CODE SCREEN */}
          {currentView === 'SCAN_QR' && (
            <motion.div
              key="scan-qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full bg-white border border-slate-150 p-6 shadow-md rounded-3xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button 
                  onClick={() => setCurrentView('TRIP_HOME')}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-[#0D2A5D]">
                  Validator
                </span>
              </div>

              {/* CAMERA VIEWFINDER OVERLAY */}
              <div className="relative w-full aspect-square bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-slate-800 rounded-3xl shadow-inner">
                {/* Viewfinder brackets */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#D97F00] rounded-tl-xl" />
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#D97F00] rounded-tr-xl" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#D97F00] rounded-bl-xl" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#D97F00] rounded-br-xl" />

                {/* Laser scan line anim */}
                <div className="absolute left-0 right-0 h-0.5 bg-orange-400 shadow-[0_0_12px_rgba(217,127,0,0.8)] top-1/4 animate-[bounce_2s_infinite]" />

                <div className="text-center p-6 space-y-2 z-10 bg-slate-950/80 backdrop-blur-xs max-w-xs border border-slate-800 rounded-2xl">
                  <QrCode size={40} className="mx-auto text-[#D97F00] animate-pulse" />
                  <p className="text-sm font-black text-white uppercase tracking-tight">Camera Feed Simulator</p>
                  <p className="text-[10px] text-slate-400 font-extrabold leading-relaxed uppercase">
                    In actual operation, ETM camera or infrared laser scan module handles instantaneous reads.
                  </p>
                </div>
              </div>

              {/* INPUT FORM FOR PAYLOAD */}
              <form onSubmit={handleScanQR} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Manual Ticket QR Payload Input
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. TKT-VALID-12345"
                      value={scanPayload}
                      onChange={(e) => setScanPayload(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D97F00] focus:bg-white rounded-xl transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={scanLoading}
                      className="py-3 px-6 bg-[#0D2A5D] hover:bg-[#0a2149] text-white font-black text-xs uppercase tracking-widest transition-colors rounded-xl shadow-sm"
                    >
                      {scanLoading ? '...' : 'Scan'}
                    </button>
                  </div>
                </div>

                {/* SIMULATOR QUICK PRESET SHORTCUTS */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Quick-Test Simulators
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 text-xs font-black uppercase tracking-wider text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setScanPayload('TKT-VALID-NIG849204');
                        toast.success('Preset Selected: Valid QR');
                      }}
                      className="py-3 px-2 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      Valid Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScanPayload('TKT-EXPIRED-NIG582049');
                        toast.success('Preset Selected: Expired QR');
                      }}
                      className="py-3 px-2 bg-rose-50 text-rose-800 border-2 border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      Expired Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScanPayload('TKT-WRONGBUS-NIG901048');
                        toast.success('Preset Selected: Wrong Bus QR');
                      }}
                      className="py-3 px-2 bg-amber-50 text-amber-800 border-2 border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                    >
                      Wrong Route
                    </button>
                  </div>
                </div>

                {/* DYNAMIC BOOKED PASSENGER TICKETS DETECTOR */}
                {(() => {
                  const saved = localStorage.getItem('user_booked_tickets');
                  const booked = saved ? JSON.parse(saved) : [];
                  const pendingBooked = booked.filter((t: any) => t.status === 'Pending' || t.status === 'Paid');
                  
                  if (pendingBooked.length === 0) return null;
                  
                  return (
                    <div className="space-y-2 pt-3 border-t border-slate-100 mt-2">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        Scannable Live Passenger Tickets ({pendingBooked.length})
                      </p>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {pendingBooked.map((ticket: any) => (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => {
                              setScanPayload(ticket.ref);
                              toast.success(`Loaded Ticket: ${ticket.ref} (${ticket.from} ➜ ${ticket.to})`);
                            }}
                            className="w-full p-2.5 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-950 border border-indigo-150 rounded-xl flex items-center justify-between text-left transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-black uppercase tracking-tight flex items-center gap-1.5">
                                <span className="font-mono text-indigo-700">{ticket.ref}</span>
                                <span className="text-[9px] text-indigo-400">• {ticket.seats} Seats ({ticket.seatNo})</span>
                              </p>
                              <p className="text-[10px] font-extrabold text-slate-500 truncate uppercase mt-0.5">
                                {ticket.from} ➜ {ticket.to}
                              </p>
                            </div>
                            <span className="text-[9px] font-black text-indigo-600 bg-white border border-indigo-200 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ml-2">
                              LOAD TICKET
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </form>
            </motion.div>
          )}

          {/* 4.2 SCAN RESULT DISPLAY */}
          {currentView === 'SCAN_RESULT' && scanResult && (
            <motion.div
              key="scan-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              {scanResult.valid ? (
                /* VALID TICKET SCREEN */
                <div className="bg-white border-2 border-emerald-200 p-8 shadow-md text-center space-y-6 rounded-3xl">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                    <CheckCircle2 size={44} />
                  </div>

                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest rounded-lg border border-emerald-200">
                      VALID BOARDING TICKET
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-4">
                      Access Authorized
                    </h3>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-5 text-sm space-y-3.5 text-left font-semibold rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">Ticket Code</span>
                      <span className="text-slate-800 font-black font-mono">{scanResult.ticket_info.ticket_id}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">Passenger</span>
                      <span className="text-slate-800 font-black text-sm">{scanResult.ticket_info.passenger_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">Route Bound</span>
                      <span className="text-slate-800 font-black text-right max-w-[200px] text-xs">
                        {scanResult.ticket_info.origin} ➜ {scanResult.ticket_info.destination}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-150 pt-2.5">
                      <span className="text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">Allowed Seats</span>
                      <span className="text-emerald-700 font-black text-sm">{scanResult.ticket_info.seats} Seats Registered</span>
                    </div>
                    {scanResult.ticket_info.newOccupancy !== undefined && (
                      <div className="border-t border-slate-150 pt-2.5 bg-slate-50/75 -mx-5 px-5 py-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#0D2A5D] uppercase text-[10px] tracking-wider font-black">Updated Occupancy</span>
                          <span className="text-[#0D2A5D] font-black text-sm">{scanResult.ticket_info.newOccupancy}/50 Seats Filled</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full ${getProgressBarClass(scanResult.ticket_info.newOccupancy)} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, (scanResult.ticket_info.newOccupancy / 50) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => setCurrentView('TRIP_HOME')}
                      className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest transition-colors rounded-xl"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setScanPayload('');
                        setCurrentView('SCAN_QR');
                      }}
                      className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest transition-colors rounded-xl shadow-xs"
                    >
                      Scan Next
                    </button>
                  </div>
                </div>
              ) : (
                /* INVALID TICKET SCREEN */
                <div className="bg-white border-2 border-rose-200 p-8 shadow-md text-center space-y-6 rounded-3xl">
                  <div className="w-20 h-20 bg-rose-50 text-rose-600 border-2 border-rose-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <XCircle size={44} />
                  </div>

                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-widest rounded-lg border border-rose-200">
                      TICKET VALIDATION REJECTED
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-4">
                      Access Denied
                    </h3>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-150 p-5 text-sm space-y-3.5 text-left text-slate-700 font-semibold rounded-2xl">
                    <div className="flex items-start gap-3 text-rose-800">
                      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black uppercase text-[10px] tracking-wider">Failure Reason</p>
                        <p className="mt-1 leading-relaxed text-slate-800 font-extrabold text-sm">
                          {scanResult.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => setCurrentView('TRIP_HOME')}
                      className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest transition-colors rounded-xl"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setScanPayload('');
                        setCurrentView('SCAN_QR');
                      }}
                      className="py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest transition-colors rounded-xl shadow-xs"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 5. TRIP HISTORY SCREEN */}
          {currentView === 'TRIP_HISTORY' && (
            <motion.div
              key="trip-history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full bg-white border border-slate-150 p-6 shadow-md rounded-3xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button 
                  onClick={() => setCurrentView('TRIP_HOME')}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-[#0D2A5D]">
                  Duty Logs
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                  Today's Cash Tickets
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  ACTIVE TRIP HISTORY: {activeTripId}
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {ticketsToday.length > 0 ? (
                  ticketsToday.map((ticket, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-slate-50 border border-slate-200 flex items-center justify-between rounded-2xl shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                            {ticket.ticket_id}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{ticket.issued_at}</span>
                        </div>
                        <p className="text-xs font-black text-slate-850 leading-tight">
                          {ticket.origin_name} ➜ {ticket.destination_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                          {ticket.seats} Seat{ticket.seats > 1 ? 's' : ''} ({ticket.ticket_type})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-slate-900">₹{ticket.fare}</p>
                        <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded-md">CASH</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      No tickets issued yet
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                      Tap 'Issue Ticket' to dispatch cash fares
                    </p>
                  </div>
                )}
              </div>

              {ticketsToday.length > 0 && (
                <button
                  onClick={() => setShowClearHistoryConfirm(true)}
                  className="w-full mt-2 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-black text-xs uppercase tracking-widest transition-colors border border-rose-200 text-center rounded-xl"
                >
                  Clear Log Data
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER SYSTEM DETAILS */}
      <footer className="bg-slate-50 py-3 px-4 border-t border-slate-150 shrink-0 text-center select-none">
        <div className="max-w-md mx-auto w-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Conductor Console • {jwt ? 'Online' : 'Offline'}</span>
        </div>
      </footer>

      {/* 6. MODALS & DIALOG OVERLAYS */}
      <AnimatePresence>
        {/* 6.1 BUS QR SCANNER MODAL */}
        {isBusQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-5 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#0D2A5D] to-[#0a2149] text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <QrCode size={20} className="text-[#D97F00]" />
                  <span className="text-xs font-black uppercase tracking-wider">Bus Console QR Scanner</span>
                </div>
                <button 
                  onClick={() => setIsBusQrModalOpen(false)}
                  className="text-slate-300 hover:text-white font-extrabold text-xs uppercase"
                >
                  Cancel
                </button>
              </div>

              <div className="p-5 flex-1 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Viewport simulation */}
                <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                  {/* Focus boxes */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#D97F00]" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#D97F00]" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#D97F00]" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#D97F00]" />

                  {/* Lens status indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">LENS ACT</span>
                  </div>

                  {busQrScanLoading ? (
                    <div className="text-center space-y-2 z-10">
                      <Loader2 className="animate-spin text-[#D97F00] mx-auto" size={24} />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Syncing QR Code...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5 z-10 px-4">
                      <QrCode size={30} className="mx-auto text-slate-400" />
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide">ALIGN BUS QR WITH LENS</p>
                    </div>
                  )}

                  {/* Scanning line animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-orange-400 shadow-[0_0_8px_rgba(217,127,0,0.8)] top-1/4 animate-[bounce_2.5s_infinite]" />
                </div>

                {/* Fleet list to choose from */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Bus to Simulate Scan</p>
                  
                  <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                    {BUS_FLEET.map((bus) => {
                      const authInfo = AUTHORIZED_MAP[bus.bus_id] || { id: 'COND-GEN-01', name: 'Authorized Staff' };
                      return (
                        <div key={bus.bus_id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[#0D2A5D] text-[9px] font-black rounded-md uppercase tracking-wider">
                              {bus.number_plate}
                            </span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                              Roster Conductor: {authInfo.name}
                            </span>
                          </div>
                          
                          <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate leading-tight">
                            {bus.route_name}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50">
                            <button
                              type="button"
                              disabled={busQrScanLoading}
                              onClick={async () => {
                                setBusQrScanLoading(true);
                                setIsConductorAuthorized(null);
                                await new Promise(r => setTimeout(r, 1000));
                                setTempSelectedBus(bus);
                                setScannedConductorId(authInfo.id);
                                setScannedConductorName(authInfo.name);
                                setIsConductorAuthorized(true);
                                setBusQrScanLoading(false);
                                setIsBusQrModalOpen(false);
                                toast.success(`Successfully Verified: ${authInfo.name} Authorized for ${bus.number_plate}`);
                              }}
                              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100/80 active:scale-[0.98] text-emerald-700 text-[8px] font-black uppercase tracking-wider rounded-xl border border-emerald-100 text-center transition-all cursor-pointer"
                            >
                              Scan (Match)
                            </button>
                            <button
                              type="button"
                              disabled={busQrScanLoading}
                              onClick={async () => {
                                setBusQrScanLoading(true);
                                setIsConductorAuthorized(null);
                                await new Promise(r => setTimeout(r, 1000));
                                setTempSelectedBus(bus);
                                setScannedConductorId('COND-ERR-99');
                                setScannedConductorName('Unauthorized Employee');
                                setIsConductorAuthorized(false);
                                setBusQrScanLoading(false);
                                setIsBusQrModalOpen(false);
                                toast.error(`Verification Failed: Unauthorized conductor for ${bus.number_plate}`);
                              }}
                              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100/80 active:scale-[0.98] text-rose-700 text-[8px] font-black uppercase tracking-wider rounded-xl border border-rose-100 text-center transition-all cursor-pointer"
                            >
                              Scan (Mismatch)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 6.2 LOGOUT CONFIRMATION DIALOG */}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-5 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <LogOut size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Logout Terminal?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to log out from the Conductor Portal? All active duty session coordinates will be cleared.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 6.3 END TRIP CONFIRMATION DIALOG */}
        {showEndTripConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-5 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-orange-50 text-[#D97F00] border border-orange-100 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Complete Duty Run?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to end this duty trip? This will stop GPS telemetry broadcasts and complete your active shift.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <button
                  onClick={() => setShowEndTripConfirm(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndTrip}
                  className="py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors"
                >
                  Yes, End Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 6.4 CLEAR HISTORY CONFIRMATION DIALOG */}
        {showClearHistoryConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-5 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clear Sales Logs?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to clear your local ticket sales log? This will reset today's revenue indicator. (Active tickets remain valid).
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <button
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearHistory}
                  className="py-3 bg-[#0D2A5D] hover:bg-[#0a2149] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors"
                >
                  Yes, Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 6.5 SALES & REVENUE ANALYTICS MODAL */}
        {isAnalyticsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-0 md:p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-full md:max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0D2A5D] to-[#0a2149] text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={20} className="text-[#D97F00]" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider leading-none">Duty Sales & Analytics</h3>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">Nigazhthisai Conductor Portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAnalyticsModalOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-slate-50 text-left">
                
                {/* PART 0: DASHBOARD ONBOARDING GUIDE */}
                <div className="bg-gradient-to-r from-indigo-50 to-[#0D2A5D]/5 border border-indigo-100 p-4 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-[#0D2A5D] text-white rounded-md">
                      <TrendingUp size={12} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#0D2A5D]">Auditor & Conductor Help Guide</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed uppercase">
                    This analytics ledger tracks all passenger transactions issued by this terminal. Use this to audit cash registers, monitor student concession ratios, and review monthly target performance.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-indigo-500/10 text-[9px] font-bold uppercase tracking-wide text-indigo-900">
                    <div>
                      <span className="text-[#D97F00]">● DAILY TAB</span>
                      <p className="text-slate-400 font-semibold mt-0.5 normal-case">Verify cash in bag vs recorded daily ticket sum.</p>
                    </div>
                    <div>
                      <span className="text-indigo-600">● MONTHLY TAB</span>
                      <p className="text-slate-400 font-semibold mt-0.5 normal-case">Long-term travel metrics and concessions audit.</p>
                    </div>
                  </div>
                </div>

                {/* PART 1: DAILY PERFORMANCE SECTION */}
                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-[#0D2A5D]" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Daily Sales Audit</h4>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Single-day shift records</p>
                      </div>
                    </div>
                    
                    {/* Date Selector Dropdown */}
                    <select
                      value={selectedDateFilter}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                      className="text-[11px] font-black text-[#D97F00] bg-orange-50 border border-orange-100 px-2 py-1.5 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#D97F00]"
                    >
                      {uniqueDates.length > 0 ? (
                        uniqueDates.map(date => (
                          <option key={date as string} value={date as string}>{date as string}</option>
                        ))
                      ) : (
                        <option value="Jul 15, 2026">Jul 15, 2026</option>
                      )}
                    </select>
                  </div>

                  {/* Daily Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center space-y-1">
                      <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Passenger Count</p>
                      <p className="text-2xl font-black text-[#0D2A5D]">{dailyTicketsSold}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">
                        Across {dailyTickets.length} transaction{dailyTickets.length === 1 ? '' : 's'}
                      </p>
                      <div className="text-[8px] text-slate-400 border-t border-slate-200/50 pt-1 mt-1 font-semibold leading-tight normal-case">
                        Number of passengers boarded on {selectedDateFilter}.
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center space-y-1">
                      <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Gross Revenue</p>
                      <p className="text-2xl font-black text-emerald-600">₹{dailyRevenue}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Cash / UPI hybrid</p>
                      <div className="text-[8px] text-slate-400 border-t border-slate-200/50 pt-1 mt-1 font-semibold leading-tight normal-case">
                        Total funds collected on this date.
                      </div>
                    </div>
                  </div>

                  {/* Simulated Payment Split */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Mode Distribution</p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div style={{ backgroundColor: '#0D2A5D' }} className="h-full w-[60%]" title="Digital / UPI" />
                      <div style={{ backgroundColor: '#D97F00' }} className="h-full w-[40%]" title="Hard Cash" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1"><span style={{ backgroundColor: '#0D2A5D' }} className="w-1.5 h-1.5 rounded-full" /> Digital UPI (60%): ₹{(dailyRevenue * 0.6).toFixed(0)}</span>
                      <span className="flex items-center gap-1"><span style={{ backgroundColor: '#D97F00' }} className="w-1.5 h-1.5 rounded-full" /> Cash register (40%): ₹{(dailyRevenue * 0.4).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* PART 2: MONTHLY PERFORMANCE & FILTER SECTION */}
                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Filter size={15} className="text-[#0D2A5D]" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Monthly Targets & KPIs</h4>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Aggregated performance trends</p>
                      </div>
                    </div>

                    {/* Monthly Filter Options */}
                    <select
                      value={selectedMonthFilter}
                      onChange={(e) => setSelectedMonthFilter(e.target.value)}
                      className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1.5 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      <option value="ALL">All Months</option>
                      {uniqueMonths.map(month => (
                        <option key={month as string} value={month as string}>{month as string}</option>
                      ))}
                    </select>
                  </div>

                  {/* Monthly Stats Summary */}
                  <div className="grid grid-cols-2 gap-3.5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-md">
                    <div className="space-y-0.5 text-left">
                      <p className="text-[8px] font-black tracking-widest text-indigo-200 uppercase">Monthly Tickets Issued</p>
                      <p className="text-xl font-black">{monthlyTicketsSold} <span className="text-xs font-bold text-indigo-300">seats</span></p>
                      <p className="text-[8px] text-indigo-200 uppercase font-extrabold">{monthlyTicketsFiltered.length} transactions</p>
                    </div>
                    <div className="border-l border-white/10 pl-3.5 space-y-0.5 text-left">
                      <p className="text-[8px] font-black tracking-widest text-emerald-300 uppercase">Monthly Revenue</p>
                      <p className="text-xl font-black text-emerald-400">₹{monthlyRevenue}</p>
                      <p className="text-[8px] text-slate-300 uppercase font-extrabold">Avg ₹{(monthlyRevenue / (monthlyTicketsFiltered.length || 1)).toFixed(0)} per ticket</p>
                    </div>
                  </div>

                  {/* Ticket Type Distribution (Horizontal Stacked Chart) */}
                  <div className="space-y-2 text-left">
                    <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Ticket Concession Categories Share</p>
                    
                    {/* Visual Bar */}
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div 
                        style={{ width: `${(regularCount / totalMonthlySeats) * 100}%` }} 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        title={`Regular: ${regularCount}`}
                      />
                      <div 
                        style={{ width: `${(studentCount / totalMonthlySeats) * 100}%` }} 
                        className="h-full bg-indigo-500 transition-all duration-500"
                        title={`Student: ${studentCount}`}
                      />
                      <div 
                        style={{ width: `${(concessionCount / totalMonthlySeats) * 100}%` }} 
                        className="h-full bg-orange-500 transition-all duration-500"
                        title={`Concession: ${concessionCount}`}
                      />
                    </div>

                    {/* Category breakdowns with currency & percentages */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1 font-black text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>REGULAR</span>
                        </div>
                        <p className="font-extrabold text-slate-800 text-[11px]">{regularCount} seats</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">₹{monthlyTicketsFiltered.filter(t => t.ticket_type === 'REGULAR').reduce((sum, t) => sum + t.fare, 0)}</p>
                      </div>
                      
                      <div className="text-left space-y-1 border-l border-slate-200 pl-2">
                        <div className="flex items-center gap-1 font-black text-indigo-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>STUDENT</span>
                        </div>
                        <p className="font-extrabold text-slate-800 text-[11px]">{studentCount} seats</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">₹{monthlyTicketsFiltered.filter(t => t.ticket_type === 'STUDENT').reduce((sum, t) => sum + t.fare, 0)}</p>
                      </div>

                      <div className="text-left space-y-1 border-l border-slate-200 pl-2">
                        <div className="flex items-center gap-1 font-black text-orange-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <span>CONCESS.</span>
                        </div>
                        <p className="font-extrabold text-slate-800 text-[11px]">{concessionCount} seats</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">₹{monthlyTicketsFiltered.filter(t => t.ticket_type === 'CONCESSION').reduce((sum, t) => sum + t.fare, 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* List of Tickets matching Month Filter */}
                  <div className="space-y-2 pt-2 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                        Filtered Audit Log ({monthlyTicketsFiltered.length} entries)
                      </p>
                      <span className="text-[9px] text-slate-400 font-black uppercase bg-slate-200 px-2 py-0.5 rounded-md">
                        {selectedMonthFilter === 'ALL' ? 'All Months' : selectedMonthFilter}
                      </span>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-left border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                      {monthlyTicketsFiltered.length > 0 ? (
                        monthlyTicketsFiltered.map((ticket, index) => (
                          <div 
                            key={index}
                            className="bg-white p-2.5 border border-slate-150 rounded-lg flex items-center justify-between shadow-xxs text-xs hover:border-indigo-200 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded uppercase">{ticket.ticket_id}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                  ticket.ticket_type === 'REGULAR' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  ticket.ticket_type === 'STUDENT' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                  'bg-orange-50 text-orange-700 border border-orange-100'
                                }`}>
                                  {ticket.ticket_type}
                                </span>
                              </p>
                              <p className="text-[10px] font-semibold text-slate-700 mt-1">
                                {ticket.origin_name} ➜ {ticket.destination_name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase">
                                Issued: {ticket.date} • {ticket.issued_at}
                              </p>
                            </div>
                            <div className="text-right space-y-0.5 shrink-0 ml-2">
                              <p className="font-extrabold text-slate-800 text-sm">₹{ticket.fare}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{ticket.seats} {ticket.seats === 1 ? 'passenger' : 'passengers'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          No transactions found
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Instructions */}
                <div className="bg-orange-50 border border-orange-100/50 p-4 rounded-xl flex items-start gap-3 text-left">
                  <Info size={16} className="text-[#D97F00] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] text-orange-950 font-black uppercase">Standard Audit Regulations</p>
                    <p className="text-[9px] text-orange-800 font-medium leading-relaxed uppercase">
                      1. Check passenger IDs for all Student or Concession discounted tickets.<br />
                      2. UPI payments should be cross-verified against terminal bank SMS alerts.<br />
                      3. Submit end-of-shift receipts to deposit physical cash collection bags.
                    </p>
                  </div>
                </div>

              </div>

              {/* Close Button */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex justify-end">
                <button
                  onClick={() => setIsAnalyticsModalOpen(false)}
                  className="w-full sm:w-auto py-2.5 px-6 bg-[#0D2A5D] hover:bg-[#0a2149] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors text-center"
                >
                  Close Analytics
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
