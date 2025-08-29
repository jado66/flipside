import {
  Zap,
  Target,
  Dumbbell,
  Layers,
  RotateCcw,
  Activity,
  Circle,
} from "lucide-react";

export const iconMap = {
  zap: Zap,
  target: Target,
  dumbbell: Dumbbell,
  layers: Layers,
  "rotate-ccw": RotateCcw,
  activity: Activity,
  bounce: Zap, // Using Zap as fallback for bounce
  circle: Circle,
  // Legacy support for old naming convention
  Zap,
  Target,
  Dumbbell,
  Layers,
};
