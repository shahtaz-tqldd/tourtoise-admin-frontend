import { apiSlice } from "../api/apiSlice";

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNewDestination: builder.mutation({
      query: (formData) => {
        return {
          url: `/admin/destinations/create/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    destinationList: builder.query({
      query: ({ page = 1, page_size = 10, search_query = "" }) => {
        let url = `/admin/destinations/list?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["destination-list"],
    }),

    destinationDetail: builder.query({
      query: (destination_id) => {
        return {
          url: `/admin/destinations/${destination_id}/detail/`,
          method: "GET",
        };
      },
    }),

    updateDestination: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/update/`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    deleteDestination: builder.mutation({
      query: (destination_id) => {
        return {
          url: `/admin/destinations/${destination_id}/delete/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["destination-list"],
    }),
  }),
});

export const {
  useCreateNewDestinationMutation,
  useDestinationListQuery,
  useDestinationDetailQuery,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
} = destinationApiSlice;

export const useCreateDestinationMutation = useCreateNewDestinationMutation;
