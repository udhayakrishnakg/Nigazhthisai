export interface SOSMessage {
  id: string;
  senderName: string;
  senderRole: 'PASSENGER' | 'CONDUCTOR' | 'ADMIN' | 'MASTER_ADMIN';
  senderEmail: string;
  message: string;
  timestamp: string;
}

export interface SOSSession {
  id: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'PASSENGER' | 'CONDUCTOR';
  senderMobile?: string;
  busNo?: string;
  routeName?: string;
  district?: string;
  timestamp: string;
  status: 'ACTIVE' | 'SOLVED';
  resolvedAt?: string;
  messages: SOSMessage[];
}

const STORAGE_KEY = 'nigazhthisai_sos_sessions';

// Default initial mock session to make the page populated and engaging out of the box
const DEFAULT_SESSIONS: SOSSession[] = [
  {
    id: 'SOS-101',
    senderName: 'Rajesh Kumar',
    senderEmail: 'rajesh@example.com',
    senderRole: 'PASSENGER',
    senderMobile: '9443210987',
    busNo: 'TN-37-BY-1111',
    routeName: 'Coimbatore Fast Track (CBE1)',
    district: 'Coimbatore',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: 'SOLVED',
    resolvedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    messages: [
      {
        id: 'msg-1',
        senderName: 'Rajesh Kumar',
        senderRole: 'PASSENGER',
        senderEmail: 'rajesh@example.com',
        message: 'Medical emergency on the bus! A passenger collapsed near the front row.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'msg-2',
        senderName: 'Chennai Control Room',
        senderRole: 'MASTER_ADMIN',
        senderEmail: 'master@nigazhthisai.com',
        message: 'Understood, Rajesh. We are dispatching an ambulance to intercept the bus near Peelamedu. Conductor has been notified.',
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        id: 'msg-3',
        senderName: 'Rajesh Kumar',
        senderRole: 'PASSENGER',
        senderEmail: 'rajesh@example.com',
        message: 'Thank you! Ambulance has arrived and passenger has been safely assisted.',
        timestamp: new Date(Date.now() - 3600000 * 1.6).toISOString()
      },
      {
        id: 'msg-4',
        senderName: 'Chennai Control Room',
        senderRole: 'MASTER_ADMIN',
        senderEmail: 'master@nigazhthisai.com',
        message: 'Perfect, glad they are safe. We are marking this emergency as solved. Take care!',
        timestamp: new Date(Date.now() - 3600000 * 1.55).toISOString()
      }
    ]
  }
];

export const getSOSSessions = (): SOSSession[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SESSIONS));
    return DEFAULT_SESSIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_SESSIONS;
  }
};

export const saveSOSSessions = (sessions: SOSSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  // Dispatch dynamic event for immediate live updates in open components
  window.dispatchEvent(new CustomEvent('sos_storage_update'));
};

export const getActiveSOSForUser = (email: string): SOSSession | null => {
  const sessions = getSOSSessions();
  return sessions.find(s => s.senderEmail.toLowerCase() === email.toLowerCase() && s.status === 'ACTIVE') || null;
};

export const createSOSSession = (
  senderName: string,
  senderEmail: string,
  senderRole: 'PASSENGER' | 'CONDUCTOR',
  details?: { busNo?: string; routeName?: string; district?: string; senderMobile?: string }
): SOSSession => {
  const sessions = getSOSSessions();
  const activeExisting = sessions.find(s => s.senderEmail.toLowerCase() === senderEmail.toLowerCase() && s.status === 'ACTIVE');
  if (activeExisting) {
    return activeExisting;
  }

  const newSession: SOSSession = {
    id: `SOS-${Date.now()}`,
    senderName,
    senderEmail,
    senderRole,
    senderMobile: details?.senderMobile || '9876543210',
    busNo: details?.busNo || 'TN-39-AB-1234',
    routeName: details?.routeName || 'Coimbatore Fast Track (CBE1)',
    district: details?.district || 'Coimbatore',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
    messages: [
      {
        id: `msg-${Date.now()}-sys`,
        senderName: 'Control Room Bot',
        senderRole: 'ADMIN',
        senderEmail: 'system@nigazhthisai.com',
        message: '🚨 EMERGENCY SOS INITIATED. Your GPS location has been sent to the control center. A dispatcher is being connected immediately.',
        timestamp: new Date().toISOString()
      }
    ]
  };

  saveSOSSessions([...sessions, newSession]);
  return newSession;
};

export const addSOSMessage = (
  sessionId: string,
  senderName: string,
  senderRole: 'PASSENGER' | 'CONDUCTOR' | 'ADMIN' | 'MASTER_ADMIN',
  senderEmail: string,
  message: string
): SOSSession | null => {
  const sessions = getSOSSessions();
  const sessionIdx = sessions.findIndex(s => s.id === sessionId);
  if (sessionIdx === -1) return null;

  const newMessage: SOSMessage = {
    id: `msg-${Date.now()}`,
    senderName,
    senderRole,
    senderEmail,
    message,
    timestamp: new Date().toISOString()
  };

  sessions[sessionIdx].messages.push(newMessage);
  saveSOSSessions(sessions);
  return sessions[sessionIdx];
};

export const resolveSOSSession = (sessionId: string): SOSSession | null => {
  const sessions = getSOSSessions();
  const sessionIdx = sessions.findIndex(s => s.id === sessionId);
  if (sessionIdx === -1) return null;

  sessions[sessionIdx].status = 'SOLVED';
  sessions[sessionIdx].resolvedAt = new Date().toISOString();
  
  // Append closing automated system message
  sessions[sessionIdx].messages.push({
    id: `msg-${Date.now()}-sys-solved`,
    senderName: 'System Auditor',
    senderRole: 'ADMIN',
    senderEmail: 'system@nigazhthisai.com',
    message: '✅ This SOS session has been marked as RESOLVED/SOLVED by the duty supervisor. The channel is now closed.',
    timestamp: new Date().toISOString()
  });

  saveSOSSessions(sessions);
  return sessions[sessionIdx];
};
