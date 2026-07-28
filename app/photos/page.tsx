"use client";

import { useState } from "react";
import PhotoPasswordGate from "@/components/PhotoPasswordGate";
import PhotoCarousel from "@/components/PhotoCarousel";

export default function PhotosPage() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PhotoPasswordGate onSuccess={() => setUnlocked(true)} />;
  }

  return <PhotoCarousel />;
}
