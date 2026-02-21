export type UserRole = 'Admin' | 'Manager' | 'Dispatcher';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
}

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export interface Vehicle {
    _id: string;
    name: string;
    licensePlate: string;
    type: string;
    status: VehicleStatus;
    maxCapacity: number;
    odometer?: number;
    lastMaintenance?: string;
    nextMaintenance?: string;
    acquisitionCost?: number;
}

export type DriverStatus = 'Available' | 'On Duty' | 'Off Duty';

export interface Driver {
    _id: string;
    name: string;
    licenseNumber: string;
    status: DriverStatus;
    phone?: string;
    licenseExpiry?: string;
    safetyScore?: number;
    tripCompletionRate?: number;
}

export type TripStatus = 'Scheduled' | 'In Transit' | 'Completed' | 'Cancelled';

export interface Trip {
    _id: string;
    vehicle: Vehicle;
    driver: Driver;
    startPoint: string;
    endPoint: string;
    cargoWeight: number;
    status: TripStatus;
    dispatchDate: string;
    arrivalDate?: string;
    revenue?: number;
}

export type LogType = 'Fuel' | 'Maintenance' | 'Expense';

export interface Log {
    _id: string;
    vehicle: string | Vehicle;
    type: LogType;
    amount: number;
    date: string;
    description?: string;
    liters?: number;
}
