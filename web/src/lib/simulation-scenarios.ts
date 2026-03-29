/**
 * Scénarios de simulation pour le Mode Tuto / Simulation.
 * Les alertes fictives sont injectées côté client uniquement (jamais en BDD).
 *
 * TUTORIAL_SCENARIOS : 5 scénarios couvrant DEFCON 5→1, ordonnés pour le tutoriel guidé.
 * ADVANCED_SCENARIOS : 6 scénarios de crise réalistes pour exploration libre.
 */

export interface SimulatedAlert {
  id: string
  title: string
  event_type: string
  severity: number
  score_fiabilite: number
  latitude: number
  longitude: number
  radius_km: number
  created_at: string
  is_active: boolean
  description: string | null
  source: string
}

export interface SimulationScenario {
  id: string
  name_fr: string
  name_en: string
  description_fr: string
  description_en: string
  icon: string
  defcon_target: 1 | 2 | 3 | 4 | 5
  tutorial_order: number // 0 = advanced (not tutorial), 1-5 = tutorial step
  learning_fr: string[]
  learning_en: string[]
  alerts: SimulatedAlert[]
}

const h = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString()

// ─── TUTORIAL SCENARIOS (DEFCON 5 → 1) ─────────────────────────
// Geo-relative: use offset from user position (0,0 = user's location)
// The consumer will add userLat/userLon to these offsets

export const TUTORIAL_SCENARIOS: SimulationScenario[] = [
  {
    id: 'tuto-defcon5',
    name_fr: 'DEFCON 5 — Veille normale',
    name_en: 'DEFCON 5 — Normal Watch',
    description_fr: 'Aucune menace a proximite. Votre tableau de bord est en mode veille. C\'est le moment de preparer votre kit de survie.',
    description_en: 'No threat nearby. Your dashboard is in watch mode. This is the time to prepare your survival kit.',
    icon: '🟢',
    defcon_target: 5,
    tutorial_order: 1,
    learning_fr: [
      'En DEFCON 5, tout est calme. Profitez-en pour preparer votre kit.',
      'Les alertes lointaines (>500km) n\'affectent pas votre niveau de risque.',
      'Verifiez regulierement vos dates d\'expiration dans le kit de survie.',
    ],
    learning_en: [
      'At DEFCON 5, everything is calm. Use this time to prepare your kit.',
      'Distant alerts (>500km) don\'t affect your risk level.',
      'Regularly check expiration dates in your survival kit.',
    ],
    alerts: [
      // Only distant, low-severity alerts
      { id: 'sim-d5-1', title: 'Earthquake — Chile', event_type: 'EQ', severity: 2, score_fiabilite: 55, latitude: -33.45, longitude: -70.66, radius_km: 100, created_at: h(12), is_active: true, description: 'Moderate 4.2 earthquake near Santiago. No damage reported.', source: 'GDACS' },
      { id: 'sim-d5-2', title: 'Tropical Storm — Pacific', event_type: 'TC', severity: 2, score_fiabilite: 60, latitude: 15.0, longitude: 145.0, radius_km: 200, created_at: h(8), is_active: true, description: 'Tropical storm forming in western Pacific. Category 1 expected.', source: 'GDACS' },
    ],
  },
  {
    id: 'tuto-defcon4',
    name_fr: 'DEFCON 4 — Vigilance accrue',
    name_en: 'DEFCON 4 — Elevated Vigilance',
    description_fr: 'Un seisme modere est detecte a environ 200km. Le systeme surveille la situation. Preparez votre sac d\'evacuation.',
    description_en: 'A moderate earthquake detected about 200km away. The system monitors the situation. Prepare your evacuation bag.',
    icon: '🟡',
    defcon_target: 4,
    tutorial_order: 2,
    learning_fr: [
      'En DEFCON 4, une menace existe mais reste eloignee.',
      'C\'est le moment de verifier votre kit et votre plan d\'evacuation.',
      'Consultez les alertes pour comprendre la nature du risque.',
    ],
    learning_en: [
      'At DEFCON 4, a threat exists but remains distant.',
      'Time to check your kit and evacuation plan.',
      'Check alerts to understand the nature of the risk.',
    ],
    // Alerts positioned ~200km from user (offsets will be applied)
    alerts: [
      { id: 'sim-d4-1', title: 'Earthquake — Regional', event_type: 'EQ', severity: 3, score_fiabilite: 75, latitude: 47.0, longitude: 3.5, radius_km: 80, created_at: h(3), is_active: true, description: 'Magnitude 5.1 earthquake. Light structural damage in some buildings. Aftershocks possible.', source: 'GDACS' },
      { id: 'sim-d4-2', title: 'Flood Warning — River basin', event_type: 'FL', severity: 2, score_fiabilite: 70, latitude: 47.5, longitude: 2.8, radius_km: 50, created_at: h(6), is_active: true, description: 'River levels rising after heavy rain. Minor flooding possible in low areas.', source: 'GDACS' },
    ],
  },
  {
    id: 'tuto-defcon3',
    name_fr: 'DEFCON 3 — Alerte significative',
    name_en: 'DEFCON 3 — Significant Alert',
    description_fr: 'Inondation majeure dans votre region. Les guides de survie sont actives. Votre kit doit etre pret.',
    description_en: 'Major flooding in your region. Survival guides are activated. Your kit must be ready.',
    icon: '🟠',
    defcon_target: 3,
    tutorial_order: 3,
    learning_fr: [
      'En DEFCON 3, la menace se rapproche. Agissez maintenant.',
      'Consultez la fiche "Que faire ?" sous chaque alerte.',
      'Verifiez les items critiques de votre kit dans la section Kit de survie.',
    ],
    learning_en: [
      'At DEFCON 3, the threat is getting closer. Act now.',
      'Check the "What to do?" guide under each alert.',
      'Verify critical items in your kit under Survival Kit section.',
    ],
    alerts: [
      { id: 'sim-d3-1', title: 'Major Flooding — Regional', event_type: 'FL', severity: 4, score_fiabilite: 85, latitude: 48.7, longitude: 2.5, radius_km: 60, created_at: h(2), is_active: true, description: 'Major flooding from river overflow. Evacuations ordered in low-lying areas. Roads blocked. Emergency shelters open.', source: 'GDACS' },
      { id: 'sim-d3-2', title: 'Severe Weather Warning', event_type: 'TC', severity: 3, score_fiabilite: 80, latitude: 48.5, longitude: 2.0, radius_km: 100, created_at: h(4), is_active: true, description: 'Violent storm system approaching. Wind gusts up to 120 km/h. Stay indoors. Secure loose objects.', source: 'GDACS' },
      { id: 'sim-d3-3', title: 'Power Grid Disruption', event_type: 'CYBER', severity: 2, score_fiabilite: 65, latitude: 48.86, longitude: 2.35, radius_km: 200, created_at: h(5), is_active: true, description: 'Widespread power outages due to storm damage. Restoration expected in 24-48h. Use flashlights, not candles.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'tuto-defcon2',
    name_fr: 'DEFCON 2 — Menace imminente',
    name_en: 'DEFCON 2 — Imminent Threat',
    description_fr: 'Conflit arme et penuries de carburant. La France est en etat d\'urgence. Utilisez le plan de fuite intelligent.',
    description_en: 'Armed conflict and fuel shortages. France under state of emergency. Use the smart evacuation plan.',
    icon: '🔴',
    defcon_target: 2,
    tutorial_order: 4,
    learning_fr: [
      'En DEFCON 2, la situation est critique. Evacuation possible.',
      'Le plan de fuite calcule un itineraire en evitant les zones de danger.',
      'L\'evacuation intelligente tient compte du vent et des menaces proches.',
    ],
    learning_en: [
      'At DEFCON 2, the situation is critical. Evacuation may be needed.',
      'The escape plan calculates a route avoiding danger zones.',
      'Smart evacuation considers wind and nearby threats.',
    ],
    alerts: [
      { id: 'sim-d2-1', title: 'Armed Conflict — European Theater', event_type: 'CONFLICT', severity: 4, score_fiabilite: 90, latitude: 49.0, longitude: 2.5, radius_km: 300, created_at: h(1), is_active: true, description: 'Military escalation in Eastern Europe. France activates Vigipirate Urgence Attentat. Airspace restricted.', source: 'RELIEFWEB' },
      { id: 'sim-d2-2', title: 'Fuel Shortage — National Crisis', event_type: 'SHORTAGE', severity: 4, score_fiabilite: 85, latitude: 48.86, longitude: 2.35, radius_km: 400, created_at: h(3), is_active: true, description: 'National fuel rationing: 20L/vehicle/week. Priority for emergency services. Long queues at stations.', source: 'SENTINEL' },
      { id: 'sim-d2-3', title: 'Cyber Attack — Infrastructure', event_type: 'CYBER', severity: 3, score_fiabilite: 75, latitude: 48.86, longitude: 2.35, radius_km: 500, created_at: h(2), is_active: true, description: 'Coordinated cyberattack on banking and telecom systems. Mobile payments disrupted. Cash recommended.', source: 'SENTINEL' },
      { id: 'sim-d2-4', title: 'Food Supply Disruption', event_type: 'SHORTAGE', severity: 3, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 300, created_at: h(5), is_active: true, description: 'Supply chain disrupted. Supermarket shelves running low. Government activating strategic food reserves.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'tuto-defcon1',
    name_fr: 'DEFCON 1 — Urgence maximale',
    name_en: 'DEFCON 1 — Maximum Emergency',
    description_fr: 'Menace nucleaire imminente. Confinement immediat. Toutes les fonctions d\'EVAQ sont en alerte maximale.',
    description_en: 'Imminent nuclear threat. Immediate sheltering. All EVAQ functions at maximum alert.',
    icon: '⚫',
    defcon_target: 1,
    tutorial_order: 5,
    learning_fr: [
      'En DEFCON 1, chaque seconde compte. Suivez les consignes.',
      'Le confinement est la priorite : fermez fenetres, coupez ventilation.',
      'EVAQ vous guide vers les actions vitales dans la section Alertes.',
    ],
    learning_en: [
      'At DEFCON 1, every second counts. Follow instructions.',
      'Sheltering is the priority: close windows, shut off ventilation.',
      'EVAQ guides you to vital actions in the Alerts section.',
    ],
    alerts: [
      { id: 'sim-d1-1', title: 'Nuclear Threat — Imminent Strike', event_type: 'NUCLEAR', severity: 5, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 100, created_at: h(0.5), is_active: true, description: 'DEFCON 1 activated. Tactical nuclear weapons detected on approach. Seek immediate shelter underground. Seal all openings.', source: 'SENTINEL' },
      { id: 'sim-d1-2', title: 'Chemical Contamination — Air', event_type: 'CHEMICAL', severity: 5, score_fiabilite: 90, latitude: 48.85, longitude: 2.30, radius_km: 30, created_at: h(0.3), is_active: true, description: 'Airborne chemical agent detected. FFP3 masks required. Do NOT go outside. Seal windows with tape and plastic.', source: 'SENTINEL' },
      { id: 'sim-d1-3', title: 'Mass Evacuation Order', event_type: 'CONFLICT', severity: 5, score_fiabilite: 95, latitude: 48.86, longitude: 2.35, radius_km: 50, created_at: h(0.2), is_active: true, description: 'Mandatory evacuation order for central Paris. Designated routes only. Bring 72h kit. Report to assembly points.', source: 'RELIEFWEB' },
      { id: 'sim-d1-4', title: 'Hospital Overflow — Critical', event_type: 'HEALTH', severity: 4, score_fiabilite: 85, latitude: 48.84, longitude: 2.33, radius_km: 20, created_at: h(1), is_active: true, description: 'All hospitals at 400% capacity. Field hospitals at Stade de France and Parc des Expositions. Triage protocol active.', source: 'RELIEFWEB' },
      { id: 'sim-d1-5', title: 'Total Communication Blackout', event_type: 'CYBER', severity: 4, score_fiabilite: 70, latitude: 48.86, longitude: 2.35, radius_km: 500, created_at: h(0.8), is_active: true, description: 'Mobile networks overloaded/jammed. Internet intermittent. Use FM radio 107.7 for official communications. Crank radio essential.', source: 'SENTINEL' },
    ],
  },
]

// ─── ADVANCED SCENARIOS (former "test" scenarios) ───────────────

export const ADVANCED_SCENARIOS: SimulationScenario[] = [
  {
    id: 'iran-war',
    name_fr: 'Guerre Iran — Escalade majeure',
    name_en: 'Iran War — Major Escalation',
    description_fr: 'Frappes aeriennes sur l\'Iran, tensions nucleaires, risque de conflit regional. La France est impliquee via la coalition.',
    description_en: 'Airstrikes on Iran, nuclear tensions, regional conflict risk. France involved via coalition.',
    icon: '⚔️',
    defcon_target: 1,
    tutorial_order: 0,
    learning_fr: [],
    learning_en: [],
    alerts: [
      { id: 'sim-iran-1', title: 'Armed Conflict — Iran, Iraq, Israel', event_type: 'CONFLICT', severity: 5, score_fiabilite: 90, latitude: 35.69, longitude: 51.39, radius_km: 800, created_at: h(2), is_active: true, description: 'Coalition airstrikes on Iranian military facilities. Strait of Hormuz partially blocked. Oil prices surge.', source: 'RELIEFWEB' },
      { id: 'sim-iran-2', title: 'Nuclear Threat — Iran nuclear facilities', event_type: 'NUCLEAR', severity: 5, score_fiabilite: 70, latitude: 32.62, longitude: 51.67, radius_km: 500, created_at: h(1), is_active: true, description: 'Isfahan nuclear facility reportedly damaged. Radiation monitoring activated. IAEA emergency session.', source: 'SENTINEL' },
      { id: 'sim-iran-3', title: 'Missile Alert — Eastern Mediterranean', event_type: 'CONFLICT', severity: 4, score_fiabilite: 85, latitude: 33.89, longitude: 35.50, radius_km: 600, created_at: h(3), is_active: true, description: 'Hezbollah retaliatory missile launches. Beirut, Cyprus, Crete in range. Naval assets deployed.', source: 'RELIEFWEB' },
      { id: 'sim-iran-4', title: 'Fuel Shortage — Europe supply disruption', event_type: 'SHORTAGE', severity: 3, score_fiabilite: 75, latitude: 48.86, longitude: 2.35, radius_km: 500, created_at: h(4), is_active: true, description: 'Strait of Hormuz blockade causing 30% reduction in oil supply to Europe. Fuel rationing expected within 72h.', source: 'SENTINEL' },
      { id: 'sim-iran-5', title: 'Vigipirate Urgence Attentat — France', event_type: 'CONFLICT', severity: 4, score_fiabilite: 95, latitude: 48.86, longitude: 2.35, radius_km: 300, created_at: h(1), is_active: true, description: 'Niveau Vigipirate releve a Urgence Attentat. Patrouilles renforcees. Surveillance des sites sensibles.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'ukraine-escalation',
    name_fr: 'Ukraine — Escalade nucleaire',
    name_en: 'Ukraine — Nuclear Escalation',
    description_fr: 'La Russie menace d\'utiliser des armes tactiques nucleaires. L\'OTAN active l\'article 5.',
    description_en: 'Russia threatens tactical nuclear weapons. NATO activates Article 5.',
    icon: '☢️',
    defcon_target: 1,
    tutorial_order: 0,
    learning_fr: [],
    learning_en: [],
    alerts: [
      { id: 'sim-ukr-1', title: 'Armed Conflict — Ukraine, Russia', event_type: 'CONFLICT', severity: 5, score_fiabilite: 95, latitude: 50.45, longitude: 30.52, radius_km: 1000, created_at: h(1), is_active: true, description: 'Major Russian offensive on Kyiv. Massive civilian evacuation. NATO emergency summit.', source: 'RELIEFWEB' },
      { id: 'sim-ukr-2', title: 'Nuclear Threat — Tactical weapons deployment', event_type: 'NUCLEAR', severity: 5, score_fiabilite: 65, latitude: 51.50, longitude: 31.00, radius_km: 1500, created_at: h(2), is_active: true, description: 'Russia deploys tactical nuclear weapons to Belarus border. Wind patterns towards Western Europe.', source: 'SENTINEL' },
      { id: 'sim-ukr-3', title: 'Cyber Attack — European infrastructure', event_type: 'CYBER', severity: 4, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 1000, created_at: h(3), is_active: true, description: 'Coordinated cyberattack on European power grids and banking systems.', source: 'SENTINEL' },
      { id: 'sim-ukr-4', title: 'Food Shortage — European wheat supply', event_type: 'SHORTAGE', severity: 3, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 400, created_at: h(5), is_active: true, description: 'Ukrainian grain exports halted. Black Sea blockade. European wheat reserves at 45-day supply.', source: 'RELIEFWEB' },
    ],
  },
  {
    id: 'chemical-attack',
    name_fr: 'Attaque chimique — Ile-de-France',
    name_en: 'Chemical Attack — Paris Region',
    description_fr: 'Attaque chimique dans le metro parisien. Zone contaminee. Confinement immediat.',
    description_en: 'Chemical attack in Paris metro. Contaminated zone. Immediate sheltering.',
    icon: '🧪',
    defcon_target: 1,
    tutorial_order: 0,
    learning_fr: [],
    learning_en: [],
    alerts: [
      { id: 'sim-chem-1', title: 'Chemical Attack — Paris Metro', event_type: 'CHEMICAL', severity: 5, score_fiabilite: 95, latitude: 48.87, longitude: 2.35, radius_km: 15, created_at: h(0.5), is_active: true, description: 'Sarin-type agent detected in RER A tunnel. 3 stations evacuated. CBRN units deployed.', source: 'SENTINEL' },
      { id: 'sim-chem-2', title: 'Terrorist Threat — Ile-de-France', event_type: 'CONFLICT', severity: 5, score_fiabilite: 90, latitude: 48.86, longitude: 2.35, radius_km: 50, created_at: h(0.3), is_active: true, description: 'DGSI: secondary attacks possible. All public transport suspended. Schools in lockdown.', source: 'SENTINEL' },
      { id: 'sim-chem-3', title: 'Health Emergency — Contamination zone', event_type: 'HEALTH', severity: 4, score_fiabilite: 85, latitude: 48.85, longitude: 2.34, radius_km: 5, created_at: h(0.2), is_active: true, description: 'Hospitals on full capacity. Decontamination centers active. Symptoms: difficulty breathing, eye irritation.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'societal-collapse',
    name_fr: 'Effondrement societal — Crise multiple',
    name_en: 'Societal Collapse — Multiple Crisis',
    description_fr: 'Pandemie + penuries + emeutes + coupures de courant. Couvre-feu national.',
    description_en: 'Pandemic + shortages + riots + power outages. National curfew.',
    icon: '🌑',
    defcon_target: 1,
    tutorial_order: 0,
    learning_fr: [],
    learning_en: [],
    alerts: [
      { id: 'sim-soc-1', title: 'Pandemic — Highly lethal variant', event_type: 'HEALTH', severity: 5, score_fiabilite: 90, latitude: 48.86, longitude: 2.35, radius_km: 2000, created_at: h(48), is_active: true, description: 'WHO declares PHEIC. New variant with 8% mortality rate. Hospitals overwhelmed. Lockdown imminent.', source: 'RELIEFWEB' },
      { id: 'sim-soc-2', title: 'Food Shortage — Supply chain collapse', event_type: 'SHORTAGE', severity: 4, score_fiabilite: 85, latitude: 48.86, longitude: 2.35, radius_km: 300, created_at: h(24), is_active: true, description: 'Truck drivers strike + port blockade. Supermarket shelves empty within 48h.', source: 'SENTINEL' },
      { id: 'sim-soc-3', title: 'Civil Unrest — Major cities', event_type: 'UNREST', severity: 4, score_fiabilite: 85, latitude: 48.86, longitude: 2.35, radius_km: 200, created_at: h(12), is_active: true, description: 'Violent riots in Paris, Lyon, Marseille. Looting reported. National curfew 20h-6h. Army deployed.', source: 'SENTINEL' },
      { id: 'sim-soc-4', title: 'Power Grid Failure — Rolling blackouts', event_type: 'CYBER', severity: 3, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 500, created_at: h(8), is_active: true, description: 'Rolling blackouts 4h on/4h off. Mobile networks intermittent. Cash only.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'natural-cascade',
    name_fr: 'Cascade naturelle — Seisme + tsunami',
    name_en: 'Natural Cascade — Earthquake + tsunami',
    description_fr: 'Mega-seisme en Mediterranee declenchant un tsunami. Cotes sud evacuees.',
    description_en: 'Mediterranean mega-earthquake triggering tsunami. Southern coasts evacuated.',
    icon: '🌋',
    defcon_target: 2,
    tutorial_order: 0,
    learning_fr: [],
    learning_en: [],
    alerts: [
      { id: 'sim-nat-1', title: 'Earthquake — Mediterranean 8.2', event_type: 'EQ', severity: 5, score_fiabilite: 95, latitude: 37.50, longitude: 15.09, radius_km: 400, created_at: h(1), is_active: true, description: 'Magnitude 8.2 earthquake near Sicily. Tsunami warning for all Mediterranean coasts.', source: 'GDACS' },
      { id: 'sim-nat-2', title: 'Tsunami Warning — French Riviera', event_type: 'FL', severity: 5, score_fiabilite: 90, latitude: 43.70, longitude: 7.27, radius_km: 200, created_at: h(0.5), is_active: true, description: 'Tsunami waves expected in 45 minutes. Evacuate to high ground immediately. Wave height estimate: 3-5m.', source: 'GDACS' },
      { id: 'sim-nat-3', title: 'Volcanic Eruption — Etna', event_type: 'VO', severity: 4, score_fiabilite: 90, latitude: 37.75, longitude: 14.99, radius_km: 150, created_at: h(0.3), is_active: true, description: 'Major eruption triggered by seismic activity. Ash cloud moving northwest.', source: 'GDACS' },
    ],
  },
  {
    id: 'confinement',
    name_fr: 'Confinement total — Menace biologique',
    name_en: 'Total Lockdown — Biological Threat',
    description_fr: 'Agent biologique libere. Confinement total. Ne pas sortir. Filtrer l\'air.',
    description_en: 'Biological agent released. Total lockdown. Do not go outside. Filter air.',
    icon: '🔒',
    defcon_target: 1,
    tutorial_order: 0,
    learning_fr: [],
    learning_en: [],
    alerts: [
      { id: 'sim-bio-1', title: 'Biological Threat — Unknown pathogen', event_type: 'HEALTH', severity: 5, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 50, created_at: h(1), is_active: true, description: 'Unknown highly contagious pathogen detected. Total lockdown ordered. Do not open windows.', source: 'SENTINEL' },
      { id: 'sim-bio-2', title: 'Chemical Contamination — Air quality', event_type: 'CHEMICAL', severity: 4, score_fiabilite: 75, latitude: 48.85, longitude: 2.30, radius_km: 30, created_at: h(0.5), is_active: true, description: 'Airborne contamination detected. FFP3 masks required if going outside.', source: 'SENTINEL' },
      { id: 'sim-bio-3', title: 'Hospital Overflow — Critical', event_type: 'HEALTH', severity: 4, score_fiabilite: 90, latitude: 48.84, longitude: 2.33, radius_km: 20, created_at: h(2), is_active: true, description: 'All Paris hospitals at 300% capacity. Field hospitals deployed.', source: 'RELIEFWEB' },
    ],
  },
]

export function getScenarioById(id: string): SimulationScenario | undefined {
  return [...TUTORIAL_SCENARIOS, ...ADVANCED_SCENARIOS].find((s) => s.id === id)
}
