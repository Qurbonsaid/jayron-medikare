import { CreateExamReq, ExamResponse } from '.';
import { baseApi } from '../baseApi';
import { PATHS } from './path';
import {
  AllExamReq,
  AllExamRes,
  createPrescriptionReq,
  MutationRes,
  ExamRes,
  UpdateExamReq,
  updatePrescriptionReq,
  deletePrescriptionReq,
  addImagesRes,
  imageReq,
  reomveimagesRes,
} from './types';

export const examinationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // exams
    createExam: builder.mutation<ExamResponse, CreateExamReq>({
      query: (body) => ({
        url: PATHS.CREATE_EXAM,
        method: 'POST',
        body,
      }),
    }),
    getAllExams: builder.query<AllExamRes, AllExamReq>({
      query: (params) => ({
        url: PATHS.ALL_EXAMS,
        params,
      }),
    }),
    getOneExam: builder.query<ExamRes, string>({
      query: (id) => ({
        url: PATHS.GET_EXAM + id,
      }),
    }),
    deleteExam: builder.mutation<MutationRes, string>({
      query: (id) => ({
        url: PATHS.DELETE_EXAM + id,
        method: 'DELETE',
      }),
    }),
    updateExam: builder.mutation<MutationRes, UpdateExamReq>({
      query: ({ id, body }) => ({
        url: PATHS.UPDATE_EXAM + id,
        method: 'PATCH',
        body,
      }),
    }),

    // prescriptions

    createPrescription: builder.mutation<MutationRes, createPrescriptionReq>({
      query: ({ id, body }) => ({
        url: PATHS.CREATE_PRESCRIPTION + id + PATHS.PRESCRIPTION,
        method: 'POST',
        body,
      }),
    }),
    updatePrescription: builder.mutation<MutationRes, updatePrescriptionReq>({
      query: ({ id, prescription_id, body }) => ({
        url:
          PATHS.CREATE_PRESCRIPTION + id + PATHS.PRESCRIPTION + prescription_id,
        method: 'PATCH',
        body,
      }),
    }),
    deletePrescription: builder.mutation<MutationRes, deletePrescriptionReq>({
      query: ({ id, prescription_id }) => ({
        url:
          PATHS.CREATE_PRESCRIPTION + id + PATHS.PRESCRIPTION + prescription_id,
        method: 'DELETE',
      }),
    }),

    // images

    addImages: builder.mutation<addImagesRes, imageReq>({
      query: ({ id, body }) => ({
        url: 'examination/add/' + id + 'images',
        method: 'POST',
        body,
      }),
    }),
    removeImages: builder.mutation<reomveimagesRes, imageReq>({
      query: ({ id, body }) => ({
        url: 'examination/remove/' + id + 'images',
        method: 'DELETE',
        body,
      }),
    }),

    //complete exams

    completeExams: builder.mutation<MutationRes, string>({
      query: (id) => ({
        url: 'examination/complete/' + id,
        method: 'PATCH',
      }),
    }),
  }),
});

export const {
  useCreateExamMutation,
  useAddImagesMutation,
  useCompleteExamsMutation,
  useCreatePrescriptionMutation,
  useDeleteExamMutation,
  useDeletePrescriptionMutation,
  useGetAllExamsQuery,
  useGetOneExamQuery,
  useRemoveImagesMutation,
  useUpdateExamMutation,
  useUpdatePrescriptionMutation,
} = examinationApi;
