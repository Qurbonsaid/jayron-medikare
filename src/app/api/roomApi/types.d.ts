export type CorpusId = {
  _id: string;
  corpus_number: number;
  description: string;
  total_rooms: number;
};

export type Room = {
  room_name: string;
  room_price: number;
  corpus_id: string | CorpusId;
  patient_capacity: number;
  patient_occupied: number;
  patients: [];
  floor_number: number;
  description: string;
  status: string;
  _id: string;
  created_at: string;
  updated_at: string;
};

export type RoomError = {
  statusCode: number;
  statusMsg: string;
  msg: string;
};

export type CreatedRoomRequest = {
  room_name: string;
  room_price: number;
  corpus_id: string;
  patient_capacity: number;
  patient_occupied: number;
  patients: [];
  floor_number: number;
  description: string;
};

export type CreatedRoomResponse = {
  success: boolean;
  message: string;
  data: Room;
  error?: RoomError;
};

export type GetAllRoomsParams = {
  page?: number;
  limit?: number;
  search?: string;
  corpus_id?: string;
  floor_number?: number;
  available?: boolean;
};

export type GetAllRoomsResponse = {
  success: true;
  data: Room[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    next_page: number | boolean | null;
    prev_page: number | boolean | null;
  };
};

export type GetOneRoomResponse = {
  success: boolean;
  message: string;
  data: Room;
  error?: RoomError;
};

export type UpdatedRoomRequest = {
  body: {
    room_name: string;
    room_price: number;
    corpus_id: string;
    patient_capacity: number;
    patient_occupied: number;
    patient_ids: string[];
    floor_number: number;
    description: string;
  };
  id: string;
};

export type DeletedRoomResponse = {
  success: boolean;
  message: string;
  error?: RoomError;
};
