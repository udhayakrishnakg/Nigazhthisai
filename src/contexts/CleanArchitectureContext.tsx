import React, { createContext, useContext, useMemo } from 'react';
import { RpcClient } from '../services/rpc/RpcClient';

// Import Repositories
import { BookingRepository } from '../repositories/BookingRepository';
import { TripRepository } from '../repositories/TripRepository';
import { AlertRepository } from '../repositories/AlertRepository';
import { BusRepository } from '../repositories/BusRepository';
import { RouteRepository } from '../repositories/RouteRepository';
import { TicketRepository } from '../repositories/TicketRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { ComplaintRepository } from '../repositories/ComplaintRepository';
import { UserRepository } from '../repositories/UserRepository';

// Import Services
import { BookingService, IBookingService } from '../services/BookingService';
import { TripService, ITripService } from '../services/TripService';
import { AlertService, IAlertService } from '../services/AlertService';
import { BusService, IBusService } from '../services/BusService';
import { PaymentService, IPaymentService } from '../services/PaymentService';
import { TicketService, ITicketService } from '../services/TicketService';
import { AuthService } from '../services/AuthService';

interface IServicesContext {
  bookingService: IBookingService;
  tripService: ITripService;
  alertService: IAlertService;
  busService: IBusService;
  paymentService: IPaymentService;
  ticketService: ITicketService;
  authService: AuthService;
}

const ServicesContext = createContext<IServicesContext | undefined>(undefined);

export const CleanArchitectureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const services = useMemo(() => {
    // 1. Instantiate Core RpcClient
    const rpcClient = new RpcClient();

    // 2. Instantiate Repositories with RpcClient Injected (DIP)
    const bookingRepository = new BookingRepository(rpcClient);
    const tripRepository = new TripRepository(rpcClient);
    const alertRepository = new AlertRepository(rpcClient);
    const busRepository = new BusRepository(rpcClient);
    const routeRepository = new RouteRepository(rpcClient);
    const ticketRepository = new TicketRepository(rpcClient);
    const paymentRepository = new PaymentRepository(rpcClient);
    const complaintRepository = new ComplaintRepository(rpcClient);
    const userRepository = new UserRepository(rpcClient);

    // 3. Instantiate Services with Repositories Injected (DIP)
    const bookingService = new BookingService(bookingRepository);
    const tripService = new TripService(tripRepository);
    const alertService = new AlertService(alertRepository);
    const busService = new BusService(busRepository);
    const paymentService = new PaymentService(paymentRepository);
    const ticketService = new TicketService(ticketRepository);
    const authService = new AuthService();

    return {
      bookingService,
      tripService,
      alertService,
      busService,
      paymentService,
      ticketService,
      authService,
    };
  }, []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): IServicesContext => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a CleanArchitectureProvider');
  }
  return context;
};
