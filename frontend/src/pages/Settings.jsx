
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

import {
  User,
  Mail,
  Lock,
  Save,
  LogOut,
  ShieldCheck,
  Camera,
  Upload,
  X,
  Monitor,
  Smartphone,
  RefreshCw,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  Settings as SettingsIcon,
  AlertCircle,
  KeyRound,
  Laptop,
  Globe,
  Check,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown";

  return parsed.toLocaleString();
};

const getDeviceName = (userAgent = "") => {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet Device";

  if (/mobile|android|iphone/i.test(userAgent)) {
    return "Mobile Device";
  }

  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/macintosh|mac os/i.test(userAgent)) return "Mac";
  if (/linux/i.test(userAgent)) return "Linux Device";

  return "Unknown Device";
};

const getBrowserName = (userAgent = "") => {
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("OPR/")) return "Opera";
  if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
  if (userAgent.includes("Chrome/")) return "Google Chrome";
  if (userAgent.includes("Safari/")) return "Safari";

  return "Unknown Browser";
};

function SectionHeading({ icon: Icon, title, description, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <div className={`rounded-xl p-3 ${colors[color]}`}>
        <Icon size={22} />
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Message({ type = "success", children }) {
  if (!children) return null;

  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const Icon = type === "error" ? AlertCircle : CheckCircle2;

  return (
    <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${styles}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span className="break-words">{children}</span>
    </div>
  );
}

function DeviceIcon({ userAgent }) {
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent || "");

  return isMobile ? <Smartphone size={22} /> : <Laptop size={22} />;
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Profile picture
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    user?.profilePicture || ""
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [imageError, setImageError] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Messages
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Active sessions
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [revokingSession, setRevokingSession] = useState("");
  const [revokeOthersLoading, setRevokeOthersLoading] = useState(false);
  const [revokeOthersError, setRevokeOthersError] = useState("");

  // Login history
  const [loginHistory, setLoginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // Sync profile fields if auth user changes
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPreviewImage(user?.profilePicture || "");
  }, [user]);

  // Cleanup temporary preview URL
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Fetch sessions
  const fetchSessions = async () => {
    setSessionsLoading(true);
    setSessionsError("");

    try {
      const response = await api.get("/auth/sessions");
      setSessions(response.data.sessions || []);
    } catch (error) {
      setSessionsError(
        error.response?.data?.message ||
          "Unable to load active sessions."
      );
    } finally {
      setSessionsLoading(false);
    }
  };

  // Fetch login history
  const fetchLoginHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await api.get("/auth/login-history");
      setLoginHistory(response.data.activities || []);
    } catch (error) {
      setHistoryError(
        error.response?.data?.message ||
          "Unable to load login history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchLoginHistory();
  }, []);

  // Logout other devices
  const handleRevokeOtherSessions = async () => {
    const otherSessions = sessions.filter(
      (session) => !session.isCurrent
    );

    if (otherSessions.length === 0) {
      setSessionMessage("There are no other active devices to log out.");
      setRevokeOthersError("");
      return;
    }

    const confirmed = window.confirm(
      `Log out from ${otherSessions.length} other device(s)? Your current device will stay logged in.`
    );

    if (!confirmed) return;

    setRevokeOthersLoading(true);
    setRevokeOthersError("");
    setSessionMessage("");

    try {
      const response = await api.post("/auth/sessions/revoke-others");

      setSessionMessage(
        response.data.message ||
          `Logged out from ${response.data.terminatedCount || 0} other device(s).`
      );

      await fetchSessions();
    } catch (error) {
      setRevokeOthersError(
        error.response?.data?.message ||
          "Unable to log out from other devices."
      );
    } finally {
      setRevokeOthersLoading(false);
    }
  };

  // Revoke individual session
  const handleRevokeSession = async (session) => {
    const confirmed = window.confirm(
      session.isCurrent
        ? "Are you sure you want to log out from this device?"
        : "Are you sure you want to log out this device?"
    );

    if (!confirmed) return;

    setRevokingSession(session.sessionId);
    setSessionMessage("");
    setSessionsError("");

    try {
      const response = await api.delete(
        `/auth/sessions/${encodeURIComponent(session.sessionId)}`
      );

      if (response.data.isCurrent) {
        logout();
        window.location.href = "/login";
        return;
      }

      setSessionMessage(
        response.data.message || "Device session terminated successfully."
      );

      await fetchSessions();
    } catch (error) {
      setSessionsError(
        error.response?.data?.message ||
          "Unable to terminate this session."
      );
    } finally {
      setRevokingSession("");
    }
  };

  // Select profile picture
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageMessage("");
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5 MB.");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;

    setSelectedImage(file);
    setPreviewImage(objectUrl);
  };

  // Cancel image selection
  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewImage(user?.profilePicture || "");
    setImageError("");
    setImageMessage("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload profile picture
  const handleImageUpload = async () => {
    if (!selectedImage) {
      setImageError("Please select an image first.");
      return;
    }

    setImageLoading(true);
    setImageMessage("");
    setImageError("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", selectedImage);

      const response = await api.post("/profile/picture", formData);

      updateUser(response.data.user);

      setPreviewImage(response.data.user.profilePicture);
      setSelectedImage(null);
      setImageMessage(response.data.message);

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setImageError(
        error.response?.data?.message ||
          "Unable to upload profile picture."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (name.trim().length < 2) {
      setProfileError("Name must contain at least 2 characters.");
      return;
    }

    setProfileLoading(true);

    try {
      const response = await api.put("/auth/profile", {
        name: name.trim(),
        email: email.trim(),
      });

      updateUser(response.data.user);
      setProfileMessage(response.data.message);
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(response.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const otherDevicesCount = sessions.filter(
    (session) => !session.isCurrent
  ).length;

  const successfulLogins = loginHistory.filter(
    (activity) => activity.status === "success"
  ).length;

  const failedLogins = loginHistory.filter(
    (activity) => activity.status !== "success"
  ).length;

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">

        {/* Page Header */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <SettingsIcon size={17} />
            ACCOUNT / SETTINGS
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Account Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage your profile, password, devices and account security.
          </p>
        </div>

        {/* Account Overview */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 text-white">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={36} />
              )}
            </div>

            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Your Account
              </span>

              <h2 className="mt-1 break-words text-xl font-bold sm:text-2xl">
                {user?.name || "Welcome"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-300">
                {user?.email || ""}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                <ShieldCheck size={14} />
                Account Settings
              </div>
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Monitor size={21} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {sessionsLoading ? "—" : sessions.length}
                </p>
                <p className="text-xs text-slate-500">Active Sessions</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {historyLoading ? "—" : successfulLogins}
                </p>
                <p className="text-xs text-slate-500">Successful Logins</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={21} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {historyLoading ? "—" : failedLogins}
                </p>
                <p className="text-xs text-slate-500">Failed Logins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={Camera}
            title="Profile Picture"
            description="Upload or change your profile photo."
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center self-center overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 sm:self-auto">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={45} className="text-slate-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Camera size={17} />
                  Choose Picture
                </button>

                {selectedImage && (
                  <>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={imageLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {imageLoading ? (
                        <RefreshCw size={17} className="animate-spin" />
                      ) : (
                        <Upload size={17} />
                      )}
                      {imageLoading ? "Uploading..." : "Upload Picture"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelImage}
                      disabled={imageLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <p className="mt-3 text-xs text-slate-400">
                JPG, PNG or WebP. Maximum size 5 MB.
              </p>

              {selectedImage && (
                <p className="mt-2 break-all text-xs font-medium text-blue-600">
                  Selected: {selectedImage.name}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <Message type="error">{imageError}</Message>
                <Message>{imageMessage}</Message>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={User}
            title="Profile Information"
            description="Update your personal account details."
          />

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                <User size={18} className="shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  required
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm text-slate-800 outline-none"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                <Mail size={18} className="shrink-0 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm text-slate-800 outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Message type="error">{profileError}</Message>
              <Message>{profileMessage}</Message>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {profileLoading ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {profileLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Change Password */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={KeyRound}
            title="Change Password"
            description="Keep your account secure with a strong password."
            color="purple"
          />

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {[
              {
                label: "Current Password",
                value: currentPassword,
                setValue: setCurrentPassword,
                placeholder: "Enter current password",
                autoComplete: "current-password",
              },
              {
                label: "New Password",
                value: newPassword,
                setValue: setNewPassword,
                placeholder: "Enter new password",
                autoComplete: "new-password",
              },
              {
                label: "Confirm New Password",
                value: confirmPassword,
                setValue: setConfirmPassword,
                placeholder: "Confirm new password",
                autoComplete: "new-password",
              },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label}
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-purple-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-50">
                  <Lock size={18} className="shrink-0 text-slate-400" />

                  <input
                    type="password"
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                    autoComplete={field.autoComplete}
                    minLength={field.label !== "Current Password" ? 6 : undefined}
                    required
                    className="w-full min-w-0 bg-transparent py-3.5 text-sm outline-none"
                    placeholder={field.placeholder}
                  />
                </div>
              </div>
            ))}

            <p className="text-xs text-slate-400">
              New password must contain at least 6 characters.
            </p>

            <div className="space-y-2">
              <Message type="error">{passwordError}</Message>
              <Message>{passwordMessage}</Message>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
            >
              {passwordLoading ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Lock size={17} />
              )}
              {passwordLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </section>

        {/* Active Sessions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <SectionHeading
              icon={ShieldCheck}
              title="Active Login Sessions"
              description="Manage devices where your account is logged in."
              color="green"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                disabled={revokeOthersLoading || sessionsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                <LogOut size={16} />
                {revokeOthersLoading ? "Logging out..." : "Logout Other Devices"}
              </button>

              <button
                type="button"
                onClick={fetchSessions}
                disabled={sessionsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                <RefreshCw
                  size={16}
                  className={sessionsLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <Message type="error">{sessionsError}</Message>
            <Message type="error">{revokeOthersError}</Message>
            <Message>{sessionMessage}</Message>
          </div>

          {!sessionsLoading && !sessionsError && sessions.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {sessions.length} Active Sessions
              </span>

              <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                {otherDevicesCount} Other Devices
              </span>
            </div>
          )}

          {sessionsLoading ? (
            <div className="flex flex-col items-center py-12 text-slate-500">
              <RefreshCw size={26} className="animate-spin text-blue-600" />
              <p className="mt-3 text-sm">Loading active sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 py-12 text-center">
              <Monitor size={34} className="mx-auto text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">
                No active sessions found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your active devices will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                        <DeviceIcon userAgent={session.userAgent} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {getDeviceName(session.userAgent)}
                          </h3>

                          {session.isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <Check size={12} />
                              This Device
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {getBrowserName(session.userAgent)}
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <Globe size={14} className="shrink-0" />
                            <span className="break-all">
                              {session.ipAddress || "Unknown IP"}
                            </span>
                          </span>

                          <span className="flex items-center gap-2">
                            <Clock size={14} className="shrink-0" />
                            Last active: {formatDate(session.lastActiveAt)}
                          </span>

                          <span className="flex items-center gap-2 sm:col-span-2">
                            <History size={14} className="shrink-0" />
                            Login: {formatDate(session.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session)}
                      disabled={revokingSession === session.sessionId}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:w-auto"
                    >
                      {revokingSession === session.sessionId ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <LogOut size={16} />
                      )}
                      {revokingSession === session.sessionId
                        ? "Logging out..."
                        : "Logout Device"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            If you see a device you do not recognize, log it out immediately
            and consider changing your password.
          </div>
        </section>

        {/* Login History */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              icon={History}
              title="Login History"
              description="Review recent successful and failed login attempts."
              color="blue"
            />

            <button
              type="button"
              onClick={fetchLoginHistory}
              disabled={historyLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={historyLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <Message type="error">{historyError}</Message>

          {historyLoading ? (
            <div className="flex flex-col items-center py-12 text-slate-500">
              <RefreshCw size={26} className="animate-spin text-blue-600" />
              <p className="mt-3 text-sm">Loading login history...</p>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 py-12 text-center">
              <History size={34} className="mx-auto text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">
                No login history found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your login attempts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((activity) => (
                <div
                  key={activity._id}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50/70"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 rounded-xl p-3 ${
                        activity.status === "success"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <XCircle size={21} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {activity.status === "success"
                            ? "Successful Login"
                            : "Failed Login Attempt"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            activity.status === "success"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {activity.status === "success" ? "Success" : "Failed"}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <Globe size={14} className="shrink-0" />
                          <span className="break-all">
                            {activity.ipAddress || "Unknown IP"}
                          </span>
                        </span>

                        <span className="flex items-center gap-2">
                          <Monitor size={14} className="shrink-0" />
                          {getBrowserName(activity.userAgent)}
                        </span>

                        <span className="flex items-center gap-2">
                          <Smartphone size={14} className="shrink-0" />
                          {getDeviceName(activity.userAgent)}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock size={14} className="shrink-0" />
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>

                      {activity.failureReason && (
                        <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                          <strong>Failure Reason:</strong>
                          <p className="mt-1 break-words">
                            {activity.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Logout */}
        <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Logout
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign out of your StudySpace account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
