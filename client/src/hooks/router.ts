import { useLocation } from "react-router-dom"

export const useUserId = () => {
    const location = useLocation();
    return location?.state?.userId || 0;
}

export const useUserType = () => {
    const location = useLocation();
    return location?.state?.type || '';
}