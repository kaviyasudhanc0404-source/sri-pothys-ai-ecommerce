import { type FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Heart, Settings, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import { apiRequest } from "@/services/api";
import { getErrorMessage } from "@/lib/utils";

type ProfileApiUser = {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
};

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
];

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
};

type AddressRecord = {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
};

type AddressForm = Omit<AddressRecord, "_id" | "isDefault"> & {
  isDefault: boolean;
};

const emptyAddressForm: AddressForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  isDefault: false,
};

const formatDateForInput = (date?: string) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

const formatAddress = (addr: AddressRecord) =>
  [addr.address, addr.city, addr.state].filter(Boolean).join(", ") + (addr.pincode ? ` - ${addr.pincode}` : "");

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const { items: wishlistItems } = useWishlist();
  const { user, token, updateUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const data = await apiRequest<{ user: ProfileApiUser }>("/auth/profile", { token });
        if (!cancelled && data?.user) {
          updateUser({ ...data.user, id: String(data.user.id || data.user._id) });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Could not load profile", { description: getErrorMessage(error) || "Please refresh and try again." });
        }
      }
    };

    loadProfile().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [token, updateUser]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      dateOfBirth: formatDateForInput(user.dateOfBirth),
      gender: user.gender || "",
    });
  }, [user]);

  useEffect(() => {
    if (!token || activeTab !== "addresses") return;
    let cancelled = false;

    const loadAddresses = async () => {
      try {
        const data = await apiRequest<{ addresses: AddressRecord[] }>("/users/addresses", { token });
        if (!cancelled) setAddresses(data?.addresses || []);
      } catch (error) {
        if (!cancelled) {
          toast.error("Could not load addresses", { description: getErrorMessage(error) || "Please try again." });
        }
      }
    };

    loadAddresses().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [activeTab, token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !user) return;

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setIsSavingProfile(true);
    try {
      const data = await apiRequest<{ user: ProfileApiUser }>("/auth/profile", {
        method: "PUT",
        token,
        body: JSON.stringify({
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          phone: profileForm.phone.trim(),
          dateOfBirth: profileForm.dateOfBirth,
          gender: profileForm.gender,
        }),
      });
      const savedUser = { ...(data?.user || user), id: String(data?.user?.id || data?.user?._id || user.id) };
      updateUser(savedUser);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Could not update profile", { description: getErrorMessage(error) || "Please try again." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const payload = {
      ...addressForm,
      name: addressForm.name.trim(),
      address: addressForm.address.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
      phone: addressForm.phone.trim(),
    };

    if (!payload.name || !payload.address || !payload.city || !payload.state || !payload.pincode || !payload.phone) {
      toast.error("Please fill all address details");
      return;
    }

    setIsSavingAddress(true);
    try {
      await apiRequest("/users/addresses", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
      const data = await apiRequest<{ addresses: AddressRecord[] }>("/users/addresses", { token });
      setAddresses(data?.addresses || []);
      setAddressForm(emptyAddressForm);
      setShowAddressForm(false);
      toast.success("Address saved");
    } catch (error) {
      toast.error("Could not save address", { description: getErrorMessage(error) || "Please try again." });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const removeAddress = async (addressId: string) => {
    if (!token) return;
    try {
      await apiRequest(`/users/addresses/${addressId}`, { method: "DELETE", token });
      setAddresses((current) => current.filter((addr) => addr._id !== addressId));
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Could not delete address", { description: getErrorMessage(error) || "Please try again." });
    }
  };

  if (!user) {
    return null;
  }

  const userInitials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="gradient-maroon py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-xl font-bold text-maroon-dark">
              {userInitials}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-primary-foreground">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-primary-foreground/60 text-sm break-words">
                {user.email} - {user.role === "admin" ? "Admin" : "Member"} since 2024
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium shrink-0 transition-all ${
                activeTab === id ? "gradient-maroon text-primary-foreground shadow-maroon" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <motion.form onSubmit={saveProfile} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 max-w-2xl">
            <h2 className="font-display text-xl font-bold mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">First Name</label>
                <input
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Last Name</label>
                <input
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Email</label>
                <input
                  value={user.email}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none opacity-70"
                  disabled
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Phone</label>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Date of Birth</label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30 cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={isSavingProfile} className="btn-gold mt-6 text-sm disabled:opacity-60">
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </motion.form>
        )}

        {activeTab === "addresses" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-2xl">
            {addresses.length === 0 && !showAddressForm && (
              <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
                No saved addresses yet.
              </div>
            )}

            {addresses.map((addr) => (
              <div key={addr._id} className={`glass-card rounded-2xl p-5 ${addr.isDefault ? "ring-2 ring-gold/50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold">{addr.name}</span>
                    {addr.isDefault && <span className="px-2 py-0.5 rounded-full gradient-gold text-[10px] font-bold text-maroon-dark">Default</span>}
                  </div>
                  <button onClick={() => void removeAddress(addr._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-xl" aria-label="Delete address">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{formatAddress(addr)}</p>
                <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
              </div>
            ))}

            {showAddressForm && (
              <form onSubmit={saveAddress} className="glass-card rounded-2xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Address Name", placeholder: "Home" },
                    { key: "phone", label: "Phone", placeholder: "+91 88702 94044" },
                    { key: "address", label: "Address", placeholder: "House/Flat, Street", full: true },
                    { key: "city", label: "City", placeholder: "Swamimalai" },
                    { key: "state", label: "State", placeholder: "Tamil Nadu" },
                    { key: "pincode", label: "Pincode", placeholder: "612302" },
                  ].map((field) => (
                    <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                      <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">{field.label}</label>
                      <input
                        value={addressForm[field.key as keyof AddressForm] as string}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  Set as default address
                </label>
                <div className="flex flex-wrap gap-3 mt-5">
                  <button type="submit" disabled={isSavingAddress} className="btn-gold text-sm disabled:opacity-60">
                    {isSavingAddress ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressForm(emptyAddressForm);
                      setShowAddressForm(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-muted text-sm font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full border-2 border-dashed border-border rounded-2xl p-5 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            )}
          </motion.div>
        )}

        {activeTab === "wishlist" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">Your Wishlist is Empty</h3>
                <p className="text-sm text-muted-foreground">Save items you love by tapping the heart icon</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlistItems.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 max-w-2xl space-y-4">
            {[
              { label: "Email Notifications", desc: "Receive order updates via email" },
              { label: "SMS Notifications", desc: "Get SMS for offers and deals" },
              { label: "Push Notifications", desc: "Browser notifications for new arrivals" },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
