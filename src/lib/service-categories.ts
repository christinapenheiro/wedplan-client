import type { ComponentType } from "react";
import {
  Camera,
  ClipboardList,
  Flower2,
  Landmark,
  Music,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import type { IServiceCategory } from "@/lib/types";

/** Display label and icon used for each service category. */
export const CATEGORY_META: Record<
  IServiceCategory,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  photography: { label: "Photography & Videography", icon: Camera },
  venue: { label: "Wedding Venues", icon: Landmark },
  floral: { label: "Decoration & Florist", icon: Flower2 },
  catering: { label: "Catering Services", icon: UtensilsCrossed },
  makeup: { label: "Makeup & Styling", icon: Sparkles },
  fashion: { label: "Wedding Fashion", icon: Shirt },
  music: { label: "Music & Entertainment", icon: Music },
  planner: { label: "Wedding Planner", icon: ClipboardList },
};
