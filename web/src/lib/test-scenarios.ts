/**
 * Scénarios de simulation pour le Mode Test.
 * Injecte des alertes fictives côté client (jamais en BDD).
 */

export interface TestScenario {
  id: string
  name_fr: string
  name_en: string
  description_fr: string
  description_en: string
  icon: string
  alerts: SimulatedAlert[]
}

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

const now = new Date().toISOString()
const h = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString()

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'iran-war',
    name_fr: 'Guerre Iran — Escalade majeure',
    name_en: 'Iran War — Major Escalation',
    description_fr: 'Frappes aeriennes sur l\'Iran, tensions nucleaires, risque de conflit regional. La France est impliquee via la coalition.',
    description_en: 'Airstrikes on Iran, nuclear tensions, regional conflict risk. France involved via coalition.',
    icon: '⚔️',
    alerts: [
      { id: 'test-iran-1', title: 'Armed Conflict — Iran, Iraq, Israel', event_type: 'CONFLICT', severity: 5, score_fiabilite: 90, latitude: 35.69, longitude: 51.39, radius_km: 800, created_at: h(2), is_active: true, description: 'Coalition airstrikes on Iranian military facilities. Strait of Hormuz partially blocked. Oil prices surge.', source: 'RELIEFWEB' },
      { id: 'test-iran-2', title: 'Nuclear Threat — Iran nuclear facilities', event_type: 'NUCLEAR', severity: 5, score_fiabilite: 70, latitude: 32.62, longitude: 51.67, radius_km: 500, created_at: h(1), is_active: true, description: 'Isfahan nuclear facility reportedly damaged. Radiation monitoring activated. IAEA emergency session.', source: 'SENTINEL' },
      { id: 'test-iran-3', title: 'Missile Alert — Eastern Mediterranean', event_type: 'CONFLICT', severity: 4, score_fiabilite: 85, latitude: 33.89, longitude: 35.50, radius_km: 600, created_at: h(3), is_active: true, description: 'Hezbollah retaliatory missile launches. Beirut, Cyprus, Crete in range. Naval assets deployed.', source: 'RELIEFWEB' },
      { id: 'test-iran-4', title: 'Fuel Shortage — Europe supply disruption', event_type: 'SHORTAGE', severity: 3, score_fiabilite: 75, latitude: 48.86, longitude: 2.35, radius_km: 500, created_at: h(4), is_active: true, description: 'Strait of Hormuz blockade causing 30% reduction in oil supply to Europe. Fuel rationing expected within 72h.', source: 'SENTINEL' },
      { id: 'test-iran-5', title: 'Vigipirate Urgence Attentat — France', event_type: 'CONFLICT', severity: 4, score_fiabilite: 95, latitude: 48.86, longitude: 2.35, radius_km: 300, created_at: h(1), is_active: true, description: 'Niveau Vigipirate releve a Urgence Attentat. Patrouilles renforcees. Surveillance des sites sensibles.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'ukraine-escalation',
    name_fr: 'Ukraine — Escalade nucleaire',
    name_en: 'Ukraine — Nuclear Escalation',
    description_fr: 'La Russie menace d\'utiliser des armes tactiques nucleaires. L\'OTAN active l\'article 5.',
    description_en: 'Russia threatens tactical nuclear weapons. NATO activates Article 5.',
    icon: '☢️',
    alerts: [
      { id: 'test-ukr-1', title: 'Armed Conflict — Ukraine, Russia', event_type: 'CONFLICT', severity: 5, score_fiabilite: 95, latitude: 50.45, longitude: 30.52, radius_km: 1000, created_at: h(1), is_active: true, description: 'Major Russian offensive on Kyiv. Massive civilian evacuation. NATO emergency summit.', source: 'RELIEFWEB' },
      { id: 'test-ukr-2', title: 'Nuclear Threat — Tactical weapons deployment', event_type: 'NUCLEAR', severity: 5, score_fiabilite: 65, latitude: 51.50, longitude: 31.00, radius_km: 1500, created_at: h(2), is_active: true, description: 'Russia deploys tactical nuclear weapons to Belarus border. Wind patterns towards Western Europe. Iodine tablets distributed in Poland, Germany.', source: 'SENTINEL' },
      { id: 'test-ukr-3', title: 'Cyber Attack — European infrastructure', event_type: 'CYBER', severity: 4, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 1000, created_at: h(3), is_active: true, description: 'Coordinated cyberattack on European power grids and banking systems attributed to Russian state actors.', source: 'SENTINEL' },
      { id: 'test-ukr-4', title: 'Food Shortage — European wheat supply', event_type: 'SHORTAGE', severity: 3, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 400, created_at: h(5), is_active: true, description: 'Ukrainian grain exports halted. Black Sea blockade. European wheat reserves at 45-day supply.', source: 'RELIEFWEB' },
    ],
  },
  {
    id: 'chemical-attack',
    name_fr: 'Attaque chimique — Ile-de-France',
    name_en: 'Chemical Attack — Paris Region',
    description_fr: 'Attaque chimique dans le metro parisien. Zone contaminee. Confinement immediat.',
    description_en: 'Chemical attack in Paris metro. Contaminated zone. Immediate sheltering.',
    icon: '🧪',
    alerts: [
      { id: 'test-chem-1', title: 'Chemical Attack — Paris Metro', event_type: 'CHEMICAL', severity: 5, score_fiabilite: 95, latitude: 48.87, longitude: 2.35, radius_km: 15, created_at: h(0.5), is_active: true, description: 'Sarin-type agent detected in RER A tunnel. 3 stations evacuated. CBRN units deployed. Stay indoors, seal windows.', source: 'SENTINEL' },
      { id: 'test-chem-2', title: 'Terrorist Threat — Île-de-France', event_type: 'CONFLICT', severity: 5, score_fiabilite: 90, latitude: 48.86, longitude: 2.35, radius_km: 50, created_at: h(0.3), is_active: true, description: 'DGSI: secondary attacks possible. All public transport suspended. Schools in lockdown. Etat d\'urgence declared.', source: 'SENTINEL' },
      { id: 'test-chem-3', title: 'Health Emergency — Contamination zone', event_type: 'HEALTH', severity: 4, score_fiabilite: 85, latitude: 48.85, longitude: 2.34, radius_km: 5, created_at: h(0.2), is_active: true, description: 'Hospitals on full capacity. Decontamination centers at Porte de Versailles and Stade de France. Symptoms: difficulty breathing, eye irritation.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'societal-collapse',
    name_fr: 'Effondrement societal — Crise multiple',
    name_en: 'Societal Collapse — Multiple Crisis',
    description_fr: 'Pandemie + penuries + emeutes + coupures de courant. Supermarches pilles. Couvre-feu national.',
    description_en: 'Pandemic + shortages + riots + power outages. Looting. National curfew.',
    icon: '🌑',
    alerts: [
      { id: 'test-soc-1', title: 'Pandemic — New highly lethal variant', event_type: 'HEALTH', severity: 5, score_fiabilite: 90, latitude: 48.86, longitude: 2.35, radius_km: 2000, created_at: h(48), is_active: true, description: 'WHO declares PHEIC. New variant with 8% mortality rate. Hospitals overwhelmed across Europe. Lockdown imminent.', source: 'RELIEFWEB' },
      { id: 'test-soc-2', title: 'Food Shortage — Supply chain collapse', event_type: 'SHORTAGE', severity: 4, score_fiabilite: 85, latitude: 48.86, longitude: 2.35, radius_km: 300, created_at: h(24), is_active: true, description: 'Truck drivers strike + port blockade. Supermarket shelves empty within 48h. Government activates strategic reserves.', source: 'SENTINEL' },
      { id: 'test-soc-3', title: 'Fuel Shortage — National crisis', event_type: 'SHORTAGE', severity: 4, score_fiabilite: 90, latitude: 48.86, longitude: 2.35, radius_km: 400, created_at: h(20), is_active: true, description: 'All refineries blocked. Fuel rationing: 20L/vehicle/week. Priority for emergency services. EV charging stations overloaded.', source: 'SENTINEL' },
      { id: 'test-soc-4', title: 'Civil Unrest — Major cities', event_type: 'UNREST', severity: 4, score_fiabilite: 85, latitude: 48.86, longitude: 2.35, radius_km: 200, created_at: h(12), is_active: true, description: 'Violent riots in Paris, Lyon, Marseille, Toulouse. Looting reported. National curfew 20h-6h. Army deployed.', source: 'SENTINEL' },
      { id: 'test-soc-5', title: 'Power Grid Failure — Rolling blackouts', event_type: 'CYBER', severity: 3, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 500, created_at: h(8), is_active: true, description: 'Coordinated cyberattack + overloaded grid. Rolling blackouts 4h on/4h off. Mobile networks intermittent. Cash only.', source: 'SENTINEL' },
    ],
  },
  {
    id: 'natural-cascade',
    name_fr: 'Cascade naturelle — Seisme + tsunami + volcan',
    name_en: 'Natural Cascade — Earthquake + tsunami + volcano',
    description_fr: 'Mega-seisme en Mediterranee declenchant un tsunami et une eruption volcanique. Cotes sud evacuees.',
    description_en: 'Mediterranean mega-earthquake triggering tsunami and volcanic eruption. Southern coasts evacuated.',
    icon: '🌋',
    alerts: [
      { id: 'test-nat-1', title: 'Earthquake — Mediterranean 8.2', event_type: 'EQ', severity: 5, score_fiabilite: 95, latitude: 37.50, longitude: 15.09, radius_km: 400, created_at: h(1), is_active: true, description: 'Magnitude 8.2 earthquake near Sicily. Buildings collapsed. Tsunami warning for all Mediterranean coasts.', source: 'GDACS' },
      { id: 'test-nat-2', title: 'Tsunami Warning — French Riviera', event_type: 'FL', severity: 5, score_fiabilite: 90, latitude: 43.70, longitude: 7.27, radius_km: 200, created_at: h(0.5), is_active: true, description: 'Tsunami waves expected in 45 minutes. Nice, Cannes, Monaco: evacuate to high ground immediately. Wave height estimate: 3-5m.', source: 'GDACS' },
      { id: 'test-nat-3', title: 'Volcanic Eruption — Etna', event_type: 'VO', severity: 4, score_fiabilite: 90, latitude: 37.75, longitude: 14.99, radius_km: 150, created_at: h(0.3), is_active: true, description: 'Major eruption triggered by seismic activity. Ash cloud moving northwest. Catania airport closed. Flight disruptions expected across southern Europe.', source: 'GDACS' },
    ],
  },
  {
    id: 'confinement',
    name_fr: 'Confinement total — Menace biologique',
    name_en: 'Total Lockdown — Biological Threat',
    description_fr: 'Agent biologique libere. Confinement total. Ne pas sortir. Filtrer l\'air.',
    description_en: 'Biological agent released. Total lockdown. Do not go outside. Filter air.',
    icon: '🔒',
    alerts: [
      { id: 'test-bio-1', title: 'Biological Threat — Unknown pathogen', event_type: 'HEALTH', severity: 5, score_fiabilite: 80, latitude: 48.86, longitude: 2.35, radius_km: 50, created_at: h(1), is_active: true, description: 'Unknown highly contagious pathogen detected in central Paris. Mortality rate unknown. Total lockdown ordered. Do not open windows. Seal all ventilation.', source: 'SENTINEL' },
      { id: 'test-bio-2', title: 'Chemical Contamination — Air quality', event_type: 'CHEMICAL', severity: 4, score_fiabilite: 75, latitude: 48.85, longitude: 2.30, radius_km: 30, created_at: h(0.5), is_active: true, description: 'Airborne contamination detected. FFP3 masks required if going outside. Decontamination showers at fire stations.', source: 'SENTINEL' },
      { id: 'test-bio-3', title: 'Hospital Overflow — Critical', event_type: 'HEALTH', severity: 4, score_fiabilite: 90, latitude: 48.84, longitude: 2.33, radius_km: 20, created_at: h(2), is_active: true, description: 'All Paris hospitals at 300% capacity. Field hospitals deployed at Palais des Sports and Parc des Expositions. Triage protocol activated.', source: 'RELIEFWEB' },
    ],
  },
]

export function getScenarioById(id: string): TestScenario | undefined {
  return TEST_SCENARIOS.find((s) => s.id === id)
}
