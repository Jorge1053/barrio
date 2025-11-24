"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, MapPin, Users, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-b-text">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        {/* Navbar simple */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-b-accent-soft border border-b-accent/40 flex items-center justify-center">
              <span className="font-bold text-b-accent text-lg">B</span>
            </div>
            <span className="font-semibold tracking-tight">Barrio</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary">Unirme a mi barrio</Button>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-[1.25fr,1fr] gap-10 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-5xl font-semibold tracking-tight mb-4"
            >
              La red social <span className="text-b-accent">hiperlocal</span>{" "}
              donde tu barrio cobra vida.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-b-muted max-w-xl mb-6"
            >
              Organiza tu cuadra, potencia los negocios del sector y comparte lo
              que pasa a pocas cuadras de tu casa. Sin ruido, sin influencers,
              solo tu comunidad real.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <Link href="/auth/register">
                <Button size="lg">Crear mi cuenta</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="lg">
                  Ya tengo cuenta
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <Feature
                icon={MapPin}
                title="Hiperlocal"
                desc="Un feed por barrio, no por algoritmo global."
              />
              <Feature
                icon={ShieldCheck}
                title="Seguro"
                desc="Alertas vecinales y reportes en tiempo real."
              />
              <Feature
                icon={Users}
                title="Comunidad"
                desc="Proyectos colectivos, ayudas y favores."
              />
            </div>
          </div>

          {/* Card mockup */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="bg-b-card/60 border border-b-border rounded-3xl p-5 shadow-soft backdrop-blur-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-2xl bg-b-accent-soft flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-b-accent" />
                </div>
                <div>
                  <p className="text-xs text-b-muted uppercase tracking-wide">
                    Tu barrio
                  </p>
                  <p className="text-sm font-semibold">Chapinero Alto</p>
                </div>
              </div>
              <span className="text-xs text-b-muted">
                32 vecinos conectados
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <MockPost
                name="Laura"
                text="Perro perdido cerca del parque principal, mestizo café, lleva pañuelo azul. ¿Alguien lo ha visto?"
              />
              <MockPost
                name="Panadería El Trigal"
                text="Promo de croissants 2x1 hoy hasta las 7pm solo para vecinos registrados en Barrio 🥐"
              />
              <MockPost
                name="Comunidad"
                icon={Bell}
                text="Reunión vecinal el sábado 4pm para hablar de iluminación y cámaras de seguridad."
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="bg-b-card/40 border border-b-border rounded-2xl p-3 flex gap-3">
      <div className="mt-1">
        <Icon className="w-4 h-4 text-b-accent" />
      </div>
      <div>
        <p className="font-medium text-sm mb-1">{title}</p>
        <p className="text-xs text-b-muted leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function MockPost({ name, text, icon: Icon }) {
  return (
    <div className="bg-b-card/80 border border-b-border rounded-2xl p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-b-accent-soft flex items-center justify-center text-[10px] font-semibold">
            {name[0]}
          </div>
          <p className="text-xs font-medium">{name}</p>
        </div>
        <span className="text-[10px] text-b-muted">hace 5 min</span>
      </div>
      <div className="flex gap-2 text-[11px] text-slate-200">
        {Icon && <Icon className="w-3.5 h-3.5 mt-0.5 text-b-accent" />}
        <p>{text}</p>
      </div>
    </div>
  );
}
