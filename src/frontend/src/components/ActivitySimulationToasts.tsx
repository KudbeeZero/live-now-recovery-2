/**
 * ActivitySimulationToasts
 * Mounts the activity simulation hook. Renders nothing visible — sonner
 * toasts are fired from the hook and rendered by the Toaster already in
 * RootLayout.
 */
import { useActivitySimulation } from "../hooks/useActivitySimulation";

export default function ActivitySimulationToasts() {
  useActivitySimulation();
  return null;
}
