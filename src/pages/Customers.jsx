import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

/* =========================================================================
   RAJNI SAREE CENTER — CUSTOMER MANAGEMENT
   Luxury Premium Glassmorphism UI — White + Gold + Cream
   Single-file, self-contained, no backend, no external CSS.
   ========================================================================= */

/* ----------------------------- THEME TOKENS ----------------------------- */

const THEME = {
  light: {
    bgGradient:
      "radial-gradient(1200px 600px at 10% -10%, #FFF7E6 0%, transparent 60%), radial-gradient(1000px 500px at 110% 10%, #FFF0D6 0%, transparent 55%), linear-gradient(180deg, #FBF7F0 0%, #F6F0E4 100%)",
    surface: "rgba(255,255,255,0.72)",
    surfaceSolid: "#FFFFFF",
    surfaceAlt: "rgba(255,251,242,0.85)",
    border: "rgba(196,155,80,0.28)",
    borderSoft: "rgba(196,155,80,0.16)",
    text: "#2A2118",
    textSoft: "#6B5D4C",
    textFaint: "#9C8B72",
    gold: "#C9A227",
    goldDeep: "#9C7A1E",
    goldSoft: "#E8D9AE",
    goldGradient: "linear-gradient(135deg, #F3D98B 0%, #C9A227 45%, #9C7A1E 100%)",
    cream: "#FBF3E3",
    black: "#1B1712",
    success: "#1E8E5A",
    successBg: "rgba(30,142,90,0.12)",
    danger: "#C0392B",
    dangerBg: "rgba(192,57,43,0.12)",
    warning: "#B8860B",
    warningBg: "rgba(184,134,11,0.12)",
    info: "#3B6EA5",
    infoBg: "rgba(59,110,165,0.12)",
    shadow: "0 8px 32px rgba(120,90,30,0.10)",
    shadowLg: "0 24px 64px rgba(120,90,30,0.18)",
    scrollTrack: "rgba(196,155,80,0.08)",
  },
  dark: {
    bgGradient:
      "radial-gradient(1200px 600px at 10% -10%, #2A2214 0%, transparent 60%), radial-gradient(1000px 500px at 110% 10%, #201A10 0%, transparent 55%), linear-gradient(180deg, #14110D 0%, #0E0C09 100%)",
    surface: "rgba(30,26,20,0.65)",
    surfaceSolid: "#1C1812",
    surfaceAlt: "rgba(38,32,24,0.85)",
    border: "rgba(201,162,39,0.28)",
    borderSoft: "rgba(201,162,39,0.14)",
    text: "#F3ECDD",
    textSoft: "#C8BBA0",
    textFaint: "#8B7F68",
    gold: "#E3C567",
    goldDeep: "#C9A227",
    goldSoft: "#4A3E22",
    goldGradient: "linear-gradient(135deg, #F3D98B 0%, #D8B54A 45%, #9C7A1E 100%)",
    cream: "#26200F",
    black: "#F3ECDD",
    success: "#4CC38A",
    successBg: "rgba(76,195,138,0.14)",
    danger: "#E5766A",
    dangerBg: "rgba(229,118,106,0.14)",
    warning: "#E3C567",
    warningBg: "rgba(227,197,103,0.14)",
    info: "#7AA7DA",
    infoBg: "rgba(122,167,218,0.14)",
    shadow: "0 8px 32px rgba(0,0,0,0.35)",
    shadowLg: "0 24px 64px rgba(0,0,0,0.55)",
    scrollTrack: "rgba(201,162,39,0.06)",
  },
};

const FONT_DISPLAY = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_BODY =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/* ------------------------------ UTILITIES -------------------------------- */

const CITIES = [
  "Hisar", "Jaipur", "Delhi", "Ludhiana", "Amritsar", "Chandigarh", "Ambala",
  "Karnal", "Panipat", "Rohtak", "Gurugram", "Faridabad", "Sirsa", "Bathinda",
  "Jodhpur", "Udaipur", "Agra", "Lucknow", "Kanpur", "Meerut",
];

const STATES = ["Haryana", "Punjab", "Rajasthan", "Delhi", "Uttar Pradesh"];

const FIRST_NAMES_F = [
  "Anjali", "Priya", "Kavita", "Sunita", "Neha", "Pooja", "Rekha", "Meena",
  "Simran", "Kiran", "Ritu", "Deepika", "Shalini", "Manju", "Suman",
  "Anita", "Nisha", "Preeti", "Komal", "Divya",
];
const FIRST_NAMES_M = [
  "Rajesh", "Suresh", "Vikas", "Amit", "Sanjay", "Manoj", "Ashok", "Ramesh",
  "Deepak", "Rohit", "Vijay", "Naveen", "Sandeep", "Anil", "Pankaj",
];
const LAST_NAMES = [
  "Sharma", "Gupta", "Verma", "Agarwal", "Singh", "Jain", "Mittal", "Bansal",
  "Goyal", "Kapoor", "Malhotra", "Chawla", "Arora", "Khanna", "Saini",
  "Yadav", "Chaudhary", "Bhatia", "Sethi", "Tandon",
];
const SAREE_TYPES = [
  "Banarasi Silk", "Kanjeevaram Silk", "Chiffon Georgette", "Organza",
  "Cotton Handloom", "Tussar Silk", "Patola Silk", "Chanderi Cotton",
  "Bandhani", "Linen", "Net Embroidered", "Crepe Silk",
];
const OCCUPATIONS = [
  "Homemaker", "Teacher", "Business Owner", "Doctor", "Government Employee",
  "Private Job", "Boutique Owner", "Retired", "Advocate", "Engineer",
];

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}

function formatINR(amount) {
  const n = Math.round(amount);
  return "₹" + n.toLocaleString("en-IN");
}

function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColorFromString(str, theme) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return theme === "dark"
    ? `hsl(${hue}, 45%, 32%)`
    : `hsl(${hue}, 55%, 82%)`;
}

function generatePhone(seedRnd) {
  const prefixes = ["98", "97", "96", "94", "99", "70", "88", "93"];
  let num = pick(prefixes, seedRnd);
  for (let i = 0; i < 8; i++) num += Math.floor(seedRnd() * 10);
  return num;
}

function generatePurchaseHistory(rnd, count, customerName) {
  const history = [];
  for (let i = 0; i < count; i++) {
    const items = Math.floor(rnd() * 4) + 1;
    const amount = Math.floor(rnd() * 18000) + 1500;
    const discount = Math.floor(amount * (rnd() * 0.1));
    const gst = Math.round((amount - discount) * 0.05);
    const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Credit"];
    const statuses = ["Paid", "Paid", "Paid", "Partial", "Pending"];
    history.push({
      invoiceNo: "INV-" + (2400 + i * 7 + Math.floor(rnd() * 5)),
      date: daysAgo(Math.floor(rnd() * 400) + i * 12),
      items,
      amount,
      discount,
      gst,
      payment: pick(paymentModes, rnd),
      status: pick(statuses, rnd),
    });
  }
  return history.sort((a, b) => b.date - a.date);
}

function generateCustomers() {
  const rnd = seededRandom(42);
  const customers = [];
  const types = ["VIP", "Premium", "Regular"];

  for (let i = 0; i < 35; i++) {
    const isFemale = rnd() > 0.25;
    const first = isFemale ? pick(FIRST_NAMES_F, rnd) : pick(FIRST_NAMES_M, rnd);
    const last = pick(LAST_NAMES, rnd);
    const name = `${first} ${last}`;
    const city = pick(CITIES, rnd);
    const state = pick(STATES, rnd);
    const typeRoll = rnd();
    const customerType = typeRoll < 0.18 ? "VIP" : typeRoll < 0.5 ? "Premium" : "Regular";
    const ordersCount =
      customerType === "VIP"
        ? Math.floor(rnd() * 25) + 15
        : customerType === "Premium"
        ? Math.floor(rnd() * 15) + 6
        : Math.floor(rnd() * 6) + 1;

    const purchaseHistory = generatePurchaseHistory(rnd, ordersCount, name);
    const lifetimePurchase = purchaseHistory.reduce((s, p) => s + p.amount - p.discount, 0);
    const outstandingRoll = rnd();
    const outstanding =
      outstandingRoll < 0.28
        ? Math.floor(rnd() * (customerType === "VIP" ? 25000 : 12000)) + 500
        : 0;

    const createdDaysAgo = Math.floor(rnd() * 900) + 5;
    const lastPurchase = purchaseHistory.length
      ? purchaseHistory[0].date
      : daysAgo(createdDaysAgo);

    customers.push({
      id: "CUST" + String(1000 + i),
      name,
      gender: isFemale ? "Female" : "Male",
      phone: generatePhone(rnd),
      altPhone: rnd() > 0.6 ? generatePhone(rnd) : "",
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@gmail.com`,
      birthday: rnd() > 0.3 ? daysAgo(Math.floor(rnd() * 15000) + 6000) : null,
      anniversary: rnd() > 0.5 ? daysAgo(Math.floor(rnd() * 5000) + 200) : null,
      occupation: pick(OCCUPATIONS, rnd),
      gstNumber: rnd() > 0.85 ? `06ABCDE${1000 + i}F1Z${Math.floor(rnd() * 9)}` : "",
      address: `${Math.floor(rnd() * 200) + 1}, ${pick(
        ["Model Town", "Civil Lines", "Sector 14", "Old City", "Gandhi Nagar", "Shastri Nagar"],
        rnd
      )}`,
      city,
      state,
      pincode: String(120000 + Math.floor(rnd() * 30000)),
      customerType,
      creditLimit:
        customerType === "VIP" ? 50000 : customerType === "Premium" ? 25000 : 10000,
      outstanding,
      favouriteSaree: pick(SAREE_TYPES, rnd),
      notes:
        rnd() > 0.6
          ? pick(
              [
                "Prefers red and maroon shades for festive wear.",
                "Always asks for new arrivals in silk collection.",
                "Loyal customer since store opening, refer VIP treatment.",
                "Prefers home delivery, works late on weekdays.",
                "Interested in bridal collection for daughter's wedding.",
                "Requests discreet billing for gifting purposes.",
              ],
              rnd
            )
          : "",
      totalOrders: ordersCount,
      lifetimePurchase,
      createdAt: daysAgo(createdDaysAgo),
      lastPurchase,
      status: rnd() > 0.08 ? "Active" : "Inactive",
      purchaseHistory,
    });
  }
  return customers;
}

/* ------------------------------ ICON SET --------------------------------- */
/* Lightweight inline SVG icons (no external deps) */

const Icon = {
  Search: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  ),
  Refresh: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
  ),
  Export: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  ),
  Crown: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20l-2-9-5 4-3-7-3 7-5-4z" /></svg>
  ),
  Star: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ),
  Wallet: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 000 4h4v-4z" /></svg>
  ),
  Rupee: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12M6 8h12M6 3s0 8 9 8M6 8s0 8 9 8l3 0M6 16h5" /></svg>
  ),
  UserPlus: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" /></svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
  ),
  History: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /><polyline points="12 7 12 12 16 14" /></svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
  Sun: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
  ),
  Moon: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
  ),
  Mail: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /><polyline points="22 6 12 13 2 6" /></svg>
  ),
  MapPin: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 40} height={p.size || 40} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  ),
  Alert: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 40} height={p.size || 40} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  Info: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 40} height={p.size || 40} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  ),
  ChevronLeft: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
  ),
  ChevronRight: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
  ),
  Sparkle: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor"><path d="M12 2l1.8 5.6L19.4 9.4 13.8 11.2 12 17l-1.8-5.8L4.6 9.4l5.6-1.8z" /></svg>
  ),
  Gift: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 15} height={p.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>
  ),
  ArrowUp: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 12} height={p.size || 12} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
  ),
};

/* ------------------------------ ANIMATIONS -------------------------------- */

const GLOBAL_KEYFRAMES = `
@keyframes rjFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes rjSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rjSlideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rjScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes rjSlideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes rjShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes rjSpin { to { transform: rotate(360deg); } }
@keyframes rjPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes rjRipple { from { transform: scale(0); opacity: 0.55; } to { transform: scale(2.5); opacity: 0; } }
@keyframes rjToastIn { from { opacity: 0; transform: translateX(60px) scale(0.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes rjGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(201,162,39,0.35); } 50% { box-shadow: 0 0 0 8px rgba(201,162,39,0); } }
.rj-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.rj-scrollbar::-webkit-scrollbar-track { background: transparent; }
.rj-scrollbar::-webkit-scrollbar-thumb { background: rgba(196,155,80,0.35); border-radius: 8px; }
.rj-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(196,155,80,0.55); }
`;

/* ------------------------------ SUBCOMPONENTS ------------------------------ */

function useCountUp(target, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}

function StatCard({ icon, label, value, isCurrency, accent, sub, delay, theme }) {
  const numericTarget =
    typeof value === "number" ? value : parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  const animated = useCountUp(numericTarget, 1100);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: theme.surface,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        boxShadow: hover ? theme.shadowLg : theme.shadow,
        transform: hover ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
        transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
        animation: `rjSlideUp 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms both`,
        cursor: "default",
        minWidth: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: accent,
          opacity: hover ? 0.22 : 0.12,
          filter: "blur(6px)",
          transition: "opacity 0.35s ease",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: `0 6px 16px ${accent}55`,
            transform: hover ? "rotate(-6deg) scale(1.06)" : "rotate(0) scale(1)",
            transition: "transform 0.35s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 600, color: theme.textSoft, letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 26, fontWeight: 800, color: theme.text, fontFamily: FONT_DISPLAY, letterSpacing: 0.2 }}>
        {isCurrency ? formatINR(animated) : animated}
      </div>
      {sub && (
        <div style={{ marginTop: 4, fontSize: 12, color: theme.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function RippleButton({ children, onClick, style, theme, variant = "primary", disabled, title, type = "button" }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    onClick && onClick(e);
  };

  const variants = {
    primary: { background: theme.goldGradient, color: "#2A2118", border: "none" },
    outline: { background: "transparent", color: theme.gold, border: `1.5px solid ${theme.border}` },
    ghost: { background: theme.surfaceAlt, color: theme.text, border: `1px solid ${theme.borderSoft}` },
    danger: { background: theme.danger, color: "#fff", border: "none" },
  };

  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={handleClick}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "10px 18px",
        borderRadius: 12,
        fontSize: 13.5,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
        fontFamily: FONT_BODY,
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
      {ripples.map((rp) => (
        <span
          key={rp.id}
          style={{
            position: "absolute",
            left: rp.x,
            top: rp.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.6)",
            animation: "rjRipple 0.6s ease-out",
            pointerEvents: "none",
          }}
        />
      ))}
    </button>
  );
}

function Badge({ children, color, bg, theme, small }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: small ? "3px 9px" : "4px 11px",
        borderRadius: 999,
        fontSize: small ? 10.5 : 11.5,
        fontWeight: 700,
        color: color,
        background: bg,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function CustomerTypeBadge({ type, theme }) {
  const map = {
    VIP: { color: theme.goldDeep, bg: `linear-gradient(135deg, ${theme.goldSoft}, transparent)`, icon: <Icon.Crown size={11} /> },
    Premium: { color: theme.info, bg: theme.infoBg, icon: <Icon.Star size={11} /> },
    Regular: { color: theme.textSoft, bg: theme.borderSoft, icon: null },
  };
  const cfg = map[type] || map.Regular;
  return (
    <Badge color={cfg.color} bg={cfg.bg} theme={theme}>
      {cfg.icon}
      {type}
    </Badge>
  );
}

function StatusBadge({ status, theme }) {
  const isActive = status === "Active";
  return (
    <Badge color={isActive ? theme.success : theme.textFaint} bg={isActive ? theme.successBg : theme.borderSoft} theme={theme}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isActive ? theme.success : theme.textFaint,
          display: "inline-block",
        }}
      />
      {status}
    </Badge>
  );
}

function Avatar({ name, size = 40, theme }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColorFromString(name, theme.text === "#F3ECDD" ? "dark" : "light"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.36,
        color: theme.text,
        border: `2px solid ${theme.border}`,
        flexShrink: 0,
        fontFamily: FONT_DISPLAY,
      }}
    >
      {initials(name)}
    </div>
  );
}

function FieldLabel({ children, required, theme }) {
  return (
    <label style={{ fontSize: 12.5, fontWeight: 700, color: theme.textSoft, marginBottom: 6, display: "block", letterSpacing: 0.2 }}>
      {children} {required && <span style={{ color: theme.danger }}>*</span>}
    </label>
  );
}

function inputStyle(theme, error) {
  return {
    width: "100%",
    padding: "10px 13px",
    borderRadius: 10,
    border: `1.5px solid ${error ? theme.danger : theme.borderSoft}`,
    background: theme.surfaceAlt,
    color: theme.text,
    fontSize: 13.5,
    fontFamily: FONT_BODY,
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
  };
}

function TextField({ label, value, onChange, placeholder, required, error, theme, type = "text", maxLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel required={required} theme={theme}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle(theme, error),
          borderColor: focused ? theme.gold : error ? theme.danger : theme.borderSoft,
          boxShadow: focused ? `0 0 0 3px ${theme.goldSoft}55` : "none",
        }}
      />
      {error && <div style={{ color: theme.danger, fontSize: 11.5, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required, error, theme }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel required={required} theme={theme}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle(theme, error),
          borderColor: focused ? theme.gold : error ? theme.danger : theme.borderSoft,
          boxShadow: focused ? `0 0 0 3px ${theme.goldSoft}55` : "none",
          cursor: "pointer",
        }}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <div style={{ color: theme.danger, fontSize: 11.5, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, theme, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel theme={theme}>{label}</FieldLabel>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle(theme, false),
          borderColor: focused ? theme.gold : theme.borderSoft,
          boxShadow: focused ? `0 0 0 3px ${theme.goldSoft}55` : "none",
          resize: "vertical",
          fontFamily: FONT_BODY,
        }}
      />
    </div>
  );
}

/* ------------------------------ TOASTS -------------------------------- */

function ToastContainer({ toasts, removeToast, theme }) {
  const cfgMap = {
    success: { color: theme.success, bg: theme.surfaceSolid, icon: <Icon.Check size={20} />, bar: theme.success },
    error: { color: theme.danger, bg: theme.surfaceSolid, icon: <Icon.Alert size={20} />, bar: theme.danger },
    warning: { color: theme.warning, bg: theme.surfaceSolid, icon: <Icon.Info size={20} />, bar: theme.warning },
  };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
      {toasts.map((t) => {
        const cfg = cfgMap[t.type] || cfgMap.success;
        return (
          <div
            key={t.id}
            style={{
              background: cfg.bg,
              border: `1px solid ${theme.border}`,
              borderLeft: `4px solid ${cfg.bar}`,
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              boxShadow: theme.shadowLg,
              animation: "rjToastIn 0.4s cubic-bezier(.22,1,.36,1)",
              minWidth: 280,
            }}
          >
            <div style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.text }}>{t.title}</div>
              {t.message && <div style={{ fontSize: 12.5, color: theme.textSoft, marginTop: 2 }}>{t.message}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: theme.textFaint, padding: 2 }}
            >
              <Icon.Close size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ SKELETONS -------------------------------- */

function shimmerStyle(theme) {
  return {
    background: `linear-gradient(90deg, ${theme.borderSoft} 0px, ${theme.goldSoft}88 40px, ${theme.borderSoft} 80px)`,
    backgroundSize: "600px 100%",
    animation: "rjShimmer 1.6s infinite linear",
    borderRadius: 8,
  };
}

function SkeletonStatCards({ theme }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 22 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 20, height: 120 }}>
          <div style={{ ...shimmerStyle(theme), width: 42, height: 42, borderRadius: 13 }} />
          <div style={{ ...shimmerStyle(theme), width: "60%", height: 12, marginTop: 16 }} />
          <div style={{ ...shimmerStyle(theme), width: "40%", height: 20, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

function SkeletonTableRows({ theme, rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 12 }).map((_, j) => (
            <td key={j} style={{ padding: "14px 12px" }}>
              <div style={{ ...shimmerStyle(theme), height: 14, width: j === 0 ? 36 : `${60 + (j % 3) * 15}%`, borderRadius: j === 0 ? "50%" : 8 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ------------------------------ MAIN COMPONENT -------------------------------- */

const PAGE_SIZE = 8;

export default function Customer() {
  /* ---------- THEME ---------- */
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? THEME.dark : THEME.light;

  /* ---------- DATA ---------- */
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- SEARCH / FILTER / SORT ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("Name");
  const [filterType, setFilterType] = useState("All");
  const [filterOutstanding, setFilterOutstanding] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- MODALS / DRAWERS ---------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  /* ---------- TOASTS ---------- */
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, title, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------- LOAD DATA (simulated) ---------- */
  const loadData = useCallback((withToast) => {
    setLoading(true);
    setTimeout(() => {
      setCustomers(generateCustomers());
      setLoading(false);
      if (withToast) pushToast("success", "Data refreshed", "Customer list has been updated.");
    }, 850);
  }, [pushToast]);

  useEffect(() => {
    loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- DERIVED STATS ---------- */
  const stats = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter((c) => c.customerType === "VIP").length;
    const regular = customers.filter((c) => c.customerType === "Regular").length;
    const outstanding = customers.reduce((s, c) => s + c.outstanding, 0);
    const revenue = customers.reduce((s, c) => s + c.lifetimePurchase, 0);
    const today = new Date();
    const todayNew = customers.filter((c) => {
      const created = new Date(c.createdAt);
      return created.toDateString() === today.toDateString();
    }).length;
    return { total, vip, regular, outstanding, revenue, todayNew: todayNew || Math.min(3, total) };
  }, [customers]);

  /* ---------- FILTERED + SORTED LIST ---------- */
  const filteredCustomers = useMemo(() => {
    let list = [...customers];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((c) => {
        if (searchBy === "Name") return c.name.toLowerCase().includes(q);
        if (searchBy === "Phone") return c.phone.includes(q) || (c.altPhone && c.altPhone.includes(q));
        if (searchBy === "City") return c.city.toLowerCase().includes(q);
        return c.name.toLowerCase().includes(q);
      });
    }

    if (filterType !== "All") {
      list = list.filter((c) => c.customerType === filterType);
    }

    if (filterOutstanding === "With Outstanding") {
      list = list.filter((c) => c.outstanding > 0);
    } else if (filterOutstanding === "No Outstanding") {
      list = list.filter((c) => c.outstanding === 0);
    }

    switch (sortBy) {
      case "Newest":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Oldest":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "Highest Purchase":
        list.sort((a, b) => b.lifetimePurchase - a.lifetimePurchase);
        break;
      case "Alphabetical":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [customers, searchTerm, searchBy, filterType, filterOutstanding, sortBy]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy, filterType, filterOutstanding, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  /* ---------- FORM STATE (ADD/EDIT) ---------- */
  const emptyForm = {
    name: "", phone: "", altPhone: "", email: "", gender: "Female",
    birthday: "", anniversary: "", occupation: "", gstNumber: "",
    address: "", city: "", state: "", pincode: "",
    customerType: "Regular", creditLimit: "10000", outstanding: "0",
    favouriteSaree: "", notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const openAddModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingCustomer(null);
    setShowAddModal(true);
  };

  const openEditModal = (customer) => {
    setForm({
      name: customer.name,
      phone: customer.phone,
      altPhone: customer.altPhone || "",
      email: customer.email,
      gender: customer.gender,
      birthday: customer.birthday ? new Date(customer.birthday).toISOString().slice(0, 10) : "",
      anniversary: customer.anniversary ? new Date(customer.anniversary).toISOString().slice(0, 10) : "",
      occupation: customer.occupation || "",
      gstNumber: customer.gstNumber || "",
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      customerType: customer.customerType,
      creditLimit: String(customer.creditLimit),
      outstanding: String(customer.outstanding),
      favouriteSaree: customer.favouriteSaree || "",
      notes: customer.notes || "",
    });
    setFormErrors({});
    setEditingCustomer(customer);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCustomer(null);
    setFormErrors({});
  };

  const updateForm = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (formErrors[key]) setFormErrors((e) => ({ ...e, [key]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Customer name is required";
    if (!form.phone.trim()) errors.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = "Enter a valid 10-digit number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.customerType) errors.customerType = "Select a customer type";
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) errors.pincode = "Enter a valid 6-digit pincode";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = () => {
    if (!validateForm()) {
      pushToast("error", "Validation failed", "Please correct the highlighted fields.");
      return;
    }

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                ...form,
                creditLimit: Number(form.creditLimit) || 0,
                outstanding: Number(form.outstanding) || 0,
                birthday: form.birthday ? new Date(form.birthday) : null,
                anniversary: form.anniversary ? new Date(form.anniversary) : null,
              }
            : c
        )
      );
      pushToast("success", "Customer updated", `${form.name}'s details were saved.`);
    } else {
      const newCustomer = {
        id: "CUST" + (1000 + customers.length + Math.floor(Math.random() * 100)),
        ...form,
        creditLimit: Number(form.creditLimit) || 0,
        outstanding: Number(form.outstanding) || 0,
        birthday: form.birthday ? new Date(form.birthday) : null,
        anniversary: form.anniversary ? new Date(form.anniversary) : null,
        totalOrders: 0,
        lifetimePurchase: 0,
        createdAt: new Date(),
        lastPurchase: new Date(),
        status: "Active",
        purchaseHistory: [],
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      pushToast("success", "Customer added", `${form.name} has been added successfully.`);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (!deletingCustomer) return;
    setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id));
    pushToast("warning", "Customer deleted", `${deletingCustomer.name} was removed from your records.`);
    setDeletingCustomer(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID", "Name", "Phone", "Email", "City", "State", "Type",
      "Total Orders", "Lifetime Purchase", "Outstanding", "Status",
    ];
    const rows = filteredCustomers.map((c) => [
      c.id, c.name, c.phone, c.email, c.city, c.state, c.customerType,
      c.totalOrders, c.lifetimePurchase, c.outstanding, c.status,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rajni_Saree_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast("success", "Export complete", `${filteredCustomers.length} customer records exported to CSV.`);
  };

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  /* ============================ RENDER ============================ */

  return (
    <div
      className="rj-scrollbar"
      style={{
        minHeight: "100vh",
        background: theme.bgGradient,
        fontFamily: FONT_BODY,
        color: theme.text,
        padding: "28px 32px 60px",
        transition: "background 0.4s ease, color 0.4s ease",
        boxSizing: "border-box",
      }}
    >
      <style>{GLOBAL_KEYFRAMES}</style>

      <ToastContainer toasts={toasts} removeToast={removeToast} theme={theme} />

      {/* ---------------- HEADER ---------------- */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          marginBottom: 26,
          animation: "rjSlideDown 0.5s ease both",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: theme.gold }}><Icon.Sparkle size={22} /></div>
            <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 800, letterSpacing: 0.3, color: theme.text }}>
              Customer Management
            </h1>
          </div>
          <p style={{ margin: "6px 0 0 32px", color: theme.textSoft, fontSize: 13.5 }}>
            Rajni Saree Center — manage relationships, loyalty and lifetime value in one place
          </p>
          <p style={{ margin: "4px 0 0 32px", color: theme.textFaint, fontSize: 12 }}>{todayFormatted}</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "9px 14px",
              minWidth: 220,
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ color: theme.textFaint }}><Icon.Search size={16} /></span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search by ${searchBy.toLowerCase()}...`}
              style={{ border: "none", outline: "none", background: "transparent", color: theme.text, fontSize: 13.5, width: "100%", fontFamily: FONT_BODY }}
            />
            {searchTerm && (
              <span style={{ cursor: "pointer", color: theme.textFaint }} onClick={() => setSearchTerm("")}>
                <Icon.Close size={14} />
              </span>
            )}
          </div>

          <button
            onClick={() => setDarkMode((d) => !d)}
            title="Toggle dark mode"
            style={{
              width: 38, height: 38, borderRadius: 12, border: `1px solid ${theme.border}`,
              background: theme.surface, color: theme.gold, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(20deg)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
          >
            {darkMode ? <Icon.Sun size={17} /> : <Icon.Moon size={17} />}
          </button>

          <RippleButton theme={theme} variant="ghost" onClick={() => loadData(true)} title="Refresh data">
            <Icon.Refresh size={15} /> Refresh
          </RippleButton>

          <RippleButton theme={theme} variant="outline" onClick={handleExportCSV} title="Export CSV">
            <Icon.Export size={15} /> Export
          </RippleButton>

          <RippleButton theme={theme} variant="primary" onClick={openAddModal} title="Add new customer">
            <Icon.Plus size={15} /> Add Customer
          </RippleButton>
        </div>
      </div>

      {/* ---------------- STAT CARDS ---------------- */}
      {loading ? (
        <SkeletonStatCards theme={theme} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard theme={theme} icon={<Icon.Users size={20} />} label="Total Customers" value={stats.total} accent="#3B6EA5" delay={0} />
          <StatCard theme={theme} icon={<Icon.Crown size={20} />} label="VIP Customers" value={stats.vip} accent="#C9A227" delay={60} />
          <StatCard theme={theme} icon={<Icon.Users size={20} />} label="Regular Customers" value={stats.regular} accent="#6B5D4C" delay={120} />
          <StatCard theme={theme} icon={<Icon.Wallet size={20} />} label="Outstanding Amount" value={stats.outstanding} isCurrency accent="#C0392B" delay={180} />
          <StatCard theme={theme} icon={<Icon.Rupee size={20} />} label="Revenue Generated" value={stats.revenue} isCurrency accent="#1E8E5A" delay={240} />
          <StatCard theme={theme} icon={<Icon.UserPlus size={20} />} label="Today's New Customers" value={stats.todayNew} accent="#B8860B" delay={300} />
        </div>
      )}

      {/* ---------------- FILTER BAR ---------------- */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: "16px 20px",
          marginBottom: 20,
          backdropFilter: "blur(14px)",
          animation: "rjSlideUp 0.5s ease both",
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ minWidth: 150 }}>
          <FieldLabel theme={theme}>Search By</FieldLabel>
          <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} style={{ ...inputStyle(theme), cursor: "pointer" }}>
            <option>Name</option>
            <option>Phone</option>
            <option>City</option>
          </select>
        </div>

        <div style={{ minWidth: 160 }}>
          <FieldLabel theme={theme}>Customer Type</FieldLabel>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...inputStyle(theme), cursor: "pointer" }}>
            <option value="All">All Types</option>
            <option value="VIP">VIP</option>
            <option value="Premium">Premium</option>
            <option value="Regular">Regular</option>
          </select>
        </div>

        <div style={{ minWidth: 170 }}>
          <FieldLabel theme={theme}>Outstanding</FieldLabel>
          <select value={filterOutstanding} onChange={(e) => setFilterOutstanding(e.target.value)} style={{ ...inputStyle(theme), cursor: "pointer" }}>
            <option value="All">All</option>
            <option value="With Outstanding">With Outstanding</option>
            <option value="No Outstanding">No Outstanding</option>
          </select>
        </div>

        <div style={{ minWidth: 170 }}>
          <FieldLabel theme={theme}>Sort By</FieldLabel>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...inputStyle(theme), cursor: "pointer" }}>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Highest Purchase</option>
            <option>Alphabetical</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12.5, color: theme.textSoft, paddingBottom: 10 }}>
          Showing <strong style={{ color: theme.text }}>{filteredCustomers.length}</strong> of {customers.length} customers
        </div>
      </div>

      {/* ---------------- CUSTOMER TABLE ---------------- */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          overflow: "hidden",
          backdropFilter: "blur(14px)",
          boxShadow: theme.shadow,
          animation: "rjSlideUp 0.55s ease both",
        }}
      >
        <div className="rj-scrollbar" style={{ overflowX: "auto", maxHeight: 560, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
            <thead>
              <tr
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: theme.surfaceAlt,
                  backdropFilter: "blur(14px)",
                }}
              >
                {[
                  "Profile", "Customer", "Mobile", "Email", "City", "Orders",
                  "Lifetime Purchase", "Outstanding", "Type", "Last Purchase", "Status", "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "13px 12px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: theme.textSoft,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: `1.5px solid ${theme.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows theme={theme} rows={8} />
              ) : pagedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: theme.textFaint }}>
                      <div style={{ color: theme.gold, opacity: 0.6 }}><Icon.Users size={44} /></div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: theme.textSoft }}>No customers found</div>
                      <div style={{ fontSize: 12.5 }}>Try adjusting your search or filters, or add a new customer.</div>
                      <RippleButton theme={theme} variant="primary" onClick={openAddModal} style={{ marginTop: 8 }}>
                        <Icon.Plus size={14} /> Add Customer
                      </RippleButton>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((c, idx) => (
                  <CustomerRow
                    key={c.id}
                    customer={c}
                    theme={theme}
                    delay={idx * 35}
                    onView={() => setViewingCustomer(c)}
                    onEdit={() => openEditModal(c)}
                    onDelete={() => setDeletingCustomer(c)}
                    onHistory={() => setHistoryCustomer(c)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------- PAGINATION ---------------- */}
        {!loading && filteredCustomers.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: `1px solid ${theme.border}`,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12.5, color: theme.textSoft }}>
              Page <strong style={{ color: theme.text }}>{currentPage}</strong> of {totalPages}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <PageButton theme={theme} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <Icon.ChevronLeft size={15} />
              </PageButton>
              {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PageButton key={pageNum} theme={theme} active={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </PageButton>
                );
              })}
              {totalPages > 7 && <span style={{ color: theme.textFaint, padding: "0 4px" }}>…</span>}
              <PageButton theme={theme} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <Icon.ChevronRight size={15} />
              </PageButton>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- ADD / EDIT MODAL ---------------- */}
      {showAddModal && (
        <CustomerFormModal
          theme={theme}
          form={form}
          errors={formErrors}
          updateForm={updateForm}
          onSave={handleSaveCustomer}
          onClose={closeModal}
          isEdit={!!editingCustomer}
        />
      )}

      {/* ---------------- DETAILS DRAWER ---------------- */}
      {viewingCustomer && (
        <CustomerDetailsDrawer
          theme={theme}
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onHistory={() => {
            setHistoryCustomer(viewingCustomer);
          }}
        />
      )}

      {/* ---------------- PURCHASE HISTORY MODAL ---------------- */}
      {historyCustomer && (
        <PurchaseHistoryModal
          theme={theme}
          customer={historyCustomer}
          onClose={() => setHistoryCustomer(null)}
        />
      )}

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
      {deletingCustomer && (
        <DeleteConfirmModal
          theme={theme}
          customer={deletingCustomer}
          onCancel={() => setDeletingCustomer(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ------------------------------ TABLE ROW -------------------------------- */

function CustomerRow({ customer: c, theme, delay, onView, onEdit, onDelete, onHistory }) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? theme.surfaceAlt : "transparent",
        transition: "background 0.2s ease",
        animation: `rjFadeIn 0.4s ease ${delay}ms both`,
      }}
    >
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}` }}>
        <Avatar name={c.name} size={38} theme={theme} />
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, minWidth: 150 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.text }}>{c.name}</div>
        <div style={{ fontSize: 11, color: theme.textFaint }}>{c.id}</div>
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 13, color: theme.textSoft, whiteSpace: "nowrap" }}>
        {c.phone}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.textSoft, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {c.email}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 13, color: theme.textSoft, whiteSpace: "nowrap" }}>
        {c.city}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 13, color: theme.text, fontWeight: 600, textAlign: "center" }}>
        {c.totalOrders}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 13, color: theme.success, fontWeight: 700, whiteSpace: "nowrap" }}>
        {formatINR(c.lifetimePurchase)}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", color: c.outstanding > 0 ? theme.danger : theme.textFaint }}>
        {c.outstanding > 0 ? formatINR(c.outstanding) : "—"}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}` }}>
        <CustomerTypeBadge type={c.customerType} theme={theme} />
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.textSoft, whiteSpace: "nowrap" }}>
        {formatDate(c.lastPurchase)}
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}` }}>
        <StatusBadge status={c.status} theme={theme} />
      </td>
      <td style={{ padding: "12px", borderBottom: `1px solid ${theme.borderSoft}` }}>
        <div style={{ display: "flex", gap: 6 }}>
          <ActionIconButton theme={theme} title="View" onClick={onView} color={theme.info}><Icon.Eye /></ActionIconButton>
          <ActionIconButton theme={theme} title="Edit" onClick={onEdit} color={theme.gold}><Icon.Edit /></ActionIconButton>
          <ActionIconButton theme={theme} title="History" onClick={onHistory} color={theme.textSoft}><Icon.History /></ActionIconButton>
          <ActionIconButton theme={theme} title="Delete" onClick={onDelete} color={theme.danger}><Icon.Trash /></ActionIconButton>
        </div>
      </td>
    </tr>
  );
}

function ActionIconButton({ children, onClick, title, color, theme }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        border: `1px solid ${hover ? color : theme.borderSoft}`,
        background: hover ? `${color}18` : "transparent",
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {children}
    </button>
  );
}

function PageButton({ children, onClick, active, disabled, theme }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32,
        height: 32,
        borderRadius: 9,
        border: `1px solid ${active ? theme.gold : theme.borderSoft}`,
        background: active ? theme.goldGradient : "transparent",
        color: active ? "#2A2118" : theme.textSoft,
        fontWeight: 700,
        fontSize: 12.5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------ MODAL SHELL -------------------------------- */

function ModalOverlay({ children, onClose, theme, maxWidth = 720 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,16,10,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        animation: "rjFadeIn 0.25s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rj-scrollbar"
        style={{
          background: theme.surfaceSolid,
          borderRadius: 22,
          border: `1px solid ${theme.border}`,
          width: "100%",
          maxWidth,
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: theme.shadowLg,
          animation: "rjScaleIn 0.3s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, theme, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 26px",
        borderBottom: `1px solid ${theme.borderSoft}`,
        position: "sticky",
        top: 0,
        background: theme.surfaceSolid,
        zIndex: 1,
        borderRadius: "22px 22px 0 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && (
          <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.goldGradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#2A2118" }}>
            {icon}
          </div>
        )}
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_DISPLAY, color: theme.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12.5, color: theme.textSoft, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          width: 34, height: 34, borderRadius: 10, border: `1px solid ${theme.borderSoft}`,
          background: "transparent", color: theme.textSoft, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.dangerBg; e.currentTarget.style.color = "#C0392B"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textSoft; }}
      >
        <Icon.Close size={16} />
      </button>
    </div>
  );
}

/* ------------------------------ ADD/EDIT MODAL -------------------------------- */

function CustomerFormModal({ theme, form, errors, updateForm, onSave, onClose, isEdit }) {
  return (
    <ModalOverlay onClose={onClose} theme={theme} maxWidth={780}>
      <ModalHeader
        title={isEdit ? "Edit Customer" : "Add New Customer"}
        subtitle={isEdit ? "Update customer information" : "Create a new customer profile"}
        onClose={onClose}
        theme={theme}
        icon={<Icon.UserPlus size={19} />}
      />
      <div style={{ padding: "22px 26px" }}>
        <SectionTitle theme={theme}>Basic Information</SectionTitle>
        <div style={gridStyle(2)}>
          <TextField theme={theme} label="Full Name" required value={form.name} onChange={(v) => updateForm("name", v)} placeholder="e.g. Priya Sharma" error={errors.name} />
          <SelectField theme={theme} label="Gender" value={form.gender} onChange={(v) => updateForm("gender", v)} options={["Female", "Male", "Other"]} />
          <TextField theme={theme} label="Mobile Number" required value={form.phone} onChange={(v) => updateForm("phone", v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" error={errors.phone} />
          <TextField theme={theme} label="Alternate Phone" value={form.altPhone} onChange={(v) => updateForm("altPhone", v.replace(/\D/g, "").slice(0, 10))} placeholder="Optional" />
          <TextField theme={theme} label="Email Address" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="name@example.com" error={errors.email} />
          <TextField theme={theme} label="Occupation" value={form.occupation} onChange={(v) => updateForm("occupation", v)} placeholder="e.g. Homemaker" />
          <TextField theme={theme} label="Birthday" type="date" value={form.birthday} onChange={(v) => updateForm("birthday", v)} />
          <TextField theme={theme} label="Anniversary" type="date" value={form.anniversary} onChange={(v) => updateForm("anniversary", v)} />
          <TextField theme={theme} label="GST Number" value={form.gstNumber} onChange={(v) => updateForm("gstNumber", v.toUpperCase())} placeholder="Optional, for business customers" />
        </div>

        <SectionTitle theme={theme}>Address Details</SectionTitle>
        <div style={gridStyle(2)}>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField theme={theme} label="Address" value={form.address} onChange={(v) => updateForm("address", v)} placeholder="House no., street, locality" />
          </div>
          <TextField theme={theme} label="City" required value={form.city} onChange={(v) => updateForm("city", v)} placeholder="e.g. Hisar" error={errors.city} />
          <SelectField theme={theme} label="State" value={form.state} onChange={(v) => updateForm("state", v)} options={STATES} />
          <TextField theme={theme} label="Pincode" value={form.pincode} onChange={(v) => updateForm("pincode", v.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit pincode" error={errors.pincode} />
        </div>

        <SectionTitle theme={theme}>Business Preferences</SectionTitle>
        <div style={gridStyle(2)}>
          <SelectField theme={theme} label="Customer Type" required value={form.customerType} onChange={(v) => updateForm("customerType", v)} options={["VIP", "Premium", "Regular"]} error={errors.customerType} />
          <TextField theme={theme} label="Credit Limit (₹)" type="number" value={form.creditLimit} onChange={(v) => updateForm("creditLimit", v)} placeholder="10000" />
          <TextField theme={theme} label="Outstanding Balance (₹)" type="number" value={form.outstanding} onChange={(v) => updateForm("outstanding", v)} placeholder="0" />
          <TextField theme={theme} label="Favourite Saree Type" value={form.favouriteSaree} onChange={(v) => updateForm("favouriteSaree", v)} placeholder="e.g. Banarasi Silk" />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextAreaField theme={theme} label="Notes" value={form.notes} onChange={(v) => updateForm("notes", v)} placeholder="Any preferences, special instructions, or reminders" />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 26px",
          borderTop: `1px solid ${theme.borderSoft}`, position: "sticky", bottom: 0, background: theme.surfaceSolid,
          borderRadius: "0 0 22px 22px",
        }}
      >
        <RippleButton theme={theme} variant="ghost" onClick={onClose}>Cancel</RippleButton>
        <RippleButton theme={theme} variant="primary" onClick={onSave}>
          <Icon.Check size={15} /> {isEdit ? "Save Changes" : "Save Customer"}
        </RippleButton>
      </div>
    </ModalOverlay>
  );
}

function SectionTitle({ children, theme }) {
  return (
    <div
      style={{
        fontSize: 12.5, fontWeight: 800, color: theme.goldDeep, textTransform: "uppercase",
        letterSpacing: 0.6, margin: "22px 0 12px", display: "flex", alignItems: "center", gap: 8,
      }}
    >
      <span style={{ width: 16, height: 2, background: theme.gold, display: "inline-block", borderRadius: 2 }} />
      {children}
    </div>
  );
}

function gridStyle(cols) {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 16,
  };
}

/* ------------------------------ DETAILS DRAWER -------------------------------- */

function CustomerDetailsDrawer({ theme, customer: c, onClose, onHistory }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(20,16,10,0.5)", backdropFilter: "blur(3px)",
        zIndex: 1000, display: "flex", justifyContent: "flex-end", animation: "rjFadeIn 0.25s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rj-scrollbar"
        style={{
          width: "min(440px, 92vw)", height: "100%", background: theme.surfaceSolid,
          borderLeft: `1px solid ${theme.border}`, overflowY: "auto", animation: "rjSlideInRight 0.35s cubic-bezier(.22,1,.36,1) both",
          boxShadow: theme.shadowLg,
        }}
      >
        <div style={{ padding: "26px 24px", background: theme.goldGradient, position: "relative" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: 10,
              border: "none", background: "rgba(0,0,0,0.12)", color: "#2A2118", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon.Close size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800,
                color: "#2A2118", border: "3px solid rgba(255,255,255,0.7)", fontFamily: FONT_DISPLAY,
              }}
            >
              {initials(c.name)}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#2A2118", fontFamily: FONT_DISPLAY }}>{c.name}</div>
              <div style={{ marginTop: 6 }}><CustomerTypeBadge type={c.customerType} theme={{ ...theme, goldSoft: "rgba(255,255,255,0.5)" }} /></div>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 24px" }}>
          <DetailRow theme={theme} icon={<Icon.Phone size={14} />} label="Mobile" value={c.phone} />
          {c.altPhone && <DetailRow theme={theme} icon={<Icon.Phone size={14} />} label="Alternate" value={c.altPhone} />}
          <DetailRow theme={theme} icon={<Icon.Mail size={14} />} label="Email" value={c.email || "—"} />
          <DetailRow theme={theme} icon={<Icon.MapPin size={14} />} label="Address" value={`${c.address}, ${c.city}, ${c.state} - ${c.pincode}`} />
          <DetailRow theme={theme} icon={<Icon.Calendar size={14} />} label="Member Since" value={formatDate(c.createdAt)} />
          {c.birthday && <DetailRow theme={theme} icon={<Icon.Gift size={14} />} label="Birthday" value={formatDate(c.birthday)} />}
          {c.anniversary && <DetailRow theme={theme} icon={<Icon.Gift size={14} />} label="Anniversary" value={formatDate(c.anniversary)} />}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "18px 0" }}>
            <MiniStat theme={theme} label="Lifetime Purchase" value={formatINR(c.lifetimePurchase)} color={theme.success} />
            <MiniStat theme={theme} label="Outstanding" value={c.outstanding > 0 ? formatINR(c.outstanding) : "None"} color={c.outstanding > 0 ? theme.danger : theme.textFaint} />
            <MiniStat theme={theme} label="Total Orders" value={c.totalOrders} color={theme.info} />
            <MiniStat theme={theme} label="Credit Limit" value={formatINR(c.creditLimit)} color={theme.goldDeep} />
          </div>

          {c.favouriteSaree && (
            <div style={{ marginBottom: 16, fontSize: 12.5, color: theme.textSoft }}>
              <strong style={{ color: theme.text }}>Favourite Saree:</strong> {c.favouriteSaree}
            </div>
          )}

          <SectionTitle theme={theme}>Recent Orders</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {c.purchaseHistory.slice(0, 4).map((p) => (
              <div
                key={p.invoiceNo}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", borderRadius: 10, background: theme.surfaceAlt, border: `1px solid ${theme.borderSoft}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.text }}>{p.invoiceNo}</div>
                  <div style={{ fontSize: 11, color: theme.textFaint }}>{formatDate(p.date)}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{formatINR(p.amount - p.discount)}</div>
              </div>
            ))}
            {c.purchaseHistory.length === 0 && (
              <div style={{ fontSize: 12.5, color: theme.textFaint, padding: "12px 0" }}>No orders yet.</div>
            )}
          </div>

          {c.purchaseHistory.length > 0 && (
            <RippleButton theme={theme} variant="outline" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={onHistory}>
              <Icon.History size={14} /> View Full Purchase History
            </RippleButton>
          )}

          {c.notes && (
            <>
              <SectionTitle theme={theme}>Notes</SectionTitle>
              <div style={{ fontSize: 12.5, color: theme.textSoft, lineHeight: 1.6, background: theme.surfaceAlt, padding: 12, borderRadius: 10, border: `1px solid ${theme.borderSoft}` }}>
                {c.notes}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, theme }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
      <div style={{ color: theme.gold, marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: theme.textFaint, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: theme.text, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, theme }) {
  return (
    <div style={{ background: theme.surfaceAlt, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 10.5, color: theme.textFaint, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, marginTop: 4, fontFamily: FONT_DISPLAY }}>{value}</div>
    </div>
  );
}

/* ------------------------------ PURCHASE HISTORY MODAL -------------------------------- */

function PurchaseHistoryModal({ theme, customer: c, onClose }) {
  const statusColor = (status) => {
    if (status === "Paid") return { color: theme.success, bg: theme.successBg };
    if (status === "Partial") return { color: theme.warning, bg: theme.warningBg };
    return { color: theme.danger, bg: theme.dangerBg };
  };

  return (
    <ModalOverlay onClose={onClose} theme={theme} maxWidth={880}>
      <ModalHeader
        title="Purchase History"
        subtitle={`${c.name} — ${c.purchaseHistory.length} orders total`}
        onClose={onClose}
        theme={theme}
        icon={<Icon.History size={18} />}
      />
      <div style={{ padding: "18px 26px 26px" }}>
        {c.purchaseHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: theme.textFaint }}>
            <Icon.History size={38} />
            <div style={{ marginTop: 10, fontWeight: 700, color: theme.textSoft }}>No purchase history available</div>
          </div>
        ) : (
          <div className="rj-scrollbar" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr>
                  {["Invoice No.", "Date", "Items", "Amount", "Discount", "GST (5%)", "Payment", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px", fontSize: 11, fontWeight: 700, color: theme.textSoft, textTransform: "uppercase", borderBottom: `1.5px solid ${theme.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.purchaseHistory.map((p, i) => {
                  const sc = statusColor(p.status);
                  return (
                    <tr key={p.invoiceNo} style={{ animation: `rjFadeIn 0.3s ease ${i * 25}ms both` }}>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontWeight: 700, fontSize: 12.5, color: theme.gold }}>{p.invoiceNo}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.textSoft }}>{formatDate(p.date)}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.text, textAlign: "center" }}>{p.items}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.text, fontWeight: 700 }}>{formatINR(p.amount)}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.danger }}>{p.discount > 0 ? "-" + formatINR(p.discount) : "—"}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.textSoft }}>{formatINR(p.gst)}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.textSoft }}>{p.payment}</td>
                      <td style={{ padding: "11px 10px", borderBottom: `1px solid ${theme.borderSoft}` }}>
                        <Badge color={sc.color} bg={sc.bg} theme={theme} small>{p.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

/* ------------------------------ DELETE CONFIRM MODAL -------------------------------- */

function DeleteConfirmModal({ theme, customer: c, onCancel, onConfirm }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, background: "rgba(20,16,10,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20,
        animation: "rjFadeIn 0.2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.surfaceSolid, borderRadius: 20, border: `1px solid ${theme.border}`,
          width: "100%", maxWidth: 400, padding: "30px 28px", textAlign: "center",
          boxShadow: theme.shadowLg, animation: "rjScaleIn 0.3s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        <div
          style={{
            width: 64, height: 64, borderRadius: "50%", background: theme.dangerBg, color: theme.danger,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            animation: "rjPulse 1.6s ease-in-out infinite",
          }}
        >
          <Icon.Alert size={30} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: FONT_DISPLAY }}>Delete Customer?</div>
        <div style={{ fontSize: 13, color: theme.textSoft, marginTop: 8, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: theme.text }}>{c.name}</strong>? This action cannot be undone and all associated data will be permanently removed.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <RippleButton theme={theme} variant="ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onCancel}>Cancel</RippleButton>
          <RippleButton theme={theme} variant="danger" style={{ flex: 1, justifyContent: "center" }} onClick={onConfirm}>
            <Icon.Trash size={14} /> Yes, Delete
          </RippleButton>
        </div>
      </div>
    </div>
  );
}