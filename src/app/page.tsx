"use client";

import { useState } from "react";
import { Preloader } from "@/components/preloader";
import { LightboxProvider } from "@/components/lightbox";
import { Hero } from "@/components/sections/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { Numbers } from "@/components/sections/numbers";
import { Journey } from "@/components/sections/journey";
import { Chapters } from "@/components/sections/chapters";
import { Gallery } from "@/components/sections/gallery";
import { Ledger } from "@/components/sections/ledger";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <LightboxProvider>
      <Preloader onDone={() => setReady(true)} />
      <main className="relative">
        <Hero ready={ready} />
        <Manifesto />
        <Numbers />
        <Journey />
        <Chapters />
        <Gallery />
        <Ledger />
        <Footer />
      </main>
    </LightboxProvider>
  );
}
