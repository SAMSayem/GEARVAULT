import Link from "next/link";
import Image from "next/image";
import { EquipmentCard } from "@/components/equipment-card";
import { API_URL } from "@/lib/api";
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
import { MotionIn } from "@/components/motion-in";
async function featured() {
  try {
    const r = await fetch(`${API_URL}/equipment?limit=6&sort=recent`, {
      next: { revalidate: 60 },
    });
    if (!r.ok) return [];
    const d = await r.json();
    return d.items || [];
  } catch {
    return [];
  }
}
const categories = [
  { name: "Construction", icon: HardHat },
  { name: "Photography", icon: Camera },
  { name: "Vehicles", icon: Truck },
  { name: "Agriculture", icon: Tractor },
  { name: "Electronics", icon: Monitor },
  { name: "Events", icon: PartyPopper },
];
const reviews = [
  {
    name: "Nadia Rahman",
    role: "Studio owner",
    rating: "★★★★★",
    text: "Booked a camera kit for a weekend shoot. The process was clear, quick, and the equipment arrived in excellent condition.",
  },
  {
    name: "Imran Hossain",
    role: "Independent contractor",
    rating: "★★★★★",
    text: "A practical way to access professional tools without a huge upfront investment. Great experience from start to finish.",
  },
  {
    name: "Farhan Ahmed",
    role: "Event planner",
    rating: "★★★★★",
    text: "Found lighting and sound gear for our event in one place. Flexible rental periods made planning much easier.",
  },
  {
    name: "Sadia Karim",
    role: "Small business owner",
    rating: "★★★★★",
    text: "The listing details and owner information helped me choose confidently. I will definitely rent here again.",
  },
];
export default async function Home() {
  const items = await featured();
  return (
    <>
      <section className="relative isolate min-h-[650px] overflow-hidden border-b border-white/10">
        <Image
          src="https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=2200&q=90"
          alt="Heavy construction machinery at work"
          fill
          priority
          unoptimized
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080a0e] via-[#080a0edb] to-[#080a0e55]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#090b0f] via-transparent to-black/20" />
        <div className="container flex min-h-[650px] items-center py-20">
          <MotionIn>
            <div className="max-w-3xl">
              <div className="eyebrow mb-6 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />{" "}
                Equipment access, reimagined
              </div>
              <h1 className="hero-title text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Rent the <span className="hero-gradient-text">heavy iron</span>{" "}
                and precision gear your project deserves.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-gray-300 sm:text-lg">
                From construction sites to creative studios, find dependable
                equipment from trusted owners. Book the right tools for exactly
                as long as you need them.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/equipment" className="btn-primary">
                  Explore equipment <ArrowUpRight size={17} />
                </Link>
                <Link href="/register" className="btn-ghost">
                  List your equipment
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 text-sm text-gray-300">
                <div>
                  <b className="block text-2xl text-white">1,200+</b>
                  <span className="text-gray-500">Equipment listings</span>
                </div>
                <div>
                  <b className="block text-2xl text-white">850+</b>
                  <span className="text-gray-500">Verified owners</span>
                </div>
                <div>
                  <b className="block text-2xl text-white">4.9/5</b>
                  <span className="text-gray-500">Customer rating</span>
                </div>
              </div>
            </div>
          </MotionIn>
        </div>
      </section>
      <section className="section">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse by industry</p>
            <h2 className="mt-3 text-3xl font-black">
              Everything from{" "}
              <span className="gradient-text">builders to broadcasters</span>
            </h2>
          </div>
          <Link href="/equipment" className="text-sm text-orange-300">
            Explore all categories ↗
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ name, icon: Icon }) => (
            <MotionIn key={name}>
              <Link
                href={`/equipment?category=${encodeURIComponent(name)}`}
                className="glass block h-full rounded-2xl p-5 transition hover:-translate-y-1 hover:border-orange-400/40"
              >
                <Icon className="mb-5 text-orange-400" size={25} />
                <b className="text-sm">{name}</b>
                <p className="mt-1 text-xs text-gray-500">Explore gear</p>
              </Link>
            </MotionIn>
          ))}
        </div>
      </section>
      <section className="section pt-0">
        <div className="mb-9 flex items-end justify-between">
          <div>
            <p className="eyebrow">Curated for your next project</p>
            <h2 className="mt-3 text-3xl font-black">
              Featured <span className="gradient-text">equipment</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Hand-picked approved listings ready to rent.
            </p>
          </div>
          <Link href="/equipment" className="btn-ghost hidden text-sm sm:block">
            View all equipment
          </Link>
        </div>
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((item: any) => (
              <MotionIn key={item._id}>
                <EquipmentCard item={item} />
              </MotionIn>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-gray-300">
              New equipment is being added. Explore the marketplace to discover
              available listings.
            </p>
            <Link href="/equipment" className="btn-primary mt-5">
              Browse equipment
            </Link>
          </div>
        )}
      </section>
      <section
        id="how-it-works"
        className="border-y border-white/10 bg-white/[.025]"
      >
        <div className="section">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow">Simple from start to finish</p>
            <h2 className="mt-3 text-3xl font-black">
              Built for people who{" "}
              <span className="gradient-text">get the job done</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Find your equipment",
                d: "Search trusted listings by category, location, rental period, and budget.",
              },
              {
                n: "02",
                t: "Book with confidence",
                d: "Choose your dates, quantity, and delivery details. See your rental total upfront.",
              },
              {
                n: "03",
                t: "Get to work",
                d: "Pay securely through Stripe and coordinate with the equipment owner.",
              },
            ].map((x) => (
              <div key={x.n} className="glass rounded-2xl p-7">
                <span className="text-4xl font-black text-orange-400/70">
                  {x.n}
                </span>
                <h3 className="mt-5 text-xl font-bold">{x.t}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="mb-9 text-center">
          <p className="eyebrow">The GearVault advantage</p>
          <h2 className="mt-3 text-3xl font-black">
            A better way to <span className="gradient-text">get equipped</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              i: Wallet,
              t: "Transparent pricing",
              d: "Clear rental rates and duration-based totals before checkout.",
            },
            {
              i: ShieldCheck,
              t: "Trusted listings",
              d: "Admin-reviewed equipment listings and owner profiles.",
            },
            {
              i: Clock3,
              t: "Flexible rental periods",
              d: "Daily, weekly, and monthly options for changing project needs.",
            },
            {
              i: Truck,
              t: "Convenient coordination",
              d: "Share delivery details and connect with equipment owners.",
            },
          ].map((x) => (
            <div className="card p-6" key={x.t}>
              <x.i className="text-orange-400" size={26} />
              <h3 className="mt-5 font-bold">{x.t}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section pt-0">
        <div className="mb-9 text-center">
          <p className="eyebrow">Real projects. Real people.</p>
          <h2 className="mt-3 text-3xl font-black">
            Rated 4.9 by renters who{" "}
            <span className="gradient-text">get things done</span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <MotionIn key={r.name}>
              <article className="glass rounded-2xl p-6">
                <div className="text-sm tracking-widest text-orange-400">
                  {r.rating}
                </div>
                <p className="mt-4 leading-7 text-gray-300">“{r.text}”</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <b>{r.name}</b>
                  <p className="mt-1 text-xs text-gray-500">{r.role}</p>
                </div>
              </article>
            </MotionIn>
          ))}
        </div>
      </section>
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-orange-700 p-8 sm:p-12">
          <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-black/60">
              Your next project starts here
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#160d06] sm:text-4xl">
              Own equipment? Turn idle hours into income.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-black/70">
              List your equipment, manage bookings, and grow your rental
              business with GearVault.
            </p>
            <Link
              href="/register"
              className="owner-cta mt-7 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
            >
              Become an equipment owner ↗
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
