import { API_TAGS } from '@/constants/apiTags';
import { baseApi } from '../baseApi';
import { PATHS } from './path';
import { GetAboutVideoByTypeResponse, VideoType } from './types';

export const aboutVideoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutVideoByType: builder.query<GetAboutVideoByTypeResponse, VideoType>({
      query: (type) => ({
        url: PATHS.GET_BY_TYPE(type),
        method: 'GET',
      }),
      providesTags: [API_TAGS.ABOUT_VIDEO],
    }),
  }),
});

export const { useGetAboutVideoByTypeQuery, useLazyGetAboutVideoByTypeQuery } = aboutVideoApi;
