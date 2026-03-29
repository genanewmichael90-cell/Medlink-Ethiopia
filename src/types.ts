export interface Hospital {
  id: string;
  name: string;
  type: 'Public' | 'Private' | 'Clinic';
  rating: number;
  services: string[];
  workingHours: string;
  emergency: boolean;
  location: string;
  phone: string;
  description: string;
  image: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experience: number;
  availableTimes: string[];
  image: string;
  rating: number;
  description?: string;
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface DiagnosticCenter {
  id: string;
  name: string;
  category: 'Imaging' | 'Laboratory' | 'Radiology' | 'General';
  description: string;
  services: string[];
  location?: string;
  rating?: number;
}

export interface Appointment {
  id: string;
  patientUid: string;
  patientName: string;
  patientAge: {
    years: number;
    months: number;
    days: number;
  };
  specialty: string;
  doctorId?: string;
  doctorName?: string;
  hospitalId?: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  message?: string;
  type: 'consult' | 'booking';
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientUid: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  instructions: string;
  date: string;
  createdAt: string;
}

export interface LabResult {
  id: string;
  patientUid: string;
  centerId: string;
  centerName: string;
  testName: string;
  result: string;
  date: string;
  status: 'pending' | 'final';
  createdAt: string;
}
