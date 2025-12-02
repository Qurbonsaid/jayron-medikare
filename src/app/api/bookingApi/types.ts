// Booking API Types
export type BookingPatient = {
  _id: string;
  fullname: string;
  phone: string;
  email?: string;
};

export type BookingRoom = {
  _id: string;
  room_name: string;
  patient_capacity: number;
  floor_number: number;
  room_price: number;
};

export type BookingCorpus = {
  _id: string;
  corpus_number: number;
  description?: string;
};

export type Booking = {
  _id: string;
  patient_id: BookingPatient | string;
  room_id: BookingRoom | string;
  corpus_id: BookingCorpus | string;
  start_at: string; // ISO date string
  end_at: string; // ISO date string
  note?: string;
  status?: string;
  created_at: string;
  updated_at: string;
};

export type CreateBookingRequest = {
  patient_id: string;
  room_id: string;
  corpus_id: string;
  start_at: string;
  end_at: string;
  note?: string;
};

export type UpdateBookingRequest = {
  id: string;
  body: {
    start_at?: string;
    end_at?: string;
    note?: string;
  };
};

export type GetAllBookingsParams = {
  start_date?: string;
  end_date?: string;
  room_id?: string;
  corpus_id?: string;
};

export type GetAllBookingsResponse = {
  success: boolean;
  message: string;
  data: Booking[];
};

export type GetBookingByPatientResponse = {
  success: boolean;
  message: string;
  data: Booking[];
};

export type BedAvailability = {
  bed: number;
  available_from: string | null;
  status: 'available' | 'booked' | 'occupied';
  occupied_by?: 'booking' | 'patient';
  leave_date?: string;
};

export type AvailableRoom = {
  _id: string;
  room_name: string;
  room_price: number;
  corpus_id: BookingCorpus;
  patient_capacity: number;
  current_occupied: number; // Hozirda xonada turgan bemorlar
  booking_count: number; // Ko'rsatilgan vaqt oralig'idagi bronlar
  real_patient_count: number; // Ko'rsatilgan vaqt oralig'idagi real bemorlar
  available_beds: number; // Bo'sh joylar
  floor_number: number;
  description?: string;
  availability?: BedAvailability[]; // Har bir joy uchun ma'lumot
};

export type GetAvailableRoomsParams = {
  corpus_id?: string;
  start_date?: string;
  end_date?: string;
};

export type GetAvailableRoomsResponse = {
  success: boolean;
  message: string;
  data: AvailableRoom[];
};

export type BookingResponse = {
  success: boolean;
  message: string;
  data?: Booking;
};

export type DeleteBookingResponse = {
  success: boolean;
  message: string;
};

export type BookingError = {
  statusCode: number;
  statusMsg: string;
  msg: string;
};
