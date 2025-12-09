import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyProfileQuery } from "@/features/settings/settingsApiSlice";
import { userDetailsFetched } from "@/features/auth/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const authChecked = !isAuthenticated || (isSuccess && data?.data);

  const { data, isSuccess, isLoading, refetch } = useGetMyProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  useEffect(() => {
    if (isAuthenticated && isSuccess && data?.data) {
      dispatch(userDetailsFetched(data.data));
    }
  }, [isSuccess, data, dispatch, isAuthenticated]);

  return {
    isLoading: isLoading || (isAuthenticated && !authChecked),
    authChecked,
    refetchProfile: refetch,
    user,
  };
};

export default useAuth;
