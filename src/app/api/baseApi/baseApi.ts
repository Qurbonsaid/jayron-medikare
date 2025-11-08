// baseApi.ts
import { API_TAGS } from '@/constants/apiTags';
import { SERVER_URL } from '@/constants/ServerUrl';
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

// Constants
const CACHE_KEY = 'rtk_cache';
const TOKEN_KEY = 'auth_token';

// Load full cache
const loadCache = (): Record<string, any> => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Cache`ni yuklashda xatolik:', error);
    return {};
  }
};

const updateCache = (url: string, data: any) => {
  try {
    const cache = loadCache();

    cache[url] = data;
    const token =
      data?.token ||
      data?.accessToken ||
      data?.access_token ||
      data?.data?.token ||
      data?.data?.access_token;

    if (token && typeof token === 'string') {
      localStorage.setItem(TOKEN_KEY,token)
    } else {
      console.warn('⚠️ No token found in response data');
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('❌ Cache`ni yangilashda xatolik:', error);
  }
};

const clearAuthTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('❌ Auth tokenni tozalashda xatolik:', error);
  }
}

export const getTokenFromCache = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ?? null;
};

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url ?? '';

  const baseQuery = fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      const token = getTokenFromCache();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  });

  const result = await baseQuery(args, api, extraOptions);

  if (!('error' in result) && result.data) {
    const responseData = result.data as any;
    const isSuccessResponse = responseData?.success !== false;

    if (isSuccessResponse) {
      updateCache(url, result.data);
    } else {
      console.error(`⚠️ Skipping cache for error response: ${url}`);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: customBaseQuery,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
});

export { updateCache , clearAuthTokens};
export default baseApi;
