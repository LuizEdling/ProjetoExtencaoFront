import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredToken } from "../lib/apiClient";

export default function RequireAuth() {
  const location = useLocation();
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
