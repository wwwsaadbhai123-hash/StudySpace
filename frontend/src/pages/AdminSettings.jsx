
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../services/api";

import {
  Save,
  RefreshCw,
  Settings,
  Globe,
  UserPlus,
  Wrench,
  Megaphone,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Info,
  Building2,
  Power,
} from "lucide-react";

function SettingsSection({ icon: Icon, title, description, children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={22} />
        </div>

        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function ToggleSetting({
  title,
  description,
  name,
  checked,
  onChange,
  color = "blue",
}) {
  const activeColor =
    color === "orange" ? "bg-orange-600" : "bg-blue-600";

  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          name={name}
          checked={Boolean(checked)}
          onChange={onChange}
          className="peer sr-only"
        />

        <span
          className={`h-7 w-12 rounded-full transition ${
            checked ? activeColor : "bg-slate-300"
          }`}
        />

        <span
          className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: "StudySpace",
    platformDescription: "",
    allowRegistration: true,
    maintenanceMode: false,
    announcement: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.get("/admin/settings");

      setSettings(response.data.settings);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.put(
        "/admin/settings",
        settings
      );

      setSettings(response.data.settings);
      setMessage("Settings saved successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50/70">
          <RefreshCw size={30} className="animate-spin text-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading platform settings...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Settings size={17} />
              ADMINISTRATION / SETTINGS
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Admin Settings
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage and customize your StudySpace platform.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Reload Settings
          </button>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <ShieldCheck size={14} />
                PLATFORM CONTROL CENTER
              </span>

              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Manage your platform your way
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                Configure platform details, control registrations,
                manage maintenance and publish announcements.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Settings size={32} />
            </div>
          </div>

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        {/* Alerts */}
        {message && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle size={21} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Success</p>
              <p className="mt-1 text-sm">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={21} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-sm">Something went wrong</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Platform Information */}
          <SettingsSection
            icon={Globe}
            title="Platform Information"
            description="Customize the basic identity of your platform."
            color="blue"
          >
            <div>
              <label
                htmlFor="platformName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Platform Name
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="platformName"
                  type="text"
                  name="platformName"
                  value={settings.platformName || ""}
                  onChange={handleChange}
                  maxLength={60}
                  required
                  placeholder="Enter platform name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <p className="mt-1.5 text-right text-xs text-slate-400">
                {(settings.platformName || "").length}/60
              </p>
            </div>

            <div>
              <label
                htmlFor="platformDescription"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Platform Description
              </label>

              <textarea
                id="platformDescription"
                name="platformDescription"
                value={settings.platformDescription || ""}
                onChange={handleChange}
                maxLength={300}
                rows={4}
                placeholder="Describe your StudySpace platform..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-1.5 text-right text-xs text-slate-400">
                {(settings.platformDescription || "").length}/300
              </p>
            </div>
          </SettingsSection>

          {/* Registration */}
          <SettingsSection
            icon={UserPlus}
            title="Registration Settings"
            description="Control who can create new accounts on your platform."
            color="violet"
          >
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                <UserPlus size={19} />
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  New Student Registration
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enable or disable new account registrations.
                </p>
              </div>
            </div>

            <ToggleSetting
              title="Allow New Registrations"
              description={
                settings.allowRegistration
                  ? "New students can create accounts."
                  : "New student registrations are disabled."
              }
              name="allowRegistration"
              checked={settings.allowRegistration}
              onChange={handleChange}
              color="blue"
            />

            <div className={`rounded-xl p-3 text-sm ${
              settings.allowRegistration
                ? "bg-emerald-50 text-emerald-700"
                : "bg-orange-50 text-orange-700"
            }`}>
              <div className="flex items-center gap-2">
                <Info size={17} />
                <span className="font-medium">
                  Registration is currently{" "}
                  {settings.allowRegistration ? "enabled" : "disabled"}.
                </span>
              </div>
            </div>
          </SettingsSection>

          {/* Maintenance */}
          <SettingsSection
            icon={Wrench}
            title="Maintenance Mode"
            description="Control the maintenance status of your platform."
            color="orange"
          >
            <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4">
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                <Power size={19} />
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  Platform Availability
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Manage the maintenance mode setting for your platform.
                </p>
              </div>
            </div>

            <ToggleSetting
              title="Enable Maintenance Mode"
              description={
                settings.maintenanceMode
                  ? "Maintenance mode is enabled."
                  : "Maintenance mode is currently disabled."
              }
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              color="orange"
            />

            {settings.maintenanceMode && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle size={18} />
                  Maintenance mode is enabled
                </div>
                <p className="mt-1 text-xs leading-5">
                  Make sure your backend and frontend correctly enforce
                  this setting before relying on it.
                </p>
              </div>
            )}
          </SettingsSection>

          {/* Announcement */}
          <SettingsSection
            icon={Megaphone}
            title="Platform Announcement"
            description="Write an announcement for your StudySpace platform."
            color="emerald"
          >
            <div>
              <label
                htmlFor="announcement"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Announcement Message
              </label>

              <textarea
                id="announcement"
                name="announcement"
                value={settings.announcement || ""}
                onChange={handleChange}
                maxLength={500}
                rows={5}
                placeholder="Write an announcement for your platform..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  This message can be displayed to platform users.
                </p>

                <span className="shrink-0 text-xs text-slate-400">
                  {(settings.announcement || "").length}/500
                </span>
              </div>
            </div>

            {settings.announcement?.trim() && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  <Megaphone size={15} />
                  Announcement Preview
                </p>

                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {settings.announcement}
                </p>
              </div>
            )}
          </SettingsSection>

          {/* Save Actions */}
          <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-xs leading-5 text-slate-500">
              Make sure to save your changes before leaving this page.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fetchSettings}
                disabled={saving || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={17} />
                Reload
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {saving ? "Saving Settings..." : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
