"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  Heart,
  ImagePlus,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { api, getApiToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { DashboardEmpty, DashboardShell } from "@/components/dashboard-shell";

type Role = "customer" | "owner" | "admin";
type Equipment = {
  _id?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  availableQuantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  terms: string;
  status?: string;
};

const categories = [
  "Construction",
  "Photography",
  "Vehicles",
  "Agriculture",
  "Electronics",
  "Events",
];
const emptyEquipment: Equipment = {
  title: "",
  description: "",
  category: "Construction",
  location: "",
  price: 0,
  rentalType: "daily",
  availableQuantity: 1,
  condition: "Good",
  brand: "",
  model: "",
  image: "",
  terms: "",
};
const money = (value: unknown) =>
  `৳${Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
const dateLabel = (value?: string | Date) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function DashboardSection() {
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug.join("/")
    : String(params.slug || "");
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [data, setData] = useState<any>({});
  const [busy, setBusy] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    if (!session) return;
    setBusy(true);
    try {
      const token = await getApiToken();
      const me = await api("/users/me", {}, token);
      setProfile(me.user || null);

      const routeMap: Record<string, string> = {
        admin: "/analytics/admin",
        "admin/users": "/users/admin",
        "admin/equipment": "/equipment/admin",
        "admin/rentals": "/bookings/admin",
        owner: "/analytics/owner",
        "owner/equipment": "/equipment/owner",
        "owner/rentals": "/bookings/owner",
        customer: "/bookings/mine",
        "customer/favorites": "/favorites",
        profile: "/users/me",
      };
      if (slug === "owner/add") {
        setData({});
      } else {
        const endpoint = routeMap[slug];
        if (!endpoint)
          throw new Error("This dashboard page could not be found.");
        const result = await api(endpoint, {}, token);
        setData(result || {});
      }
    } catch (error: any) {
      toast.error(error.message || "Unable to load dashboard data");
      setData({});
    } finally {
      setBusy(false);
    }
  }, [session, slug]);

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
    if (session) load();
  }, [session, isPending, router, load, reloadKey]);

  const role: Role = profile?.role || "customer";
  const pageMeta: Record<
    string,
    { title: string; subtitle: string; eyebrow?: string }
  > = {
    admin: {
      title: "Platform analytics",
      subtitle:
        "Monitor users, inventory, bookings and overall marketplace performance.",
    },
    "admin/users": {
      title: "User management",
      subtitle:
        "Review registered accounts and manage their platform permissions.",
    },
    "admin/equipment": {
      title: "Equipment directory",
      subtitle:
        "Review submissions, keep listings accurate and manage marketplace inventory.",
    },
    "admin/rentals": {
      title: "Rental management",
      subtitle:
        "Monitor customer bookings, owners, payments and rental progress.",
    },
    owner: {
      title: "Business overview",
      subtitle: "Track your listings, rentals and payment performance.",
    },
    "owner/add": {
      title: "List new equipment",
      subtitle:
        "Create a clear, detailed listing renters can confidently book.",
    },
    "owner/equipment": {
      title: "My equipment",
      subtitle:
        "Keep your inventory, images, prices and availability up to date.",
    },
    "owner/rentals": {
      title: "Rental requests",
      subtitle: "Review requests and manage rentals for your listed equipment.",
    },
    customer: {
      title: "My rentals",
      subtitle:
        "Follow your booking history, payment progress and rental schedule.",
    },
    "customer/favorites": {
      title: "Saved equipment",
      subtitle: "Your shortlisted equipment, ready when your next project is.",
    },
    profile: {
      title: "Profile & account",
      subtitle:
        "Manage your personal details and keep your renter or owner profile current.",
    },
  };
  const meta = pageMeta[slug] || pageMeta.profile;
  const expectedRole: Role | null = slug.startsWith("admin")
    ? "admin"
    : slug.startsWith("owner")
      ? "owner"
      : slug.startsWith("customer")
        ? "customer"
        : null;
  const forbidden = expectedRole && profile && role !== expectedRole;

  const refresh = () => setReloadKey((value) => value + 1);

  if (isPending || !session || busy)
    return (
      <div className="container dashboard-loading">
        <span className="loading-orbit" />
        <p>Loading your workspace…</p>
      </div>
    );

  return (
    <DashboardShell
      role={role}
      name={profile?.name || session.user.name}
      image={profile?.photoURL || profile?.image || session.user.image || ""}
      title={meta.title}
      subtitle={meta.subtitle}
      eyebrow={
        role === "admin"
          ? "ADMINISTRATION"
          : role === "owner"
            ? "OWNER WORKSPACE"
            : "RENTER WORKSPACE"
      }
      action={
        slug === "owner/equipment" ? (
          <Link className="btn-primary" href="/dashboard/owner/add">
            <Plus size={16} /> Add equipment
          </Link>
        ) : slug === "admin/equipment" ? (
          <Link className="btn-ghost" href="/equipment">
            View marketplace <ExternalLink size={14} />
          </Link>
        ) : undefined
      }
    >
      {forbidden ? (
        <div className="dashboard-panel permission-panel">
          <ShieldCheck size={32} />
          <h2>Workspace access restricted</h2>
          <p>
            This section is available to {expectedRole} accounts. Your current
            account role is <b>{role}</b>.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Return to my dashboard
          </Link>
        </div>
      ) : (
        <>
          {slug === "profile" && (
            <ProfileForm user={profile} onSaved={refresh} />
          )}
          {slug === "owner/add" && (
            <EquipmentEditor
              mode="create"
              endpoint="/equipment/owner"
              onSaved={() => {
                router.push("/dashboard/owner/equipment");
                refresh();
              }}
            />
          )}
          {slug === "owner/equipment" && (
            <EquipmentList
              items={data.items || []}
              mode="owner"
              onRefresh={refresh}
            />
          )}
          {slug === "admin/equipment" && (
            <EquipmentList
              items={data.items || []}
              mode="admin"
              onRefresh={refresh}
            />
          )}
          {slug === "admin/users" && (
            <UsersTable users={data.users || []} onRefresh={refresh} />
          )}
          {(slug === "owner/rentals" ||
            slug === "admin/rentals" ||
            slug === "customer") && (
            <BookingsTable
              bookings={data.bookings || []}
              mode={
                slug === "customer"
                  ? "customer"
                  : slug === "owner/rentals"
                    ? "owner"
                    : "admin"
              }
              onRefresh={refresh}
            />
          )}
          {slug === "customer/favorites" && (
            <FavoritesList
              favorites={data.favorites || []}
              onRefresh={refresh}
            />
          )}
          {(slug === "admin" || slug === "owner") && (
            <Analytics
              data={data}
              mode={slug === "admin" ? "admin" : "owner"}
            />
          )}
        </>
      )}
    </DashboardShell>
  );
}

function StatusBadge({ value }: { value?: string }) {
  const status = (value || "pending").toLowerCase().replaceAll("_", "-");
  return (
    <span className={`status-badge status-${status}`}>
      {status.replaceAll("-", " ")}
    </span>
  );
}

function EquipmentList({
  items,
  mode,
  onRefresh,
}: {
  items: Equipment[];
  mode: "owner" | "admin";
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(
    () =>
      filter === "all" ? items : items.filter((item) => item.status === filter),
    [items, filter],
  );
  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((x) => x.status === "pending").length,
      approved: items.filter((x) => x.status === "approved").length,
      rejected: items.filter((x) => x.status === "rejected").length,
    }),
    [items],
  );

  const updateStatus = async (item: Equipment, status: string) => {
    try {
      const token = await getApiToken();
      await api(
        `/equipment/admin/${item._id}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token,
      );
      toast.success(`Listing ${status}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const remove = async (item: Equipment) => {
    if (
      !window.confirm(`Delete “${item.title}”? This action cannot be undone.`)
    )
      return;
    try {
      const token = await getApiToken();
      await api(`/equipment/${mode}/${item._id}`, { method: "DELETE" }, token);
      toast.success("Equipment deleted");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="inventory-summary-grid">
        <InventoryMetric
          label="All listings"
          value={counts.all}
          tone="orange"
        />
        <InventoryMetric
          label="Approved"
          value={counts.approved}
          tone="green"
        />
        <InventoryMetric
          label="Pending review"
          value={counts.pending}
          tone="amber"
        />
        <InventoryMetric label="Rejected" value={counts.rejected} tone="red" />
      </div>
      <div className="dashboard-panel inventory-panel">
        <div className="inventory-panel-heading">
          <div>
            <h2>
              {mode === "admin"
                ? "Marketplace inventory"
                : "Your equipment inventory"}
            </h2>
            <p>
              {mode === "admin"
                ? "Review and manage every equipment listing submitted to GearVault."
                : "Manage the equipment you have made available to renters."}
            </p>
          </div>
          <div className="inventory-filters">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={filter === value ? "selected" : ""}
                >
                  {value[0].toUpperCase() + value.slice(1)}{" "}
                  <span>{counts[value]}</span>
                </button>
              ),
            )}
          </div>
        </div>
        {filtered.length ? (
          <div className="equipment-admin-list">
            {filtered.map((item) => (
              <article className="equipment-admin-row" key={item._id}>
                <div className="equipment-admin-image">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <Package size={26} />
                  )}
                </div>
                <div className="equipment-admin-info">
                  <div className="equipment-admin-title-line">
                    <h3>{item.title}</h3>
                    <StatusBadge value={item.status} />
                  </div>
                  <div className="equipment-admin-meta">
                    <span>{item.category}</span>
                    <span>
                      <MapPin size={12} />
                      {item.location}
                    </span>
                    <span>{item.availableQuantity} available</span>
                  </div>
                  <div className="equipment-admin-price">
                    {money(item.price)} <small>/ {item.rentalType}</small>
                  </div>
                </div>
                <div className="equipment-admin-actions">
                  <Link
                    className="action-icon-button"
                    href={`/equipment/${item._id}`}
                    title="View details"
                  >
                    <ExternalLink size={16} />
                  </Link>
                  <button
                    className="action-icon-button"
                    onClick={() => setEditing(item)}
                    title="Edit listing"
                  >
                    <Edit3 size={16} />
                  </button>
                  {mode === "admin" && item.status !== "approved" && (
                    <button
                      className="action-icon-button action-approve"
                      onClick={() => updateStatus(item, "approved")}
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {mode === "admin" && item.status !== "rejected" && (
                    <button
                      className="action-icon-button action-reject"
                      onClick={() => updateStatus(item, "rejected")}
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    className="action-icon-button action-delete"
                    onClick={() => remove(item)}
                    title="Delete listing"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <DashboardEmpty
            title={
              filter === "all"
                ? "No equipment listings yet"
                : `No ${filter} listings`
            }
            description={
              mode === "admin"
                ? "Equipment submitted by owners will appear here for review."
                : "Your listings will appear here once you add equipment."
            }
            href={mode === "owner" ? "/dashboard/owner/add" : undefined}
            action="Add your first listing"
          />
        )}
      </div>
      {editing && (
        <EquipmentModal
          item={editing}
          mode={mode}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

function InventoryMetric({ label, value, tone }: any) {
  return (
    <div className={`inventory-metric tone-${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function EquipmentModal({
  item,
  mode,
  onClose,
  onSaved,
}: {
  item: Equipment;
  mode: "owner" | "admin";
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-edit-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">LISTING DETAILS</span>
            <h2 id="equipment-edit-title">Edit equipment</h2>
            <p>Update the listing details, image, pricing and availability.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <EquipmentEditor
          mode="edit"
          endpoint={`/equipment/${mode}/${item._id}`}
          initial={item}
          submitLabel="Save changes"
          onSaved={onSaved}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

function EquipmentEditor({
  mode,
  endpoint,
  initial = emptyEquipment,
  submitLabel = "Submit for approval",
  onSaved,
  onCancel,
}: {
  mode: "create" | "edit";
  endpoint: string;
  initial?: Equipment;
  submitLabel?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const DRAFT_KEY = "gearvault-equipment-create-draft";

  const [form, setForm] = useState<Equipment>({
    ...emptyEquipment,
    ...initial,
  });

  const [draftReady, setDraftReady] = useState(false);

  // Restore previously saved equipment information
  useEffect(() => {
    if (mode !== "create") {
      setDraftReady(true);
      return;
    }

    try {
      const savedDraft = sessionStorage.getItem(DRAFT_KEY);

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setForm({
          ...emptyEquipment,
          ...parsed,
        });
      }
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }

    setDraftReady(true);
  }, [mode]);

  // Automatically save the equipment draft
  useEffect(() => {
    if (mode !== "create" || !draftReady) return;

    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, mode, draftReady]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (key: keyof Equipment, value: string | number) =>
    setForm((old) => ({ ...old, [key]: value }) as Equipment);

  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.url)
        throw new Error(result.message || "Image upload failed");
      set("image", result.url);
      toast.success("Equipment image uploaded");
    } catch (error: any) {
      toast.error(error.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.image.trim()) {
      toast.error("Add an equipment image or paste an image URL.");
      return;
    }
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      Number(form.price) <= 0 ||
      Number(form.availableQuantity) < 1
    ) {
      toast.error("Please complete all required equipment details.");
      return;
    }
    setBusy(true);
    try {
      const token = await getApiToken();
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location.trim(),
        price: Number(form.price),
        rentalType: form.rentalType,
        availableQuantity: Number(form.availableQuantity),
        condition: form.condition,
        brand: form.brand.trim(),
        model: form.model.trim(),
        image: form.image.trim(),
        terms: form.terms.trim(),
      };
      await api(
        endpoint,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: JSON.stringify(body),
        },
        token,
      );
      toast.success(
        mode === "create"
          ? "Equipment submitted for admin approval"
          : "Equipment details updated",
      );

      if (mode === "create") {
        sessionStorage.removeItem(DRAFT_KEY);
      }

      onSaved();
      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Unable to save equipment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="equipment-editor-form">
      <div className="editor-section-heading">
        <span className="editor-section-icon">
          <Package size={17} />
        </span>
        <div>
          <b>Equipment information</b>
          <small>
            Give renters the information they need to choose confidently.
          </small>
        </div>
      </div>
      <div className="editor-field-grid">
        <Field label="Equipment name" required>
          <input
            className="field"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Professional 4K Camera"
            required
          />
        </Field>
        <Field label="Category" required>
          <select
            className="field"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Rental location" required>
          <input
            className="field"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City or service area"
            required
          />
        </Field>
        <Field label="Equipment condition">
          <select
            className="field"
            value={form.condition || "Good"}
            onChange={(e) => set("condition", e.target.value)}
          >
            {["New", "Like New", "Good", "Fair"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Brand">
          <input
            className="field"
            value={form.brand || ""}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="Manufacturer"
          />
        </Field>
        <Field label="Model">
          <input
            className="field"
            value={form.model || ""}
            onChange={(e) => set("model", e.target.value)}
            placeholder="Model or version"
          />
        </Field>
      </div>
      <Field label="Description" required>
        <textarea
          className="field editor-textarea"
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the equipment, its features and what is included…"
          required
        />
      </Field>

      <div className="editor-section-heading editor-section-spaced">
        <span className="editor-section-icon">
          <CircleDollarSign size={17} />
        </span>
        <div>
          <b>Pricing & availability</b>
          <small>Set a clear rental rate and the quantity available.</small>
        </div>
      </div>
      <div className="editor-field-grid editor-field-grid-three">
        <Field label="Rental price (BDT)" required>
          <div className="input-prefix-wrap">
            <span>৳</span>
            <input
              className="field"
              type="number"
              min="1"
              step="1"
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="0"
              required
            />
          </div>
        </Field>
        <Field label="Rental period" required>
          <select
            className="field"
            value={form.rentalType}
            onChange={(e) => set("rentalType", e.target.value)}
          >
            <option value="daily">Per day</option>
            <option value="weekly">Per week</option>
            <option value="monthly">Per month</option>
          </select>
        </Field>
        <Field label="Available quantity" required>
          <input
            className="field"
            type="number"
            min="1"
            step="1"
            value={form.availableQuantity}
            onChange={(e) => set("availableQuantity", Number(e.target.value))}
            required
          />
        </Field>
      </div>

      <div className="editor-section-heading editor-section-spaced">
        <span className="editor-section-icon">
          <ImagePlus size={17} />
        </span>
        <div>
          <b>Equipment photography</b>
          <small>Upload a clear image or paste a public image URL.</small>
        </div>
      </div>
      <div className="image-editor-layout">
        <div className="equipment-image-preview">
          {form.image ? (
            <img src={form.image} alt="Equipment preview" />
          ) : (
            <div>
              <ImagePlus size={28} />
              <span>Image preview</span>
            </div>
          )}
        </div>
        <div className="image-editor-controls">
          <label className="upload-dropzone">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
            <ImagePlus size={19} />
            <b>{uploading ? "Uploading image…" : "Choose an image"}</b>
            <small>JPG, PNG or WEBP · Max 5 MB</small>
          </label>
          <Field label="Or paste image URL">
            <input
              className="field"
              type="url"
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://example.com/equipment.jpg"
            />
          </Field>
        </div>
      </div>
      <Field label="Rental terms & conditions">
        <textarea
          className="field editor-textarea"
          rows={3}
          value={form.terms || ""}
          onChange={(e) => set("terms", e.target.value)}
          placeholder="Deposit, pickup, return, damage or usage terms…"
        />
      </Field>
      {mode === "create" && (
        <div className="submission-note">
          <Clock3 size={16} />
          <span>
            <b>Admin review required</b>Your listing will be saved with Pending
            status until it is reviewed.
          </span>
        </div>
      )}
      <div className="editor-actions">
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={busy || uploading}
        >
          {busy ? "Saving…" : submitLabel}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="editor-field">
      <span>
        {label}
        {required && <i>*</i>}
      </span>
      {children}
    </label>
  );
}

function UsersTable({
  users,
  onRefresh,
}: {
  users: any[];
  onRefresh: () => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const updateRole = async (user: any, role: string) => {
    setSaving(user._id);
    try {
      const token = await getApiToken();
      await api(
        `/users/admin/${user._id}/role`,
        { method: "PATCH", body: JSON.stringify({ role }) },
        token,
      );
      toast.success(`${user.name || "User"}'s role updated`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(null);
    }
  };
  const counts = {
    customer: users.filter((u) => u.role === "customer").length,
    owner: users.filter((u) => u.role === "owner").length,
    admin: users.filter((u) => u.role === "admin").length,
  };
  return (
    <>
      <div className="inventory-summary-grid user-summary-grid">
        <InventoryMetric
          label="Total accounts"
          value={users.length}
          tone="orange"
        />
        <InventoryMetric
          label="Customers"
          value={counts.customer}
          tone="blue"
        />
        <InventoryMetric
          label="Equipment owners"
          value={counts.owner}
          tone="green"
        />
        <InventoryMetric
          label="Administrators"
          value={counts.admin}
          tone="amber"
        />
      </div>
      <div className="dashboard-panel table-panel">
        <div className="inventory-panel-heading">
          <div>
            <h2>Registered accounts</h2>
            <p>
              Change a user’s role to control which dashboard features they can
              access.
            </p>
          </div>
          <span className="section-toolbar-chip">
            <Users size={14} /> {users.length} accounts
          </span>
        </div>
        {users.length ? (
          <div className="responsive-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email address</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Manage role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="table-user-cell">
                        {user.image ? (
                          <img src={user.image} alt="" />
                        ) : (
                          <span>
                            {(user.name || "U").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <b>{user.name || "Unnamed user"}</b>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <StatusBadge value={user.role} />
                    </td>
                    <td>{dateLabel(user.createdAt)}</td>
                    <td>
                      <select
                        className="table-role-select"
                        aria-label={`Change role for ${user.name || user.email}`}
                        value={user.role || "customer"}
                        disabled={saving === user._id}
                        onChange={(e) => updateRole(user, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DashboardEmpty
            title="No user accounts found"
            description="Registered GearVault users will appear in this directory."
          />
        )}
      </div>
    </>
  );
}

function BookingsTable({
  bookings,
  mode,
  onRefresh,
}: {
  bookings: any[];
  mode: "customer" | "owner" | "admin";
  onRefresh: () => void;
}) {
  const [working, setWorking] = useState<string | null>(null);
  const changeStatus = async (booking: any, status: string) => {
    const prompt =
      status === "cancelled"
        ? "Cancel this rental booking?"
        : status === "confirmed"
          ? "Confirm this paid rental booking?"
          : "Mark this rental as completed?";
    if (!window.confirm(prompt)) return;
    setWorking(booking._id);
    try {
      const token = await getApiToken();
      await api(
        `/bookings/${booking._id}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token,
      );
      toast.success("Booking status updated");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setWorking(null);
    }
  };
  const pending = bookings.filter((b) => b.bookingStatus === "pending").length;
  const paid = bookings.filter((b) => b.paymentStatus === "paid").length;
  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  return (
    <>
      <div className="inventory-summary-grid">
        <InventoryMetric
          label="Total bookings"
          value={bookings.length}
          tone="orange"
        />
        <InventoryMetric
          label="Pending requests"
          value={pending}
          tone="amber"
        />
        <InventoryMetric label="Paid bookings" value={paid} tone="green" />
        <InventoryMetric
          label="Paid booking value"
          value={money(revenue)}
          tone="blue"
        />
      </div>
      <div className="dashboard-panel table-panel">
        <div className="inventory-panel-heading">
          <div>
            <h2>
              {mode === "customer"
                ? "Your booking history"
                : mode === "owner"
                  ? "Bookings for your equipment"
                  : "All marketplace bookings"}
            </h2>
            <p>
              {mode === "customer"
                ? "See your rental dates, payment status and booking progress."
                : mode === "owner"
                  ? "Check customer details and respond to paid booking requests."
                  : "Review booking records and monitor the rental lifecycle."}
            </p>
          </div>
          <span className="section-toolbar-chip">
            <ClipboardList size={14} /> {bookings.length} bookings
          </span>
        </div>
        {bookings.length ? (
          <div className="responsive-table-wrap">
            <table className="dashboard-table booking-table">
              <thead>
                <tr>
                  {mode !== "customer" && <th>Customer</th>}
                  {mode === "admin" && <th>Owner</th>}
                  <th>Equipment</th>
                  <th>Rental dates</th>
                  <th>Qty.</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Booking</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    {mode !== "customer" && (
                      <td>
                        <div className="table-person">
                          <b>{booking.customer?.name || "Customer"}</b>
                          <small>{booking.customer?.email || "—"}</small>
                          {booking.customer?.phone && (
                            <small>{booking.customer.phone}</small>
                          )}
                        </div>
                      </td>
                    )}
                    {mode === "admin" && (
                      <td>
                        <div className="table-person">
                          <b>{booking.owner?.name || "Owner"}</b>
                          <small>{booking.owner?.email || "—"}</small>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="table-equipment-cell">
                        {booking.equipment?.image || booking.equipmentImage ? (
                          <img
                            src={
                              booking.equipment?.image || booking.equipmentImage
                            }
                            alt=""
                          />
                        ) : (
                          <span>
                            <Package size={16} />
                          </span>
                        )}
                        <b>
                          {booking.equipment?.title ||
                            booking.equipmentTitle ||
                            "Equipment"}
                        </b>
                      </div>
                    </td>
                    <td>
                      <div className="table-person">
                        <b>{dateLabel(booking.startDate)}</b>
                        <small>to {dateLabel(booking.endDate)}</small>
                        <small>Booked {dateLabel(booking.createdAt)}</small>
                      </div>
                    </td>
                    <td>{booking.quantity || 1}</td>
                    <td className="amount-cell">
                      {money(booking.totalAmount)}
                    </td>
                    <td>
                      <StatusBadge value={booking.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge value={booking.bookingStatus} />
                    </td>
                    <td>
                      <div className="table-action-group">
                        {mode === "owner" && (
                          <>
                            <button
                              className="mini-action mini-action-good"
                              disabled={
                                working === booking._id ||
                                booking.bookingStatus === "confirmed" ||
                                booking.bookingStatus === "completed" ||
                                booking.paymentStatus !== "paid"
                              }
                              onClick={() => changeStatus(booking, "confirmed")}
                              title="Confirm paid booking"
                            >
                              <Check size={14} /> Confirm
                            </button>
                            <button
                              className="mini-action mini-action-danger"
                              disabled={
                                working === booking._id ||
                                ["cancelled", "completed"].includes(
                                  booking.bookingStatus,
                                )
                              }
                              onClick={() => changeStatus(booking, "cancelled")}
                              title="Decline booking"
                            >
                              <X size={14} /> Decline
                            </button>
                          </>
                        )}
                        {mode === "admin" && (
                          <>
                            <button
                              className="mini-action mini-action-good"
                              disabled={
                                working === booking._id ||
                                booking.bookingStatus === "completed"
                              }
                              onClick={() => changeStatus(booking, "completed")}
                            >
                              Complete
                            </button>
                            <button
                              className="mini-action mini-action-danger"
                              disabled={
                                working === booking._id ||
                                booking.bookingStatus === "cancelled"
                              }
                              onClick={() => changeStatus(booking, "cancelled")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {mode === "customer" && (
                          <>
                            {booking.bookingStatus !== "cancelled" &&
                              booking.paymentStatus !== "paid" && (
                                <button
                                  className="mini-action mini-action-danger"
                                  disabled={working === booking._id}
                                  onClick={() =>
                                    changeStatus(booking, "cancelled")
                                  }
                                >
                                  Cancel booking
                                </button>
                              )}
                            <Link
                              href={`/equipment/${booking.equipmentId}`}
                              className="mini-action"
                            >
                              View item <ArrowRight size={13} />
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DashboardEmpty
            title="No rental records yet"
            description="Once a booking is created, its dates, payment and status will be listed here."
            href={mode === "customer" ? "/equipment" : undefined}
          />
        )}
      </div>
    </>
  );
}

function FavoritesList({
  favorites,
  onRefresh,
}: {
  favorites: any[];
  onRefresh: () => void;
}) {
  const remove = async (id: string) => {
    if (!id) return;
    try {
      const token = await getApiToken();
      await api(`/favorites/${id}`, { method: "DELETE" }, token);
      toast.success("Removed from favorites");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  return (
    <>
      <div className="section-toolbar favorites-toolbar">
        <div>
          <b>
            {favorites.length} saved {favorites.length === 1 ? "item" : "items"}
          </b>
          <span>Keep your preferred equipment close at hand.</span>
        </div>
        <Link href="/equipment" className="btn-primary">
          <Plus size={15} /> Discover equipment
        </Link>
      </div>
      {favorites.length ? (
        <div className="favorite-grid">
          {favorites.map((favorite) => {
            const item = favorite.equipment || {};
            return (
              <article className="favorite-card" key={favorite._id}>
                <Link
                  href={`/equipment/${item._id}`}
                  className="favorite-card-image"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <Package size={28} />
                  )}
                  <span className="favorite-category">{item.category}</span>
                </Link>
                <div className="favorite-card-body">
                  <div className="favorite-card-title">
                    <Link href={`/equipment/${item._id}`}>{item.title}</Link>
                    <span className="favorite-available">
                      {Number(item.availableQuantity) > 0
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>
                  <p>
                    <MapPin size={13} />
                    {item.location}
                  </p>
                  <div className="favorite-card-bottom">
                    <div>
                      <b>{money(item.price)}</b>
                      <small>/ {item.rentalType}</small>
                    </div>
                    <button
                      className="favorite-remove"
                      onClick={() => remove(item._id)}
                      title="Remove favorite"
                    >
                      <Heart size={16} fill="currentColor" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-panel">
          <DashboardEmpty
            title="Your favorites list is empty"
            description="Save equipment you like and compare it here before making a booking."
            href="/equipment"
            action="Browse equipment"
          />
        </div>
      )}
    </>
  );
}

function ProfileForm({ user, onSaved }: { user: any; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    photoURL: user?.photoURL || user?.image || "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(
    () =>
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        photoURL: user?.photoURL || user?.image || "",
      }),
    [user],
  );
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const token = await getApiToken();
      await api(
        "/users/me",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            photoURL: form.photoURL.trim(),
          }),
        },
        token,
      );
      toast.success("Your profile has been updated");
      onSaved();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.url)
        throw new Error(result.message || "Upload failed");
      setForm((prev) => ({ ...prev, photoURL: result.url }));
      toast.success("Profile picture uploaded");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };
  const joined = user?.createdAt ? new Date(user.createdAt) : null;
  const completeness =
    [form.name, form.email, form.phone, form.address, form.photoURL].filter(
      Boolean,
    ).length * 20;
  const initials =
    form.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((x: string) => x[0]?.toUpperCase())
      .join("") || "GV";
  return (
    <div className="profile-page-grid">
      <aside className="profile-overview-card">
        <div className="profile-cover" />
        <div className="profile-overview-content">
          <div className="profile-large-avatar">
            {form.photoURL ? (
              <img src={form.photoURL} alt="Profile" />
            ) : (
              initials
            )}
          </div>
          <span className="profile-account-role">
            <ShieldCheck size={13} />
            {user?.role || "customer"} account
          </span>
          <h2>{form.name || "Your name"}</h2>
          <p>{form.email}</p>
          <div className="profile-member-since">
            <CalendarDays size={14} /> Member since{" "}
            {joined
              ? joined.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </div>
          <div className="profile-completeness">
            <div>
              <b>Profile completeness</b>
              <strong>{completeness}%</strong>
            </div>
            <span>
              <i style={{ width: `${completeness}%` }} />
            </span>
            <small>
              {completeness === 100
                ? "Your profile looks complete."
                : "Complete your details to help keep your account up to date."}
            </small>
          </div>
          <div className="profile-security-note">
            <ShieldCheck size={17} />
            <span>
              <b>Account protected</b>
              <small>
                Your sign-in is managed securely by GearVault authentication.
              </small>
            </span>
          </div>
        </div>
      </aside>
      <section className="dashboard-panel profile-edit-panel">
        <div className="profile-form-heading">
          <div>
            <span className="eyebrow">PERSONAL INFORMATION</span>
            <h2>Edit your profile</h2>
            <p>
              Keep your details accurate so owners can coordinate rentals with
              you.
            </p>
          </div>
          <span className="profile-form-icon">
            <UserRound size={20} />
          </span>
        </div>
        <form onSubmit={save} className="profile-edit-form">
          <div className="profile-photo-editor">
            <div className="profile-photo-preview">
              {form.photoURL ? (
                <img src={form.photoURL} alt="Profile preview" />
              ) : (
                initials
              )}
            </div>
            <div>
              <b>Profile picture</b>
              <p>Use a clear photo so your account is recognizable.</p>
              <label className="profile-upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
                <ImagePlus size={15} />
                {uploading ? "Uploading…" : "Upload photo"}
              </label>
            </div>
          </div>
          <div className="editor-field-grid">
            <Field label="Full name" required>
              <input
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </Field>
            <Field label="Email address">
              <input
                className="field field-readonly"
                value={form.email}
                readOnly
                type="email"
              />
              <small className="field-hint">
                Your sign-in email cannot be changed here.
              </small>
            </Field>
            <Field label="Phone number">
              <input
                className="field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Your contact number"
              />
            </Field>
            <Field label="Address">
              <input
                className="field"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, area, city"
              />
            </Field>
          </div>
          <Field label="Profile image URL (optional)">
            <input
              className="field"
              type="url"
              value={form.photoURL}
              onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
              placeholder="https://example.com/profile.jpg"
            />
          </Field>
          <div className="profile-form-footer">
            <span>
              <ShieldCheck size={14} /> Your email and role are protected
              account information.
            </span>
            <button
              className="btn-primary"
              type="submit"
              disabled={busy || uploading}
            >
              {busy ? "Saving profile…" : "Save changes"}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Analytics({ data, mode }: { data: any; mode: "admin" | "owner" }) {
  const stats = data.stats || {};
  const rows =
    (mode === "admin" ? data.monthly_bookings : data.monthly_earnings) || [];
  const chartData = rows.map((row: any) => ({
    month: row.month,
    bookings: Number(row.bookings || 0),
    earnings: Number(row.earnings ?? row.revenue ?? 0),
  }));
  const cards =
    mode === "admin"
      ? [
          ["Total users", stats.total_users, Users, "registered accounts"],
          [
            "Total equipment",
            stats.total_equipment,
            Package,
            `${stats.approved_equipment || 0} approved`,
          ],
          [
            "Total bookings",
            stats.total_bookings,
            ClipboardList,
            `${stats.completed_rentals || 0} completed`,
          ],
          [
            "Pending approvals",
            stats.pending_approvals,
            Clock3,
            "awaiting admin review",
          ],
          [
            "Completed rentals",
            stats.completed_rentals,
            CheckCircle2,
            "successfully completed",
          ],
          [
            "Platform revenue",
            money(stats.total_revenue),
            CircleDollarSign,
            "successful transactions",
          ],
        ]
      : [
          [
            "Listed equipment",
            stats.total_listed_equipment,
            Package,
            "your active inventory",
          ],
          [
            "Total bookings",
            stats.total_bookings,
            ClipboardList,
            "all rental requests",
          ],
          [
            "Completed rentals",
            stats.completed_rentals,
            CheckCircle2,
            "successfully completed",
          ],
          [
            "Total earnings",
            money(stats.total_earnings),
            CircleDollarSign,
            "successful payments",
          ],
        ];
  return (
    <>
      <div className="analytics-intro-row">
        <div>
          <span className="eyebrow">
            {mode === "admin" ? "PLATFORM HEALTH" : "YOUR BUSINESS HEALTH"}
          </span>
          <h2>
            {mode === "admin"
              ? "The numbers behind GearVault"
              : "Your rental business at a glance"}
          </h2>
          <p>
            {mode === "admin"
              ? "Use these indicators to understand marketplace activity and listing health."
              : "A quick summary of your listed assets, completed rentals and paid earnings."}
          </p>
        </div>
        <span className="analytics-updated">
          <RefreshCw size={13} /> Live data
        </span>
      </div>
      <div className="analytics-metrics-grid">
        {cards.map(([label, value, Icon, note]: any) => (
          <article className="analytics-metric-card" key={label}>
            <span className="analytics-metric-icon">
              <Icon size={19} />
            </span>
            <small>{label}</small>
            <b>
              {typeof value === "number"
                ? value.toLocaleString()
                : (value ?? "0")}
            </b>
            <span>{note}</span>
          </article>
        ))}
      </div>
      <div className="dashboard-panel analytics-chart-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MONTHLY REPORT</span>
            <h2>
              {mode === "admin" ? "Bookings and revenue" : "Monthly earnings"}
            </h2>
            <p>
              {mode === "admin"
                ? "Booking volume and paid booking value across the platform."
                : "Successful payment earnings generated by your equipment."}
            </p>
          </div>
          <span className="chart-legend">
            <i className="legend-orange" />
            {mode === "admin" ? "Bookings" : "Earnings"}
            {mode === "admin" && (
              <>
                <i className="legend-blue" />
                Revenue
              </>
            )}
          </span>
        </div>
        {chartData.length ? (
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => String(value).slice(5)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-solid)",
                    color: "var(--text)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [
                    name === "earnings"
                      ? money(value)
                      : Number(value).toLocaleString(),
                    name === "earnings" ? "Revenue" : "Bookings",
                  ]}
                />
                {mode === "admin" && (
                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#ff922f"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={30}
                  />
                )}
                <Bar
                  dataKey="earnings"
                  name="Revenue"
                  fill="#60a5fa"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-empty">
            <TrendingUpIcon />
            <b>No monthly activity to chart yet</b>
            <span>
              Monthly analytics will appear as bookings and successful payments
              are recorded.
            </span>
          </div>
        )}
      </div>
    </>
  );
}
function TrendingUpIcon() {
  return <CircleDollarSign size={27} />;
}
