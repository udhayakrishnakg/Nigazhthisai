import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Search, 
  MapPin, 
  Ticket as TicketIcon, 
  User, 
  LogOut, 
  Navigation, 
  Menu, 
  Bell, 
  ArrowLeftRight, 
  ArrowLeft,
  ChevronRight, 
  Download,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  X,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Calendar,
  Sparkles,
  Info,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation, Language } from '../lib/i18n';
import { toast } from 'sonner';
import { 
  getActiveSOSForUser, 
  createSOSSession, 
  addSOSMessage, 
  getSOSSessions, 
  SOSSession 
} from '../lib/sos';

type View = 'HISTORY' | 'BUSES' | 'TICKETS' | 'BOOKING' | 'SUCCESS' | 'TRACKING';

const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 
  'Viluppuram', 'Virudhunagar'
];

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Erode': { lat: 11.3410, lng: 77.7172 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'Tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'Vellore': { lat: 12.9165, lng: 79.1325 },
  'Thanjavur': { lat: 10.7870, lng: 79.1378 },
  'Kanyakumari': { lat: 8.0883, lng: 77.5385 },
  'Dindigul': { lat: 10.3673, lng: 77.9803 },
  'Cuddalore': { lat: 11.7480, lng: 79.7714 },
  'Dharmapuri': { lat: 12.1211, lng: 78.1582 },
  'Kanchipuram': { lat: 12.8342, lng: 79.7036 },
  'Karur': { lat: 10.9601, lng: 78.0766 },
  'Krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'Nagapattinam': { lat: 10.7672, lng: 79.8444 },
  'Namakkal': { lat: 11.2189, lng: 78.1672 },
  'Nilgiris': { lat: 11.4102, lng: 76.6950 },
  'Pudukkottai': { lat: 10.3797, lng: 78.8214 },
  'Ramanathapuram': { lat: 9.3639, lng: 78.8395 },
  'Sivaganga': { lat: 9.8433, lng: 78.4809 },
  'Theni': { lat: 10.0104, lng: 77.4748 },
  'Thoothukudi': { lat: 8.7642, lng: 78.1348 },
  'Tiruppur': { lat: 11.1085, lng: 77.3411 },
  'Tiruvallur': { lat: 13.1384, lng: 79.9080 },
  'Tiruvannamalai': { lat: 12.2282, lng: 79.0734 },
  'Tiruvarur': { lat: 10.7712, lng: 79.6416 },
  'Viluppuram': { lat: 11.9398, lng: 79.4883 },
  'Virudhunagar': { lat: 9.5680, lng: 77.9624 },
  'Ariyalur': { lat: 11.1378, lng: 79.0747 },
  'Chengalpattu': { lat: 12.6841, lng: 79.9836 },
  'Kallakurichi': { lat: 11.7384, lng: 78.9639 },
  'Mayiladuthurai': { lat: 11.1018, lng: 79.6522 },
  'Ranipet': { lat: 12.9272, lng: 79.3327 },
  'Tenkasi': { lat: 8.9591, lng: 77.3139 },
  'Tirupathur': { lat: 12.4926, lng: 78.5678 }
};

const findClosestDistrict = (lat: number, lng: number): string => {
  let closestDistrict = 'Coimbatore';
  let minDistance = Infinity;

  Object.entries(DISTRICT_COORDINATES).forEach(([district, coords]) => {
    const distance = Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2);
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = district;
    }
  });

  return closestDistrict;
};

const STOPS_BY_DISTRICT: Record<string, string[]> = {
  'Ariyalur': ['Ariyalur Bus Stand', 'Jayamkondam', 'Sendurai', 'Andimadam'],
  'Chengalpattu': ['Chengalpattu', 'Maduranthakam', 'Tambaram', 'Vandalur'],
  'Chennai': [
    'Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Saidapet', 
    'Nandanam', 'T. Nagar', 'Central Railway Station', 'Egmore', 'Triplicane', 
    'Mylapore', 'Adyar', 'Thiruvanmiyur', 'Perungudi', 'Tambaram'
  ],
  'Coimbatore': [
    'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
    'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
    'Ukkadam', 'Podanur Junction', 'Eachanari', 'Kinathukadavu', 'Pollachi'
  ],
  'Cuddalore': ['Cuddalore', 'Chidambaram', 'Virudhachalam', 'Panruti'],
  'Dharmapuri': ['Dharmapuri', 'Harur', 'Pennagaram', 'Palacode'],
  'Dindigul': ['Dindigul', 'Palani', 'Kodaikanal', 'Oddanchatram'],
  'Erode': [
    'Central Bus Stand', 'GH Corner', 'Paneerselvam Park', 'Kalaimadu Silai', 'Karungalpalayam', 
    'Chithode', 'Bhavani', 'Perundurai', 'Thindal', 'Nasiyanur', 
    'Pallipalayam', 'Komarapalayam', 'Gobichettipalayam', 'Sathy', 'Anthiyur'
  ],
  'Kanchipuram': ['Kanchipuram', 'Sriperumbudur', 'Walajabad', 'Uthiramerur'],
  'Madurai': [
    'Mattuthavani', 'K.Pudur', 'Outpost', 'Goripalayam', 'Simmakkal', 
    'Periyar Bus Stand', 'Madurai Junction', 'Arapalayam', 'Kalavasal', 'Bypass Road', 
    'Pykara', 'Thirunagar', 'Tirumangalam', 'Kappalur', 'Austinpatti'
  ],
  'Salem': [
    'Salem New Bus Stand', 'Junction Road', 'Five Roads', 'Four Roads', 'Old Bus Stand', 
    'Ammapet', 'Ayothiyapattinam', 'Vazhapadi', 'Attur', 'Omalur', 
    'Karuppur', 'Steel Plant', 'Mettur Dam', 'Elampillai', 'Sankari'
  ],
  'Tirunelveli': ['Nellai Bus Stand', 'Palayamkottai', 'Ambasamudram', 'Valliyur'],
  'Tiruppur': [
    'Old Bus Stand', 'Pushpa Theatre', 'Kumar Nagar', 'New Bus Stand', 'Pandian Nagar', 
    'Pooluvapatti', 'Avinashi', 'Mangalam', 'Karuvampalayam', 'Veerapandi', 
    'Palladam', 'Pongalur', 'Koduvai', 'Dharapuram Road', 'Kangeyam'
  ],
  'Vellore': ['Green Circle', 'Katpadi', 'Gudiyatham', 'Pernambut'],
  'default': ['Main Bus Stand', 'Railway Station', 'Town Center', 'Market Stop']
};

export interface BusRoute {
  id: string;
  name: string;
  busNo: string;
  district: string;
  route: string[];
  type: 'AC' | 'NON-AC';
  timings: string;
}

export const DUMMY_BUSES: BusRoute[] = [
  // COIMBATORE: 5 buses
  {
    id: 'CBE-BUS-1',
    name: 'Coimbatore Fast Track (CBE1)',
    busNo: 'TN-37-BY-1111',
    district: 'Coimbatore',
    route: [
      'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
      'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
      'Ukkadam', 'Eachanari', 'Pollachi'
    ],
    type: 'NON-AC',
    timings: 'Every 15 mins'
  },
  {
    id: 'CBE-BUS-2',
    name: 'Pollachi Express (CBE2)',
    busNo: 'TN-37-BZ-2222',
    district: 'Coimbatore',
    route: [
      'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
      'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
      'Ukkadam', 'Eachanari', 'Pollachi'
    ],
    type: 'AC',
    timings: 'Every 30 mins'
  },
  {
    id: 'CBE-BUS-3',
    name: 'Coimbatore-Pollachi Deluxe (CBE3)',
    busNo: 'TN-37-CA-1234',
    district: 'Coimbatore',
    route: [
      'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
      'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
      'Ukkadam', 'Eachanari', 'Pollachi'
    ],
    type: 'AC',
    timings: 'Every 20 mins'
  },
  {
    id: 'CBE-BUS-4',
    name: 'Ukkadam Town Shuttle (CBE4)',
    busNo: 'TN-37-CB-5678',
    district: 'Coimbatore',
    route: [
      'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
      'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
      'Ukkadam', 'Eachanari', 'Pollachi'
    ],
    type: 'NON-AC',
    timings: 'Every 10 mins'
  },
  {
    id: 'CBE-BUS-5',
    name: 'Singanallur-Pollachi Link (CBE5)',
    busNo: 'TN-37-CC-9012',
    district: 'Coimbatore',
    route: [
      'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
      'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
      'Ukkadam', 'Eachanari', 'Pollachi'
    ],
    type: 'NON-AC',
    timings: 'Every 40 mins'
  },
  // MADURAI: 4 buses
  {
    id: 'MDU-BUS-1',
    name: 'Madurai City Rider (MDU1)',
    busNo: 'TN-59-CA-3333',
    district: 'Madurai',
    route: [
      'Mattuthavani', 'K.Pudur', 'Outpost', 'Goripalayam', 'Simmakkal', 
      'Periyar Bus Stand', 'Madurai Junction', 'Arapalayam', 'Kalavasal', 'Bypass Road', 
      'Thirunagar', 'Tirumangalam', 'Kappalur'
    ],
    type: 'NON-AC',
    timings: 'Every 10 mins'
  },
  {
    id: 'MDU-BUS-2',
    name: 'Tirumangalam Connector (MDU2)',
    busNo: 'TN-59-CB-4444',
    district: 'Madurai',
    route: [
      'Mattuthavani', 'K.Pudur', 'Outpost', 'Goripalayam', 'Simmakkal', 
      'Periyar Bus Stand', 'Madurai Junction', 'Arapalayam', 'Kalavasal', 'Bypass Road', 
      'Thirunagar', 'Tirumangalam', 'Kappalur'
    ],
    type: 'AC',
    timings: 'Every 20 mins'
  },
  {
    id: 'MDU-BUS-3',
    name: 'Madurai Bypass Flyer (MDU3)',
    busNo: 'TN-59-CC-7777',
    district: 'Madurai',
    route: [
      'Mattuthavani', 'K.Pudur', 'Outpost', 'Goripalayam', 'Simmakkal', 
      'Periyar Bus Stand', 'Madurai Junction', 'Arapalayam', 'Kalavasal', 'Bypass Road', 
      'Thirunagar', 'Tirumangalam', 'Kappalur'
    ],
    type: 'AC',
    timings: 'Every 15 mins'
  },
  {
    id: 'MDU-BUS-4',
    name: 'All-Stops Madurai Town (MDU4)',
    busNo: 'TN-59-CD-8888',
    district: 'Madurai',
    route: [
      'Mattuthavani', 'K.Pudur', 'Outpost', 'Goripalayam', 'Simmakkal', 
      'Periyar Bus Stand', 'Madurai Junction', 'Arapalayam', 'Kalavasal', 'Bypass Road', 
      'Thirunagar', 'Tirumangalam', 'Kappalur'
    ],
    type: 'NON-AC',
    timings: 'Every 8 mins'
  },
  // CHENNAI: 4 buses
  {
    id: 'MAS-BUS-1',
    name: 'Chennai Metro Connector (MAS1)',
    busNo: 'TN-01-DA-5555',
    district: 'Chennai',
    route: [
      'Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Saidapet', 
      'Nandanam', 'T. Nagar', 'Central Railway Station', 'Egmore', 
      'Mylapore', 'Adyar', 'Thiruvanmiyur', 'Tambaram'
    ],
    type: 'NON-AC',
    timings: 'Every 12 mins'
  },
  {
    id: 'MAS-BUS-2',
    name: 'Adyar Super Link (MAS2)',
    busNo: 'TN-01-DB-6666',
    district: 'Chennai',
    route: [
      'Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Saidapet', 
      'Nandanam', 'T. Nagar', 'Central Railway Station', 'Egmore', 
      'Mylapore', 'Adyar', 'Thiruvanmiyur', 'Tambaram'
    ],
    type: 'AC',
    timings: 'Every 25 mins'
  },
  {
    id: 'MAS-BUS-3',
    name: 'Koyambedu-Adyar Express (MAS3)',
    busNo: 'TN-01-DC-7788',
    district: 'Chennai',
    route: [
      'Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Saidapet', 
      'Nandanam', 'T. Nagar', 'Central Railway Station', 'Egmore', 
      'Mylapore', 'Adyar', 'Thiruvanmiyur', 'Tambaram'
    ],
    type: 'AC',
    timings: 'Every 15 mins'
  },
  {
    id: 'MAS-BUS-4',
    name: 'Chennai City Circular (MAS4)',
    busNo: 'TN-01-DD-9900',
    district: 'Chennai',
    route: [
      'Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Saidapet', 
      'Nandanam', 'T. Nagar', 'Central Railway Station', 'Egmore', 
      'Mylapore', 'Adyar', 'Thiruvanmiyur', 'Tambaram'
    ],
    type: 'NON-AC',
    timings: 'Every 10 mins'
  },
  // TIRUPPUR: 3 buses
  {
    id: 'TPR-BUS-1',
    name: 'Tiruppur Avinashi Link (TPR1)',
    busNo: 'TN-39-AA-1122',
    district: 'Tiruppur',
    route: [
      'Old Bus Stand', 'Pushpa Theatre', 'Kumar Nagar', 'New Bus Stand', 'Pandian Nagar', 
      'Avinashi', 'Mangalam', 'Karuvampalayam', 'Veerapandi', 
      'Palladam', 'Pongalur', 'Dharapuram Road', 'Kangeyam'
    ],
    type: 'NON-AC',
    timings: 'Every 15 mins'
  },
  {
    id: 'TPR-BUS-2',
    name: 'Palladam Express (TPR2)',
    busNo: 'TN-39-AB-3344',
    district: 'Tiruppur',
    route: [
      'Old Bus Stand', 'Pushpa Theatre', 'Kumar Nagar', 'New Bus Stand', 'Pandian Nagar', 
      'Avinashi', 'Mangalam', 'Karuvampalayam', 'Veerapandi', 
      'Palladam', 'Pongalur', 'Dharapuram Road', 'Kangeyam'
    ],
    type: 'AC',
    timings: 'Every 20 mins'
  },
  {
    id: 'TPR-BUS-3',
    name: 'Tiruppur Town Bus Local (TPR3)',
    busNo: 'TN-39-AC-5566',
    district: 'Tiruppur',
    route: [
      'Old Bus Stand', 'Pushpa Theatre', 'Kumar Nagar', 'New Bus Stand', 'Pandian Nagar', 
      'Avinashi', 'Mangalam', 'Karuvampalayam', 'Veerapandi', 
      'Palladam', 'Pongalur', 'Dharapuram Road', 'Kangeyam'
    ],
    type: 'NON-AC',
    timings: 'Every 12 mins'
  },
  // SALEM: 2 buses
  {
    id: 'SLM-BUS-1',
    name: 'Salem Attur Express (SLM1)',
    busNo: 'TN-30-AA-7788',
    district: 'Salem',
    route: [
      'Salem New Bus Stand', 'Junction Road', 'Five Roads', 'Four Roads', 'Old Bus Stand', 
      'Ammapet', 'Ayothiyapattinam', 'Vazhapadi', 'Attur', 'Omalur', 
      'Karuppur', 'Mettur Dam', 'Sankari'
    ],
    type: 'NON-AC',
    timings: 'Every 15 mins'
  },
  {
    id: 'SLM-BUS-2',
    name: 'Mettur Dam Special (SLM2)',
    busNo: 'TN-30-AB-9900',
    district: 'Salem',
    route: [
      'Salem New Bus Stand', 'Junction Road', 'Five Roads', 'Four Roads', 'Old Bus Stand', 
      'Ammapet', 'Ayothiyapattinam', 'Vazhapadi', 'Attur', 'Omalur', 
      'Karuppur', 'Mettur Dam', 'Sankari'
    ],
    type: 'AC',
    timings: 'Every 30 mins'
  },
  // ERODE: 2 buses
  {
    id: 'ERD-BUS-1',
    name: 'Bhavani Rider (ERD1)',
    busNo: 'TN-33-AA-1122',
    district: 'Erode',
    route: [
      'Central Bus Stand', 'GH Corner', 'Paneerselvam Park', 'Kalaimadu Silai', 'Karungalpalayam', 
      'Chithode', 'Bhavani', 'Perundurai', 'Thindal', 
      'Pallipalayam', 'Komarapalayam', 'Gobichettipalayam', 'Sathy'
    ],
    type: 'NON-AC',
    timings: 'Every 15 mins'
  },
  {
    id: 'ERD-BUS-2',
    name: 'Gobi Deluxe (ERD2)',
    busNo: 'TN-33-AB-3344',
    district: 'Erode',
    route: [
      'Central Bus Stand', 'GH Corner', 'Paneerselvam Park', 'Kalaimadu Silai', 'Karungalpalayam', 
      'Chithode', 'Bhavani', 'Perundurai', 'Thindal', 
      'Pallipalayam', 'Komarapalayam', 'Gobichettipalayam', 'Sathy'
    ],
    type: 'AC',
    timings: 'Every 25 mins'
  }
];

export const PassengerPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<View>('BUSES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [stopSelectionType, setStopSelectionType] = useState<'FROM' | 'TO'>('FROM');
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // SOS States
  const [historySubTab, setHistorySubTab] = useState<'TICKETS' | 'SOS'>('TICKETS');
  const [activeSOS, setActiveSOS] = useState<SOSSession | null>(null);
  const [isSOSChatOpen, setIsSOSChatOpen] = useState(false);
  const [sosHistory, setSosHistory] = useState<SOSSession[]>([]);
  const [chatMessageText, setChatMessageText] = useState('');
  const [selectedPastSOS, setSelectedPastSOS] = useState<SOSSession | null>(null);

  const passengerEmail = localStorage.getItem('passenger_email') || 'passenger@nigazhthisai.com';
  const passengerName = localStorage.getItem('passenger_name') || 'Anand Kumar';

  // Load and sync SOS state
  const syncSOSState = () => {
    const active = getActiveSOSForUser(passengerEmail);
    setActiveSOS(active);
    
    const all = getSOSSessions();
    const userHistory = all.filter(s => s.senderEmail.toLowerCase() === passengerEmail.toLowerCase() && s.status === 'SOLVED');
    setSosHistory(userHistory);
  };

  useEffect(() => {
    syncSOSState();
    const handleSOSUpdate = () => syncSOSState();
    window.addEventListener('sos_storage_update', handleSOSUpdate);
    const interval = setInterval(syncSOSState, 1000);
    return () => {
      window.removeEventListener('sos_storage_update', handleSOSUpdate);
      clearInterval(interval);
    };
  }, [passengerEmail]);

  // Default values loaded from localStorage
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    return localStorage.getItem('selected_district') || 'Coimbatore';
  });

  const [fromStop, setFromStop] = useState<string>(() => {
    return localStorage.getItem('from_stop') || 'Gandhipuram';
  });
  
  const [toStop, setToStop] = useState<string>('');

  const [numSeats, setNumSeats] = useState(2);
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  
  // Dynamic selected bus state
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);

  const getUnitPrice = (from: string, to: string, district: string, busType?: 'AC' | 'NON-AC') => {
    if (!from || !to) return 14;
    const stops = STOPS_BY_DISTRICT[district] || STOPS_BY_DISTRICT['default'];
    const fromIdx = stops.indexOf(from);
    const textToSearch = to;
    const toIdx = stops.indexOf(textToSearch);
    
    if (fromIdx === -1 || toIdx === -1) {
      return 14;
    }
    
    const distance = Math.abs(fromIdx - toIdx);
    const basePrice = 12; // Base price for 1 stop
    const pricePerStop = 10; // Extra price per stop
    let price = basePrice + (distance - 1) * pricePerStop;
    if (price < basePrice) price = basePrice;
    
    if (busType === 'AC') {
      price = Math.round(price * 1.5);
    }
    return price;
  };

  const getRouteForTicket = (ticket: any) => {
    const matchedBus = DUMMY_BUSES.find(b => b.busNo === ticket.busNo);
    if (matchedBus) {
      return matchedBus.route;
    }
    // Fallback for static tickets
    if (ticket.busNo === 'TN-01-AX-4432') {
      return [
        'Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Saidapet', 
        'Nandanam', 'T. Nagar', 'Central Railway Station', 'Egmore', 'Mylapore', 
        'Adyar', 'Thiruvanmiyur', 'Perungudi', 'Sholinganallur', 'Pondicherry Bus Stand'
      ];
    }
    if (ticket.busNo === 'TN-59-BT-1120') {
      return [
        'Mattuthavani', 'K.Pudur', 'Outpost', 'Goripalayam', 'Simmakkal', 
        'Periyar Bus Stand', 'Madurai Junction', 'Arapalayam', 'Kalavasal', 'Bypass Road', 
        'Melur', 'Kottampatti', 'Thuvarankurichi', 'Manapparai', 'Trichy Central Bus Stand'
      ];
    }
    // Generic fallback route of 15 stops
    return [
      ticket.from || 'Source Stop', 'Stop 2', 'Stop 3', 'Stop 4', 'Stop 5', 
      'Stop 6', 'Stop 7', 'Stop 8', 'Stop 9', 'Stop 10', 
      'Stop 11', 'Stop 12', 'Stop 13', 'Stop 14', ticket.to || 'Destination Stop'
    ];
  };

  const getTrackedBusDetails = () => {
    if (trackingBusId) {
      const bus = DUMMY_BUSES.find(b => b.id === trackingBusId);
      if (bus) {
        return {
          bus,
          route: bus.route,
          busNo: bus.busNo,
          name: bus.name,
          type: bus.type,
          from: bus.route[0],
          to: bus.route[bus.route.length - 1],
          occupancy: getBusOccupancy(bus.busNo)
        };
      }
    }
    
    if (trackingTicketId) {
      // Is it a booked ticket from the list?
      const ticket = userBookedTickets.find((t: any) => t.id === trackingTicketId);
      if (ticket) {
        const matchedBus = DUMMY_BUSES.find(b => b.busNo === ticket.busNo);
        return {
          bus: matchedBus,
          route: getRouteForTicket(ticket),
          busNo: ticket.busNo,
          name: matchedBus ? matchedBus.name : `Express Service (${ticket.busNo})`,
          type: matchedBus ? matchedBus.type : 'NON-AC',
          from: ticket.from,
          to: ticket.to,
          occupancy: getBusOccupancy(ticket.busNo)
        };
      }
      
      // Is it static ticket 1?
      if (trackingTicketId === 'TKT-LIVE-1') {
        const matchedBus = DUMMY_BUSES.find(b => b.busNo === 'TN-01-AX-4432');
        return {
          bus: matchedBus,
          route: getRouteForTicket({ busNo: 'TN-01-AX-4432', from: 'Chennai', to: 'Pondicherry' }),
          busNo: 'TN-01-AX-4432',
          name: 'Chennai-Pondicherry Express',
          type: 'AC',
          from: 'Chennai',
          to: 'Pondicherry',
          occupancy: getBusOccupancy('TN-01-AX-4432')
        };
      }
      
      // Is it static ticket 2?
      if (trackingTicketId === 'TKT-LIVE-2') {
        const matchedBus = DUMMY_BUSES.find(b => b.busNo === 'TN-59-BT-1120');
        return {
          bus: matchedBus,
          route: getRouteForTicket({ busNo: 'TN-59-BT-1120', from: 'Madurai', to: 'Trichy' }),
          busNo: 'TN-59-BT-1120',
          name: 'Madurai-Trichy Deluxe',
          type: 'NON-AC',
          from: 'Madurai',
          to: 'Trichy',
          occupancy: getBusOccupancy('TN-59-BT-1120')
        };
      }
    }
    
    // Fallback default
    return {
      bus: null,
      route: [
        'Gandhipuram', 'GP Signal', 'Lakshmi Mills', 'Peelamedu', 'Hopes College', 
        'KMCH Hospital', 'SITRA Junction', 'Singanallur', 'Ramanathapuram', 'Sungam', 
        'Ukkadam', 'Podanur Junction', 'Eachanari', 'Kinathukadavu', 'Pollachi'
      ],
      busNo: 'TN-37-BY-1111',
      name: 'Coimbatore Express',
      type: 'NON-AC',
      from: 'Gandhipuram',
      to: 'Pollachi',
      occupancy: 15
    };
  };

  // Expanded QR State for live tickets list
  const [expandedQRId, setExpandedQRId] = useState<string | null>(null);

  // Active tracked ticket ID in live tickets list
  const [trackingTicketId, setTrackingTicketId] = useState<string | null>(null);

  // Active tracked bus ID in search list
  const [trackingBusId, setTrackingBusId] = useState<string | null>(null);

  // Remember source view for the Tracking page back button
  const [trackingSourceView, setTrackingSourceView] = useState<'BUSES' | 'TICKETS'>('BUSES');

  // Triggered list of tickets booked in current session
  const [userBookedTickets, setUserBookedTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('user_booked_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [busOccupancies, setBusOccupancies] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('bus_occupancies');
    return saved ? JSON.parse(saved) : {};
  });

  const getBusOccupancy = (busNo: string) => {
    const key = busNo.replace(/[^A-Z0-9]/ig, '').toUpperCase();
    
    if (busOccupancies[key] !== undefined) {
      return busOccupancies[key];
    }
    
    // Provide a realistic default based on the bus plate
    let defaultCount = 12; // default
    if (key.includes('1111')) defaultCount = 18;
    else if (key.includes('2222')) defaultCount = 8;
    else if (key.includes('1234')) defaultCount = 15;
    else if (key.includes('5678')) defaultCount = 22;
    else if (key.includes('9012')) defaultCount = 5;
    else if (key.includes('3333')) defaultCount = 34;
    else if (key.includes('4444')) defaultCount = 12;
    else if (key.includes('7777')) defaultCount = 20;
    else if (key.includes('8888')) defaultCount = 42;
    else if (key.includes('5555')) defaultCount = 28;
    else if (key.includes('6666')) defaultCount = 15;
    else if (key.includes('7788')) defaultCount = 19;
    else if (key.includes('9900')) defaultCount = 31;
    else if (key.includes('1122')) defaultCount = 12; // Tiruppur Avinashi Link
    else if (key.includes('3344')) defaultCount = 25;
    else if (key.includes('5566')) defaultCount = 17;
    
    return defaultCount;
  };

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

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Poll localStorage to keep tickets and occupancies synchronized in real-time
  useEffect(() => {
    const handleSync = () => {
      const savedTickets = localStorage.getItem('user_booked_tickets');
      if (savedTickets) {
        setUserBookedTickets(JSON.parse(savedTickets));
      }
      const savedOccupancies = localStorage.getItem('bus_occupancies');
      if (savedOccupancies) {
        setBusOccupancies(JSON.parse(savedOccupancies));
      }
    };
    
    // Poll every 1.5 seconds for instant updates when switching browser tabs
    const interval = setInterval(handleSync, 1500);
    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    
    // Initial sync
    handleSync();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    localStorage.setItem('selected_district', district);
    
    // Reset stops when district changes
    const districtStops = STOPS_BY_DISTRICT[district] || STOPS_BY_DISTRICT['default'];
    const firstStop = districtStops[0] || 'Main Bus Stand';
    
    setFromStop(firstStop);
    setToStop(''); // Empty to prevent showing the bus list automatically
    setSelectedBus(null);
    localStorage.setItem('from_stop', firstStop);
    localStorage.setItem('to_stop', '');
    
    setIsDistrictModalOpen(false);
    toast.success(`District updated to ${district}. Please select destination (To).`);
  };

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectMyLocation = (isAuto = false) => {
    if (!navigator.geolocation) {
      if (!isAuto) toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const closest = findClosestDistrict(latitude, longitude);
        
        setIsDetectingLocation(false);
        
        // Let's check distance to see if they are in/near Tamil Nadu
        const defaultCoords = DISTRICT_COORDINATES[closest] || { lat: 11.0168, lng: 76.9558 };
        const distSq = Math.pow(latitude - defaultCoords.lat, 2) + Math.pow(longitude - defaultCoords.lng, 2);
        
        if (distSq > 5.0) {
          // Outside Tamil Nadu
          handleDistrictSelect(closest);
          toast.success(
            language === 'TA'
              ? `இருப்பிடம் கண்டறியப்பட்டது! சிறந்த அனுபவத்திற்காக ${closest} மாவட்டம் தேர்ந்தெடுக்கப்பட்டது.`
              : `Location detected! Matched nearest district ${closest} for local bus operations.`
          );
        } else {
          handleDistrictSelect(closest);
          toast.success(
            language === 'TA'
              ? `உங்கள் இருப்பிடம் கண்டறியப்பட்டது: ${closest}!`
              : `Location detected: ${closest} District!`
          );
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (!isAuto) {
          const mockDistricts = ['Chennai', 'Coimbatore', 'Madurai', 'Erode'];
          const randomMock = mockDistricts[Math.floor(Math.random() * mockDistricts.length)];
          handleDistrictSelect(randomMock);
          toast.info(
            language === 'TA'
              ? `இருப்பிட அனுமதி மறுக்கப்பட்டது. மாதிரியாக ${randomMock} தேர்ந்தெடுக்கப்பட்டது.`
              : `Location permission denied. Fallback: Auto-selected ${randomMock}!`
          );
        }
      },
      options
    );
  };

  // Autoselect location on load if no district is selected yet
  useEffect(() => {
    const savedDist = localStorage.getItem('selected_district');
    if (!savedDist) {
      detectMyLocation(true);
    }
  }, []);

  const handleStopSelect = (stop: string) => {
    if (stopSelectionType === 'FROM') {
      setFromStop(stop);
      localStorage.setItem('from_stop', stop);
    } else {
      setToStop(stop);
      localStorage.setItem('to_stop', stop);
    }
    setSelectedBus(null); // Reset bus on stop change
    setIsStopModalOpen(false);
  };

  const openStopModal = (type: 'FROM' | 'TO') => {
    setStopSelectionType(type);
    setStopSearchQuery('');
    setIsStopModalOpen(true);
  };

  const handleSwapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
    localStorage.setItem('from_stop', toStop);
    localStorage.setItem('to_stop', temp);
    setSelectedBus(null); // Reset bus on swap
    toast.success(language === 'TA' ? 'வழித்தடங்கள் மாற்றப்பட்டன' : 'Routes swapped');
  };

  const triggerSOSAlert = () => {
    if (activeSOS) {
      setIsSOSChatOpen(true);
      toast.info(
        language === 'TA'
          ? 'உங்களிடம் ஏற்கனவே ஒரு செயலில் உள்ள SOS உள்ளது. நேரடி அரட்டை திறக்கப்படுகிறது.'
          : 'Rejoining your active live emergency assistance chat...'
      );
    } else {
      setIsSOSModalOpen(true);
    }
  };

  const handleConfirmSOS = () => {
    setIsSOSModalOpen(false);
    
    const busDetails = selectedBus ? {
      busNo: selectedBus.busNo,
      routeName: selectedBus.name,
      district: selectedDistrict,
      senderMobile: '+91 9080160688'
    } : {
      busNo: 'TN-37-BY-1111',
      routeName: 'General Route Alert',
      district: selectedDistrict,
      senderMobile: '+91 9080160688'
    };

    const newSession = createSOSSession(
      passengerName,
      passengerEmail,
      'PASSENGER',
      busDetails
    );

    setActiveSOS(newSession);
    setIsSOSChatOpen(true);

    toast.error(
      language === 'TA' 
        ? 'அவசர எச்சரிக்கை அனுப்பப்பட்டது! நேரடி அரட்டை தொடங்கப்பட்டது.' 
        : 'SOS Emergency Alert Broadcasted! Live Chat connected to control center.'
    );
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeSOS) return;

    addSOSMessage(
      activeSOS.id,
      passengerName,
      'PASSENGER',
      passengerEmail,
      chatMessageText.trim()
    );

    setChatMessageText('');
    syncSOSState();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
    toast.info('Logged out from Passenger App');
  };

  const handleProceedToBooking = () => {
    if (!toStop) {
      toast.error('Please select a destination stop (To) first!');
      return;
    }
    const matching = DUMMY_BUSES.filter(bus => {
      if (bus.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      const fromIdx = bus.route.indexOf(fromStop);
      const toIdx = bus.route.indexOf(toStop);
      return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    });
    if (matching.length > 0) {
      setSelectedBus(matching[0]);
    } else {
      setSelectedBus(null);
    }
    setCurrentView('BOOKING');
  };

  const executeTicketBooking = () => {
    const unitPrice = getUnitPrice(fromStop, toStop, selectedDistrict, selectedBus?.type);
    const newTicket = {
      id: `TKT-LIVE-${Date.now()}`,
      ref: `TK${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      from: fromStop,
      to: toStop,
      seats: numSeats,
      seatNo: `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`,
      amount: numSeats * unitPrice,
      busNo: selectedBus ? selectedBus.busNo : `TN-39-BT-${Math.floor(1000 + Math.random() * 9000)}`,
      busName: selectedBus ? selectedBus.name : 'Local - TNSTC',
      time: '12 mins',
      date: 'Today',
      status: 'Pending'
    };
    
    const updatedTickets = [newTicket, ...userBookedTickets];
    setUserBookedTickets(updatedTickets);
    localStorage.setItem('user_booked_tickets', JSON.stringify(updatedTickets));
    setCurrentView('SUCCESS');
  };

  // --- RENDERING COMPONENTS ---

  const Header = ({ title, subtitle, showWelcome = false }: { title: string; subtitle: string; showWelcome?: boolean }) => {
    return (
      <header className="bg-white border-b border-slate-100 flex items-center justify-between px-4 py-3 sticky top-0 z-40 shadow-sm" id="passenger-app-header">
        <div className="flex items-center gap-3">
          {/* Hamburger menu */}
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
            id="passenger-menu-button"
          >
            <Menu size={22} className="text-[#0D2A5D]" />
          </button>
          
          {/* Logo / Title Area */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0D2A5D] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#0D2A5D]/20 overflow-hidden">
              <img src="/favicon.jpeg" className="w-full h-full object-cover" alt="Logo" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-extrabold tracking-tight text-[#0D2A5D] leading-none">{title}</h1>
              <p className="text-[11px] font-medium text-slate-500 mt-1 leading-none">
                {showWelcome ? "Welcome, Barath!" : subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Notification bell with orange count + SOS pill */}
        <div className="flex items-center gap-2">
          {/* Bell with red/orange bubble */}
          <div className="relative cursor-pointer hover:scale-105 transition-transform p-1.5 rounded-lg hover:bg-slate-50">
            <Bell size={20} className="text-[#0D2A5D]" />
            <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-[#D97F00] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white scale-90">
              14
            </span>
          </div>

          {/* SOS Capsule Pill */}
          <button 
            onClick={triggerSOSAlert}
            className={`${activeSOS ? 'bg-red-600 animate-pulse ring-4 ring-red-500/30' : 'bg-[#D97F00] hover:bg-[#b86b00]'} text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all`}
          >
            <PhoneCall size={12} className="text-white" />
            {activeSOS ? 'LIVE CHAT' : 'SOS'}
          </button>
        </div>
      </header>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden font-sans border-x border-slate-200/50 shadow-2xl">
      
      {/* 1. SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-[99] flex flex-col items-center justify-center p-6 max-w-md mx-auto"
            id="passenger-splash-screen"
          >
            <div className="relative p-4 bg-slate-50 rounded-3xl shadow-xl border border-slate-100 mb-8">
              <div className="w-24 h-24 bg-[#0D2A5D] rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="/favicon.jpeg" className="w-full h-full object-cover" alt="Logo" />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-[#0D2A5D]">NIGAZHTHISAI</h1>
              <p className="text-xs text-[#D97F00] font-bold uppercase tracking-[0.25em] mt-2 animate-pulse">
                LIVE BUS TRACKING & TICKETS
              </p>
            </div>
            
            <div className="absolute bottom-16 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D2A5D] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97F00] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D2A5D] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SIDEBAR NAVIGATION OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-[#0D2A5D]/40 z-50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[80%] bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="bg-[#0D2A5D] pt-12 pb-8 px-6 text-white relative overflow-hidden shrink-0">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm mb-4">
                    <User size={32} className="text-white" />
                  </div>
                  <div className="text-center w-full">
                    <h2 className="text-lg font-black tracking-tight leading-none mb-1.5 text-white">GOWARDHAN</h2>
                    <p className="text-[10px] font-bold text-[#D97F00] tracking-[0.2em] uppercase">+91 9080160688</p>
                  </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
                <div className="absolute -right-6 -bottom-6 bg-white/10 w-28 h-28 rounded-full blur-2xl" />
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
                {[
                  { label: 'BUS LOOKUP & MAP', icon: Bus, active: currentView === 'BUSES' || currentView === 'BOOKING', id: 'BUSES' },
                  { label: 'TICKET HISTORY', icon: Clock, active: currentView === 'HISTORY', id: 'HISTORY' },
                  { label: 'LIVE TICKETS', icon: TicketIcon, active: currentView === 'TICKETS', id: 'TICKETS' },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all group ${item.active ? 'text-[#0D2A5D] bg-[#0D2A5D]/5 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className={`p-2 rounded-lg transition-all ${item.active ? 'bg-[#0D2A5D] text-white shadow-md' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-xs uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Language and Logout */}
              <div className="p-4 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/50">
                {/* Language Switch Accordion */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-white border border-slate-200 text-[#0D2A5D] rounded-lg">
                        <Globe size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Language</p>
                        <p className="text-[11px] font-black text-slate-800 uppercase mt-0.5">
                          {language === 'EN' ? 'English' : language === 'TA' ? 'தமிழ்' : 'English'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLangOpen && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50/30 grid grid-cols-2 gap-1">
                      {[
                        { id: 'EN', label: 'ENGLISH', native: 'English' },
                        { id: 'TA', label: 'TAMIL', native: 'தமிழ்' }
                      ].map((lang) => (
                        <button 
                          key={lang.id}
                          onClick={() => {
                            setLanguage(lang.id as Language);
                            setIsLangOpen(false);
                            toast.success(`Language changed to ${lang.native}`);
                          }}
                          className={`py-1.5 px-1 text-center rounded-lg border text-xs transition-all ${
                            language === lang.id 
                              ? 'bg-[#0D2A5D]/5 border-[#0D2A5D]/30 text-[#0D2A5D] font-bold' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <div>{lang.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENTS */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-28">

        {/* --- VIEW 1: BUSES & LOOKUP (Screen 1) --- */}
        {currentView === 'BUSES' && (
          <div className="p-4 space-y-5" id="passenger-buses-view">
            <Header title="NIGAZHTHISAI" subtitle="Welcome, Barath!" showWelcome={true} />
            
            {/* BUS LOOKUP BOX */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative space-y-4">
              
              {/* Title & Back Button Row */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toast.info('Welcome to Nigazhthisai!')}
                  className="w-9 h-9 border border-slate-200 flex items-center justify-center rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={16} className="text-[#0D2A5D]" />
                </button>
                <div>
                  <h2 className="text-[#0D2A5D] font-extrabold text-base tracking-wide leading-none">BUS LOOKUP</h2>
                  <p className="text-xs text-slate-400 mt-1">Find and track buses easily</p>
                </div>
              </div>

              {/* Select District Dropdown */}
              <div className="space-y-1.5" id="district-selector-container">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'TA' ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Select District'}
                  </label>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      detectMyLocation(false);
                    }}
                    disabled={isDetectingLocation}
                    type="button"
                    className="text-[10px] font-black text-[#D97F00] hover:text-[#b86b00] uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Navigation size={10} className={`${isDetectingLocation ? 'animate-spin text-red-500' : 'text-[#D97F00]'}`} />
                    {isDetectingLocation 
                      ? (language === 'TA' ? 'கண்டறிகிறது...' : 'Detecting...') 
                      : (language === 'TA' ? 'என் இருப்பிடம்' : 'Detect Location')}
                  </button>
                </div>
                <div 
                  onClick={() => setIsDistrictModalOpen(true)}
                  className={`w-full bg-white border ${isDetectingLocation ? 'border-[#D97F00] ring-2 ring-[#D97F00]/10 animate-pulse' : 'border-slate-200'} px-4 py-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#0D2A5D] transition-all`}
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Globe size={16} className={`${isDetectingLocation ? 'text-red-500 animate-bounce' : 'text-[#0D2A5D]'}`} />
                    <span className="text-xs font-semibold">{selectedDistrict}</span>
                    {isDetectingLocation && (
                      <span className="text-[9px] text-[#D97F00] font-black uppercase tracking-widest animate-pulse ml-1">
                        GPS Active
                      </span>
                    )}
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>

              {/* Station inputs (FROM & TO) with vertical route line and swap */}
              <div className="relative space-y-3 pt-1">
                
                {/* FROM Stop Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</label>
                  <div 
                    onClick={() => openStopModal('FROM')}
                    className="w-full bg-white border border-slate-200 px-4 py-3.5 rounded-2xl flex items-center gap-2.5 cursor-pointer hover:border-[#0D2A5D] transition-colors"
                  >
                    <MapPin size={16} className="text-[#0D2A5D]" />
                    <span className="text-xs font-semibold text-slate-700 truncate">{fromStop}</span>
                  </div>
                </div>

                {/* Swap Button (Floating on the right side) */}
                <div className="absolute right-3 top-[52px] z-10">
                  <button 
                    onClick={handleSwapStops}
                    className="w-9 h-9 bg-white border border-slate-200 flex items-center justify-center rounded-xl shadow-md text-[#0D2A5D] hover:text-[#D97F00] active:scale-90 transition-all"
                    title="Swap locations"
                  >
                    <ArrowLeftRight size={14} className="rotate-90" />
                  </button>
                </div>

                {/* TO Stop Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</label>
                  <div 
                    onClick={() => openStopModal('TO')}
                    className="w-full bg-white border border-slate-200 px-4 py-3.5 rounded-2xl flex items-center gap-2.5 cursor-pointer hover:border-[#0D2A5D] transition-colors"
                  >
                    <MapPin size={16} className="text-[#0D2A5D]" />
                    <span className={`text-xs font-semibold truncate ${toStop ? 'text-slate-700' : 'text-slate-400'}`}>
                      {toStop || 'Select Destination'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* ACTIVE SCHEDULED BUSES CONTAINER */}
            <div className="space-y-3">
              {(() => {
                const runningBuses = (() => {
                  if (!toStop) return [];
                  return DUMMY_BUSES.filter(bus => {
                    if (bus.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
                    const fromIdx = bus.route.indexOf(fromStop);
                    const toIdx = bus.route.indexOf(toStop);
                    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
                  });
                })();

                return (
                  <>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#0D2A5D]/5 rounded-lg">
                          <ArrowLeftRight size={12} className="text-[#0D2A5D]" />
                        </div>
                        <h3 className="text-xs font-bold text-[#0D2A5D] uppercase tracking-wider">ACTIVE SCHEDULED BUSES</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${runningBuses.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#fef3c7] text-[#D97F00]'}`}>
                        {runningBuses.length} RUNNING
                      </span>
                    </div>

                    {!toStop ? (
                      /* No To option selected yet state */
                      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-[#0D2A5D]/5 rounded-2xl flex items-center justify-center text-[#0D2A5D]">
                          <Search size={32} className="text-[#D97F00]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[#0D2A5D] font-extrabold text-sm tracking-wide">Select your destination</h4>
                          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                            Please select a "To" stop above to view available buses and real-time schedules.
                          </p>
                        </div>
                      </div>
                    ) : runningBuses.length === 0 ? (
                      /* No matching bus found for these stops -> "Bus currently not RUNNING" */
                      <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100/60 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                          <X size={32} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-red-700 font-extrabold text-sm tracking-wide uppercase">Bus currently not RUNNING</h4>
                          <p className="text-xs text-red-500 max-w-xs leading-relaxed">
                            There are no active buses scheduled between <span className="font-bold">{fromStop}</span> and <span className="font-bold">{toStop}</span> right now.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Render matching buses! */
                      <div className="space-y-3">
                        {runningBuses.map((bus) => {
                          const price = getUnitPrice(fromStop, toStop, selectedDistrict, bus.type);
                          return (
                            <div 
                              key={bus.id} 
                              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-[#0D2A5D]/30 transition-all shadow-xs space-y-4 text-left"
                            >
                              {/* Bus Name & Type Badge */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-extrabold text-slate-900 text-sm">{bus.name}</h4>
                                  <p className="text-[10px] text-slate-400 font-semibold">{bus.busNo}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-wider ${bus.type === 'AC' ? 'bg-[#0D2A5D] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  {bus.type}
                                </span>
                              </div>

                              {/* Route Timeline Indicator */}
                              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                                <span className="font-semibold text-slate-800 truncate max-w-[100px]">{fromStop}</span>
                                <span className="text-slate-300">➔</span>
                                <span className="font-semibold text-slate-800 truncate max-w-[100px]">{toStop}</span>
                                <span className="ml-auto text-[10px] font-bold text-[#D97F00]">{bus.timings}</span>
                              </div>

                              {/* Bus Occupancy Segment */}
                              <div className="space-y-1.5 px-1 py-0.5">
                                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                  <span>Bus Occupancy</span>
                                  <span className="text-slate-700 font-black">
                                    {getBusOccupancy(bus.busNo)}/50 Seats Filled
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                  <div 
                                    className={`h-full ${getProgressBarClass(getBusOccupancy(bus.busNo))} rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(100, (getBusOccupancy(bus.busNo) / 50) * 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Price & Book CTA Button */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Price per Seat</p>
                                  <p className="text-base font-black text-[#0D2A5D]">₹{price}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {/* Track Button */}
                                  <button
                                    onClick={() => {
                                      setTrackingBusId(bus.id);
                                      setTrackingTicketId(null);
                                      setTrackingSourceView('BUSES');
                                      setCurrentView('TRACKING');
                                    }}
                                    className="bg-white hover:bg-slate-50 text-[#0D2A5D] border border-slate-200 text-[11px] font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                                  >
                                    <Navigation size={11} className="text-[#D97F00]" />
                                    Track
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedBus(bus);
                                      setCurrentView('BOOKING');
                                    }}
                                    className="bg-[#0D2A5D] hover:bg-[#123673] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-[#0D2A5D]/10 active:scale-95 transition-all flex items-center gap-1.5"
                                  >
                                    <TicketIcon size={12} className="text-[#D97F00]" />
                                    Book Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

          </div>
        )}


        {/* --- VIEW 2: HISTORY (Screen 2) --- */}
        {currentView === 'HISTORY' && (
          <div className="p-4 space-y-5" id="passenger-history-view">
            <Header title="NIGAZHTHISAI" subtitle="Your previous trips across Tamil Nadu" />
            
            {/* HISTORY OVERVIEW CARD */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#0D2A5D] flex items-center justify-center text-[#0D2A5D] shrink-0">
                <Clock size={22} className="text-[#0D2A5D]" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-[#0D2A5D] font-extrabold text-base uppercase tracking-wide">HISTORY</h2>
                <p className="text-xs text-slate-400">Your previous trips across Tamil Nadu</p>
              </div>
            </div>

            {/* SEGMENTED TAB CONTROL */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button 
                onClick={() => setHistorySubTab('TICKETS')}
                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${historySubTab === 'TICKETS' ? 'bg-[#0D2A5D] text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Ticket Bookings
              </button>
              <button 
                onClick={() => setHistorySubTab('SOS')}
                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${historySubTab === 'SOS' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                SOS Reports ({sosHistory.length})
              </button>
            </div>

            {historySubTab === 'TICKETS' ? (
              /* PAST TICKETS LIST */
              <div className="space-y-4">
                
                {/* Item 1: Madurai to Tirunelveli */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  {/* Header: Ticket ID & Status */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">TICKET ID: TXN982341</span>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      COMPLETED
                    </span>
                  </div>

                  {/* Cities Route display with orange circle */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-[#0D2A5D]">Madurai</span>
                    <span className="w-4 h-4 rounded-full border-2 border-[#D97F00] shrink-0" />
                    <span className="text-base font-extrabold text-[#0D2A5D]">Tirunelveli</span>
                  </div>

                  {/* Sub-details line */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">DATE & TIME</p>
                        <p className="font-semibold text-slate-700">12 Jul 2026, 09:30 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">BUS TYPE</p>
                        <p className="font-semibold text-slate-700">Local - TNSTC</p>
                      </div>
                    </div>
                  </div>

                  {/* Dotted divider line */}
                  <div className="border-t border-dashed border-slate-200 my-2" />

                  {/* Footer of card */}
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => toast.success('Starting PDF download for ticket TXN982341...')}
                      className="text-[#D97F00] hover:text-[#b86b00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-[#D97F00] shrink-0" />
                      DOWNLOAD PDF
                    </button>
                    <span className="text-[#0D2A5D] font-black text-lg">₹45</span>
                  </div>
                </div>

                {/* Item 2: Chennai to Vellore */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">TICKET ID: TXN871290</span>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      COMPLETED
                    </span>
                  </div>

                  {/* Cities Route */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-[#0D2A5D]">Chennai</span>
                    <span className="w-4 h-4 rounded-full border-2 border-[#D97F00] shrink-0" />
                    <span className="text-base font-extrabold text-[#0D2A5D]">Vellore</span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">DATE & TIME</p>
                        <p className="font-semibold text-slate-700">10 Jul 2026, 02:15 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">BUS TYPE</p>
                        <p className="font-semibold text-slate-700">Super Deluxe</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-200 my-2" />

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => toast.success('Starting PDF download for ticket TXN871290...')}
                      className="text-[#D97F00] hover:text-[#b86b00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-[#D97F00] shrink-0" />
                      DOWNLOAD PDF
                    </button>
                    <span className="text-[#0D2A5D] font-black text-lg">₹120</span>
                  </div>
                </div>

                {/* Item 3: Coimbatore to Pollachi */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">TICKET ID: TXN765102</span>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      COMPLETED
                    </span>
                  </div>

                  {/* Cities Route */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-[#0D2A5D]">Coimbatore</span>
                    <span className="w-4 h-4 rounded-full border-2 border-[#D97F00] shrink-0" />
                    <span className="text-base font-extrabold text-[#0D2A5D]">Pollachi</span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">DATE & TIME</p>
                        <p className="font-semibold text-slate-700">08 Jul 2026, 11:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">BUS TYPE</p>
                        <p className="font-semibold text-slate-700">Local - TNSTC</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-200 my-2" />

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => toast.success('Starting PDF download for ticket TXN765102...')}
                      className="text-[#D97F00] hover:text-[#b86b00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-[#D97F00] shrink-0" />
                      DOWNLOAD PDF
                    </button>
                    <span className="text-[#0D2A5D] font-black text-lg">₹45</span>
                  </div>
                </div>

              </div>
            ) : (
              /* SOS REPORTS LIST */
              <div className="space-y-4">
                {sosHistory.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[#0D2A5D] font-extrabold text-xs uppercase tracking-wide">No Incident Logs</h4>
                      <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                        You have not triggered any distress alerts or emergency SOS events.
                      </p>
                    </div>
                  </div>
                ) : (
                  sosHistory.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedPastSOS(s)}
                      className="bg-white hover:bg-slate-50/50 cursor-pointer rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 transition-colors text-left"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-red-600 uppercase">INCIDENT: {s.id}</span>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                          RESOLVED
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[#0D2A5D] font-extrabold text-sm uppercase">DISTRESS ALERT RECORDED</h4>
                        <p className="text-[10px] text-[#D97F00] font-bold uppercase tracking-wider">
                          Bus No: {s.busNo} • {s.routeName}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-400 flex justify-between items-center pt-2.5 border-t border-slate-100">
                        <span>{new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[#0D2A5D] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                          View Log ➔
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}


        {/* --- VIEW 3: LIVE TICKETS (Screen 3) --- */}
        {currentView === 'TICKETS' && (
          <div className="p-4 space-y-5" id="passenger-tickets-view">
            <Header title="NIGAZHTHISAI" subtitle="LIVE TICKETS" />

            {/* LIVE TICKETS CONTAINER */}
            <div className="space-y-4">
              
              {/* Dynamic Tickets booked during the session */}
              {userBookedTickets.map((ticket, index) => (
                <div key={ticket.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                  {/* Top Header Row */}
                  <div className="flex justify-between items-start">
                    {ticket.status === 'Boarded' ? (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-150 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        Boarded & Scanned
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-[#D97F00] px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Departing in {ticket.time}
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">SEAT</p>
                      <p className="text-base font-extrabold text-slate-900">{ticket.seatNo}</p>
                    </div>
                  </div>

                  {/* Vertical Timeline Route */}
                  <div className="relative pl-6 space-y-4 border-l-2 border-[#0D2A5D] ml-2">
                    {/* Circle Node 1 (From) */}
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#D97F00]" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">FROM</p>
                      <h4 className="text-sm font-extrabold text-[#0D2A5D]">{ticket.from}</h4>
                    </div>

                    {/* Circle Node 2 (To) */}
                    <div className="absolute -left-[7px] bottom-1.5 w-3 h-3 rounded-full bg-black border-2 border-black" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">TO</p>
                      <h4 className="text-sm font-extrabold text-[#0D2A5D]">{ticket.to}</h4>
                    </div>
                  </div>

                  {/* Dotted border divider */}
                  <div className="border-t border-dashed border-slate-200 pt-3" />

                  {/* Footer with bus NO and View QR toggle */}
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold">BUS NO.</p>
                      <p className="font-extrabold text-slate-800">{ticket.busNo}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setTrackingTicketId(ticket.id);
                          setTrackingBusId(null);
                          setTrackingSourceView('TICKETS');
                          setCurrentView('TRACKING');
                        }}
                        className="text-[#0D2A5D] hover:text-[#D97F00] font-black flex items-center gap-1 uppercase transition-colors text-xs"
                      >
                        <Navigation size={12} className="text-[#D97F00]" />
                        <span>Track</span>
                      </button>
                      <button 
                        onClick={() => setExpandedQRId(expandedQRId === ticket.id ? null : ticket.id)}
                        className="text-[#0D2A5D] font-extrabold flex items-center gap-1.5 uppercase hover:text-[#D97F00] transition-colors"
                      >
                        <span>View QR</span>
                        {expandedQRId === ticket.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded QR Code Area */}
                  {expandedQRId === ticket.id && (
                    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 text-center space-y-3 animate-fade-in-subtle">
                      <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-md">
                        <QRCodeSVG value={ticket.ref} size={130} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Scan for boarding</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">REF: {ticket.ref}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Static Default Live Ticket (As shown in Screen 3) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                {/* Top Header Row */}
                <div className="flex justify-between items-start">
                  <span className="bg-amber-50 text-[#D97F00] px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Departing in 12 mins
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">SEAT</p>
                    <p className="text-base font-extrabold text-slate-900">14A</p>
                  </div>
                </div>

                {/* Vertical Timeline Route */}
                <div className="relative pl-6 space-y-4 border-l-2 border-[#0D2A5D] ml-2">
                  {/* Circle Node 1 (From) */}
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#D97F00]" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">FROM</p>
                    <h4 className="text-sm font-extrabold text-[#0D2A5D]">Chennai</h4>
                  </div>

                  {/* Circle Node 2 (To) */}
                  <div className="absolute -left-[7px] bottom-1.5 w-3 h-3 rounded-full bg-black border-2 border-black" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">TO</p>
                    <h4 className="text-sm font-extrabold text-[#0D2A5D]">Pondicherry</h4>
                  </div>
                </div>

                {/* Dotted border divider */}
                <div className="border-t border-dashed border-slate-200 pt-3" />

                {/* Footer with bus NO and View QR toggle */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold">BUS NO.</p>
                    <p className="font-extrabold text-slate-800">TN-01-AX-4432</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setTrackingTicketId('TKT-LIVE-1');
                        setTrackingBusId(null);
                        setTrackingSourceView('TICKETS');
                        setCurrentView('TRACKING');
                      }}
                      className="text-[#0D2A5D] hover:text-[#D97F00] font-black flex items-center gap-1 uppercase transition-colors text-xs"
                    >
                      <Navigation size={12} className="text-[#D97F00]" />
                      <span>Track</span>
                    </button>
                    <button 
                      onClick={() => setExpandedQRId(expandedQRId === 'TKT-LIVE-1' ? null : 'TKT-LIVE-1')}
                      className="text-[#0D2A5D] font-extrabold flex items-center gap-1.5 uppercase hover:text-[#D97F00] transition-colors"
                    >
                      <span>View QR</span>
                      {expandedQRId === 'TKT-LIVE-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded QR Code Area */}
                {expandedQRId === 'TKT-LIVE-1' && (
                  <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 text-center space-y-3">
                    <div className="p-3 bg-white rounded-xl border border-teal-300 shadow-md">
                      <QRCodeSVG value="TN01AX4432SEAT14A" size={130} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Scan for boarding</p>
                  </div>
                )}
              </div>

              {/* Static Second Default Live Ticket */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Departing in 28 mins
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">SEAT</p>
                    <p className="text-base font-extrabold text-slate-900">02B</p>
                  </div>
                </div>

                <div className="relative pl-6 space-y-4 border-l-2 border-[#0D2A5D] ml-2">
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#D97F00]" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">FROM</p>
                    <h4 className="text-sm font-extrabold text-[#0D2A5D]">Madurai</h4>
                  </div>

                  <div className="absolute -left-[7px] bottom-1.5 w-3 h-3 rounded-full bg-black border-2 border-black" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">TO</p>
                    <h4 className="text-sm font-extrabold text-[#0D2A5D]">Trichy</h4>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3" />

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold">BUS NO.</p>
                    <p className="font-extrabold text-slate-800">TN-59-BT-1120</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setTrackingTicketId('TKT-LIVE-2');
                        setTrackingBusId(null);
                        setTrackingSourceView('TICKETS');
                        setCurrentView('TRACKING');
                      }}
                      className="text-[#0D2A5D] hover:text-[#D97F00] font-black flex items-center gap-1 uppercase transition-colors text-xs"
                    >
                      <Navigation size={12} className="text-[#D97F00]" />
                      <span>Track</span>
                    </button>
                    <button 
                      onClick={() => setExpandedQRId(expandedQRId === 'TKT-LIVE-2' ? null : 'TKT-LIVE-2')}
                      className="text-[#0D2A5D] font-extrabold flex items-center gap-1.5 uppercase hover:text-[#D97F00] transition-colors"
                    >
                      <span>View QR</span>
                      {expandedQRId === 'TKT-LIVE-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedQRId === 'TKT-LIVE-2' && (
                  <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 text-center space-y-3 animate-fade-in-subtle">
                    <div className="p-3 bg-white rounded-xl border border-teal-300 shadow-md">
                      <QRCodeSVG value="TN59BT1120SEAT02B" size={130} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Scan for boarding</p>
                  </div>
                )}
              </div>

            </div>

            {/* Down arrow indicator as requested inside Screen 3 */}
            <div className="flex justify-center pt-2">
              <div className="w-8 h-8 bg-black hover:bg-slate-800 flex items-center justify-center rounded-full text-white cursor-pointer active:scale-95 transition-transform">
                <ChevronDown size={16} className="text-white" />
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: LIVE BUS TRACKING PAGE --- */}
        {currentView === 'TRACKING' && (() => {
          const details = getTrackedBusDetails();
          const route = details.route || [];
          const occupancy = details.occupancy;
          const pct = Math.min(100, (occupancy / 50) * 100);
          
          // Helper to get vertical gradient track class based on passenger count
          const getVerticalTrackClass = (count: number) => {
            const ratio = (count / 50) * 100;
            if (ratio <= 30) {
              return 'bg-occupancy-green'; // Starting green
            } else if (ratio <= 60) {
              return 'bg-gradient-to-b from-occupancy-green to-occupancy-orange'; // green to orange
            } else if (ratio <= 80) {
              return 'bg-gradient-to-b from-occupancy-green via-occupancy-orange to-occupancy-orange';
            } else {
              return 'bg-gradient-to-b from-occupancy-green via-occupancy-orange to-occupancy-red'; // reddish gradient end
            }
          };

          const trackGradientClass = getVerticalTrackClass(occupancy);

          return (
            <div className="p-4 space-y-5 animate-fade-in-subtle" id="passenger-tracking-view">
              
              {/* Top Navigation Bar with back button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setCurrentView(trackingSourceView || 'BUSES');
                    }}
                    className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center rounded-xl text-[#0D2A5D] shadow-sm hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                    id="tracking-back-btn"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="text-[#0D2A5D] font-extrabold text-base uppercase">Live Tracking</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Route Pipeline Map</p>
                  </div>
                </div>

                {/* Bus Badge */}
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-right">
                  <p className="text-[8px] text-slate-400 font-extrabold leading-none uppercase">BUS NO.</p>
                  <p className="text-xs font-black text-slate-800 leading-none mt-1">{details.busNo}</p>
                </div>
              </div>

              {/* Main Bus Info Header Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      details.type === 'AC' ? 'bg-[#D97F00]/10 text-[#D97F00] border border-[#D97F00]/20' : 'bg-[#0D2A5D]/10 text-[#0D2A5D] border border-[#0D2A5D]/20'
                    }`}>
                      {details.type} Premium
                    </span>
                    <h3 className="text-[#0D2A5D] font-black text-base mt-1.5">{details.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{details.from} to {details.to}</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black border border-emerald-150 shadow-xs uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    GPS Active
                  </div>
                </div>

                {/* Dynamic Passenger Count & Progress Bar Indicator */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#0D2A5D]" />
                      <span className="font-extrabold text-[#0D2A5D]">Passenger Capacity</span>
                    </div>
                    <span className="font-black text-slate-800">
                      {occupancy} / 50 Boarded
                    </span>
                  </div>

                  {/* Dynamic Gradient Bar */}
                  <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-150">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarClass(occupancy)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-emerald-600">Low (Green)</span>
                    <span className="text-amber-500">Medium (Orange)</span>
                    <span className="text-rose-500">Crowded (Reddish)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Route Pipeline Points - showing 15 stops */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="text-[10px] font-black text-[#0D2A5D] uppercase tracking-widest">Route Pipeline Stop Details</h4>
                  <p className="text-[9px] font-black uppercase text-slate-400">Total: {route.length} Stops</p>
                </div>

                <div className="relative pl-8 py-3 space-y-6">
                  {/* Dynamic Pipeline Track from green to orange/reddish */}
                  <div className="absolute left-[17px] top-6 bottom-6 w-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                    <div className={`w-full h-full rounded-full ${trackGradientClass}`} />
                  </div>

                  {/* Render the stops */}
                  {route.map((stop, sIdx) => {
                    const isPassed = sIdx < 5;
                    const isCurrentHeading = sIdx === 5;
                    const isScheduled = sIdx > 5;

                    return (
                      <div key={stop} className="relative flex items-center justify-between">
                        {/* Custom Pipeline Point Circle Nodes */}
                        <div className="absolute left-[-29px] flex items-center justify-center z-10">
                          {isPassed ? (
                            <div className="w-6 h-6 rounded-full bg-[#0D2A5D] border-4 border-white flex items-center justify-center shadow-md">
                              <CheckCircle2 size={12} className="text-white" />
                            </div>
                          ) : isCurrentHeading ? (
                            <div className="w-7 h-7 rounded-full bg-[#D97F00] border-4 border-white flex items-center justify-center shadow-xl animate-bounce">
                              <Bus size={13} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center shadow-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Stop Label Panel */}
                        <div className="text-left flex-1 pl-2">
                          <p className={`text-xs font-extrabold ${isCurrentHeading ? 'text-[#D97F00] font-black scale-102 origin-left transition-transform' : 'text-slate-700'}`}>
                            {stop}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                            {isPassed 
                              ? `Stop ${sIdx + 1} Passed` 
                              : isCurrentHeading 
                                ? 'Next Stop (Approaching)' 
                                : `Upcoming Stop ${sIdx + 1}`}
                          </p>
                        </div>

                        {/* Status Label */}
                        <div className="text-right">
                          {isPassed && (
                            <span className="text-[8px] font-black uppercase text-[#0D2A5D] bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                              Departed
                            </span>
                          )}
                          {isCurrentHeading && (
                            <span className="bg-[#D97F00]/10 text-[#D97F00] border border-[#D97F00]/20 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider animate-pulse">
                              En Route
                            </span>
                          )}
                          {isScheduled && (
                            <span className="text-[8px] font-bold uppercase text-slate-300">
                              Point {sIdx + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- VIEW 4: TICKET BOOKING STEPS --- */}
        {currentView === 'BOOKING' && (
          <div className="p-4 space-y-5" id="passenger-booking-view">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentView('BUSES')}
                className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center rounded-xl text-[#0D2A5D] shadow-sm hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[#0D2A5D] font-extrabold text-base uppercase">Book Ticket</h2>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
              
              {/* Route Display */}
              <div className="bg-[#0D2A5D]/5 p-4 rounded-2xl border border-[#0D2A5D]/10 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Journey</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-[#0D2A5D]">{fromStop}</span>
                  <span className="text-[#D97F00] font-black">➔</span>
                  <span className="text-sm font-extrabold text-[#0D2A5D]">{toStop}</span>
                </div>
              </div>

              {/* Number of Seats Selection */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Seats</p>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-left">
                    <p className="text-2xl font-black text-[#0D2A5D] leading-none">{numSeats}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Seats Selected</p>
                  </div>
                  
                  {/* Plus/Minus triggers */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                      className="w-10 h-10 bg-white border border-slate-200 text-slate-500 hover:text-[#0D2A5D] rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <button 
                      onClick={() => setNumSeats(numSeats + 1)}
                      className="w-10 h-10 bg-white border border-slate-200 text-slate-500 hover:text-[#0D2A5D] rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Amount</p>
                  <p className="text-xl font-black text-[#0D2A5D] mt-0.5">₹{numSeats * getUnitPrice(fromStop, toStop, selectedDistrict, selectedBus?.type)}.00</p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">
                  READY TO BOOK
                </span>
              </div>

            </div>

            {/* Confirm button */}
            <button 
              onClick={executeTicketBooking}
              className="w-full bg-[#D97F00] hover:bg-[#b86b00] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D97F00]/20 active:scale-95 transition-all"
            >
              Confirm Booking (₹{numSeats * getUnitPrice(fromStop, toStop, selectedDistrict, selectedBus?.type)}.00)
            </button>
          </div>
        )}

        {/* --- VIEW 5: SUCCESS TICKETING BOARDING INFO --- */}
        {currentView === 'SUCCESS' && (
          <div className="p-4 space-y-6 text-center" id="passenger-success-view">
            
            <div className="flex justify-center pt-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-md animate-bounce">
                <CheckCircle2 size={32} />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#0D2A5D] uppercase tracking-wide">Ticket Booked Successfully!</h2>
              <p className="text-xs text-[#D97F00] font-bold uppercase tracking-widest">Booking Confirmed</p>
            </div>

            {/* Ticket Preview Card */}
            {(() => {
              const ticket = userBookedTickets[0] || {
                ref: 'TK928391N',
                from: fromStop,
                to: toStop,
                seats: numSeats,
                seatNo: '14A',
                amount: numSeats * getUnitPrice(fromStop, toStop, selectedDistrict, selectedBus?.type),
                busNo: selectedBus?.busNo || 'TN-37-BY-1111',
                busName: selectedBus?.name || 'Local - TNSTC',
                time: '12 mins',
                date: 'Today'
              };

              return (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden text-left">
                  <div className="bg-gradient-to-br from-[#0D2A5D] to-[#14428d] p-6 text-center space-y-4">
                    <div className="bg-white p-3 inline-block rounded-xl shadow-lg">
                      <QRCodeSVG value={`${ticket.ref}-${ticket.seatNo}`} size={130} />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">TICKET REFERENCE</p>
                      <p className="text-base font-bold font-mono text-white tracking-widest uppercase">{ticket.ref}</p>
                    </div>
                  </div>

                  {/* Booking specifications */}
                  <div className="p-5 space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ROUTE</p>
                        <p className="font-bold text-[#0D2A5D]">{ticket.busName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">DATE / BUS NO</p>
                        <p className="font-bold text-[#0D2A5D]">{ticket.date} • {ticket.busNo}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">FROM</p>
                        <p className="font-extrabold text-[#0D2A5D] truncate max-w-[150px]">{ticket.from}</p>
                      </div>
                      <span className="text-slate-300">➔</span>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TO</p>
                        <p className="font-extrabold text-[#0D2A5D] truncate max-w-[150px]">{ticket.to}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PASSENGERS / SEAT</p>
                        <p className="font-extrabold text-[#0D2A5D] text-sm">{ticket.seats} seats ({ticket.seatNo})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AMOUNT PAID</p>
                        <p className="font-black text-emerald-600 text-lg">₹{ticket.amount}.00</p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Direct button to shift back to Active/Live Tickets page */}
            <button 
              onClick={() => {
                setExpandedQRId(userBookedTickets[0]?.id || 'TKT-LIVE-1');
                setCurrentView('TICKETS');
              }}
              className="w-full bg-[#0D2A5D] hover:bg-[#123673] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            >
              Go to Live Tickets
              <ChevronRight size={16} />
            </button>

          </div>
        )}

      </main>

      {/* 4. PREMIUM FLOATING BOTTOM NAVIGATION BAR */}
      <nav className="bg-white border-t border-slate-100 flex items-center justify-around px-4 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] pb-6 pt-3 h-24">
        
        {/* Left Option: HISTORY */}
        <button
          onClick={() => setCurrentView('HISTORY')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 relative ${currentView === 'HISTORY' ? 'text-[#0D2A5D]' : 'text-slate-400'}`}
        >
          {currentView === 'HISTORY' ? (
            <div className="flex flex-col items-center">
              <div className="bg-[#0D2A5D] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg -translate-y-4 transition-transform duration-300">
                <Clock size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D2A5D] -mt-2">HISTORY</span>
              <div className="w-1 h-1 bg-[#0D2A5D] rounded-full mt-1 animate-ping" />
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 hover:scale-105 transition-transform">
              <Clock size={20} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">HISTORY</span>
            </div>
          )}
        </button>

        {/* Center Option: BUSES */}
        <button
          onClick={() => setCurrentView('BUSES')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 relative ${currentView === 'BUSES' ? 'text-[#0D2A5D]' : 'text-slate-400'}`}
        >
          {currentView === 'BUSES' ? (
            <div className="flex flex-col items-center">
              <div className="bg-[#0D2A5D] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg -translate-y-4 transition-transform duration-300">
                <Search size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D2A5D] -mt-2">BUSES</span>
              <div className="w-1 h-1 bg-[#0D2A5D] rounded-full mt-1 animate-ping" />
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 hover:scale-105 transition-transform">
              <Search size={20} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">BUSES</span>
            </div>
          )}
        </button>

        {/* Right Option: TICKETS */}
        <button
          onClick={() => setCurrentView('TICKETS')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 relative ${currentView === 'TICKETS' ? 'text-[#0D2A5D]' : 'text-slate-400'}`}
        >
          {currentView === 'TICKETS' ? (
            <div className="flex flex-col items-center">
              <div className="bg-[#0D2A5D] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg -translate-y-4 transition-transform duration-300">
                <TicketIcon size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D2A5D] -mt-2">TICKETS</span>
              <div className="w-1 h-1 bg-[#0D2A5D] rounded-full mt-1 animate-ping" />
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 hover:scale-105 transition-transform">
              <TicketIcon size={20} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">TICKETS</span>
            </div>
          )}
        </button>

      </nav>

      {/* 5. DISTRICT SELECTION MODAL */}
      <AnimatePresence>
        {isDistrictModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDistrictModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-[70] rounded-t-3xl overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-black uppercase text-[#0D2A5D]">Select District</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tamil Nadu • 38 Districts</p>
                </div>
                <button 
                  onClick={() => setIsDistrictModalOpen(false)}
                  className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-1.5 no-scrollbar">
                {TAMIL_NADU_DISTRICTS.map((district) => (
                  <button
                    key={district}
                    onClick={() => handleDistrictSelect(district)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-between border ${
                      selectedDistrict === district 
                        ? 'bg-[#0D2A5D] text-white border-[#0D2A5D] shadow-md shadow-[#0D2A5D]/20' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-[#0D2A5D]/30 hover:bg-slate-50'
                    }`}
                  >
                    <span>{district}</span>
                    {selectedDistrict === district && <CheckCircle2 size={16} className="text-[#D97F00]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. STOP SELECTION MODAL */}
      <AnimatePresence>
        {isStopModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStopModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-[70] rounded-t-3xl overflow-hidden flex flex-col h-[75vh] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-[#0D2A5D] p-5 text-white sticky top-0 z-10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-extrabold uppercase">
                      {stopSelectionType === 'FROM' ? 'Boarding From' : 'Destination To'}
                    </h2>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
                      {selectedDistrict} District Stops
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsStopModalOpen(false)}
                    className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                  <input 
                    type="text"
                    placeholder="Search for a stop..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:bg-white/15 text-xs text-white placeholder:text-white/40 transition-all"
                    value={stopSearchQuery}
                    onChange={(e) => setStopSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Stops list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-1.5 no-scrollbar bg-slate-50">
                {(STOPS_BY_DISTRICT[selectedDistrict] || STOPS_BY_DISTRICT['default'])
                  .filter(stop => stop.toLowerCase().includes(stopSearchQuery.toLowerCase()))
                  .map((stop) => (
                    <button
                      key={stop}
                      onClick={() => handleStopSelect(stop)}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-between border ${
                        (stopSelectionType === 'FROM' ? fromStop : toStop) === stop
                          ? 'bg-[#0D2A5D] text-white border-[#0D2A5D]' 
                          : 'bg-white text-slate-600 border-slate-100 hover:border-[#0D2A5D]/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className={(stopSelectionType === 'FROM' ? fromStop : toStop) === stop ? 'text-white' : 'text-[#0D2A5D]'} />
                        <span>{stop}</span>
                      </div>
                      {(stopSelectionType === 'FROM' ? fromStop : toStop) === stop && (
                        <CheckCircle2 size={16} className="text-[#D97F00]" />
                      )}
                    </button>
                  ))}
                
                {/* Empty Search State */}
                {(STOPS_BY_DISTRICT[selectedDistrict] || STOPS_BY_DISTRICT['default'])
                  .filter(stop => stop.toLowerCase().includes(stopSearchQuery.toLowerCase())).length === 0 && (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Info size={24} className="mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">No stops matching your search</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. EMERGENCY SOS TRIGGER MODAL */}
      <AnimatePresence>
        {isSOSModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSOSModalOpen(false)}
              className="fixed inset-0 bg-red-950/40 z-[99] backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white z-[100] rounded-3xl p-6 text-center space-y-5 shadow-2xl border-2 border-red-500"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border-2 border-red-100 mx-auto">
                <PhoneCall size={32} className="animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-red-600 font-extrabold text-lg">EMERGENCY SOS WARNING</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you in immediate danger or facing medical emergencies inside the bus? 
                  This will broadcast your active GPS location to the central control desk and state emergency services.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSOSModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmSOS}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md shadow-red-500/20"
                >
                  Broadcast SOS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 8. ACTIVE SOS LIVE CHAT WINDOW */}
      <AnimatePresence>
        {isSOSChatOpen && activeSOS && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/65 z-[105] backdrop-blur-xs"
              onClick={() => setIsSOSChatOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 top-16 max-w-md mx-auto bg-white rounded-t-[32px] shadow-2xl z-[110] flex flex-col overflow-hidden border-t-4 border-red-600"
            >
              {/* Header */}
              <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <div>
                    <h3 className="text-red-700 font-black text-xs uppercase tracking-widest">
                      Live Emergency Desk
                    </h3>
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">
                      Incident Ref: {activeSOS.id}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSOSChatOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-500 p-2 rounded-full border border-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Connected Bus Specs */}
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Bus: {activeSOS.busNo}</span>
                <span className="text-[#D97F00]">{activeSOS.routeName}</span>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 no-scrollbar">
                <div className="text-center my-1.5">
                  <span className="bg-red-50 border border-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    GPS TRACKING IS ONLINE & ACTIVE
                  </span>
                </div>

                {activeSOS.messages.map((m: any) => {
                  const isMe = m.senderEmail.toLowerCase() === passengerEmail.toLowerCase();
                  const isSys = m.senderEmail === 'system@nigazhthisai.com';
                  
                  if (isSys) {
                    return (
                      <div key={m.id} className="flex justify-center my-1">
                        <span className="bg-red-50 text-red-600 text-[9px] font-bold px-3 py-1 rounded-lg text-center max-w-xs border border-red-100/50">
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[280px] rounded-2xl p-3 shadow-xs ${isMe ? 'bg-[#D97F00] text-white rounded-tr-none' : 'bg-[#0D2A5D] text-white rounded-tl-none'}`}>
                        <p className="text-[8px] font-black uppercase tracking-wider opacity-75 mb-0.5">
                          {m.senderName} ({m.senderRole.replace('_', ' ')})
                        </p>
                        <p className="text-xs font-semibold leading-relaxed">
                          {m.message}
                        </p>
                        <p className="text-[8px] opacity-50 text-right mt-1 font-medium">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Typing box */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    placeholder="Describe your situation in real-time..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] text-xs font-semibold text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessageText.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white p-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    Send
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 9. RESOLVED SOS HISTORY VIEW DIALOG */}
      <AnimatePresence>
        {selectedPastSOS && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 z-[120] backdrop-blur-xs"
              onClick={() => setSelectedPastSOS(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white z-[125] rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <div>
                  <h3 className="text-sm font-black text-[#0D2A5D] uppercase tracking-tight">SOS Transcripts</h3>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Ref: {selectedPastSOS.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedPastSOS(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Bus Details</p>
                <p className="font-extrabold text-[#0D2A5D]">{selectedPastSOS.busNo} ({selectedPastSOS.routeName})</p>
                <p className="text-[10px] text-slate-400 font-semibold">{new Date(selectedPastSOS.timestamp).toLocaleString()}</p>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 no-scrollbar">
                {selectedPastSOS.messages.map((m: any) => {
                  const isMe = m.senderEmail.toLowerCase() === passengerEmail.toLowerCase();
                  return (
                    <div key={m.id} className="space-y-0.5 text-left">
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isMe ? 'text-[#D97F00]' : 'text-[#0D2A5D]'}`}>
                        {m.senderName} ({m.senderRole.replace('_', ' ')})
                      </p>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-white p-2 rounded-lg border border-slate-100">
                        {m.message}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setSelectedPastSOS(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close Logs
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PassengerPage;
