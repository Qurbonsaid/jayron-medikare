import { API_TAGS } from "@/constants/apiTags";
import { baseApi } from "../baseApi";
import { PATHS } from "./path";
import {
  Booking,
  BookingResponse,
  CreateBookingRequest,
  DeleteBookingResponse,
  GetAllBookingsParams,
  GetAllBookingsResponse,
  GetAvailableRoomsParams,
  GetAvailableRoomsResponse,
  GetBookingByPatientResponse,
  UpdateBookingRequest,
} from "./types";

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Yangi booking yaratish
    createBooking: builder.mutation<BookingResponse, CreateBookingRequest>({
      query: (body) => ({
        url: PATHS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAGS.BOOKING, API_TAGS.ROOM, API_TAGS.CORPUS],
    }),

    // Barcha bookinglarni olish (filterlar bilan)
    getAllBookings: builder.query<
      GetAllBookingsResponse,
      GetAllBookingsParams
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.start_date)
          queryParams.append("start_date", params.start_date);
        if (params.end_date) queryParams.append("end_date", params.end_date);
        if (params.room_id) queryParams.append("room_id", params.room_id);
        if (params.corpus_id) queryParams.append("corpus_id", params.corpus_id);

        const queryString = queryParams.toString();
        return {
          url: queryString ? `${PATHS.GET_ALL}?${queryString}` : PATHS.GET_ALL,
        };
      },
      providesTags: [API_TAGS.BOOKING],
    }),

    // Bemor bo'yicha bookinglarni olish
    getBookingsByPatient: builder.query<
      GetBookingByPatientResponse,
      { patient_id: string }
    >({
      query: ({ patient_id }) => ({
        url: `${PATHS.GET_BY_PATIENT}/${patient_id}`,
      }),
      providesTags: [API_TAGS.BOOKING],
    }),

    // Bo'sh xonalarni olish (availability bilan)
    getAvailableRooms: builder.query<
      GetAvailableRoomsResponse,
      GetAvailableRoomsParams
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.corpus_id) queryParams.append("corpus_id", params.corpus_id);
        if (params.room_id) queryParams.append("room_id", params.room_id);
        if (params.start_date)
          queryParams.append("start_date", params.start_date);
        if (params.end_date) queryParams.append("end_date", params.end_date);

        const queryString = queryParams.toString();
        return {
          url: queryString
            ? `${PATHS.AVAILABLE_ROOMS}?${queryString}`
            : PATHS.AVAILABLE_ROOMS,
        };
      },
      providesTags: [API_TAGS.BOOKING, API_TAGS.ROOM],
    }),

    // Bookingni yangilash
    updateBooking: builder.mutation<BookingResponse, UpdateBookingRequest>({
      query: ({ id, body }) => ({
        url: `${PATHS.UPDATE}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [API_TAGS.BOOKING, API_TAGS.ROOM, API_TAGS.CORPUS],
    }),

    // Bookingni o'chirish
    deleteBooking: builder.mutation<DeleteBookingResponse, { id: string }>({
      query: ({ id }) => ({
        url: `${PATHS.DELETE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.BOOKING, API_TAGS.ROOM, API_TAGS.CORPUS],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetAllBookingsQuery,
  useGetBookingsByPatientQuery,
  useGetAvailableRoomsQuery,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = bookingApi;
