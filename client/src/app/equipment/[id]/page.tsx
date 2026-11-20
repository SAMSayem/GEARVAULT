"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
export default function Detail() {
  const { id } = useParams<{ id: string }>(),
    router = useRouter();
  const [item, setItem] = useState<any>(),
    [modal, setModal] = useState(false),
    [msg, setMsg] = useState("");
  useEffect(() => {
    api(`/equipment/${id}`)
      .then(setItem)
      .catch((e) => setMsg(e.message));
  }, [id]);
  async function book(e: any) {
    e.preventDefault();
    try {
      const b = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          equipmentId: id,
          startDate: e.target.start.value,
          endDate: e.target.end.value,
          quantity: Number(e.target.quantity.value),
          contact: e.target.contact.value,
          address: e.target.address.value,
          notes: e.target.notes.value,
        }),
      });
      const p = await api("/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ bookingId: b.bookingId }),
      });
      location.href = p.url;
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  async function favorite() {
    try {
      await api(`/equipment/${id}/favorite`, { method: "POST" });
      setMsg("Added to favorites");
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  if (!item)
    return (
      <div className="container empty">{msg || "Loading equipment..."}</div>
    );
  return (
    <div className="container">
      <div className="detail-layout">
        <img src={item.image} alt={item.name} />
        <div>
          <span className="tag">{item.category}</span>
          <h1 style={{ font: "800 38px Manrope" }}>{item.name}</h1>
          <p className="section-sub">{item.description}</p>
          <h2 className="price">
            ${item.price} <small className="muted">/ {item.rentalType}</small>
          </h2>
          <p className="muted">
            ⌖ {item.location} · {item.quantity} available
          </p>
          <p className="muted">
            Owner: {item.owner?.name || "Verified equipment owner"}
          </p>
          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => {
                if (!localStorage.getItem("gv_token")) router.push("/login");
                else setModal(true);
              }}
            >
              Book Now ↗
            </button>
            <button
              className="btn-outline"
              style={{ color: "var(--text)", borderColor: "var(--line)" }}
              onClick={favorite}
            >
              ♡ Add to Favorites
            </button>
          </div>
          <h3>Rental terms and conditions</h3>
          <p className="section-sub">
            {item.terms ||
              "Please return equipment in the condition it was received. Any damage or late return may incur additional charges."}
          </p>
          {msg && <p className="muted">{msg}</p>}
        </div>
      </div>
      {modal && (
        <div className="modal-back">
          <form className="modal" onSubmit={book}>
            <button
              type="button"
              className="close"
              onClick={() => setModal(false)}
            >
              ×
            </button>
            <h2>Book {item.name}</h2>
            <label>
              Rental Start Date
              <input name="start" type="date" required />
            </label>
            <label>
              Rental End Date
              <input name="end" type="date" required />
            </label>
            <label>
              Required Quantity
              <input
                name="quantity"
                type="number"
                min="1"
                max={item.quantity}
                defaultValue="1"
                required
              />
            </label>
            <label>
              Contact Number
              <input name="contact" required />
            </label>
            <label>
              Delivery Address
              <textarea name="address" required />
            </label>
            <label>
              Additional Notes
              <textarea name="notes" />
            </label>
            <button className="btn-primary">Continue to secure payment</button>
          </form>
        </div>
      )}
    </div>
  );
}
