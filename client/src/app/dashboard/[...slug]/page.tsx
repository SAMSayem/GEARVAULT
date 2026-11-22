"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiToken, api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
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
import Link from "next/link";

export default function DashboardSection() {
  const params = useParams();
  const slug = (params.slug as string[]).join("/");
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [data, setData] = useState<any>({});
  const [busy, setBusy] = useState(true);

  async function load() {
    try {
      const t = await getApiToken();

      const path = slug.includes("users")
        ? "/users/admin"
        : slug.includes("admin/equipment")
          ? "/equipment/admin"
          : slug.includes("admin/rentals")
            ? "/bookings/admin"
            : slug.includes("owner/equipment")
              ? "/equipment/owner"
              : slug.includes("owner/rentals")
                ? "/bookings/owner"
                : slug.includes("favorites")
                  ? "/favorites"
                  : slug.includes("profile")
                    ? "/users/me"
                    : slug.includes("add")
                      ? "/equipment/owner"
                      : slug.includes("customer")
                        ? "/bookings/mine"
                        : slug.startsWith("admin")
                          ? "/analytics/admin"
                          : "/analytics/owner";

      const d = await api(path, {}, t);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function mutate(path: string, method: string, body?: any) {
    try {
      const t = await getApiToken();

      await api(
        path,
        {
          method,
          body: body ? JSON.stringify(body) : undefined,
        },
        t,
      );

      toast.success("Changes saved");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }

    if (session) {
      load();
    }
  }, [session, isPending, slug, router]);

  const title = slug.split("/").pop()?.replaceAll("-", " ") || "Overview";

  const rows =
    data.items ||
    data.bookings ||
    data.equipment ||
    data.users ||
    data.favorites ||
    [];

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow">GearVault workspace</p>
          <h1 className="mt-3 text-3xl font-black capitalize">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage and monitor your rental marketplace activity.
          </p>
        </div>

        <Link href="/dashboard" className="btn-ghost text-sm">
          Dashboard home
        </Link>
      </div>

      {busy ? (
        <div className="py-20 text-center text-gray-500">
          Loading dashboard data…
        </div>
      ) : slug.endsWith("add") ? (
        <EquipmentForm />
      ) : slug.includes("profile") ? (
        <ProfileForm user={data.user} />
      ) : slug === "admin" || slug === "owner" ? (
        <Analytics data={data} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {(data.stats
              ? Object.entries(data.stats)
              : [
                  ["Records", rows.length],
                  ["Account", session?.user?.name || "Active"],
                  ["Role", "Authorized"],
                ]
            )
              .slice(0, 3)
              .map(([k, v]: any) => (
                <div className="glass rounded-xl p-5" key={k}>
                  <p className="text-xs capitalize text-gray-500">{k}</p>
                  <b className="mt-2 block text-2xl">
                    {typeof v === "number" ? v.toLocaleString() : String(v)}
                  </b>
                </div>
              ))}
          </div>

          <div className="table-wrap mt-7">
            <table className="data-table">
              <thead>
                <tr>
                  {rows.length ? (
                    Object.keys(rows[0])
                      .filter(
                        (k) =>
                          !["_id", "ownerId", "customerId", "image"].includes(
                            k,
                          ),
                      )
                      .slice(0, 7)
                      .map((k) => <th key={k}>{k}</th>)
                  ) : (
                    <th>Information</th>
                  )}

                  {(slug.includes("equipment") ||
                    slug.includes("users") ||
                    slug.includes("rentals") ||
                    slug.includes("favorites")) && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {rows.length ? (
                  rows.map((r: any) => (
                    <tr key={r._id}>
                      {Object.entries(r)
                        .filter(
                          ([k]) =>
                            !["_id", "ownerId", "customerId", "image"].includes(
                              k,
                            ),
                        )
                        .slice(0, 7)
                        .map(([k, v]: any) => (
                          <td key={k}>
                            {typeof v === "object"
                              ? JSON.stringify(v)
                              : String(v ?? "—")}
                          </td>
                        ))}

                      {(slug.includes("equipment") ||
                        slug.includes("users") ||
                        slug.includes("rentals") ||
                        slug.includes("favorites")) && (
                        <td>
                          <div className="flex flex-wrap gap-2">
                            {slug.includes("admin/equipment") && (
                              <>
                                <button
                                  className="pill"
                                  onClick={() => {
                                    const price = window.prompt(
                                      "Set rental price (৳)",
                                      String(r.price),
                                    );

                                    if (price && Number(price) > 0) {
                                      mutate(
                                        `/equipment/admin/${r._id}`,
                                        "PATCH",
                                        { price: Number(price) },
                                      );
                                    }
                                  }}
                                >
                                  Update price
                                </button>

                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/equipment/admin/${r._id}/status`,
                                      "PATCH",
                                      { status: "approved" },
                                    )
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/equipment/admin/${r._id}/status`,
                                      "PATCH",
                                      { status: "rejected" },
                                    )
                                  }
                                >
                                  Reject
                                </button>

                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/equipment/admin/${r._id}`,
                                      "DELETE",
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}

                            {slug.includes("admin/users") && (
                              <select
                                className="field min-w-24"
                                defaultValue={r.role || "customer"}
                                onChange={(e) =>
                                  mutate(
                                    `/users/admin/${r._id}/role`,
                                    "PATCH",
                                    { role: e.target.value },
                                  )
                                }
                              >
                                <option value="customer">Customer</option>
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}

                            {slug.includes("favorites") && (
                              <>
                                <Link
                                  className="pill"
                                  href={`/equipment/${r.equipment?._id}`}
                                >
                                  View details
                                </Link>

                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/favorites/${r.equipment?._id}`,
                                      "DELETE",
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              </>
                            )}

                            {slug.includes("rentals") && (
                              <>
                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/bookings/${r._id}/status`,
                                      "PATCH",
                                      { status: "completed" },
                                    )
                                  }
                                >
                                  Complete
                                </button>

                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/bookings/${r._id}/status`,
                                      "PATCH",
                                      { status: "cancelled" },
                                    )
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {slug.includes("owner/equipment") && (
                              <>
                                <button
                                  className="pill"
                                  onClick={() => {
                                    const price = window.prompt(
                                      "Set new rental price (৳)",
                                      String(r.price),
                                    );

                                    if (price && Number(price) > 0) {
                                      mutate(
                                        `/equipment/owner/${r._id}`,
                                        "PATCH",
                                        { price: Number(price) },
                                      );
                                    }
                                  }}
                                >
                                  Update price
                                </button>

                                <button
                                  className="pill"
                                  onClick={() =>
                                    mutate(
                                      `/equipment/owner/${r._id}`,
                                      "DELETE",
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No records to display yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Analytics({ data }: any) {
  const stats = data.stats || {};

  const chartData = Object.entries(stats)
    .filter(([, v]) => typeof v === "number")
    .map(([name, value]) => ({
      name: name.replaceAll("_", " "),
      value: Number(value),
    }));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stats).map(([k, v]: any) => (
          <div key={k} className="glass rounded-2xl p-6">
            <p className="text-xs capitalize text-gray-500">
              {k.replaceAll("_", " ")}
            </p>
            <b className="mt-3 block text-3xl text-orange-300">
              {typeof v === "number" ? v.toLocaleString() : v}
            </b>
          </div>
        ))}
      </div>

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-5 text-lg font-bold">Performance snapshot</h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#ffffff12" vertical={false} />
              <XAxis dataKey="name" stroke="#89919d" tick={{ fontSize: 11 }} />
              <YAxis stroke="#89919d" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#171b22",
                  border: "1px solid #ffffff20",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="value" fill="#ff8a24" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function EquipmentForm() {
  const [uploading, setUploading] = useState(false);

  const [f, setF] = useState<any>({
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
  });

  const [busy, setBusy] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);

    try {
      const t = await getApiToken();

      await api(
        "/equipment/owner",
        {
          method: "POST",
          body: JSON.stringify(f),
        },
        t,
      );

      toast.success("Equipment submitted for approval");
      setF({ ...f, title: "", description: "" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2"
    >
      {Object.entries(f).map(([k, v]: any) => (
        <label key={k} className="text-sm capitalize">
          {k.replace(/[A-Z]/g, (m: string) => " " + m)}

          {k === "description" || k === "terms" ? (
            <textarea
              className="field mt-2"
              rows={3}
              value={v}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            />
          ) : k === "category" || k === "rentalType" ? (
            <select
              className="field mt-2"
              value={v}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            >
              {(k === "category"
                ? [
                    "Construction",
                    "Photography",
                    "Vehicles",
                    "Agriculture",
                    "Electronics",
                    "Events",
                  ]
                : ["daily", "weekly", "monthly"]
              ).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          ) : (
            <input
              className="field mt-2"
              required={!["brand", "model", "terms"].includes(k)}
              type={
                k === "price" || k === "availableQuantity" ? "number" : "text"
              }
              value={v}
              onChange={(e) =>
                setF({
                  ...f,
                  [k]:
                    k === "price" || k === "availableQuantity"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          )}
        </label>
      ))}

      <label className="text-sm sm:col-span-2">
        Upload equipment image (ImgBB)
        <input
          className="field mt-2"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

            if (!key) {
              toast.error(
                "Add NEXT_PUBLIC_IMGBB_API_KEY to client environment variables",
              );
              return;
            }

            setUploading(true);

            try {
              const body = new FormData();
              body.append("image", file);

              const response = await fetch(
                `https://api.imgbb.com/1/upload?key=${key}`,
                {
                  method: "POST",
                  body,
                },
              );

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error("Image upload failed");
              }

              setF((old: any) => ({
                ...old,
                image: result.data.url,
              }));

              toast.success("Image uploaded");
            } catch (err: any) {
              toast.error(err.message);
            } finally {
              setUploading(false);
            }
          }}
        />
        {uploading ? (
          <small className="text-orange-300">Uploading…</small>
        ) : (
          <small className="text-gray-500">
            Upload a JPG/PNG or paste an image URL in the Image field above.
          </small>
        )}
      </label>

      <button
        disabled={busy || uploading}
        className="btn-primary sm:col-span-2"
      >
        {busy ? "Submitting…" : "Submit for approval"}
      </button>
    </form>
  );
}

function ProfileForm({ user }: any) {
  const [f, setF] = useState<any>({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    photoURL: user?.photoURL || "",
  });

  async function save(e: any) {
    e.preventDefault();

    try {
      const t = await getApiToken();

      await api(
        "/users/me",
        {
          method: "PATCH",
          body: JSON.stringify(f),
        },
        t,
      );

      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <form onSubmit={save} className="glass grid max-w-xl gap-4 rounded-2xl p-6">
      {Object.entries(f).map(([k, v]: any) => (
        <label className="text-sm capitalize" key={k}>
          {k}
          <input
            className="field mt-2"
            value={v}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
          />
        </label>
      ))}

      <button className="btn-primary">Save profile</button>
    </form>
  );
}
