import { API_TAGS } from "@/constants/apiTags";
import { baseApi } from "../baseApi";
import { MEDICAL_IMAGE_PATHS } from "./path";
import {
  CreatedMedicalImageRequest,
  CreatedMedicalImageResponse,
  DeletedMedicalImageResponse,
  GetAllMedicalImagesParams,
  GetAllMedicalImagesResponse,
  GetOneMedicalImageResponse,
  UpdatedMedicalImageRequest,
} from "./types";

export const medicalImageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMedicalImage: builder.mutation<
      CreatedMedicalImageResponse,
      CreatedMedicalImageRequest
    >({
      query: (body) => ({
        url: MEDICAL_IMAGE_PATHS.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAGS.MEDICAL_IMAGE, API_TAGS.PATIENTS],
    }),

    getAllMedicalImages: builder.query<
      GetAllMedicalImagesResponse,
      GetAllMedicalImagesParams
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page != null)
          queryParams.append("page", params.page.toString());
        if (params.limit != null)
          queryParams.append("limit", params.limit.toString());
        if (params.patient_id)
          queryParams.append("patient_id", params.patient_id);
        if (params.examination_id)
          queryParams.append("examination_id", params.examination_id);
        if (params.imaging_type_id)
          queryParams.append("imaging_type_id", params.imaging_type_id);
        if (params.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        return {
          url: queryParams
            ? `${MEDICAL_IMAGE_PATHS.GET_ALL}?${queryString}`
            : MEDICAL_IMAGE_PATHS.GET_ALL,
        };
      },
      providesTags: [API_TAGS.MEDICAL_IMAGE, API_TAGS.PATIENTS],
    }),

    getOneMedicalImage: builder.query<
      GetOneMedicalImageResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: MEDICAL_IMAGE_PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.MEDICAL_IMAGE],
    }),

    updateMedicalImage: builder.mutation<
      CreatedMedicalImageResponse,
      UpdatedMedicalImageRequest
    >({
      query: ({ id, body }) => ({
        url: MEDICAL_IMAGE_PATHS.UPDATE + id,
        method: "PUT",
        body,
      }),
      invalidatesTags: [API_TAGS.MEDICAL_IMAGE, API_TAGS.PATIENTS],
    }),

    deleteMedicalImage: builder.mutation<
      DeletedMedicalImageResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: MEDICAL_IMAGE_PATHS.DELETE + id,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.MEDICAL_IMAGE, API_TAGS.PATIENTS],
    }),
  }),
});

export const {
  useCreateMedicalImageMutation,
  useGetAllMedicalImagesQuery,
  useGetOneMedicalImageQuery,
  useUpdateMedicalImageMutation,
  useDeleteMedicalImageMutation,
} = medicalImageApi;
