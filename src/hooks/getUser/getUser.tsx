import { useMeQuery } from "@/app/api/authApi/authApi"

const getUser = () => {
  const {data} = useMeQuery();
  return data.data
}

export default getUser