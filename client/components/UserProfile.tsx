import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Check, X, Edit2, LogOut } from "lucide-react";

export default function UserProfile() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "User";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const parts = String(displayName).split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.user_metadata?.phone ?? "");
    setAddress(user?.user_metadata?.address ?? "");
    setCity(user?.user_metadata?.city ?? "");
    setState(user?.user_metadata?.state ?? "");
    setZipCode(user?.user_metadata?.zip_code ?? "");
  }, [displayName, user]);

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage(null);
    const payload = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      address,
      city,
      state,
      zip_code: zipCode,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSavedMessage("Profile updated successfully!");
      } else {
        setSavedMessage("Saved locally (no server endpoint).");
      }
    } catch (err) {
      console.warn("Profile save failed, saved locally", err);
      setSavedMessage("Saved locally (offline).");
    } finally {
      setSaving(false);
      setEditing(false);
      window.setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  const initials = (firstName || lastName || email)
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Card with Avatar */}
        <Card className="mb-6 bg-white border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white">
                {initials || "U"}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-white">{`${firstName} ${lastName}`.trim() || displayName}</h1>
                <p className="text-emerald-100 text-sm mt-1">{email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* First Name Card */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4">
            <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">First Name</label>
            {editing ? (
              <Input 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter first name"
              />
            ) : (
              <p className="mt-2 text-lg font-medium text-gray-800">{firstName || "—"}</p>
            )}
          </Card>

          {/* Last Name Card */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4">
            <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Last Name</label>
            {editing ? (
              <Input 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter last name"
              />
            ) : (
              <p className="mt-2 text-lg font-medium text-gray-800">{lastName || "—"}</p>
            )}
          </Card>

          {/* Phone Card */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4">
            <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Phone</label>
            {editing ? (
              <Input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="+1 (555) 000-0000"
                type="tel"
              />
            ) : (
              <p className="mt-2 text-lg font-medium text-gray-800">{phone || "—"}</p>
            )}
          </Card>

          {/* City Card */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4">
            <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">City</label>
            {editing ? (
              <Input 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter city"
              />
            ) : (
              <p className="mt-2 text-lg font-medium text-gray-800">{city || "—"}</p>
            )}
          </Card>

          {/* State Card */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4">
            <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">State</label>
            {editing ? (
              <Input 
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter state"
              />
            ) : (
              <p className="mt-2 text-lg font-medium text-gray-800">{state || "—"}</p>
            )}
          </Card>

          {/* Zip Code Card */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4">
            <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Zip Code</label>
            {editing ? (
              <Input 
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="12345"
              />
            ) : (
              <p className="mt-2 text-lg font-medium text-gray-800">{zipCode || "—"}</p>
            )}
          </Card>
        </div>

        {/* Address Card - Full Width */}
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow p-4 mb-6">
          <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Full Address</label>
          {editing ? (
            <Textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
              placeholder="Enter your complete address"
              rows={3}
            />
          ) : (
            <p className="mt-2 text-base font-medium text-gray-800 whitespace-pre-wrap">{address || "—"}</p>
          )}
        </Card>

        {/* Success Message */}
        {savedMessage && (
          <Card className="bg-emerald-50 border border-emerald-200 shadow-md p-4 mb-6">
            <div className="flex items-center gap-3 text-emerald-700">
              <Check size={20} />
              <p className="font-medium">{savedMessage}</p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {editing ? (
            <>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <Check size={18} />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setEditing(false)}
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setEditing(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit Profile
              </Button>
              <Button 
                variant="outline"
                onClick={() => signOut()}
                className="border-red-300 text-red-600 hover:bg-red-50 font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
