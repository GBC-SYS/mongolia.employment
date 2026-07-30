"use client";

import { useState } from "react";
import ClientOnly from "@/components/ClientOnly";
import PhotoPasswordGate from "@/components/PhotoPasswordGate";
import PhotoCarousel from "@/components/PhotoCarousel";

const STORAGE_KEY = "mongol-photos-unlocked";

function readUnlocked() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function PhotosGate() {
  const [manuallyUnlocked, setManuallyUnlocked] = useState(false);

  if (!manuallyUnlocked && !readUnlocked()) {
    return (
      <PhotoPasswordGate
        onSuccess={() => {
          try {
            localStorage.setItem(STORAGE_KEY, "true");
          } catch {}
          setManuallyUnlocked(true);
        }}
      />
    );
  }

  return <PhotoCarousel />;
}

export default function PhotosPage() {
  return (
    <ClientOnly>
      <PhotosGate />
    </ClientOnly>
  );
}
