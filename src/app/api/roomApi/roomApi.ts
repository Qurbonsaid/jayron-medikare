import { API_TAGS } from "@/constants/apiTags";
import { baseApi } from "../baseApi";
import { PATHS } from "./path";
import {
  CreatedRoomRequest,
  CreatedRoomResponse,
  DeletedRoomResponse,
  GetAllRoomsParams,
  GetAllRoomsResponse,
  GetOneRoomResponse,
  UpdatedRoomRequest,
} from "./types";

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation<CreatedRoomResponse, CreatedRoomRequest>({
      query: (body) => ({
        url: PATHS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    getAllRooms: builder.query<GetAllRoomsResponse, GetAllRoomsParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page != null)
          queryParams.append("page", params.page.toString());
        if (params.limit != null)
          queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.corpus_id)
          queryParams.append("corpus_id", params.corpus_id.toString());
        if (params.floor_number)
          queryParams.append("floor_number", params.floor_number.toString());
        if (params.available)
          queryParams.append("available", params.available.toString());

        const queryString = queryParams.toString();
        return {
          url: queryParams ? `${PATHS.GET_ALL}?${queryString}` : PATHS.GET_ALL,
        };
      },
      providesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    getOneRoom: builder.query<GetOneRoomResponse, { id: string }>({
      query: ({ id }) => ({
        url: PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    updateRoom: builder.mutation<CreatedRoomResponse, UpdatedRoomRequest>({
      query: ({ id, body }) => ({
        url: PATHS.UPDATE + id,
        method: "PUT",
        body,
      }),
      invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    deleteRoom: builder.mutation<DeletedRoomResponse, { id: string }>({
      query: ({ id }) => ({
        url: PATHS.DELETE + id,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    addPatientRoom: builder.mutation<
      CreatedRoomResponse,
      { id: string; patient_id: string }
    >({
      query: ({ id, patient_id }) => ({
        url: PATHS.ADD_PATIENT + id,
        method: "POST",
        body: { patient_id },
      }),
      invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    removePatientRoom: builder.mutation<
      CreatedRoomResponse,
      { id: string; patient_id: string }
    >({
      query: ({ id, patient_id }) => ({
        url: PATHS.REMOVE_PATIENT + id,
        method: "POST",
        body: { patient_id },
      }),
      invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useGetAllRoomsQuery,
  useGetOneRoomQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useAddPatientRoomMutation,
  useRemovePatientRoomMutation,
} = roomApi;
