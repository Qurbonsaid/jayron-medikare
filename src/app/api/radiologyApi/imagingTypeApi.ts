import { API_TAGS } from "@/constants/apiTags";
import { baseApi } from "../baseApi";
import { IMAGING_TYPE_PATHS } from "./path";
import {
  CreatedImagingTypeRequest,
  CreatedImagingTypeResponse,
  DeletedImagingTypeResponse,
  GetAllImagingTypesParams,
  GetAllImagingTypesResponse,
  GetOneImagingTypeResponse,
  UpdatedImagingTypeRequest,
} from "./types";

export const imagingTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createImagingType: builder.mutation<
      CreatedImagingTypeResponse,
      CreatedImagingTypeRequest
    >({
      query: (body) => ({
        url: IMAGING_TYPE_PATHS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAGS.IMAGING_TYPE],
    }),

    getAllImagingTypes: builder.query<
      GetAllImagingTypesResponse,
      GetAllImagingTypesParams
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page != null)
          queryParams.append("page", params.page.toString());
        if (params.limit != null)
          queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        return {
          url: queryParams
            ? `${IMAGING_TYPE_PATHS.GET_ALL}?${queryString}`
            : IMAGING_TYPE_PATHS.GET_ALL,
        };
      },
      providesTags: [API_TAGS.IMAGING_TYPE],
    }),

    getOneImagingType: builder.query<
      GetOneImagingTypeResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: IMAGING_TYPE_PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.IMAGING_TYPE],
    }),

    updateImagingType: builder.mutation<
      CreatedImagingTypeResponse,
      UpdatedImagingTypeRequest
    >({
      query: ({ id, body }) => ({
        url: IMAGING_TYPE_PATHS.UPDATE + id,
        method: "PUT",
        body,
      }),
      invalidatesTags: [API_TAGS.IMAGING_TYPE],
    }),

    deleteImagingType: builder.mutation<
      DeletedImagingTypeResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: IMAGING_TYPE_PATHS.DELETE + id,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.IMAGING_TYPE],
    }),
  }),
});

export const {
  useCreateImagingTypeMutation,
  useGetAllImagingTypesQuery,
  useGetOneImagingTypeQuery,
  useUpdateImagingTypeMutation,
  useDeleteImagingTypeMutation,
} = imagingTypeApi;
