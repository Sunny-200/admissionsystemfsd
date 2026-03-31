import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="border border-blue-900 text-blue-900 px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}