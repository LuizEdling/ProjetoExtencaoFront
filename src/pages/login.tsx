import { Navigate } from "react-router-dom";
import LoginComponent from "../components/Login";
import { getStoredToken } from "../lib/apiClient";

export default function Login() {
  if (getStoredToken()) {
    return <Navigate to="/painel" replace />;
  }

  return (
    <div>
      <LoginComponent />
    </div>
  );
}
