"use client";

import { useState } from "react";
import PhotoPasswordGate from "@/components/PhotoPasswordGate";
import PhotoGallery from "@/components/PhotoGallery";

export default function PhotosPage() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PhotoPasswordGate onSuccess={() => setUnlocked(true)} />;
  }

  return <PhotoGallery />;
}
