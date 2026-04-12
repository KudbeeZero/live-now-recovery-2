import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import ActivitySimulationToasts from "./components/ActivitySimulationToasts";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { EmergencyBanner } from "./components/EmergencyBanner";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { SentinelChat } from "./components/SentinelChat";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { CitizensPage } from "./pages/CitizensPage";
import { ContactPage } from "./pages/ContactPage";
import { CookiesPage } from "./pages/CookiesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FAQPage } from "./pages/FAQPage";
import { FounderPage } from "./pages/FounderPage";
import { HelperPage } from "./pages/HelperPage";
import { HomePage } from "./pages/HomePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { IntegrationPage } from "./pages/IntegrationPage";
import { LocationPage } from "./pages/LocationPage";
import { MissionPage } from "./pages/MissionPage";
import { NationalImpactPage } from "./pages/NationalImpactPage";
import { OhioStatsPage } from "./pages/OhioStatsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ProviderPage } from "./pages/ProviderPage";
import { RecoveryAccountPage } from "./pages/RecoveryAccountPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { SignupPage } from "./pages/SignupPage";
import { SitemapPage } from "./pages/SitemapPage";
import { TermsPage } from "./pages/TermsPage";
import { VerifyPage } from "./pages/VerifyPage";
import { VideosPage } from "./pages/VideosPage";

function ScrollToTop() {
  const { location } = useRouterState();
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the only dep needed
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);
  return null;
}

// Root layout
function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <EmergencyBanner />
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster richColors position="top-right" />
      <ActivitySimulationToasts />
      <SentinelChat />
      <CookieConsentBanner />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const providerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/provider/$id",
  component: ProviderPage,
});
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify",
  component: VerifyPage,
});
const helperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helper",
  component: HelperPage,
});
const missionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mission",
  component: MissionPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});
const founderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/founder",
  component: FounderPage,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: BlogPage,
});
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: BlogPostPage,
});
const locationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/location/$town",
  component: LocationPage,
});
const resourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/resources",
  component: ResourcesPage,
});
const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FAQPage,
});
const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/how-it-works",
  component: HowItWorksPage,
});
const ohioStatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ohio-stats",
  component: OhioStatsPage,
});
const integrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/integration",
  component: IntegrationPage,
});
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
});
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});
const cookiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cookies",
  component: CookiesPage,
});
const videosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/videos",
  component: VideosPage,
});

// Direct SEO city routes
const clevelandRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cleveland",
  component: () => <LocationPage townOverride="cleveland" />,
});
const lakewoodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lakewood",
  component: () => <LocationPage townOverride="lakewood" />,
});
const parmaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/parma",
  component: () => <LocationPage townOverride="parma" />,
});
const lorainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lorain",
  component: () => <LocationPage townOverride="lorain" />,
});
const akronRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/akron",
  component: () => <LocationPage townOverride="akron" />,
});
const youngstownRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/youngstown",
  component: () => <LocationPage townOverride="youngstown" />,
});
const cantonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/canton",
  component: () => <LocationPage townOverride="canton" />,
});
const elyriaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/elyria",
  component: () => <LocationPage townOverride="elyria" />,
});
const mentorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mentor",
  component: () => <LocationPage townOverride="mentor" />,
});
const strongsvilleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/strongsville",
  component: () => <LocationPage townOverride="strongsville" />,
});
const euclidRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/euclid",
  component: () => <LocationPage townOverride="euclid" />,
});
const sanduskyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sandusky",
  component: () => <LocationPage townOverride="sandusky" />,
});
const warrenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/warren",
  component: () => <LocationPage townOverride="warren" />,
});
const toledoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/toledo",
  component: () => <LocationPage townOverride="toledo" />,
});
const medinaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/medina",
  component: () => <LocationPage townOverride="medina" />,
});
const sitemapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sitemap",
  component: SitemapPage,
});
const myRecoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-recovery",
  component: RecoveryAccountPage,
});
const citizensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/citizens",
  component: CitizensPage,
});
const nationalImpactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/national-impact",
  component: NationalImpactPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  providerRoute,
  dashboardRoute,
  adminRoute,
  verifyRoute,
  helperRoute,
  missionRoute,
  aboutRoute,
  founderRoute,
  contactRoute,
  registerRoute,
  signupRoute,
  blogRoute,
  blogPostRoute,
  locationRoute,
  resourcesRoute,
  faqRoute,
  howItWorksRoute,
  ohioStatsRoute,
  integrationRoute,
  privacyRoute,
  termsRoute,
  cookiesRoute,
  videosRoute,
  clevelandRoute,
  lakewoodRoute,
  parmaRoute,
  lorainRoute,
  akronRoute,
  youngstownRoute,
  cantonRoute,
  elyriaRoute,
  mentorRoute,
  strongsvilleRoute,
  euclidRoute,
  sanduskyRoute,
  warrenRoute,
  toledoRoute,
  medinaRoute,
  sitemapRoute,
  myRecoveryRoute,
  citizensRoute,
  nationalImpactRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
