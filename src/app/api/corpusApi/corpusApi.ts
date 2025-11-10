import { API_TAGS } from "@/constants/apiTags";
import { baseApi } from "../baseApi";
import { PATHS } from "./path";
import {
  CorpusesGetAllResponse,
  CreatedCorpusRequest,
  CreatedCorpusResponse,
  DeletedCorpusResponse,
  GetONeCorpusResponse,
  UpdatedCorpusRequest,
} from "./types";

export type GetCorpusesParams = {
  page?: number;
  limit?: number;
  search?: string;
  corpus_number?: number;
};

export const corpusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCorpus: builder.mutation<CreatedCorpusResponse, CreatedCorpusRequest>(
      {
        query: (body) => ({
          url: PATHS.CREATE,
          method: "POST",
          body,
        }),
        invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
      }
    ),

    getCorpuses: builder.query<CorpusesGetAllResponse, GetCorpusesParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page != null)
          queryParams.append("page", params.page.toString());
        if (params.limit != null)
          queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.corpus_number)
          queryParams.append("corpus_number", params.corpus_number.toString());

        const queryString = queryParams.toString();
        return {
          url: queryParams ? `${PATHS.GET_ALL}?${queryString}` : PATHS.GET_ALL,
        };
      },
      providesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    getOneCorpus: builder.query<GetONeCorpusResponse, { id: string }>({
      query: ({ id }) => ({
        url: PATHS.GET_ONE + id,
      }),
      providesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),

    updateCorpus: builder.mutation<CreatedCorpusResponse, UpdatedCorpusRequest>(
      {
        query: ({ id, body }) => ({
          url: PATHS.UPDATE + id,
          method: "PUT",
          body,
        }),
        invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
      }
    ),

    deleteCorpus: builder.mutation<DeletedCorpusResponse, { id: string }>({
      query: ({ id }) => ({
        url: PATHS.DELETE + id,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.CORPUS, API_TAGS.ROOM],
    }),
  }),
});

export const {
  useCreateCorpusMutation,
  useGetCorpusesQuery,
  useGetOneCorpusQuery,
  useUpdateCorpusMutation,
  useDeleteCorpusMutation,
} = corpusApi;
