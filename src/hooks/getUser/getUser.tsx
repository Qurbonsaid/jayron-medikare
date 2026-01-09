import { useMeQuery } from '@/app/api/authApi/authApi';

const useGetUser = () => {
  const { data } = useMeQuery();
  return data.data;
};

export default useGetUser;
