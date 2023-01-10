import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const buildApi = createApi({
    reducerPath: 'build',
    baseQuery: fetchBaseQuery(),
    endpoints: (builder) => ({
        uploadBuild: builder.mutation({
            query: (file) => ({ url: `/api/build/upload`, method: 'POST', body: file }),
        }),
    }),
})

export const matchApi = createApi({
    reducerPath: 'match',
    baseQuery: fetchBaseQuery(),
    endpoints: (builder) => ({
        match: builder.query({
            query: (md5) => `/api/match/${md5}`,
        }),
        upload: builder.mutation({
            async queryFn(file, _queryApi, _extraOptions, fetchWithBQ) {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetchWithBQ({
                  url: '/api/upload',
                  method: 'POST',
                  body: formData,
                }, _queryApi, _extraOptions);
                if (response.error) throw response.error;
                return response.data ? { data: response.data } : { error: response.error };
              },
        }),
    }),
})