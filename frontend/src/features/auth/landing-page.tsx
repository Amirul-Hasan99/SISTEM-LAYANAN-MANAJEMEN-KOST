"use client";

import { motion, Variants } from "framer-motion";
import { useTheme } from "next-themes";
import {
  DoorOpen,
  CreditCard,
  MessageSquareWarning,
  Bell,
  Moon,
  Sun,
  Building2,
  Users,
  Clock,
  Headphones,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const features = [
  {
    icon: DoorOpen,
    title: "Manajemen Kamar",
    description:
      "Atur kamar, pantau ketersediaan, dan kelola hunian dengan antarmuka yang intuitif.",
  },
  {
    icon: CreditCard,
    title: "Pelacakan Pembayaran",
    description:
      "Otomatisasi penagihan sewa, kirim pengingat, dan simpan catatan keuangan di satu tempat.",
  },
  {
    icon: MessageSquareWarning,
    title: "Sistem Pengaduan",
    description:
      "Beri kemudahan penyewa untuk mengirim keluhan. Selesaikan masalah lebih cepat dengan alur yang terstruktur.",
  },
  {
    icon: Bell,
    title: "Notifikasi Real-time",
    description:
      "Tetap terinformasi dengan peringatan instan untuk pembayaran, pengumuman, dan pembaruan sistem.",
  },
];

const stats = [
  { value: "50+", label: "Kamar Dikelola" },
  { value: "40+", label: "Penyewa Aktif" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Dukungan" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg"
      aria-label="Toggle theme"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}

export function LandingPage() {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-emerald-600" />
            <span className="text-base font-bold tracking-tight">
              Kost<span className="text-emerald-600"> Pak Mun Cepoko</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setCurrentPage("login")}
            >
              Masuk
            </Button>
            <Button
              size="sm"
              className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setCurrentPage("register")}
            >
              Mulai Sekarang
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <motion.main
        className="flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Manajemen kost jadi lebih mudah
            </span>
          </motion.div>

          <motion.h1
            className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            Sistem Manajemen Kost
            <br />
            <span className="text-emerald-600">Pintar</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            variants={itemVariants}
          >
            Kelola operasional kost Anda dengan mudah, mulai dari pembayaran otomatis, pelacakan kamar, hingga komunikasi penyewa — semua dalam satu dashboard modern.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            variants={itemVariants}
          >
            <Button
              size="lg"
              className="w-full rounded-lg bg-emerald-600 px-8 text-white hover:bg-emerald-700 sm:w-auto"
              onClick={() => setCurrentPage("login")}
            >
              Mulai Sekarang
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-lg px-8 sm:w-auto"
              onClick={() => setCurrentPage("login")}
            >
              Masuk
            </Button>
          </motion.div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Semua yang Anda butuhkan untuk mengelola kost
            </h2>
            <p className="mt-2 text-muted-foreground">
              Dibuat untuk pemilik properti yang menginginkan kemudahan dan kontrol penuh.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Preview Kamar ── */}
        <section className="border-t bg-muted/20 py-20">
          <motion.div
            className="mx-auto max-w-6xl px-4 sm:px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Preview Kamar Kost</h2>
              <p className="mt-2 text-muted-foreground">Kenyamanan adalah prioritas kami di Kost Pak Mun Cepoko.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} variants={itemVariants} className="overflow-hidden rounded-2xl shadow-sm border bg-card">
                  <img
                    src={`/images/kamar${i}.jpg`}
                    alt={`Preview Kamar ${i}`}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop";
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">Tipe Kamar {i === 1 ? "Standard" : i === 2 ? "Deluxe" : "Suite"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Fasilitas lengkap, nyaman, dan siap huni.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Lokasi Maps ── */}
        <section className="border-t py-20">
          <motion.div
            className="mx-auto max-w-6xl px-4 sm:px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center justify-center gap-2">
                <MapPin className="size-6 text-emerald-600" />
                Lokasi Kost Pak Mun Cepoko
              </h2>
              <p className="mt-2 text-muted-foreground">Jl. Cepoko RT 3 RW 3, Gunungpati, Semarang</p>
            </div>
            <motion.div variants={itemVariants} className="rounded-2xl overflow-hidden shadow-sm border h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15839.803024546875!2d110.3601!3d-7.0707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7089b099b3b8ad%3A0x7d6f5f3e9b104b90!2sCepoko%2C%20Kec.%20Gn.%20Pati%2C%20Kota%20Semarang%2C%20Jawa%20Tengah!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Stats ── */}
        <section className="border-y bg-emerald-950 text-white">
          <motion.div
            className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:px-6 py-14 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-emerald-800"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div className="flex items-center gap-2 text-2xl font-bold sm:text-3xl text-emerald-400">
                  {i === 0 && <DoorOpen className="size-5" />}
                  {i === 1 && <Users className="size-5" />}
                  {i === 2 && <Clock className="size-5" />}
                  {i === 3 && <Headphones className="size-5" />}
                  <span>{s.value}</span>
                </div>
                <span className="text-xs text-emerald-200 sm:text-sm">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Siap untuk merasakan kenyamanan maksimal?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Bergabunglah dengan para penyewa yang sudah menikmati fasilitas Kost Pak Mun Cepoko.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                size="lg"
                className="rounded-lg bg-emerald-600 px-8 text-white hover:bg-emerald-700"
                onClick={() => setCurrentPage("register")}
              >
                Buat Akun Gratis
              </Button>
            </div>
          </motion.div>
        </section>
      </motion.main>

      {/* ── Footer ── */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-muted-foreground">
          &copy; 2025 Kost Pak Mun Cepoko. Hak cipta dilindungi.
        </div>
      </footer>
    </div>
  );
}