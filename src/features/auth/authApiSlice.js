import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/login`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["auth", "my-profile"],
    }),

    registration: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/register`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["auth"],
    }),

    forgotPassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/forget-password`,
          method: "POST",
          body: payload,
        };
      },
    }),

    resetPassword: builder.mutation({
      query: (payload) => {
        const { bodyData, userId, token } = payload;
        return {
          url: `auth/forget-password/${userId}/${token}`,
          method: "POST",
          body: bodyData,
        };
      },
    }),

    changePassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/reset-password`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    userList: builder.query({
      query: ({ page, page_size, search_str }) => {
        return {
          url: `/auth/list?page=${page}&page_size=${page_size}&search_str=${
            search_str || ""
          }`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUserListQuery,
} = authApiSlice;
