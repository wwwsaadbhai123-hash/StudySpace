
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("studyspace_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        localStorage.removeItem("studyspace_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);

    localStorage.setItem("studyspace_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);

    localStorage.setItem("studyspace_token", response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const updateUser = (updatedUser) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updatedUser,
    }));
  };

  const logout = () => {
    localStorage.removeItem("studyspace_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
