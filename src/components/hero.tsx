"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&q=80)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/25" />

      <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-32 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-5xl tracking-tight text-white sm:text-7xl md:text-8xl"
        >
          Stephen Rudge
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-200 sm:text-xl"
        >
          Travel logs, field notes, and photography by Stephen Rudge.
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button asChild size="lg">
            <Link href="/blog">
              Read the journal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/destinations">Explore destinations</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
