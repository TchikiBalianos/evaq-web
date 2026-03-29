'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Locale = 'fr' | 'en'

const STORAGE_KEY = 'evaq-locale'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'fr',
  setLocale: () => {},
  t: (key) => key,
})

export function useI18n() {
  return useContext(I18nContext)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored === 'fr' || stored === 'en') setLocaleState(stored)
    }
    init()
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t = useCallback(
    (key: string) => {
      const dict = locale === 'fr' ? fr : en
      return (dict as Record<string, string>)[key] ?? key
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// ─── Dictionnaire FR ───────────────────────────────────────────
const fr: Record<string, string> = {
  // Nav
  'nav.dashboard': 'Tableau de bord',
  'nav.dashboard.short': 'Accueil',
  'nav.alerts': 'Alertes',
  'nav.evacuation': 'Plan de fuite',
  'nav.evacuation.short': 'Fuite',
  'nav.kit': 'Kit de survie',
  'nav.kit.short': 'Kit',

  // Theme
  'theme.light': 'Clair',
  'theme.dark': 'Sombre',
  'theme.system': 'Systeme',
  'theme.label': 'Theme',
  'theme.change': 'Changer le theme',

  // Dashboard
  'dashboard.title': 'Tableau de bord',
  'dashboard.risk_level': 'Niveau de risque actuel',
  'dashboard.calculating': 'Calcul en cours...',
  'dashboard.alerts_analyzed': 'alertes actives analysees',
  'dashboard.nearby_alerts': 'Alertes a proximite',
  'dashboard.view_alerts': 'Voir les alertes',
  'dashboard.evacuation_plan': 'Plan de fuite',
  'dashboard.my_kit': 'Mon kit',
  'dashboard.preparation_score': 'Score de preparation',
  'dashboard.complete_kit': 'Completez votre kit de survie pour ameliorer votre score.',
  'dashboard.kit_ready': 'Votre kit est complet. Vous etes pret.',
  'dashboard.premium': 'Premium',

  // DEFCON messages
  'defcon.5': 'Aucune menace detectee dans votre zone. Tout est calme.',
  'defcon.4': 'Evenements surveilles dans votre region. Restez informe.',
  'defcon.3': 'Alerte active a proximite. Preparez votre kit.',
  'defcon.2': 'Danger significatif proche. Activez votre plan de fuite.',
  'defcon.1': 'Urgence imminente. Evacuez si necessaire.',

  // DEFCON badge
  'defcon.level.5': 'Veille',
  'defcon.level.4': 'Attention',
  'defcon.level.3': 'Alerte',
  'defcon.level.2': 'Danger',
  'defcon.level.1': 'Urgence',

  // Geo errors
  'geo.unsupported': 'Geolocalisation non supportee par votre navigateur.',
  'geo.denied': 'Acces a la position refuse. Activez la geolocalisation pour calculer votre DEFCON.',
  'geo.unavailable': 'Impossible de recuperer votre position.',
  'geo.world_alerts': 'alertes actives dans le monde.',

  // Geo status indicator
  'geo.status.active': 'GPS actif',
  'geo.status.denied': 'Position inconnue',

  // Alerts page
  'alerts.title': 'Alertes',
  'alerts.mode.sage': 'Mode Sage',
  'alerts.mode.expert': 'Mode Expert',
  'alerts.sage_info': 'Seules les alertes confirmees (fiabilite > 80%) sont affichees.',
  'alerts.switch_expert': 'Passer en mode Expert',
  'alerts.expert_info': 'Toutes les alertes sont affichees, y compris celles a fiabilite < 80%.',
  'alerts.switch_sage': 'Filtrer (fiabilite > 80%)',
  'alerts.sort.date': 'Recent',
  'alerts.sort.severity': 'Gravite',
  'alerts.sort.distance': 'Distance',
  'alerts.none': 'Aucune alerte active',
  'alerts.none_sage': 'Aucune alerte confirmee. Essayez le mode Expert.',
  'alerts.none_expert': 'EVAQ surveille en continu les sources GDACS et OSINT.',
  'alerts.count': 'alerte',
  'alerts.count_plural': 'alertes',
  'alerts.source': 'Source',
  'alerts.radius': 'Rayon',
  'alerts.coords': 'Coords',
  'alerts.guide_title': 'Que faire ?',

  // Severity
  'severity.1': 'Mineur',
  'severity.2': 'Modere',
  'severity.3': 'Severe',
  'severity.4': 'Grave',
  'severity.5': 'Catastrophique',

  // Event types
  'event.EQ': 'Seisme',
  'event.FL': 'Inondation',
  'event.TC': 'Cyclone',
  'event.VO': 'Volcan',
  'event.DR': 'Secheresse',
  'event.WF': 'Feu de foret',
  'event.CONFLICT': 'Conflit',
  'event.HEALTH': 'Sante',
  'event.NUCLEAR': 'Nucleaire',
  'event.CHEMICAL': 'Chimique',
  'event.SHORTAGE': 'Penurie',
  'event.UNREST': 'Troubles civils',
  'event.CYBER': 'Cyberattaque',

  // Push
  'push.title': 'Notifications push',
  'push.active': 'Actives — DEFCON 3 et plus',
  'push.inactive': 'Desactivees',
  'push.enable': 'Activer',
  'push.disable': 'Desactiver',
  'push.denied': 'Permission refusee',

  // Auth
  'auth.login': 'Se connecter',
  'auth.register': 'Creer mon compte',
  'auth.loading': 'Chargement...',
  'auth.email': 'Adresse email',
  'auth.email_placeholder': 'vous@exemple.fr',
  'auth.password': 'Mot de passe',
  'auth.password_placeholder': '12 caracteres minimum',
  'auth.login_subtitle': 'Connectez-vous pour continuer',
  'auth.register_subtitle': 'Creez votre compte',
  'auth.no_account': 'Pas encore de compte ?',
  'auth.signup': "S'inscrire",
  'auth.has_account': 'Deja un compte ?',
  'auth.signin': 'Se connecter',
  'auth.tos_prefix': 'En vous inscrivant, vous acceptez nos',
  'auth.tos': 'CGU',
  'auth.tos_and': 'et notre',
  'auth.privacy': 'politique de confidentialite',

  // Offline
  'offline.no_connection': 'Pas de connexion internet',
  'offline.message': "EVAQ est disponible en mode hors-ligne pour les abonnes premium. Installez l'app depuis votre navigateur pour acceder aux donnees sauvegardees.",
  'offline.retry': 'Reessayer',

  // Install prompt
  'install.title': 'Installer EVAQ sur votre iPhone',
  'install.message': 'Appuyez sur Partager puis Sur l\'ecran d\'accueil pour recevoir les alertes push.',
  'install.close': 'Fermer',

  // Plan de fuite
  'plan.title': 'Plan de fuite',
  'plan.map': 'Carte interactive',
  'plan.map_phase2': 'Disponible en Phase 2',
  'plan.calculate': 'Calculer un itineraire de fuite',
  'plan.calculate_desc': 'EVAQ calcule 3 routes alternatives selon votre profil (voiture, PMR, animaux) et le type de menace active.',
  'plan.calculate_desc_short': '3 itineraires adaptes a votre profil et au type de menace.',
  'plan.calculate_btn': 'Calculer mon plan — disponible Phase 2',
  'plan.calculate_route': 'Calculer un itineraire — bientot disponible',
  'plan.active_threats': 'menaces actives',

  // Routing
  'route.select_destination': 'Choisir une destination',
  'route.tap_destination': 'Touchez la carte pour placer votre destination',
  'route.cancel': 'Annuler',
  'route.need_gps': 'GPS requis pour calculer un itineraire',
  'route.destination_set': 'Destination placee',
  'route.calculate': 'Calculer l\'itineraire',
  'route.calculating': 'Calcul en cours...',
  'route.routes_found': 'itineraires trouves',
  'route.fastest': 'Le plus rapide',
  'route.alternative': 'Alternative',
  'route.new_route': 'Nouvel itineraire',
  'route.error': 'Impossible de calculer l\'itineraire. Reessayez.',
  'route.smart_evacuate': 'Evacuation intelligente',
  'route.wind_info': 'Vent actuel',
  'route.wind_from': 'depuis',
  'route.save_plan': 'Sauvegarder ce plan',
  'route.stops': 'Arrets et services',
  'route.loading_stops': 'Recherche des services...',
  'route.no_stops': 'Aucun service trouve le long du trajet',
  'route.fuel_station': 'Station-service',
  'route.ev_charger': 'Borne electrique',
  'route.rest_area': 'Aire de repos',
  'route.toll': 'Peage',
  'route.hospital': 'Hopital',
  'route.supermarket': 'Supermarche',
  'route.at_km': 'a ~{km} km',
  'route.saved_plans': 'Plans sauvegardes',

  // Evacuation advice
  'evac.nuclear_upwind': 'Menace nucleaire detectee. Fuyez face au vent (direction opposee aux retombees).',
  'evac.nuclear_no_wind': 'Menace nucleaire detectee. Eloignez-vous de l\'epicentre (100 km min).',
  'evac.chemical_perpendicular': 'Menace chimique. Fuyez perpendiculairement au vent.',
  'evac.chemical_no_wind': 'Menace chimique. Eloignez-vous de la source (30 km min).',
  'evac.flood': 'Inondation. Rejoignez les zones en hauteur.',
  'evac.cyclone': 'Cyclone. Fuyez perpendiculairement a la trajectoire.',
  'evac.volcano': 'Eruption volcanique. Eloignez-vous de l\'epicentre.',
  'evac.volcano_wind': 'Eruption volcanique. Fuyez face au vent pour eviter les cendres.',
  'evac.wildfire': 'Feu de foret. Eloignez-vous de la zone.',
  'evac.wildfire_wind': 'Feu de foret. Fuyez perpendiculairement au vent (propagation).',
  'evac.conflict': 'Conflit arme. Eloignez-vous de la zone de danger.',
  'evac.eq': 'Seisme. Eloignez-vous de l\'epicentre et des structures endommagees.',
  'evac.health': 'Risque sanitaire. Restez confine et suivez les consignes officielles.',
  'evac.no_action': 'Aucune evacuation necessaire.',

  // Kit
  'kit.title': 'Kit de survie',
  'kit.cat.water': 'Eau',
  'kit.cat.food': 'Nourriture',
  'kit.cat.medical': 'Medical',
  'kit.cat.tools': 'Outils',
  'kit.cat.documents': 'Documents',
  'kit.cat.communication': 'Communication',
  'kit.items': 'items',
  'kit.items_missing': 'items manquants',
  'kit.tap_to_see': 'Voir les recommandations',
  'kit.recommended': 'Items recommandes (sources officielles)',
  'kit.more': 'de plus',
  'kit.preparation_score': 'Score de preparation',
  'kit.empty_category': 'Aucun item dans cette categorie.',
  'kit.add_item': 'Ajouter un item',
  'kit.edit_item': 'Modifier l\'item',
  'kit.item_name': 'Nom de l\'item',
  'kit.unit': 'Unite (kg, L, boites...)',
  'kit.notes': 'Notes (optionnel)',
  'kit.add': 'Ajouter',
  'kit.save': 'Enregistrer',
  'kit.edit': 'Modifier',
  'kit.expired': 'Expire',
  'kit.limit_reached': 'Limite gratuite atteinte (15 items)',
  'kit.free_tier': 'offre gratuite',
  'kit.add_expiry': 'Ajouter une date d\'expiration',
  'kit.undo_delete': 'Annuler',
  'kit.deleted': 'Item supprime',

  // Premium
  'premium.title': 'EVAQ Premium',
  'premium.subtitle': 'Debloquez toutes les fonctionnalites pour mieux vous preparer.',
  'premium.subscriptions': 'Abonnements',
  'premium.packs': 'Packs a l\'unite',
  'premium.monthly': 'Mensuel',
  'premium.yearly': 'Annuel',
  'premium.per_month': '/mois',
  'premium.per_year': '/an',
  'premium.save_42': '-42%',
  'premium.subscribe': 'S\'abonner',
  'premium.manage': 'Gerer mon abonnement',
  'premium.pack_alert': 'Pack Alertes',
  'premium.pack_evacuation': 'Pack Evacuation',
  'premium.pack_kit': 'Pack Kit',
  'premium.pack_preparation': 'Pack Preparation',
  'premium.feat_everything': 'Toutes les fonctionnalites',
  'premium.feat_unlimited_alerts': 'Alertes illimitees',
  'premium.feat_expert_mode': 'Mode Expert permanent',
  'premium.feat_unlimited_routes': 'Itineraires illimites',
  'premium.feat_smart_evac': 'Evacuation intelligente',
  'premium.feat_unlimited_items': 'Items kit illimites',
  'premium.feat_expiry_alerts': 'Alertes expiration',
  'premium.feat_full_score': 'Score complet',
  'premium.feat_personalized_reco': 'Recommandations personnalisees',
  'premium.feat_offline_tiles': 'Cartes hors-ligne',
  'premium.feat_priority_notif': 'Notifications prioritaires',
  'premium.feat_no_ads': 'Sans publicite',

  // Locale
  'locale.fr': 'FR',
  'locale.en': 'EN',
}

// ─── Dictionnaire EN ───────────────────────────────────────────
const en: Record<string, string> = {
  // Nav
  'nav.dashboard': 'Dashboard',
  'nav.dashboard.short': 'Home',
  'nav.alerts': 'Alerts',
  'nav.evacuation': 'Evacuation Plan',
  'nav.evacuation.short': 'Evacuation',
  'nav.kit': 'Survival Kit',
  'nav.kit.short': 'Kit',

  // Theme
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',
  'theme.label': 'Theme',
  'theme.change': 'Change theme',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.risk_level': 'Current risk level',
  'dashboard.calculating': 'Calculating...',
  'dashboard.alerts_analyzed': 'active alerts analyzed',
  'dashboard.nearby_alerts': 'Nearby alerts',
  'dashboard.view_alerts': 'View alerts',
  'dashboard.evacuation_plan': 'Evacuation plan',
  'dashboard.my_kit': 'My kit',
  'dashboard.preparation_score': 'Preparation score',
  'dashboard.complete_kit': 'Complete your survival kit to improve your score.',
  'dashboard.kit_ready': 'Your kit is complete. You are ready.',
  'dashboard.premium': 'Premium',

  // DEFCON messages
  'defcon.5': 'No threats detected in your area. All clear.',
  'defcon.4': 'Events being monitored in your region. Stay informed.',
  'defcon.3': 'Active alert nearby. Prepare your kit.',
  'defcon.2': 'Significant danger nearby. Activate your evacuation plan.',
  'defcon.1': 'Imminent emergency. Evacuate if necessary.',

  // DEFCON badge
  'defcon.level.5': 'Watch',
  'defcon.level.4': 'Caution',
  'defcon.level.3': 'Alert',
  'defcon.level.2': 'Danger',
  'defcon.level.1': 'Emergency',

  // Geo errors
  'geo.unsupported': 'Geolocation is not supported by your browser.',
  'geo.denied': 'Location access denied. Enable geolocation to calculate your DEFCON level.',
  'geo.unavailable': 'Unable to retrieve your position.',
  'geo.world_alerts': 'active alerts worldwide.',

  // Geo status indicator
  'geo.status.active': 'GPS active',
  'geo.status.denied': 'Location unknown',

  // Alerts page
  'alerts.title': 'Alerts',
  'alerts.mode.sage': 'Safe Mode',
  'alerts.mode.expert': 'Expert Mode',
  'alerts.sage_info': 'Only confirmed alerts (reliability > 80%) are displayed.',
  'alerts.switch_expert': 'Switch to Expert Mode',
  'alerts.expert_info': 'All alerts are displayed, including those with reliability < 80%.',
  'alerts.switch_sage': 'Filter (reliability > 80%)',
  'alerts.sort.date': 'Recent',
  'alerts.sort.severity': 'Severity',
  'alerts.sort.distance': 'Distance',
  'alerts.none': 'No active alerts',
  'alerts.none_sage': 'No confirmed alerts. Try Expert Mode.',
  'alerts.none_expert': 'EVAQ continuously monitors GDACS and OSINT sources.',
  'alerts.count': 'alert',
  'alerts.count_plural': 'alerts',
  'alerts.source': 'Source',
  'alerts.radius': 'Radius',
  'alerts.coords': 'Coords',
  'alerts.guide_title': 'What to do?',

  // Severity
  'severity.1': 'Minor',
  'severity.2': 'Moderate',
  'severity.3': 'Severe',
  'severity.4': 'Critical',
  'severity.5': 'Catastrophic',

  // Event types
  'event.EQ': 'Earthquake',
  'event.FL': 'Flood',
  'event.TC': 'Tropical Cyclone',
  'event.VO': 'Volcano',
  'event.DR': 'Drought',
  'event.WF': 'Wildfire',
  'event.CONFLICT': 'Conflict',
  'event.HEALTH': 'Health',
  'event.NUCLEAR': 'Nuclear',
  'event.CHEMICAL': 'Chemical',
  'event.SHORTAGE': 'Shortage',
  'event.UNREST': 'Civil Unrest',
  'event.CYBER': 'Cyber Attack',

  // Push
  'push.title': 'Push notifications',
  'push.active': 'Active — DEFCON 3 and above',
  'push.inactive': 'Disabled',
  'push.enable': 'Enable',
  'push.disable': 'Disable',
  'push.denied': 'Permission denied',

  // Auth
  'auth.login': 'Sign in',
  'auth.register': 'Create account',
  'auth.loading': 'Loading...',
  'auth.email': 'Email address',
  'auth.email_placeholder': 'you@example.com',
  'auth.password': 'Password',
  'auth.password_placeholder': '12 characters minimum',
  'auth.login_subtitle': 'Sign in to continue',
  'auth.register_subtitle': 'Create your account',
  'auth.no_account': "Don't have an account?",
  'auth.signup': 'Sign up',
  'auth.has_account': 'Already have an account?',
  'auth.signin': 'Sign in',
  'auth.tos_prefix': 'By signing up, you agree to our',
  'auth.tos': 'Terms of Service',
  'auth.tos_and': 'and our',
  'auth.privacy': 'Privacy Policy',

  // Offline
  'offline.no_connection': 'No internet connection',
  'offline.message': 'EVAQ is available offline for premium subscribers. Install the app from your browser to access saved data.',
  'offline.retry': 'Retry',

  // Install prompt
  'install.title': 'Install EVAQ on your iPhone',
  'install.message': 'Tap Share then Add to Home Screen to receive push alerts.',
  'install.close': 'Close',

  // Plan de fuite
  'plan.title': 'Evacuation Plan',
  'plan.map': 'Interactive map',
  'plan.map_phase2': 'Available in Phase 2',
  'plan.calculate': 'Calculate an evacuation route',
  'plan.calculate_desc': 'EVAQ calculates 3 alternative routes based on your profile (car, reduced mobility, pets) and the active threat type.',
  'plan.calculate_desc_short': '3 routes adapted to your profile and threat type.',
  'plan.calculate_btn': 'Calculate my plan — available Phase 2',
  'plan.calculate_route': 'Calculate a route — coming soon',
  'plan.active_threats': 'active threats',

  // Routing
  'route.select_destination': 'Choose a destination',
  'route.tap_destination': 'Tap the map to place your destination',
  'route.cancel': 'Cancel',
  'route.need_gps': 'GPS required to calculate a route',
  'route.destination_set': 'Destination set',
  'route.calculate': 'Calculate route',
  'route.calculating': 'Calculating...',
  'route.routes_found': 'routes found',
  'route.fastest': 'Fastest',
  'route.alternative': 'Alternative',
  'route.new_route': 'New route',
  'route.error': 'Unable to calculate route. Try again.',
  'route.smart_evacuate': 'Smart evacuation',
  'route.wind_info': 'Current wind',
  'route.wind_from': 'from',
  'route.save_plan': 'Save this plan',
  'route.stops': 'Stops & services',
  'route.loading_stops': 'Searching for services...',
  'route.no_stops': 'No services found along the route',
  'route.fuel_station': 'Gas station',
  'route.ev_charger': 'EV charger',
  'route.rest_area': 'Rest area',
  'route.toll': 'Toll',
  'route.hospital': 'Hospital',
  'route.supermarket': 'Supermarket',
  'route.at_km': 'at ~{km} km',
  'route.saved_plans': 'Saved plans',

  // Evacuation advice
  'evac.nuclear_upwind': 'Nuclear threat detected. Flee upwind (away from fallout).',
  'evac.nuclear_no_wind': 'Nuclear threat detected. Move away from epicenter (100 km min).',
  'evac.chemical_perpendicular': 'Chemical threat. Flee perpendicular to wind direction.',
  'evac.chemical_no_wind': 'Chemical threat. Move away from source (30 km min).',
  'evac.flood': 'Flooding. Head to higher ground.',
  'evac.cyclone': 'Cyclone. Flee perpendicular to the storm track.',
  'evac.volcano': 'Volcanic eruption. Move away from the epicenter.',
  'evac.volcano_wind': 'Volcanic eruption. Flee upwind to avoid ash.',
  'evac.wildfire': 'Wildfire. Move away from the area.',
  'evac.wildfire_wind': 'Wildfire. Flee perpendicular to wind (fire spreads downwind).',
  'evac.conflict': 'Armed conflict. Move away from the danger zone.',
  'evac.eq': 'Earthquake. Move away from the epicenter and damaged structures.',
  'evac.health': 'Health hazard. Shelter in place and follow official guidance.',
  'evac.no_action': 'No evacuation needed.',

  // Kit
  'kit.title': 'Survival Kit',
  'kit.cat.water': 'Water',
  'kit.cat.food': 'Food',
  'kit.cat.medical': 'Medical',
  'kit.cat.tools': 'Tools',
  'kit.cat.documents': 'Documents',
  'kit.cat.communication': 'Communication',
  'kit.items': 'items',
  'kit.items_missing': 'items missing',
  'kit.tap_to_see': 'See recommendations',
  'kit.recommended': 'Recommended items (official sources)',
  'kit.more': 'more',
  'kit.preparation_score': 'Preparation score',
  'kit.empty_category': 'No items in this category.',
  'kit.add_item': 'Add an item',
  'kit.edit_item': 'Edit item',
  'kit.item_name': 'Item name',
  'kit.unit': 'Unit (kg, L, cans...)',
  'kit.notes': 'Notes (optional)',
  'kit.add': 'Add',
  'kit.save': 'Save',
  'kit.edit': 'Edit',
  'kit.expired': 'Expired',
  'kit.limit_reached': 'Free limit reached (15 items)',
  'kit.free_tier': 'free tier',
  'kit.add_expiry': 'Add expiry date',
  'kit.undo_delete': 'Undo',
  'kit.deleted': 'Item deleted',

  // Premium
  'premium.title': 'EVAQ Premium',
  'premium.subtitle': 'Unlock all features to better prepare yourself.',
  'premium.subscriptions': 'Subscriptions',
  'premium.packs': 'One-time packs',
  'premium.monthly': 'Monthly',
  'premium.yearly': 'Yearly',
  'premium.per_month': '/month',
  'premium.per_year': '/year',
  'premium.save_42': '-42%',
  'premium.subscribe': 'Subscribe',
  'premium.manage': 'Manage my subscription',
  'premium.pack_alert': 'Alerts Pack',
  'premium.pack_evacuation': 'Evacuation Pack',
  'premium.pack_kit': 'Kit Pack',
  'premium.pack_preparation': 'Preparation Pack',
  'premium.feat_everything': 'All features',
  'premium.feat_unlimited_alerts': 'Unlimited alerts',
  'premium.feat_expert_mode': 'Permanent Expert Mode',
  'premium.feat_unlimited_routes': 'Unlimited routes',
  'premium.feat_smart_evac': 'Smart evacuation',
  'premium.feat_unlimited_items': 'Unlimited kit items',
  'premium.feat_expiry_alerts': 'Expiry alerts',
  'premium.feat_full_score': 'Full score',
  'premium.feat_personalized_reco': 'Personalized recommendations',
  'premium.feat_offline_tiles': 'Offline maps',
  'premium.feat_priority_notif': 'Priority notifications',
  'premium.feat_no_ads': 'Ad-free',

  // Locale
  'locale.fr': 'FR',
  'locale.en': 'EN',
}

// ─── Traduction des titres d'alertes GDACS ─────────────────────

const COUNTRY_NAMES_FR: Record<string, string> = {
  'Afghanistan': 'Afghanistan', 'Albania': 'Albanie', 'Algeria': 'Algerie', 'Angola': 'Angola',
  'Argentina': 'Argentine', 'Armenia': 'Armenie', 'Australia': 'Australie', 'Austria': 'Autriche',
  'Azerbaijan': 'Azerbaidjan', 'Bangladesh': 'Bangladesh', 'Belgium': 'Belgique', 'Bolivia': 'Bolivie',
  'Bosnia and Herzegovina': 'Bosnie-Herzegovine', 'Brazil': 'Bresil', 'Bulgaria': 'Bulgarie',
  'Burkina Faso': 'Burkina Faso', 'Cambodia': 'Cambodge', 'Cameroon': 'Cameroun', 'Canada': 'Canada',
  'Chad': 'Tchad', 'Chile': 'Chili', 'China': 'Chine', 'Colombia': 'Colombie',
  'Costa Rica': 'Costa Rica', 'Croatia': 'Croatie', 'Cuba': 'Cuba', 'Cyprus': 'Chypre',
  'Czech Republic': 'Republique tcheque', 'Democratic Republic of Congo': 'Republique democratique du Congo',
  'Democratic Republic of the Congo': 'Republique democratique du Congo',
  'Denmark': 'Danemark', 'Dominican Republic': 'Republique dominicaine',
  'Ecuador': 'Equateur', 'Egypt': 'Egypte', 'El Salvador': 'Salvador',
  'Ethiopia': 'Ethiopie', 'Fiji': 'Fidji', 'Finland': 'Finlande', 'France': 'France',
  'Georgia': 'Georgie', 'Germany': 'Allemagne', 'Ghana': 'Ghana', 'Greece': 'Grece',
  'Guatemala': 'Guatemala', 'Haiti': 'Haiti', 'Honduras': 'Honduras', 'Hungary': 'Hongrie',
  'Iceland': 'Islande', 'India': 'Inde', 'Indonesia': 'Indonesie', 'Iran': 'Iran',
  'Iraq': 'Irak', 'Ireland': 'Irlande', 'Israel': 'Israel', 'Italy': 'Italie',
  'Jamaica': 'Jamaique', 'Japan': 'Japon', 'Jordan': 'Jordanie', 'Kazakhstan': 'Kazakhstan',
  'Kenya': 'Kenya', 'Korea': 'Coree', 'Kuwait': 'Koweit', 'Kyrgyzstan': 'Kirghizistan',
  'Lebanon': 'Liban', 'Libya': 'Libye', 'Madagascar': 'Madagascar', 'Malaysia': 'Malaisie',
  'Mali': 'Mali', 'Mexico': 'Mexique', 'Mongolia': 'Mongolie', 'Morocco': 'Maroc',
  'Mozambique': 'Mozambique', 'Myanmar': 'Myanmar', 'Nepal': 'Nepal',
  'Netherlands': 'Pays-Bas', 'New Zealand': 'Nouvelle-Zelande', 'Nicaragua': 'Nicaragua',
  'Niger': 'Niger', 'Nigeria': 'Nigeria', 'North Korea': 'Coree du Nord',
  'Norway': 'Norvege', 'Pakistan': 'Pakistan', 'Palestine': 'Palestine', 'Panama': 'Panama',
  'Papua New Guinea': 'Papouasie-Nouvelle-Guinee', 'Paraguay': 'Paraguay', 'Peru': 'Perou',
  'Philippines': 'Philippines', 'Poland': 'Pologne', 'Portugal': 'Portugal',
  'Romania': 'Roumanie', 'Russia': 'Russie', 'Rwanda': 'Rwanda', 'Saudi Arabia': 'Arabie saoudite',
  'Senegal': 'Senegal', 'Serbia': 'Serbie', 'Singapore': 'Singapour',
  'Slovakia': 'Slovaquie', 'Slovenia': 'Slovenie', 'Somalia': 'Somalie',
  'South Africa': 'Afrique du Sud', 'South Korea': 'Coree du Sud', 'Spain': 'Espagne',
  'Sri Lanka': 'Sri Lanka', 'Sudan': 'Soudan', 'Sweden': 'Suede', 'Switzerland': 'Suisse',
  'Syria': 'Syrie', 'Taiwan': 'Taiwan', 'Tajikistan': 'Tadjikistan',
  'Tanzania': 'Tanzanie', 'Thailand': 'Thailande', 'Tonga': 'Tonga',
  'Tunisia': 'Tunisie', 'Turkey': 'Turquie', 'Turkmenistan': 'Turkmenistan',
  'Uganda': 'Ouganda', 'Ukraine': 'Ukraine', 'United Arab Emirates': 'Emirats arabes unis',
  'United Kingdom': 'Royaume-Uni', 'United States': 'Etats-Unis', 'Uruguay': 'Uruguay',
  'Uzbekistan': 'Ouzbekistan', 'Vanuatu': 'Vanuatu', 'Venezuela': 'Venezuela',
  'Viet Nam': 'Vietnam', 'Vietnam': 'Vietnam', 'Yemen': 'Yemen', 'Zambia': 'Zambie', 'Zimbabwe': 'Zimbabwe',
}

const EVENT_TYPE_FR: Record<string, string> = {
  EQ: 'Seisme', FL: 'Inondation', TC: 'Cyclone tropical', VO: 'Eruption volcanique',
  DR: 'Secheresse', WF: 'Feu de foret',
}

// Traduit un titre GDACS anglais en francais
// Ex: "Drought in Bolivia, Brazil, Peru" -> "Secheresse — Bolivie, Bresil, Perou"
export function translateAlertTitle(title: string, eventType: string, locale: Locale): string {
  if (locale === 'en') return title

  const frType = EVENT_TYPE_FR[eventType]
  if (!frType) return title

  // Extraire les pays du titre (pattern: "Event in Country1, Country2")
  const inMatch = title.match(/\s+in\s+(.+)$/i)
  if (!inMatch) {
    // Pattern cyclone: "Tropical Cyclone NAME-XX"
    const cycloneMatch = title.match(/Tropical Cyclone\s+(.+)/i)
    if (cycloneMatch) return `${frType} ${cycloneMatch[1]}`
    return `${frType}`
  }

  const countries = inMatch[1]
    .split(/,\s*/)
    .map((c) => COUNTRY_NAMES_FR[c.trim()] ?? c.trim())
    .join(', ')

  return `${frType} — ${countries}`
}
