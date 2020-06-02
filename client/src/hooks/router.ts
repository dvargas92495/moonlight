import { useLocation } from "react-router-dom";

export const useUserId = () => {
  const location = useLocation<{ userId: number }>();
  return location?.state?.userId || 0;
};

export const useUserType = () => {
  const location = useLocation<{ type: string }>();
  return location?.state?.type || "";
};
