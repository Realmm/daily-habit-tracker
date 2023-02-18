import { useSelector } from "react-redux";

const useSignedInAddress = () => {
  const signedInAddress = useSelector((s) => (s as any).address.value);
  return signedInAddress;
};

export default useSignedInAddress;
