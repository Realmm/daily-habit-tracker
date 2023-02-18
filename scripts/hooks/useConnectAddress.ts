import { useSelector } from "react-redux";

const useConnectAddress = () => {
  const connectAddress = useSelector((s) => (s as any).address.value);
  return connectAddress;
};

export default useConnectAddress;
