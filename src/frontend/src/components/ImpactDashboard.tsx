import { Skeleton } from "@/components/ui/skeleton";
import { Award, TrendingUp, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGlobalImpactStats } from "../hooks/useCredentials";

// Animated number counter hook
function useCountUp(target: number, duration = 2000, enabled = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const startValueRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: startValueRef intentionally captures count at animation start
  useEffect(() => {
    if (!enabled || target === 0) return;
    cancelAnimationFrame(frameRef.current);
    startRef.current = 0;
    startValueRef.current = count;

    function step(timestamp: number) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - (1 - progress) ** 3;
      setCount(
        Math.floor(
          startValueRef.current + (target - startValueRef.current) * eased,
        ),
      );
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return count;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  colorClass,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtext: string;
  colorClass: string;
  isLoading: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const displayed = useCountUp(value, 2000, visible && !isLoading);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
    >
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}/15`}
      >
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-24 mb-2" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : (
        <>
          <span className={`text-4xl font-black tracking-tight ${colorClass}`}>
            {displayed.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-foreground mt-1">
            {label}
          </span>
          <span className="text-xs text-muted-foreground mt-1">{subtext}</span>
        </>
      )}
    </div>
  );
}

export function ImpactDashboard() {
  const { data: stats, isLoading } = useGlobalImpactStats();

  const totalBadges = Number(stats?.totalBadgesMinted ?? 0);
  const contributors = Number(stats?.activeContributors ?? 0);
  const impactScore = Number(stats?.totalImpactScore ?? 0);

  return (
    <section data-ocid="impact_dashboard.section" className="w-full py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
          <Zap className="h-3 w-3" />
          Live on ICP Blockchain
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          Real Change, Live
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Every credential minted is a permanent, verifiable proof of impact on
          the Internet Computer. Watch the movement grow in real time.
        </p>
      </div>

      {/* Stat cards */}
      <div
        data-ocid="impact_dashboard.stats"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
      >
        <StatCard
          icon={Award}
          label="Badges Minted"
          value={totalBadges}
          subtext="Soul-bound on ICP forever"
          colorClass="text-emerald-400"
          isLoading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Active Contributors"
          value={contributors}
          subtext="Counselors, providers & community"
          colorClass="text-blue-400"
          isLoading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Impact Score"
          value={impactScore}
          subtext="Weighted by credential type"
          colorClass="text-purple-400"
          isLoading={isLoading}
        />
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <a
          data-ocid="impact_dashboard.leaderboard_link"
          href="/leaderboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Award className="h-4 w-4" />
          View the Leaderboard
        </a>
        <p className="text-xs text-muted-foreground mt-3">
          See who's building the movement — pseudonymous, transparent, on-chain.
        </p>
      </div>
    </section>
  );
}
