
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold mb-8">
          <GraduationCap className="text-blue-600" size={30} />
          <span>Study<span className="text-blue-600">Space</span></span>
        </Link>

        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-slate-500 mt-2 mb-7">
          Login to continue your learning journey.
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Email address</label>
            <div className="flex items-center border border-slate-200 rounded-xl px-4">
              <Mail size={18} className="text-slate-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className="flex items-center border border-slate-200 rounded-xl px-4">
              <Lock size={18} className="text-slate-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-7">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
