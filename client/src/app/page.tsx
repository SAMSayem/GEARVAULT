"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Clock3,
  Wallet,
  Truck,
  Camera,
  Tractor,
  Monitor,
  PartyPopper,
  HardHat,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
const sample = [
  {
    _id: "a",
    name: "CAT 320 Excavator",
    category: "Construction Equipment",
    price: 185,
    rentalType: "daily",
    location: "Dhaka, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "b",
    name: "Cinema Camera Kit",
    category: "Photography Equipment",
    price: 95,
    rentalType: "daily",
    location: "Dhaka, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "c",
    name: "Heavy Duty Tractor",
    category: "Agriculture Equipment",
    price: 120,
    rentalType: "daily",
    location: "Gazipur, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
  },
];
const cats = [
  ["🏗️", "Construction Equipment", "Heavy machinery & tools"],
  ["📸", "Photography Equipment", "Cameras, lenses & studio"],
  ["🚚", "Vehicles & Transportation", "Move people and materials"],
  ["🌾", "Agriculture Equipment", "Grow more with the right gear"],
  ["⚡", "Electronics", "Power, tools & technology"],
  ["🎪", "Event Equipment", "Make every event happen"],
];
const reviews = [
  [
    "“The excavator was exactly as described. Booking was smooth and the owner was incredibly professional.”",
    "Mahmud Rahman",
    "Construction contractor",
  ],
  [
    "“Found a cinema camera kit for a weekend shoot at a fair price. The whole process felt secure.”",
    "Nadia Islam",
    "Independent filmmaker",
  ],
  [
    "“GEARVAULT helped us get equipment without the huge upfront investment. Brilliant platform.”",
    "Tanvir Ahmed",
    "Small business owner",
  ],
  [
    "“Clear pricing, flexible dates and responsive owners. This is how equipment rental should work.”",
    "Farhana Karim",
    "Event producer",
  ],
];
export default function Home() {
  const [items, setItems] = useState<any[]>(sample);
  useEffect(() => {
    api("/equipment?limit=6")
      .then((d) => setItems(d.items?.length ? d.items : sample))
      .catch(() => {});
  }, []);
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="eyebrow">THE SMARTER WAY TO RENT</div>
            <h1>
              Rent the heavy iron
              <br />
              and precision gear
              <br />
              <em>your project deserves.</em>
            </h1>
            <p>
              From construction sites to creative studios, get the right
              equipment when you need it. Reliable machines. Verified owners. No
              unnecessary overhead.
            </p>
            <div className="hero-buttons">
              <Link className="btn-primary" href="/equipment">
                Explore Equipment <ArrowUpRight size={17} />
              </Link>
              <Link className="btn-outline" href="/register">
                List Your Equipment
              </Link>
            </div>
            <div className="stats">
              <div className="stat">
                <strong>1,200+</strong>
                <span>Equipment listings</span>
              </div>
              <div className="stat">
                <strong>4.9/5</strong>
                <span>Renter satisfaction</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Booking access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">READY WHEN YOU ARE</div>
              <h2>This week's most trusted machines</h2>
              <p className="section-sub">
                Explore reliable equipment, listed by owners who know what
                getting the job done takes.
              </p>
            </div>
            <Link className="text-link" href="/equipment">
              Browse all equipment ↗
            </Link>
          </div>
          <div className="grid-3">
            {items.slice(0, 6).map((x, i) => (
              <motion.article
                className="equipment-card"
                key={x._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <img src={x.image} alt={x.name} />
                <div className="card-body">
                  <span className="tag">{x.category}</span>
                  <h3>{x.name}</h3>
                  <div className="meta">
                    <span>⌖ {x.location}</span>
                    <span>Available</span>
                  </div>
                  <div className="price-row">
                    <div className="price">
                      ${x.price}
                      <small> / {x.rentalType}</small>
                    </div>
                    <Link className="mini-btn" href={`/equipment/${x._id}`}>
                      View Details ↗
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "var(--soft)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">FIND YOUR CATEGORY</div>
              <h2>Everything from bulldozers to broadcast</h2>
              <p className="section-sub">
                A better way to access the equipment that keeps your work
                moving.
              </p>
            </div>
          </div>
          <div className="grid-3">
            {cats.map((c) => (
              <Link
                href={`/equipment?category=${encodeURIComponent(c[1])}`}
                className="category"
                key={c[1]}
              >
                <div className="category-icon">{c[0]}</div>
                <h3>{c[1]}</h3>
                <p>{c[2]} ↗</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section benefit-band">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">THE GEARVAULT ADVANTAGE</div>
              <h2>Built for people who get the job done</h2>
            </div>
          </div>
          <div className="grid-4">
            {[
              [
                ShieldCheck,
                "Verified equipment owners",
                "Know who you are renting from, with transparent listings and clear details.",
              ],
              [
                Wallet,
                "Straightforward pricing",
                "See rental rates upfront and keep your project costs under control.",
              ],
              [
                Clock3,
                "Flexible rental periods",
                "Book equipment for the time your work actually requires.",
              ],
              [
                Truck,
                "Convenient coordination",
                "Connect with owners to arrange collection or delivery.",
              ],
            ].map(([I, t, p]: any) => (
              <div className="benefit" key={t}>
                <I color="#ff801e" size={26} />
                <b>{t}</b>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">SIMPLE BY DESIGN</div>
              <h2>Three steps between you and the right machine</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              [
                "01",
                "Find your equipment",
                "Search by category, location and rental rate to find the right fit.",
              ],
              [
                "02",
                "Book with confidence",
                "Choose your rental dates, quantity and confirm the booking details.",
              ],
              [
                "03",
                "Get to work",
                "Complete secure payment and coordinate with the equipment owner.",
              ],
            ].map((s) => (
              <div className="how-card" key={s[0]}>
                <div className="how-num">{s[0]} / STEP</div>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className="section"
        id="reviews"
        style={{ background: "var(--soft)" }}
      >
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">REAL PEOPLE. REAL PROJECTS.</div>
              <h2>Rated 4.9 by renters who ship on time</h2>
            </div>
          </div>
          <div className="grid-4">
            {reviews.map((r) => (
              <div className="review" key={r[1]}>
                <div className="stars">★★★★★</div>
                <p>{r[0]}</p>
                <b>{r[1]}</b>
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                  {r[2]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="cta-panel">
            <div>
              <h2>Own equipment? Turn idle machines into income.</h2>
              <p>
                List your equipment, connect with renters and put your assets to
                work.
              </p>
            </div>
            <Link href="/register">Become an equipment owner ↗</Link>
          </div>
        </div>
      </section>
    </>
  );
}
