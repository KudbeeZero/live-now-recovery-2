import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { ProviderWithStatus } from "../backend";
import {
  BRIGHTSIDE_LOCATIONS,
  BrightsideAnchor,
} from "../components/BrightsideAnchor";
import { SEO } from "../components/SEO";
import { useAllProviders } from "../hooks/useQueries";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  cleveland: { lat: 41.4993, lng: -81.6944 },
  lakewood: { lat: 41.4819, lng: -81.7982 },
  parma: { lat: 41.3773, lng: -81.729 },
  lorain: { lat: 41.4529, lng: -82.1824 },
  akron: { lat: 41.0814, lng: -81.519 },
  youngstown: { lat: 41.0998, lng: -80.6495 },
  canton: { lat: 40.7989, lng: -81.3784 },
  elyria: { lat: 41.3684, lng: -82.1077 },
  mentor: { lat: 41.6661, lng: -81.3396 },
  strongsville: { lat: 41.3145, lng: -81.8357 },
  euclid: { lat: 41.5931, lng: -81.5268 },
  sandusky: { lat: 41.4487, lng: -82.7079 },
  warren: { lat: 41.2376, lng: -80.8184 },
  toledo: { lat: 41.6639, lng: -83.5552 },
  medina: { lat: 41.1386, lng: -81.8638 },
};

interface CityData {
  name: string;
  county: string;
  population: string;
  odDeathRate: string;
  odDeaths: string;
  trend: string;
  headline: string;
  body: string;
  targetKeywords: string[];
  nearbyResources: string[];
}

const CITY_DATA: Record<string, CityData> = {
  cleveland: {
    name: "Cleveland",
    county: "Cuyahoga",
    population: "372,624",
    odDeathRate: "62.3",
    odDeaths: "600+",
    trend: "23% above Ohio average",
    headline:
      "Cleveland is ground zero for Ohio\u2019s opioid crisis \u2014 and Live Now Recovery is changing that.",
    body: "Cuyahoga County records more than 600 overdose deaths per year, making Cleveland one of the most severely impacted cities in the United States. The majority involve fentanyl, often mixed with xylazine, dramatically compressing the window for naloxone response. Despite the scale of the crisis, Cuyahoga County has more MAT providers per capita than most Ohio counties \u2014 the challenge is connection, not capacity. Live Now Recovery\u2019s real-time map surfaces available providers, Narcan kiosk locations, and harm reduction resources across all 59 Cleveland ZIP codes instantly. When someone searches \u2018MAT clinic Cleveland\u2019 or \u2018Narcan near me 44105\u2019, they reach the platform before they reach a crisis. The Sentinel Prediction Engine flags high-risk weekends \u2014 payday Fridays, cold snaps, festivals \u2014 so providers can prepare. Recovery doesn\u2019t happen in a hospital. It happens in the community, with the right information at the right moment.",
    targetKeywords: [
      "MAT clinic Cleveland",
      "medication-assisted treatment Cleveland Ohio",
      "Narcan kiosk Cleveland",
      "buprenorphine clinic Cleveland",
      "addiction treatment Cuyahoga County",
    ],
    nearbyResources: [
      "Cuyahoga County ADAMHS Board (adamhscc.org)",
      "MetroHealth Addiction Services",
      "Frontline Service Cleveland",
    ],
  },
  akron: {
    name: "Akron",
    county: "Summit",
    population: "190,469",
    odDeathRate: "51.4",
    odDeaths: "280+",
    trend: "12% above Ohio average",
    headline:
      "Akron\u2019s Summit County has been on the front lines of Ohio\u2019s opioid epidemic since 2015.",
    body: "Summit County was one of the first Ohio counties to declare a public health emergency over the opioid crisis, and Akron has remained at the center ever since. The city has pioneered innovative harm reduction approaches, including the Summit County ADAMHS FIRST initiative, which embeds peer support specialists in ERs to create warm handoffs at the moment of crisis. Live Now Recovery extends that model citywide \u2014 every MAT provider, naloxone kiosk, and telehealth option in Summit County is mapped and updated in real time. Searching \u2018buprenorphine clinic Akron\u2019 or \u2018addiction treatment near me Akron\u2019 now surfaces real availability, not outdated directories. The platform\u2019s 7-Attempts model tracks referral persistence \u2014 because Akron\u2019s recovery community already knows that most people need more than one connection before treatment sticks. By digitizing the warm handoff and making it available anonymously at any hour, Live Now Recovery turns the phone in someone\u2019s pocket into a lifeline.",
    targetKeywords: [
      "MAT clinic Akron",
      "buprenorphine Akron Ohio",
      "addiction treatment Summit County",
      "Narcan Akron",
      "medication-assisted treatment Akron",
    ],
    nearbyResources: [
      "Summit County ADAMHS Board",
      "Interval Brotherhood Home Akron",
      "Portage Path Behavioral Health",
    ],
  },
  toledo: {
    name: "Toledo",
    county: "Lucas",
    population: "268,508",
    odDeathRate: "48.2",
    odDeaths: "240+",
    trend: "9% above Ohio average",
    headline:
      "Toledo sits at a critical crossroads \u2014 I-75 corridor drug trafficking meets one of Ohio\u2019s most underserved recovery systems.",
    body: "Lucas County\u2019s overdose death rate has risen sharply over the past three years, driven by fentanyl-laced supply chains moving along the I-75 highway corridor connecting Detroit to Dayton. Toledo\u2019s geographic position makes it a high-pressure zone: high drug availability, high poverty, and historically limited MAT infrastructure outside the Toledo Hospital system. Live Now Recovery maps every available resource in Lucas County \u2014 MAT clinics, telehealth options, naloxone kiosks, and harm reduction supply points \u2014 making the full ecosystem visible for the first time in a single platform. The Census Social Stress Layer identifies Toledo ZIP codes with above-average divorce and separation rates, flagging them for elevated baseline risk in the Sentinel Prediction Engine. When the weather drops below 32\u00b0F and it\u2019s a payday Friday, the system automatically elevates outreach priority for Toledo\u2019s most vulnerable neighborhoods.",
    targetKeywords: [
      "MAT provider Toledo",
      "addiction treatment Toledo Ohio",
      "Narcan Toledo",
      "medication-assisted treatment Lucas County",
      "opioid treatment Toledo",
    ],
    nearbyResources: [
      "Lucas County ADAMHS",
      "Harbor Behavioral Health Toledo",
      "Toledo Recovery Center",
    ],
  },
  youngstown: {
    name: "Youngstown",
    county: "Mahoning",
    population: "60,068",
    odDeathRate: "57.1",
    odDeaths: "190+",
    trend: "18% above Ohio average",
    headline:
      "Youngstown\u2019s economic collapse and the opioid crisis arrived together \u2014 Live Now Recovery is part of the recovery.",
    body: "Mahoning County has one of the highest overdose death rates in northeastern Ohio, compounded by decades of deindustrialization that left Youngstown with high unemployment, social stress, and limited healthcare infrastructure. The city has fewer MAT providers per capita than Cleveland or Columbus, making the search for treatment especially difficult for residents without transportation or insurance. Live Now Recovery\u2019s harm reduction supply layer maps every free naloxone distribution point, clean syringe exchange, and telehealth MAT option in Mahoning County. The platform\u2019s Census Social Stress Layer applies a 1.15x risk multiplier to Youngstown\u2019s highest-stress ZIP codes, surfacing them on the Sentinel heatmap for targeted outreach. Peer support stories from the Citizens Hub give Youngstown residents something no government database can: proof that recovery happens here, in this city, in this community.",
    targetKeywords: [
      "MAT clinic Youngstown",
      "addiction treatment Mahoning County",
      "Narcan Youngstown",
      "buprenorphine Youngstown Ohio",
      "opioid treatment Youngstown",
    ],
    nearbyResources: [
      "Mahoning County ADAMHS",
      "Tod Children\u2019s Hospital Behavioral Health",
      "Meridian HealthCare Youngstown",
    ],
  },
  canton: {
    name: "Canton",
    county: "Stark",
    population: "69,713",
    odDeathRate: "44.8",
    odDeaths: "160+",
    trend: "5% above Ohio average",
    headline:
      "Stark County\u2019s overdose rate has doubled in a decade \u2014 Canton is fighting back with real-time resources.",
    body: "Stark County saw its overdose death rate nearly double between 2016 and 2023, driven by the shift from prescription opioids to illicitly manufactured fentanyl. Canton\u2019s community response has been notable: the Stark County Mental Health and Addiction Recovery board funds one of Ohio\u2019s more robust peer support networks, including mobile crisis teams and recovery housing programs. Live Now Recovery digitizes and amplifies that infrastructure, making every provider, kiosk, and support program findable in real time from a mobile phone. The platform\u2019s payday cycle logic automatically flags elevated risk windows for Stark County\u2019s working-class ZIP codes \u2014 ensuring that peer outreach is concentrated when and where it\u2019s most needed. Searching \u2018addiction treatment Canton Ohio\u2019 or \u2018MAT clinic Stark County\u2019 now returns actionable, live results rather than outdated government directories.",
    targetKeywords: [
      "MAT clinic Canton Ohio",
      "addiction treatment Stark County",
      "Narcan Canton",
      "buprenorphine Canton Ohio",
      "medication-assisted treatment Canton",
    ],
    nearbyResources: [
      "Stark County MHAR Board",
      "Aultman Hospital Addiction Recovery",
      "CHC Community Mental Health",
    ],
  },
  lorain: {
    name: "Lorain",
    county: "Lorain County",
    population: "64,097",
    odDeathRate: "39.6",
    odDeaths: "130+",
    trend: "At Ohio average",
    headline:
      "Lorain County\u2019s lakefront communities face an opioid crisis amplified by isolation and limited treatment access.",
    body: "Lorain County stretches along Lake Erie with a mix of urban Lorain and rural communities \u2014 a geography that creates real access barriers for people seeking MAT treatment. The county has seen consistent overdose death rates above the state average, with fentanyl involvement in over 80% of cases. Live Now Recovery maps every MAT provider in Lorain County with real-time availability, including telehealth options that serve rural and suburban residents who can\u2019t easily reach urban clinics. The Citizens Hub allows Lorain residents to post community reports \u2014 suspected bad batches, Narcan uses, community check-ins \u2014 that feed directly into the Sentinel risk heatmap and alert local providers. Searching \u2018medication-assisted treatment Lorain\u2019 or \u2018Narcan near me Lorain County\u2019 now returns live, accurate results.",
    targetKeywords: [
      "MAT provider Lorain",
      "medication-assisted treatment Lorain Ohio",
      "Narcan Lorain County",
      "addiction treatment Lorain",
      "buprenorphine Lorain Ohio",
    ],
    nearbyResources: [
      "Lorain County ADAMHS",
      "Nord Center Lorain",
      "Firelands Counseling and Recovery Services",
    ],
  },
  elyria: {
    name: "Elyria",
    county: "Lorain County",
    population: "54,533",
    odDeathRate: "41.2",
    odDeaths: "80+",
    trend: "2% above Ohio average",
    headline:
      "Elyria is Lorain County\u2019s largest city and a central access point for recovery resources across the region.",
    body: "As Lorain County\u2019s seat and largest city, Elyria serves as a hub for regional MAT services, court-based recovery programs, and harm reduction infrastructure. The city\u2019s proximity to Cleveland makes it both a source and destination for people seeking treatment across northeastern Ohio. Live Now Recovery surfaces every available resource in Elyria \u2014 from walk-in MAT clinics and naloxone kiosks to telehealth appointments and peer support groups \u2014 in a single real-time map. The platform\u2019s Emergency Bridge feature flags when local ERs have activated 72-hour stabilization protocols, connecting people to bridge prescriptions at the moment of crisis. Searching \u2018addiction treatment Elyria\u2019 or \u2018MAT clinic near me Elyria Ohio\u2019 now leads directly to live provider availability.",
    targetKeywords: [
      "addiction treatment Elyria",
      "MAT clinic Elyria Ohio",
      "Narcan Elyria",
      "buprenorphine Elyria",
      "recovery resources Elyria Ohio",
    ],
    nearbyResources: [
      "Nord Center Elyria",
      "EMH Regional Medical Center",
      "Lorain County ADAMHS",
    ],
  },
  lakewood: {
    name: "Lakewood",
    county: "Cuyahoga",
    population: "50,965",
    odDeathRate: "38.4",
    odDeaths: "60+",
    trend: "At Ohio average",
    headline:
      "Lakewood\u2019s dense urban community borders Cleveland and shares its crisis \u2014 with more recovery infrastructure than most.",
    body: "Lakewood is one of Ohio\u2019s densest cities and sits directly on Cleveland\u2019s western edge, making it a high-demand zone for MAT services that are technically located in neighboring jurisdictions. The city has a relatively active harm reduction community, with several mutual aid organizations and recovery-friendly businesses \u2014 but those resources have historically been invisible outside of local networks. Live Now Recovery maps Lakewood\u2019s recovery ecosystem alongside Cleveland\u2019s, making the combined set of Cuyahoga County resources navigable from a single platform. The Citizen Hub\u2019s community reporting layer is particularly active in Lakewood, where residents post real-time check-ins, Narcan use reports, and resource finds that keep the risk overlay current. Searching \u2018recovery resources Lakewood Ohio\u2019 or \u2018MAT provider near Lakewood\u2019 now returns an accurate, live picture.",
    targetKeywords: [
      "recovery resources Lakewood Ohio",
      "MAT provider Lakewood",
      "Narcan Lakewood",
      "addiction treatment Lakewood Ohio",
      "buprenorphine Lakewood",
    ],
    nearbyResources: [
      "Cuyahoga County ADAMHS",
      "Lakewood Hospital Care Network",
      "Frontline Service West Side",
    ],
  },
  parma: {
    name: "Parma",
    county: "Cuyahoga",
    population: "79,688",
    odDeathRate: "36.1",
    odDeaths: "55+",
    trend: "3% below Ohio average",
    headline:
      "Parma\u2019s suburban communities often miss recovery resources that are concentrated in Cleveland \u2014 Live Now Recovery closes that gap.",
    body: "Parma is one of Ohio\u2019s largest suburbs and one of Cuyahoga County\u2019s most populous cities, yet its residents often face significant distance barriers to MAT providers concentrated in Cleveland\u2019s urban core. The perception that the opioid crisis is an urban problem has left suburban communities like Parma with fewer local resources and less visible harm reduction infrastructure. Live Now Recovery maps every provider accessible to Parma residents, including telehealth MAT options that eliminate the geographic barrier entirely. The platform\u2019s real-time availability filter shows which providers are accepting new patients today \u2014 a critical feature for suburban residents who work full-time and cannot afford to make multiple calls before finding open capacity. Searching \u2018buprenorphine clinic Parma Ohio\u2019 or \u2018addiction treatment near Parma\u2019 now surfaces real options.",
    targetKeywords: [
      "buprenorphine clinic Parma Ohio",
      "addiction treatment Parma",
      "MAT provider Parma Ohio",
      "Narcan Parma",
      "recovery resources Parma",
    ],
    nearbyResources: [
      "Cuyahoga County ADAMHS",
      "Southwest Community Health Center",
      "MetroHealth Parma",
    ],
  },
  mentor: {
    name: "Mentor",
    county: "Lake County",
    population: "47,321",
    odDeathRate: "33.7",
    odDeaths: "45+",
    trend: "6% below Ohio average",
    headline:
      "Lake County\u2019s suburban communities need the same real-time recovery access as Ohio\u2019s urban centers.",
    body: "Mentor is Lake County\u2019s largest city and a gateway to a county that has seen consistent above-average overdose rates despite its affluent reputation. The Lake County ADAMHS board operates several effective programs, but awareness and navigation barriers remain the primary obstacle to treatment access. People in crisis in Mentor often don\u2019t know what\u2019s available, where to go, or whether providers are accepting new patients. Live Now Recovery closes that gap \u2014 every MAT clinic, telehealth provider, Narcan kiosk, and harm reduction resource in Lake County is mapped with live status. The platform\u2019s optional recovery account lets Lake County residents track resources they\u2019ve used and come back to the platform as a long-term recovery tool, not just a crisis resource.",
    targetKeywords: [
      "MAT clinic Mentor Ohio",
      "addiction treatment Lake County",
      "Narcan Mentor",
      "medication-assisted treatment Mentor",
      "recovery resources Lake County Ohio",
    ],
    nearbyResources: [
      "Lake County ADAMHS",
      "Lake Health Behavioral Health",
      "LifeCare Alliance Lake County",
    ],
  },
  strongsville: {
    name: "Strongsville",
    county: "Cuyahoga",
    population: "45,820",
    odDeathRate: "29.8",
    odDeaths: "35+",
    trend: "10% below Ohio average",
    headline:
      "Strongsville\u2019s affluent identity masks real recovery needs that Live Now Recovery makes visible.",
    body: "Strongsville is one of Cuyahoga County\u2019s wealthiest suburbs, but overdose death rates don\u2019t respect income brackets. The stigma around seeking treatment is often higher in affluent communities \u2014 which means people wait longer, hide more, and reach crisis points that could have been prevented with earlier intervention. Live Now Recovery operates anonymously by design: no account required, no PHI stored, no record of searches. A resident of Strongsville can find the nearest MAT provider or Narcan kiosk on their phone in under 60 seconds without any identifying information changing hands. Telehealth MAT options are particularly valuable in communities like Strongsville, where privacy concerns are a major barrier to in-person clinic visits. The platform treats every Ohio ZIP code with the same urgency \u2014 suburban or urban, high-income or low.",
    targetKeywords: [
      "addiction treatment Strongsville Ohio",
      "MAT provider Strongsville",
      "Narcan Strongsville",
      "buprenorphine Strongsville",
      "recovery resources southwest Cuyahoga County",
    ],
    nearbyResources: [
      "Southwest General Health Center",
      "Cuyahoga County ADAMHS",
      "Bridgeway Addiction Treatment",
    ],
  },
  euclid: {
    name: "Euclid",
    county: "Cuyahoga",
    population: "48,920",
    odDeathRate: "44.1",
    odDeaths: "55+",
    trend: "4% above Ohio average",
    headline:
      "Euclid\u2019s east Cuyahoga location puts it at the intersection of Cleveland\u2019s crisis and limited suburban recovery infrastructure.",
    body: "Euclid sits on Cleveland\u2019s eastern edge in a corridor that has seen disproportionate overdose burden relative to its population size. The city combines urban density with suburban resource gaps \u2014 close enough to Cleveland\u2019s MAT infrastructure to be overlooked in funding allocations, far enough that transportation is a real barrier for residents without vehicles. Live Now Recovery maps Euclid alongside Cleveland\u2019s full eastern corridor, making every nearby MAT provider, naloxone kiosk, and harm reduction resource visible from a single search. The Sentinel Prediction Engine\u2019s weather and payday multipliers are particularly relevant for Euclid\u2019s working-class ZIP codes, where risk spikes on cold Friday evenings are predictable and preventable. Searching \u2018MAT clinic Euclid Ohio\u2019 or \u2018addiction treatment east Cleveland suburbs\u2019 now returns live provider availability.",
    targetKeywords: [
      "MAT clinic Euclid Ohio",
      "addiction treatment east Cuyahoga",
      "Narcan Euclid",
      "buprenorphine Euclid Ohio",
      "recovery resources Euclid",
    ],
    nearbyResources: [
      "Cuyahoga County ADAMHS East",
      "University Hospitals East Medical Center",
      "Stella Maris Cleveland",
    ],
  },
  sandusky: {
    name: "Sandusky",
    county: "Erie County",
    population: "25,400",
    odDeathRate: "52.6",
    odDeaths: "70+",
    trend: "13% above Ohio average",
    headline:
      "Sandusky\u2019s Erie County has one of northwest Ohio\u2019s highest overdose death rates \u2014 and among its fewest treatment options.",
    body: "Erie County and Sandusky represent one of Ohio\u2019s more acute access gaps: a county with overdose death rates well above the state average but with limited local MAT infrastructure. Many Erie County residents drive 45+ minutes to Cleveland, Toledo, or Lorain for MAT appointments \u2014 a barrier that causes treatment abandonment at critical moments. Live Now Recovery maps every accessible provider for Sandusky and Erie County residents, including telehealth MAT options that eliminate the driving barrier entirely. The platform\u2019s harm reduction supply layer shows the nearest naloxone kiosks and fentanyl test strip distribution points in northwest Ohio. Searching \u2018addiction treatment Sandusky Ohio\u2019 or \u2018MAT clinic Erie County\u2019 now returns real options, not dead ends.",
    targetKeywords: [
      "addiction treatment Sandusky Ohio",
      "MAT clinic Erie County",
      "Narcan Sandusky",
      "medication-assisted treatment Sandusky",
      "recovery resources Sandusky Ohio",
    ],
    nearbyResources: [
      "Erie County ADAMHS",
      "Firelands Regional Medical Center",
      "Harbor Behavioral Health Sandusky",
    ],
  },
  warren: {
    name: "Warren",
    county: "Trumbull",
    population: "38,480",
    odDeathRate: "55.3",
    odDeaths: "120+",
    trend: "16% above Ohio average",
    headline:
      "Trumbull County\u2019s Warren is a northeastern Ohio epicenter \u2014 economic collapse and opioids arrived together.",
    body: "Trumbull County has one of the highest overdose death rates in northeastern Ohio, and Warren sits at its center. Like Youngstown to the south, Warren\u2019s economic trajectory over the past three decades \u2014 plant closures, population loss, concentrated poverty \u2014 tracks almost perfectly with rising overdose rates. The research is clear: economic despair and substance use disorder are linked. The WARN Act economic shock data built into the Sentinel Prediction Engine flags Warren\u2019s ZIP codes when new layoff filings appear, elevating outreach priority 30 days before the economic shock fully hits. Live Now Recovery maps every MAT provider and harm reduction resource accessible to Warren residents, including mobile and telehealth options for people without transportation.",
    targetKeywords: [
      "MAT clinic Warren Ohio",
      "addiction treatment Trumbull County",
      "Narcan Warren Ohio",
      "buprenorphine Warren",
      "recovery resources Warren Ohio",
    ],
    nearbyResources: [
      "Trumbull County ADAMHS",
      "Meridian HealthCare Trumbull",
      "Kent State University Behavioral Health Warren",
    ],
  },
  medina: {
    name: "Medina",
    county: "Medina County",
    population: "29,247",
    odDeathRate: "31.2",
    odDeaths: "55+",
    trend: "8% below Ohio average",
    headline:
      "Medina County\u2019s rural character and suburban sprawl create recovery access barriers that technology can close.",
    body: "Medina County sits between Cleveland and Akron \u2014 close enough to major city resources in theory, far enough in practice that transportation barriers cause real treatment abandonment. The county\u2019s overdose death rate, while lower than Cuyahoga or Summit, has trended upward over the past five years as fentanyl supply chains penetrate rural and suburban communities. Live Now Recovery maps every MAT provider accessible to Medina County residents, with particular emphasis on telehealth options that eliminate the distance barrier. The platform\u2019s optional recovery account is especially useful for Medina residents managing long-term recovery: saving favorite providers, tracking resources used, and connecting with peer support stories from others in similar communities. Searching \u2018MAT clinic Medina County\u2019 or \u2018addiction treatment Medina Ohio\u2019 now returns actionable, live results.",
    targetKeywords: [
      "MAT clinic Medina County",
      "addiction treatment Medina Ohio",
      "Narcan Medina",
      "buprenorphine Medina Ohio",
      "recovery resources Medina County",
    ],
    nearbyResources: [
      "Medina County ADAMHS",
      "Medina Hospital Behavioral Health",
      "Coleman Professional Services Medina",
    ],
  },
};

type ProviderWithDist = ProviderWithStatus & { distMi: number };

function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  MAT: {
    label: "MAT Clinic",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.30)",
  },
  Narcan: {
    label: "Narcan Distribution",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.30)",
  },
  ER: {
    label: "Emergency Room",
    color: "#f87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.30)",
  },
  "Naloxone Kiosk": {
    label: "Naloxone Kiosk",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.10)",
    border: "rgba(192,132,252,0.30)",
  },
  "Telehealth MAT": {
    label: "Telehealth MAT",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.10)",
    border: "rgba(129,140,248,0.30)",
  },
};

function typeCfg(raw: string) {
  if (TYPE_CONFIG[raw]) return TYPE_CONFIG[raw];
  if (/^mat/i.test(raw)) return TYPE_CONFIG.MAT;
  if (/narcan|naloxone kiosk/i.test(raw)) return TYPE_CONFIG["Naloxone Kiosk"];
  if (/narcan/i.test(raw)) return TYPE_CONFIG.Narcan;
  if (/telehealth/i.test(raw)) return TYPE_CONFIG["Telehealth MAT"];
  if (/er$|emergency/i.test(raw)) return TYPE_CONFIG.ER;
  return {
    label: raw || "Provider",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.30)",
  };
}

export function LocationPage({ townOverride }: { townOverride?: string }) {
  const params = useParams({ strict: false }) as { town?: string };
  const town = (townOverride ?? params.town ?? "").toLowerCase();
  const cityName = capitalize(town);
  const hasBrightside = BRIGHTSIDE_LOCATIONS.some(
    (l) => l.name.toLowerCase() === town,
  );
  const cityCoords = CITY_COORDS[town];
  const cityInfo = CITY_DATA[town];
  const { data: allProviders = [], isLoading } = useAllProviders();

  const nearbyProviders: ProviderWithDist[] = cityCoords
    ? (allProviders as ProviderWithStatus[])
        .map(
          (p): ProviderWithDist => ({
            ...p,
            distMi: distanceMiles(cityCoords.lat, cityCoords.lng, p.lat, p.lng),
          }),
        )
        .sort((a, b) => a.distMi - b.distMi)
        .slice(0, 12)
    : [];

  const seoKeywords = cityInfo
    ? cityInfo.targetKeywords.join(", ")
    : `MAT providers ${cityName}, addiction treatment ${cityName} Ohio, Narcan ${cityName}`;

  return (
    <main className="min-h-screen py-10 px-4" data-ocid="location.page">
      <SEO
        title={`MAT Providers in ${cityName}, Ohio | Live Now Recovery`}
        description={`Find medication-assisted treatment (MAT) providers, Narcan kiosks, and harm reduction resources in ${cityName}, Ohio. Real-time availability, anonymous, and privacy-first.`}
        keywords={seoKeywords}
        canonical={`/location/${town}`}
      />

      <div className="max-w-5xl mx-auto">
        {cityInfo ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {cityInfo.county} County, Ohio
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 leading-tight">
              {cityInfo.headline}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                {
                  label: "Population",
                  value: cityInfo.population,
                  icon: Users,
                },
                {
                  label: "OD Death Rate",
                  value: `${cityInfo.odDeathRate}/100k`,
                  icon: AlertCircle,
                },
                {
                  label: "Annual OD Deaths",
                  value: cityInfo.odDeaths,
                  icon: AlertCircle,
                },
                {
                  label: "vs Ohio Average",
                  value: cityInfo.trend,
                  icon: Building2,
                },
              ].map(({ label, value, icon: Icon }) => (
                <motion.div
                  key={label}
                  className="rounded-xl p-3 flex flex-col gap-1"
                  style={{
                    background: "oklch(0.15 0.030 240)",
                    border: "1px solid oklch(0.24 0.040 225 / 0.5)",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                >
                  <Icon className="w-3.5 h-3.5 text-primary mb-0.5" />
                  <p className="text-lg font-extrabold text-foreground leading-none">
                    {value}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="text-base text-foreground/75 leading-relaxed max-w-3xl">
              {cityInfo.body}
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              MAT Providers in {cityName}, Ohio
            </h1>
            <p className="text-muted-foreground">
              Real-time availability for medication-assisted treatment in{" "}
              {cityName}. Region 13 coverage.
            </p>
          </div>
        )}

        <div
          className="mb-8 p-4 rounded-xl bg-crisis-banner/10 border border-crisis-banner/20 flex items-start gap-3"
          data-ocid="location.panel"
        >
          <AlertCircle className="w-5 h-5 text-crisis-banner shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-crisis-banner text-sm">
              Need help right now?
            </p>
            <p className="text-sm text-foreground/80">
              Call Ohio MAR NOW:{" "}
              <a
                href="tel:833-234-6343"
                className="font-bold text-crisis-banner hover:underline"
              >
                833-234-6343
              </a>{" "}
              \u2014 24/7 crisis support
            </p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Find Providers in {cityName}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card animate-pulse"
                  style={{ height: "140px" }}
                />
              ))}
            </div>
          ) : nearbyProviders.length === 0 ? (
            <div
              className="rounded-2xl border border-border bg-card p-8 text-center"
              data-ocid="location.empty_state"
            >
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">
                No providers listed in this area yet.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Call Ohio MAR NOW at{" "}
                <a
                  href="tel:833-234-6343"
                  className="text-crisis-banner hover:underline font-bold"
                >
                  833-234-6343
                </a>{" "}
                for immediate assistance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyProviders.map((p, idx) => {
                const cfg = typeCfg(
                  (p as { providerType?: string }).providerType ?? "",
                );
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border bg-card p-5 flex flex-col gap-3 transition-shadow hover:shadow-glow"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    data-ocid={`location.item.${idx + 1}`}
                  >
                    <span
                      className="self-start text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        color: cfg.color,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <p className="font-bold text-foreground text-base leading-snug">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {p.distMi < 0.1
                        ? "In city center"
                        : `${p.distMi.toFixed(1)} mi from ${cityName}`}
                    </p>
                    <Link
                      to="/provider/$id"
                      params={{ id: p.id }}
                      className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                      style={{
                        background: "rgba(45,156,219,0.15)",
                        border: "1px solid rgba(45,156,219,0.35)",
                        color: "#2D9CDB",
                      }}
                      data-ocid={`location.view_button.${idx + 1}`}
                    >
                      View Provider
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {hasBrightside && (
          <div className="mb-10">
            <BrightsideAnchor filterCity={cityName} />
          </div>
        )}

        {cityInfo && (
          <div
            className="mb-8 rounded-2xl p-6"
            style={{
              background: "oklch(0.14 0.028 240)",
              border: "1px solid oklch(0.24 0.038 225 / 0.5)",
            }}
          >
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Nearby Resources \u2014 {cityName}
            </h2>
            <ul className="space-y-2">
              {cityInfo.nearbyResources.map((res) => (
                <li
                  key={res}
                  className="flex items-center gap-2 text-sm text-foreground/80"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                  {res}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-card border border-border p-6 mb-8">
          <h2 className="font-bold text-foreground mb-4">
            Local Crisis Resources \u2014 {cityName}
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-crisis-banner" />
              <span>
                <strong>Ohio MAR NOW:</strong>{" "}
                <a
                  href="tel:833-234-6343"
                  className="text-crisis-banner hover:underline font-bold"
                >
                  833-234-6343
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-action-blue" />
              <span>
                <strong>SAMHSA Helpline:</strong>{" "}
                <a
                  href="tel:1-800-662-4357"
                  className="text-action-blue hover:underline"
                >
                  1-800-662-HELP (4357)
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>988 Suicide &amp; Crisis Lifeline:</strong>{" "}
                <a href="tel:988" className="text-action-blue hover:underline">
                  988
                </a>
              </span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "oklch(0.68 0.18 196 / 0.15)",
              border: "1px solid oklch(0.68 0.18 196 / 0.40)",
              color: "oklch(0.82 0.14 196)",
            }}
            data-ocid="location.find_help_cta"
          >
            <MapPin className="w-4 h-4" />
            Find Help in {cityName} Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
