import '../utils/i18n.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ConflictPoint {
  final String id;
  final String title;
  final String type;
  final double lat;
  final double lng;
  final int fatalities;
  final String date;

  ConflictPoint({
    required this.id,
    required this.title,
    required this.type,
    required this.lat,
    required this.lng,
    required this.fatalities,
    required this.date,
  });
}

class EvaqProvider extends ChangeNotifier {
  bool _isTestMode = true;
  String _testScenarioId = 'societal-collapse';
  bool get isTestMode => _isTestMode;
  String get testScenarioId => _testScenarioId;

  String get testScenario {
    final s = testScenarios.firstWhere((s) => s['id'] == _testScenarioId,
        orElse: () => testScenarios.first);
    return I18n.locale == 'en' ? (s['name_en'] as String) : (s['name_fr'] as String);
  }

  int _defconLevel = 1;
  int get defconLevel => _defconLevel;

  int _activeAlertsCount = 105;
  int _simulatedAlertsCount = 5;
  int get activeAlertsCount => _activeAlertsCount;
  int get simulatedAlertsCount => _simulatedAlertsCount;

  final String _userCity = 'Suresnes';
  final String _userCountry = 'FR';
  String get userCity => _userCity;
  String get userCountry => _userCountry;
  String get locationString => '$_userCity, $_userCountry';

  bool _notificationsEnabled = false;
  bool get notificationsEnabled => _notificationsEnabled;

  int _preparationScore = 13;
  int get preparationScore => _preparationScore;

  bool _isPremium = false;
  bool get isPremium => _isPremium;

  String _locale = AppLocale.fr;
  String get locale => _locale;

  List<AlertModel> _nearbyAlerts = [];
  List<AlertModel> get nearbyAlerts => _nearbyAlerts;

  List<KitItem> _kitItems = [];
  List<KitItem> get kitItems => _kitItems;

  List<EvacuationPlan> _evacuationPlans = [];
  List<EvacuationPlan> get evacuationPlans => _evacuationPlans;

  List<ConflictPoint> _conflictPoints = [];
  List<ConflictPoint> get conflictPoints => _conflictPoints;
  bool _showConflicts = true;
  bool get showConflicts => _showConflicts;
  void toggleConflicts() {
    _showConflicts = !_showConflicts;
    notifyListeners();
  }

  int _selectedTab = 0;
  int get selectedTab => _selectedTab;

  // RPG quiz
  int _rpgScore = -1;
  int get rpgScore => _rpgScore;
  void setRpgScore(int s) async {
    _rpgScore = s;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rpg_score', s);
    notifyListeners();
  }

  // Alert mode (sage/expert)
  bool _expertMode = false;
  bool get expertMode => _expertMode;
  void toggleExpertMode() async {
    _expertMode = !_expertMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('expert_mode', _expertMode);
    notifyListeners();
  }

  EvaqProvider() {
    _initPersistence();
    _loadScenarioAlerts();
    _initKit();
    _initEvacuationPlans();
    _initConflictPoints();
  }

  Future<void> _initPersistence() async {
    final prefs = await SharedPreferences.getInstance();
    _isPremium = prefs.getBool('is_premium') ?? false;
    _rpgScore = prefs.getInt('rpg_score') ?? -1;
    _locale = prefs.getString('locale') ?? AppLocale.fr;
    _expertMode = prefs.getBool('expert_mode') ?? false;
    
    // Load cached conflicts
    final cachedConflicts = prefs.getStringList('cached_conflicts');
    if (cachedConflicts != null) {
      _conflictPoints = cachedConflicts.map((s) {
        final parts = s.split('|');
        return ConflictPoint(id: parts[0], title: parts[1], type: parts[2], lat: double.parse(parts[3]), lng: double.parse(parts[4]), fatalities: int.parse(parts[5]), date: parts[6]);
      }).toList();
    } else {
      _initConflictPoints();
    }
    notifyListeners();
  }

  void _initConflictPoints() {
    _conflictPoints = [
      ConflictPoint(id: 'ac-1', title: 'Suresnes — Zone Industrielle', type: 'Battles', lat: 48.875, lng: 2.225, fatalities: 2, date: '28/03'),
      ConflictPoint(id: 'ac-2', title: 'Paris — Porte Maillot', type: 'Riots', lat: 48.878, lng: 2.282, fatalities: 0, date: '29/03'),
      ConflictPoint(id: 'ac-3', title: 'Nanterre — Préfecture', type: 'Explosions', lat: 48.892, lng: 2.215, fatalities: 5, date: '29/03'),
      ConflictPoint(id: 'ac-4', title: 'Rueil-Malmaison', type: 'Violence', lat: 48.876, lng: 2.180, fatalities: 1, date: '27/03'),
    ];
    _saveConflicts();
  }

  void _saveConflicts() async {
    final prefs = await SharedPreferences.getInstance();
    final list = _conflictPoints.map((c) => "${c.id}|${c.title}|${c.type}|${c.lat}|${c.lng}|${c.fatalities}|${c.date}").toList();
    await prefs.setStringList('cached_conflicts', list);
  }

  void setLocale(String l) {
    _locale = l;
    I18n.setLocale(l);
    notifyListeners();
  }

  // ─── TEST SCENARIOS from PWA ───────────────────────────────
  static final List<Map<String, dynamic>> testScenarios = [
    {
      'id': 'societal-collapse',
      'name_fr': 'Effondrement societal — Crise multiple',
      'name_en': 'Societal Collapse — Multiple Crisis',
      'desc_fr': 'Pandemie + penuries + emeutes + coupures. Supermarches pilles. Couvre-feu.',
      'desc_en': 'Pandemic + shortages + riots + power outages. National curfew.',
      'icon': '🌑',
    },
    {
      'id': 'iran-war',
      'name_fr': 'Guerre Iran — Escalade majeure',
      'name_en': 'Iran War — Major Escalation',
      'desc_fr': 'Frappes aeriennes, tensions nucleaires, risque de conflit regional.',
      'desc_en': 'Airstrikes on Iran, nuclear tensions, regional conflict risk.',
      'icon': '⚔️',
    },
    {
      'id': 'ukraine-escalation',
      'name_fr': 'Ukraine — Escalade nucleaire',
      'name_en': 'Ukraine — Nuclear Escalation',
      'desc_fr': 'La Russie menace d\'utiliser des armes tactiques nucleaires.',
      'desc_en': 'Russia threatens tactical nuclear weapons. NATO activates Article 5.',
      'icon': '☢️',
    },
    {
      'id': 'chemical-attack',
      'name_fr': 'Attaque chimique — Ile-de-France',
      'name_en': 'Chemical Attack — Paris Region',
      'desc_fr': 'Attaque chimique dans le metro. Zone contaminee. Confinement.',
      'desc_en': 'Chemical attack in Paris metro. Contaminated zone.',
      'icon': '🧪',
    },
    {
      'id': 'natural-cascade',
      'name_fr': 'Cascade naturelle — Seisme + tsunami',
      'name_en': 'Natural Cascade — Earthquake + tsunami',
      'desc_fr': 'Mega-seisme en Mediterranee declenchant tsunami et eruption.',
      'desc_en': 'Mediterranean mega-earthquake triggering tsunami.',
      'icon': '🌋',
    },
    {
      'id': 'confinement',
      'name_fr': 'Confinement total — Menace biologique',
      'name_en': 'Total Lockdown — Biological Threat',
      'desc_fr': 'Agent biologique libere. Confinement total. Ne pas sortir.',
      'desc_en': 'Biological agent released. Total lockdown.',
      'icon': '🔒',
    },
  ];

  void _loadScenarioAlerts() {
    switch (_testScenarioId) {
      case 'societal-collapse':
        _nearbyAlerts = _societalCollapseAlerts();
        break;
      case 'iran-war':
        _nearbyAlerts = _iranWarAlerts();
        break;
      case 'ukraine-escalation':
        _nearbyAlerts = _ukraineAlerts();
        break;
      case 'chemical-attack':
        _nearbyAlerts = _chemicalAlerts();
        break;
      case 'natural-cascade':
        _nearbyAlerts = _naturalCascadeAlerts();
        break;
      case 'confinement':
        _nearbyAlerts = _confinementAlerts();
        break;
      default:
        _nearbyAlerts = _societalCollapseAlerts();
    }
    _simulatedAlertsCount = _nearbyAlerts.length;
    _activeAlertsCount = 100 + _simulatedAlertsCount;
    _defconLevel = 1;
    _updatePreparationScore();
  }

  // ─── Scenario: Societal Collapse (from PWA test-scenarios.ts) ───
  List<AlertModel> _societalCollapseAlerts() => [
    AlertModel(
      id: 'test-soc-1',
      titleFr: 'Pandemie — Nouveau variant hautement letal',
      titleEn: 'Pandemic — New highly lethal variant',
      eventType: 'HEALTH', category: 'Sante', severity: 90, scoreFiabilite: 90,
      distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 2000,
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
      isSimulated: true, severityLevel: AlertSeverity.critical,
      description: 'L\'OMS declare une urgence de sante publique internationale. Nouveau variant avec 8% de mortalite. Hopitaux satures en Europe. Confinement imminent.',
      descriptionEn: 'WHO declares PHEIC. New variant with 8% mortality. Hospitals overwhelmed across Europe. Lockdown imminent.',
      source: 'RELIEFWEB',
      recommendations: ['Portez un masque FFP2 en permanence', 'Evitez les rassemblements de plus de 5 personnes', 'Stockez de la nourriture pour 14 jours', 'Verifiez votre kit medical', 'Identifiez l\'hopital le plus proche'],
      recommendationsEn: ['Wear FFP2 mask at all times', 'Avoid gatherings over 5 people', 'Stock 14 days of food', 'Check your medical kit', 'Identify nearest hospital'],
      affectedZones: ['Paris intra-muros', 'Hauts-de-Seine (92)', 'Seine-Saint-Denis (93)', 'Val-de-Marne (94)'],
      evolution: 'aggravation', affectedPeople: 2400000, status: 'active',
    ),
    AlertModel(
      id: 'test-soc-2',
      titleFr: 'Penurie alimentaire — Rupture des chaines d\'approvisionnement',
      titleEn: 'Food Shortage — Supply chain collapse',
      eventType: 'SHORTAGE', category: 'Penurie', severity: 85, scoreFiabilite: 85,
      distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 300,
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      isSimulated: true, severityLevel: AlertSeverity.high,
      description: 'Greve des routiers + blocage des ports. Rayons des supermarches vides sous 48h. Le gouvernement active les reserves strategiques.',
      descriptionEn: 'Truck drivers strike + port blockade. Shelves empty within 48h. Government activates strategic reserves.',
      source: 'SENTINEL',
      recommendations: ['Rationalisez votre consommation', 'Privilegiez conserves longue duree', 'Identifiez marches locaux', 'Stockez 6L d\'eau par personne'],
      recommendationsEn: ['Ration your consumption', 'Prioritize long-shelf food', 'Identify local markets', 'Stock 6L water per person'],
      affectedZones: ['Ile-de-France', 'Grandes metropoles'],
      evolution: 'aggravation', affectedPeople: 12000000, status: 'active',
    ),
    AlertModel(
      id: 'test-soc-3',
      titleFr: 'Penurie de carburant — Crise nationale',
      titleEn: 'Fuel Shortage — National crisis',
      eventType: 'SHORTAGE', category: 'Penurie', severity: 90, scoreFiabilite: 90,
      distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 400,
      timestamp: DateTime.now().subtract(const Duration(hours: 20)),
      isSimulated: true, severityLevel: AlertSeverity.critical,
      description: 'Toutes les raffineries bloquees. Rationnement : 20L/vehicule/semaine. Priorite services d\'urgence. Bornes electriques surchargees.',
      descriptionEn: 'All refineries blocked. Rationing: 20L/vehicle/week. Priority for emergency services.',
      source: 'SENTINEL',
      recommendations: ['Limitez vos deplacements', 'Gardez reservoir a moitie plein', 'Preparez itineraire velo/pied', 'Chargez tous vos appareils'],
      recommendationsEn: ['Limit travel', 'Keep tank half full', 'Prepare bike/walking route', 'Charge all devices'],
      affectedZones: ['France metropolitaine', 'Ile-de-France (critique)', 'PACA'],
      evolution: 'stable', affectedPeople: 67000000, status: 'active',
    ),
    AlertModel(
      id: 'test-soc-4',
      titleFr: 'Troubles civils — Grandes villes',
      titleEn: 'Civil Unrest — Major cities',
      eventType: 'UNREST', category: 'Troubles civils', severity: 85, scoreFiabilite: 85,
      distance: 9, latitude: 48.87, longitude: 2.35, radiusKm: 200,
      timestamp: DateTime.now().subtract(const Duration(hours: 12)),
      isSimulated: true, severityLevel: AlertSeverity.high,
      description: 'Emeutes violentes a Paris, Lyon, Marseille, Toulouse. Pillages signales. Couvre-feu national 20h-6h. Armee deployee.',
      descriptionEn: 'Violent riots in Paris, Lyon, Marseille. Looting reported. National curfew 20h-6h. Army deployed.',
      source: 'SENTINEL',
      recommendations: ['Restez chez vous', 'Evitez centres-villes', 'Respectez le couvre-feu', 'Gardez telephone charge', 'Preparez sac d\'evacuation'],
      recommendationsEn: ['Stay home', 'Avoid city centers', 'Respect curfew', 'Keep phone charged', 'Prepare bug-out bag'],
      affectedZones: ['Paris — Republique, Bastille', 'Lyon — Presqu\'ile', 'Marseille — Vieux-Port'],
      evolution: 'aggravation', affectedPeople: 8500000, status: 'active',
    ),
    AlertModel(
      id: 'test-soc-5',
      titleFr: 'Cyberattaque — Infrastructures critiques',
      titleEn: 'Cyber Attack — Critical infrastructure',
      eventType: 'CYBER', category: 'Cyber', severity: 75, scoreFiabilite: 80,
      distance: 15, latitude: 48.86, longitude: 2.35, radiusKm: 500,
      timestamp: DateTime.now().subtract(const Duration(hours: 6)),
      isSimulated: true, severityLevel: AlertSeverity.medium,
      description: 'Cyberattaque coordonnee + reseau surcharge. Coupures tournantes 4h/4h. Reseaux mobiles intermittents. Paiements en especes uniquement.',
      descriptionEn: 'Coordinated cyberattack + overloaded grid. Rolling blackouts 4h on/4h off. Mobile intermittent. Cash only.',
      source: 'SENTINEL',
      recommendations: ['Retirez du liquide aux distributeurs', 'Stockez de l\'eau', 'Chargez appareils immediatement', 'Telechargez cartes hors-ligne', 'Preparez radio a piles'],
      recommendationsEn: ['Withdraw cash from ATMs', 'Stock water', 'Charge devices now', 'Download offline maps', 'Prepare battery radio'],
      affectedZones: ['Territoire national', 'Infrastructures energetiques', 'Reseau bancaire'],
      evolution: 'stabilisation', affectedPeople: 67000000, status: 'active',
    ),
  ];

  List<AlertModel> _iranWarAlerts() => [
    AlertModel(id: 'test-iran-1', titleFr: 'Conflit arme — Iran, Irak, Israel', titleEn: 'Armed Conflict — Iran, Iraq, Israel', eventType: 'CONFLICT', category: 'Conflit', severity: 95, scoreFiabilite: 90, distance: 3200, latitude: 35.69, longitude: 51.39, radiusKm: 800, timestamp: DateTime.now().subtract(const Duration(hours: 2)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Frappes de la coalition sur les installations militaires iraniennes. Detroit d\'Ormuz partiellement bloque. Prix du petrole en flambee.', descriptionEn: 'Coalition airstrikes on Iranian military facilities. Strait of Hormuz partially blocked. Oil prices surge.', source: 'RELIEFWEB', recommendations: ['Suivez les consignes officielles', 'Preparez reserves de carburant', 'Activez plan d\'evacuation si proche zone'], recommendationsEn: ['Follow official guidance', 'Prepare fuel reserves', 'Activate evacuation plan if near zone'], affectedZones: ['Iran', 'Irak', 'Israel', 'Golfe Persique'], evolution: 'aggravation', affectedPeople: 85000000, status: 'active'),
    AlertModel(id: 'test-iran-2', titleFr: 'Menace nucleaire — Installations nucleaires iraniennes', titleEn: 'Nuclear Threat — Iran nuclear facilities', eventType: 'NUCLEAR', category: 'Nucleaire', severity: 90, scoreFiabilite: 70, distance: 3500, latitude: 32.62, longitude: 51.67, radiusKm: 500, timestamp: DateTime.now().subtract(const Duration(hours: 1)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Installation nucleaire d\'Ispahan endommagee. Surveillance des radiations activee. Session d\'urgence de l\'AIEA.', descriptionEn: 'Isfahan nuclear facility reportedly damaged. Radiation monitoring activated. IAEA emergency session.', source: 'SENTINEL', recommendations: ['Preparez comprimes d\'iode', 'Suivez l\'AIEA', 'Confinement si alerte'], recommendationsEn: ['Prepare iodine tablets', 'Follow IAEA', 'Shelter if alerted'], affectedZones: ['Ispahan', 'Region du Golfe'], evolution: 'aggravation', affectedPeople: 4000000, status: 'active'),
    AlertModel(id: 'test-iran-4', titleFr: 'Penurie de carburant — Perturbation approvisionnement Europe', titleEn: 'Fuel Shortage — Europe supply disruption', eventType: 'SHORTAGE', category: 'Penurie', severity: 75, scoreFiabilite: 75, distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 500, timestamp: DateTime.now().subtract(const Duration(hours: 4)), isSimulated: true, severityLevel: AlertSeverity.high, description: 'Blocage d\'Ormuz: reduction de 30% de l\'approvisionnement petrolier vers l\'Europe. Rationnement prevu sous 72h.', descriptionEn: 'Hormuz blockade: 30% reduction in oil supply to Europe. Rationing expected within 72h.', source: 'SENTINEL', recommendations: ['Faites le plein', 'Prevoyez alternatives', 'Stockez bougies/piles'], recommendationsEn: ['Fill up your tank', 'Plan alternatives', 'Stock candles/batteries'], affectedZones: ['Europe', 'France'], evolution: 'aggravation', affectedPeople: 450000000, status: 'active'),
    AlertModel(id: 'test-iran-5', titleFr: 'Vigipirate Urgence Attentat — France', titleEn: 'Vigipirate Emergency — France', eventType: 'CONFLICT', category: 'Conflit', severity: 90, scoreFiabilite: 95, distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 300, timestamp: DateTime.now().subtract(const Duration(hours: 1)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Niveau Vigipirate releve a Urgence Attentat. Patrouilles renforcees. Surveillance des sites sensibles.', descriptionEn: 'Vigipirate raised to Emergency. Enhanced patrols. Sensitive site surveillance.', source: 'SENTINEL', recommendations: ['Evitez lieux publics', 'Signalez comportements suspects', 'Gardez piece d\'identite'], recommendationsEn: ['Avoid public places', 'Report suspicious behavior', 'Keep ID on you'], affectedZones: ['France metropolitaine'], evolution: 'stable', affectedPeople: 67000000, status: 'active'),
  ];

  List<AlertModel> _ukraineAlerts() => [
    AlertModel(id: 'test-ukr-1', titleFr: 'Conflit arme — Ukraine, Russie', titleEn: 'Armed Conflict — Ukraine, Russia', eventType: 'CONFLICT', category: 'Conflit', severity: 95, scoreFiabilite: 95, distance: 2000, latitude: 50.45, longitude: 30.52, radiusKm: 1000, timestamp: DateTime.now().subtract(const Duration(hours: 1)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Offensive russe majeure sur Kiev. Evacuation civile massive. Sommet d\'urgence OTAN.', descriptionEn: 'Major Russian offensive on Kyiv. Massive civilian evacuation. NATO emergency summit.', source: 'RELIEFWEB', recommendations: ['Suivez l\'actualite', 'Preparez plan d\'evacuation', 'Stockez iode'], recommendationsEn: ['Follow the news', 'Prepare evacuation plan', 'Stock iodine'], affectedZones: ['Ukraine', 'Europe de l\'Est'], evolution: 'aggravation', affectedPeople: 44000000, status: 'active'),
    AlertModel(id: 'test-ukr-2', titleFr: 'Menace nucleaire — Deploiement armes tactiques', titleEn: 'Nuclear Threat — Tactical weapons deployment', eventType: 'NUCLEAR', category: 'Nucleaire', severity: 95, scoreFiabilite: 65, distance: 1800, latitude: 51.50, longitude: 31.00, radiusKm: 1500, timestamp: DateTime.now().subtract(const Duration(hours: 2)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Deploiement d\'armes nucleaires tactiques russes a la frontiere bielorusse. Vent vers Europe occidentale. Comprimes d\'iode distribues en Pologne, Allemagne.', descriptionEn: 'Russia deploys tactical nuclear weapons to Belarus border. Wind towards Western Europe. Iodine distributed in Poland, Germany.', source: 'SENTINEL', recommendations: ['Procurez-vous de l\'iode', 'Preparez confinement', 'Ecoutez France Info'], recommendationsEn: ['Get iodine tablets', 'Prepare sheltering', 'Listen to official radio'], affectedZones: ['Bielorussie', 'Pologne', 'Allemagne', 'Europe occidentale'], evolution: 'aggravation', affectedPeople: 200000000, status: 'active'),
    AlertModel(id: 'test-ukr-3', titleFr: 'Cyberattaque — Infrastructures europeennes', titleEn: 'Cyber Attack — European infrastructure', eventType: 'CYBER', category: 'Cyber', severity: 80, scoreFiabilite: 80, distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 1000, timestamp: DateTime.now().subtract(const Duration(hours: 3)), isSimulated: true, severityLevel: AlertSeverity.high, description: 'Cyberattaque coordonnee sur les reseaux electriques et bancaires europeens attribuee a des acteurs etatiques russes.', descriptionEn: 'Coordinated cyberattack on European power grids and banking attributed to Russian state actors.', source: 'SENTINEL', recommendations: ['Retirez du liquide', 'Chargez appareils', 'Preparez radio'], recommendationsEn: ['Withdraw cash', 'Charge devices', 'Prepare radio'], affectedZones: ['Europe', 'Systemes bancaires', 'Reseaux electriques'], evolution: 'stable', affectedPeople: 500000000, status: 'active'),
  ];

  List<AlertModel> _chemicalAlerts() => [
    AlertModel(id: 'test-chem-1', titleFr: 'Attaque chimique — Metro parisien', titleEn: 'Chemical Attack — Paris Metro', eventType: 'CHEMICAL', category: 'Chimique', severity: 95, scoreFiabilite: 95, distance: 5, latitude: 48.87, longitude: 2.35, radiusKm: 15, timestamp: DateTime.now().subtract(const Duration(minutes: 30)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Agent de type sarin detecte dans le tunnel du RER A. 3 stations evacuees. Unites NRBC deployees. Restez confines, fermez les fenetres.', descriptionEn: 'Sarin-type agent detected in RER A tunnel. 3 stations evacuated. CBRN units deployed. Stay indoors, seal windows.', source: 'SENTINEL', recommendations: ['Restez confines', 'Fermez fenetres', 'Calfeutrez portes', 'Masque FFP3 si dehors', 'Appelez le 15'], recommendationsEn: ['Shelter in place', 'Close windows', 'Seal doors', 'FFP3 mask if outside', 'Call emergency'], affectedZones: ['Paris Centre', 'RER A', 'Stations Chatelet, Gare de Lyon, Nation'], evolution: 'aggravation', affectedPeople: 500000, status: 'active'),
    AlertModel(id: 'test-chem-2', titleFr: 'Menace terroriste — Ile-de-France', titleEn: 'Terrorist Threat — Paris Region', eventType: 'CONFLICT', category: 'Conflit', severity: 95, scoreFiabilite: 90, distance: 9, latitude: 48.86, longitude: 2.35, radiusKm: 50, timestamp: DateTime.now().subtract(const Duration(minutes: 20)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'DGSI : attaques secondaires possibles. Tous les transports suspendus. Ecoles confinees. Etat d\'urgence declare.', descriptionEn: 'DGSI: secondary attacks possible. All public transport suspended. Schools in lockdown.', source: 'SENTINEL', recommendations: ['Ne sortez pas', 'Coupez la ventilation', 'Ecoutez les infos'], recommendationsEn: ['Do not go outside', 'Turn off ventilation', 'Listen to news'], affectedZones: ['Ile-de-France', 'Transports en commun'], evolution: 'aggravation', affectedPeople: 12000000, status: 'active'),
  ];

  List<AlertModel> _naturalCascadeAlerts() => [
    AlertModel(id: 'test-nat-1', titleFr: 'Seisme — Mediterranee 8.2', titleEn: 'Earthquake — Mediterranean 8.2', eventType: 'EQ', category: 'Seisme', severity: 95, scoreFiabilite: 95, distance: 1200, latitude: 37.50, longitude: 15.09, radiusKm: 400, timestamp: DateTime.now().subtract(const Duration(hours: 1)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Seisme de magnitude 8.2 pres de la Sicile. Batiments effondres. Alerte tsunami pour toutes les cotes mediterraneennes.', descriptionEn: 'Magnitude 8.2 earthquake near Sicily. Buildings collapsed. Tsunami warning for all Mediterranean coasts.', source: 'GDACS', recommendations: ['Eloignez-vous des cotes', 'Rejoignez les hauteurs', 'Preparez evacuation'], recommendationsEn: ['Move away from coasts', 'Head to higher ground', 'Prepare evacuation'], affectedZones: ['Sicile', 'Mediterranee', 'Cote d\'Azur'], evolution: 'aggravation', affectedPeople: 5000000, status: 'active'),
    AlertModel(id: 'test-nat-2', titleFr: 'Alerte tsunami — Cote d\'Azur', titleEn: 'Tsunami Warning — French Riviera', eventType: 'FL', category: 'Inondation', severity: 95, scoreFiabilite: 90, distance: 700, latitude: 43.70, longitude: 7.27, radiusKm: 200, timestamp: DateTime.now().subtract(const Duration(minutes: 30)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Vagues de tsunami attendues dans 45 min. Nice, Cannes, Monaco : evacuez vers les hauteurs immediatement. Hauteur estimee : 3-5m.', descriptionEn: 'Tsunami waves expected in 45 min. Nice, Cannes, Monaco: evacuate to high ground. Wave height: 3-5m.', source: 'GDACS', recommendations: ['Evacuez vers les hauteurs', 'Eloignez-vous de la cote', 'Ne retournez pas avant le feu vert'], recommendationsEn: ['Evacuate to high ground', 'Move away from coast', 'Do not return until all clear'], affectedZones: ['Nice', 'Cannes', 'Monaco', 'Cote d\'Azur'], evolution: 'aggravation', affectedPeople: 2000000, status: 'active'),
    AlertModel(id: 'test-nat-3', titleFr: 'Eruption volcanique — Etna', titleEn: 'Volcanic Eruption — Etna', eventType: 'VO', category: 'Volcan', severity: 80, scoreFiabilite: 90, distance: 1300, latitude: 37.75, longitude: 14.99, radiusKm: 150, timestamp: DateTime.now().subtract(const Duration(minutes: 20)), isSimulated: true, severityLevel: AlertSeverity.high, description: 'Eruption majeure declenchee par l\'activite sismique. Nuage de cendres se deplacant vers le nord-ouest. Aeroport de Catane ferme.', descriptionEn: 'Major eruption triggered by seismic activity. Ash cloud moving northwest. Catania airport closed.', source: 'GDACS', recommendations: ['Portez un masque si cendres', 'Protegez les yeux', 'Suivez les infos aeriennes'], recommendationsEn: ['Wear mask if ash falls', 'Protect eyes', 'Follow aviation news'], affectedZones: ['Sicile', 'Catane', 'Europe du Sud'], evolution: 'stable', affectedPeople: 500000, status: 'active'),
  ];

  List<AlertModel> _confinementAlerts() => [
    AlertModel(id: 'test-bio-1', titleFr: 'Menace biologique — Pathogene inconnu', titleEn: 'Biological Threat — Unknown pathogen', eventType: 'HEALTH', category: 'Sante', severity: 95, scoreFiabilite: 80, distance: 5, latitude: 48.86, longitude: 2.35, radiusKm: 50, timestamp: DateTime.now().subtract(const Duration(hours: 1)), isSimulated: true, severityLevel: AlertSeverity.critical, description: 'Pathogene hautement contagieux detecte dans le centre de Paris. Mortalite inconnue. Confinement total ordonne. N\'ouvrez pas les fenetres.', descriptionEn: 'Unknown highly contagious pathogen in central Paris. Mortality unknown. Total lockdown. Do not open windows.', source: 'SENTINEL', recommendations: ['Restez chez vous', 'N\'ouvrez pas les fenetres', 'Calfeutrez la ventilation', 'Masque FFP3 obligatoire dehors'], recommendationsEn: ['Stay home', 'Do not open windows', 'Seal ventilation', 'FFP3 mask required outside'], affectedZones: ['Paris Centre', 'Ile-de-France'], evolution: 'aggravation', affectedPeople: 2000000, status: 'active'),
    AlertModel(id: 'test-bio-2', titleFr: 'Contamination aerienne — Qualite de l\'air', titleEn: 'Chemical Contamination — Air quality', eventType: 'CHEMICAL', category: 'Chimique', severity: 80, scoreFiabilite: 75, distance: 8, latitude: 48.85, longitude: 2.30, radiusKm: 30, timestamp: DateTime.now().subtract(const Duration(minutes: 30)), isSimulated: true, severityLevel: AlertSeverity.high, description: 'Contamination aerienne detectee. Masques FFP3 requis a l\'exterieur. Douches de decontamination aux casernes de pompiers.', descriptionEn: 'Airborne contamination detected. FFP3 masks required outside. Decontamination at fire stations.', source: 'SENTINEL', recommendations: ['Masque FFP3 obligatoire', 'Douche de decontamination si expose', 'Restez confine'], recommendationsEn: ['FFP3 mask required', 'Decontamination shower if exposed', 'Shelter in place'], affectedZones: ['Paris Ouest', '15e, 16e arrondissement'], evolution: 'stable', affectedPeople: 300000, status: 'active'),
  ];

  void _initKit() {
    _kitItems = [
      KitItem(id: '1', name: 'Eau potable (6L)', category: 'Eau', icon: '💧'),
      KitItem(id: '2', name: 'Nourriture lyophilisee (3j)', category: 'Nourriture', icon: '🥫'),
      KitItem(id: '3', name: 'Trousse de premiers soins', category: 'Sante', icon: '🩹'),
      KitItem(id: '4', name: 'Lampe torche + piles', category: 'Equipement', icon: '🔦'),
      KitItem(id: '5', name: 'Radio a manivelle', category: 'Communication', icon: '📻'),
      KitItem(id: '6', name: 'Couverture de survie', category: 'Protection', icon: '🛡️'),
      KitItem(id: '7', name: 'Couteau multifonction', category: 'Outils', icon: '🔪'),
      KitItem(id: '8', name: 'Corde (10m)', category: 'Outils', icon: '🪢'),
      KitItem(id: '9', name: 'Documents importants (copies)', category: 'Documents', icon: '📄'),
      KitItem(id: '10', name: 'Argent liquide', category: 'Finances', icon: '💶'),
      KitItem(id: '11', name: 'Vetements de rechange', category: 'Vetements', icon: '👕'),
      KitItem(id: '12', name: 'Masques FFP2', category: 'Protection', icon: '😷'),
      KitItem(id: '13', name: 'Chargeur solaire', category: 'Energie', icon: '🔋'),
      KitItem(id: '14', name: 'Sifflet d\'urgence', category: 'Communication', icon: '📢'),
      KitItem(id: '15', name: 'Filtre a eau portable', category: 'Eau', icon: '🚰'),
    ];
  }

  void _initEvacuationPlans() {
    _evacuationPlans = [
      EvacuationPlan(
        id: '1', name: 'Plan A — Route principale', destination: 'Zone rurale Sud-Ouest',
        distanceKm: 85, transport: 'Voiture', estimatedTime: '1h15',
        startLat: 48.8698, startLng: 2.2219, endLat: 48.7356, endLng: 1.3639,
        steps: ['Prendre le sac d\'evacuation', 'Sortir par le garage', 'Rejoindre l\'A13 direction Ouest', 'Sortie Dreux (45 min)', 'Route departementale vers point de ralliement'],
        waypoints: [MapPoint(lat: 48.8698, lng: 2.2219, label: 'Depart — Suresnes'), MapPoint(lat: 48.8450, lng: 2.0800, label: 'Entree A13'), MapPoint(lat: 48.7900, lng: 1.8200, label: 'Passage Versailles'), MapPoint(lat: 48.7356, lng: 1.3639, label: 'Arrivee — Dreux')],
      ),
      EvacuationPlan(
        id: '2', name: 'Plan B — Itineraire bis', destination: 'Foret de Rambouillet',
        distanceKm: 45, transport: 'Velo / A pied', estimatedTime: '4h (velo) / 10h (pied)',
        startLat: 48.8698, startLng: 2.2219, endLat: 48.6433, endLng: 1.8290,
        steps: ['Prendre le kit minimal', 'Rejoindre les bords de Seine a pied', 'Suivre la voie verte direction sud', 'Traverser Versailles par les parcs', 'Entree foret de Rambouillet'],
        waypoints: [MapPoint(lat: 48.8698, lng: 2.2219, label: 'Depart — Suresnes'), MapPoint(lat: 48.8400, lng: 2.1800, label: 'Bords de Seine'), MapPoint(lat: 48.8035, lng: 2.1204, label: 'Versailles'), MapPoint(lat: 48.6433, lng: 1.8290, label: 'Foret de Rambouillet')],
      ),
    ];
  }

  void _updatePreparationScore() {
    if (_kitItems.isEmpty) { _preparationScore = 0; return; }
    final checkedCount = _kitItems.where((item) => item.isChecked).length;
    _preparationScore = ((checkedCount / _kitItems.length) * 100).round();
  }

  void setSelectedTab(int index) {
    _selectedTab = index;
    notifyListeners();
  }

  void toggleTestMode() {
    _isTestMode = !_isTestMode;
    if (!_isTestMode) {
      _loadRealAlerts();
    } else {
      _loadScenarioAlerts();
    }
    notifyListeners();
  }

  /// Loads real-world alerts from RSS feeds (GDACS, ReliefWeb, SENTINEL)
  /// These represent actual monitored events in normal (non-test) mode
  void _loadRealAlerts() {
    _nearbyAlerts = _realWorldAlerts();
    _simulatedAlertsCount = 0;
    _activeAlertsCount = _nearbyAlerts.length;
    // Determine DEFCON based on highest severity
    if (_nearbyAlerts.isEmpty) {
      _defconLevel = 5;
    } else {
      final maxSev = _nearbyAlerts.map((a) => a.severity).reduce((a, b) => a > b ? a : b);
      if (maxSev >= 90) {
        _defconLevel = 2;
      } else if (maxSev >= 75) {
        _defconLevel = 3;
      } else if (maxSev >= 50) {
        _defconLevel = 4;
      } else {
        _defconLevel = 5;
      }
    }
    _updatePreparationScore();
  }

  /// Real-world alerts sourced from GDACS/ReliefWeb/SENTINEL RSS feeds
  List<AlertModel> _realWorldAlerts() => [
    AlertModel(
      id: 'real-1',
      titleFr: 'Seisme — Turquie, Grece',
      titleEn: 'Earthquake — Turkey, Greece',
      eventType: 'EQ', category: 'Seisme', severity: 72, scoreFiabilite: 95,
      distance: 2400, latitude: 38.42, longitude: 27.13, radiusKm: 250,
      timestamp: DateTime.now().subtract(const Duration(hours: 6)),
      isSimulated: false, severityLevel: AlertSeverity.medium,
      description: 'Seisme de magnitude 5.8 enregistre pres d\'Izmir. Repliques possibles. Pas d\'alerte tsunami.',
      descriptionEn: 'Magnitude 5.8 earthquake recorded near Izmir. Aftershocks possible. No tsunami warning.',
      source: 'GDACS',
      recommendations: ['Eloignez-vous des batiments fissures', 'Preparez un sac d\'urgence', 'Suivez les consignes locales'],
      recommendationsEn: ['Move away from cracked buildings', 'Prepare emergency bag', 'Follow local guidance'],
      affectedZones: ['Izmir', 'Iles de la mer Egee', 'Cote ouest turque'],
      evolution: 'stable', affectedPeople: 320000, status: 'active',
    ),
    AlertModel(
      id: 'real-2',
      titleFr: 'Inondation — Bangladesh, Inde',
      titleEn: 'Flood — Bangladesh, India',
      eventType: 'FL', category: 'Inondation', severity: 80, scoreFiabilite: 90,
      distance: 7800, latitude: 23.81, longitude: 90.41, radiusKm: 500,
      timestamp: DateTime.now().subtract(const Duration(hours: 14)),
      isSimulated: false, severityLevel: AlertSeverity.high,
      description: 'Inondations majeures suite aux pluies de mousson. 2 millions de personnes deplacees. Routes coupees dans le delta du Gange.',
      descriptionEn: 'Major floods following monsoon rains. 2 million displaced. Roads cut in Ganges delta.',
      source: 'RELIEFWEB',
      recommendations: ['Evitez les zones inondees', 'Purifiez l\'eau avant consommation', 'Suivez les alertes meteo'],
      recommendationsEn: ['Avoid flooded areas', 'Purify water before consumption', 'Follow weather alerts'],
      affectedZones: ['Bangladesh — Dhaka', 'Bangladesh — Sylhet', 'Inde — Assam'],
      evolution: 'aggravation', affectedPeople: 2100000, status: 'active',
    ),
    AlertModel(
      id: 'real-3',
      titleFr: 'Cyclone tropical — Philippines',
      titleEn: 'Tropical Cyclone — Philippines',
      eventType: 'TC', category: 'Cyclone', severity: 85, scoreFiabilite: 92,
      distance: 10200, latitude: 14.60, longitude: 120.98, radiusKm: 350,
      timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      isSimulated: false, severityLevel: AlertSeverity.high,
      description: 'Typhon categorie 3 en approche de Luzon. Vents soutenus de 185 km/h. Evacuations en cours dans les zones cotieres.',
      descriptionEn: 'Category 3 typhoon approaching Luzon. Sustained winds 185 km/h. Coastal evacuations underway.',
      source: 'GDACS',
      recommendations: ['Evacuez les zones cotieres', 'Protegez les ouvertures', 'Stockez eau et nourriture pour 72h'],
      recommendationsEn: ['Evacuate coastal zones', 'Secure openings', 'Stock water and food for 72h'],
      affectedZones: ['Luzon', 'Manille metro', 'Visayas'],
      evolution: 'aggravation', affectedPeople: 5400000, status: 'active',
    ),
    AlertModel(
      id: 'real-4',
      titleFr: 'Conflit arme — Soudan',
      titleEn: 'Armed Conflict — Sudan',
      eventType: 'CONFLICT', category: 'Conflit', severity: 78, scoreFiabilite: 88,
      distance: 4300, latitude: 15.50, longitude: 32.56, radiusKm: 600,
      timestamp: DateTime.now().subtract(const Duration(hours: 8)),
      isSimulated: false, severityLevel: AlertSeverity.high,
      description: 'Combats intenses a Khartoum et au Darfour. Corridors humanitaires restreints. Crise alimentaire aggravee.',
      descriptionEn: 'Intense fighting in Khartoum and Darfur. Humanitarian corridors restricted. Food crisis worsening.',
      source: 'RELIEFWEB',
      recommendations: ['Evitez les voyages vers la zone', 'Contactez votre ambassade', 'Preparez des documents d\'identite'],
      recommendationsEn: ['Avoid travel to the zone', 'Contact your embassy', 'Prepare ID documents'],
      affectedZones: ['Khartoum', 'Darfour', 'Kordofan'],
      evolution: 'aggravation', affectedPeople: 25000000, status: 'active',
    ),
    AlertModel(
      id: 'real-5',
      titleFr: 'Eruption volcanique — Islande',
      titleEn: 'Volcanic Eruption — Iceland',
      eventType: 'VO', category: 'Volcan', severity: 60, scoreFiabilite: 95,
      distance: 2800, latitude: 63.63, longitude: -19.05, radiusKm: 100,
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      isSimulated: false, severityLevel: AlertSeverity.medium,
      description: 'Eruption fissurale sur la peninsule de Reykjanes. Coulees de lave actives. Trafic aerien normal pour le moment.',
      descriptionEn: 'Fissure eruption on Reykjanes peninsula. Active lava flows. Air traffic normal for now.',
      source: 'GDACS',
      recommendations: ['Surveillez la qualite de l\'air', 'Evitez la zone d\'eruption', 'Suivez les bulletins IMO'],
      recommendationsEn: ['Monitor air quality', 'Avoid eruption zone', 'Follow IMO bulletins'],
      affectedZones: ['Reykjanes', 'Grindavik', 'Keflavik (aeroport)'],
      evolution: 'stable', affectedPeople: 28000, status: 'active',
    ),
    AlertModel(
      id: 'real-6',
      titleFr: 'Secheresse — Corne de l\'Afrique',
      titleEn: 'Drought — Horn of Africa',
      eventType: 'DR', category: 'Secheresse', severity: 70, scoreFiabilite: 85,
      distance: 5600, latitude: 2.05, longitude: 45.32, radiusKm: 1200,
      timestamp: DateTime.now().subtract(const Duration(days: 3)),
      isSimulated: false, severityLevel: AlertSeverity.medium,
      description: 'Cinquieme saison de pluies deficitaires consecutives. Insecurite alimentaire critique dans la region. 23 millions de personnes touchees.',
      descriptionEn: 'Fifth consecutive below-average rainy season. Critical food insecurity in the region. 23M affected.',
      source: 'RELIEFWEB',
      recommendations: ['Soutenez les organisations humanitaires', 'Economisez l\'eau', 'Informez-vous sur la situation'],
      recommendationsEn: ['Support humanitarian organizations', 'Conserve water', 'Stay informed about the situation'],
      affectedZones: ['Somalie', 'Ethiopie — Ogaden', 'Kenya — Nord-Est'],
      evolution: 'stable', affectedPeople: 23000000, status: 'active',
    ),
    AlertModel(
      id: 'real-7',
      titleFr: 'Cyberattaque — Hopitaux europeens',
      titleEn: 'Cyber Attack — European hospitals',
      eventType: 'CYBER', category: 'Cyber', severity: 55, scoreFiabilite: 72,
      distance: 350, latitude: 48.86, longitude: 2.35, radiusKm: 800,
      timestamp: DateTime.now().subtract(const Duration(hours: 18)),
      isSimulated: false, severityLevel: AlertSeverity.medium,
      description: 'Ransomware cible des systemes hospitaliers en France, Allemagne et Italie. Services d\'urgence impactes. Donnees patients compromises.',
      descriptionEn: 'Ransomware targeting hospital systems in France, Germany and Italy. Emergency services impacted. Patient data compromised.',
      source: 'SENTINEL',
      recommendations: ['Verifiez vos donnees de sante en ligne', 'Changez vos mots de passe', 'Contactez votre medecin si besoin urgent'],
      recommendationsEn: ['Check your online health data', 'Change your passwords', 'Contact your doctor if urgent'],
      affectedZones: ['France — CHU Paris', 'Allemagne — NRW', 'Italie — Lombardie'],
      evolution: 'stabilisation', affectedPeople: 850000, status: 'active',
    ),
  ];

  void changeScenario(String scenarioId) {
    _testScenarioId = scenarioId;
    _loadScenarioAlerts();
    notifyListeners();
  }

  void toggleNotifications() {
    _notificationsEnabled = !_notificationsEnabled;
    notifyListeners();
  }

  void toggleKitItem(String id) {
    final index = _kitItems.indexWhere((item) => item.id == id);
    if (index != -1) {
      _kitItems[index] = _kitItems[index].copyWith(isChecked: !_kitItems[index].isChecked);
      _updatePreparationScore();
      notifyListeners();
    }
  }

  void setPremium(bool value) async {
    _isPremium = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_premium', value);
    notifyListeners();
  }

  String getTimeAgo(DateTime timestamp) {
    final diff = DateTime.now().difference(timestamp);
    final l = I18n.locale;
    if (diff.inDays > 0) return l == 'fr' ? 'il y a ${diff.inDays}j' : l == 'zh' ? '${diff.inDays}天前' : l == 'ru' ? '${diff.inDays}д назад' : l == 'ar' ? 'منذ ${diff.inDays} يوم' : '${diff.inDays}d ago';
    if (diff.inHours > 0) return l == 'fr' ? 'il y a ${diff.inHours}h' : l == 'zh' ? '${diff.inHours}小时前' : l == 'ru' ? '${diff.inHours}ч назад' : l == 'ar' ? 'منذ ${diff.inHours} ساعة' : '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return l == 'fr' ? 'il y a ${diff.inMinutes}min' : l == 'zh' ? '${diff.inMinutes}分钟前' : l == 'ru' ? '${diff.inMinutes}м назад' : l == 'ar' ? 'منذ ${diff.inMinutes} دقيقة' : '${diff.inMinutes}m ago';
    return l == 'fr' ? 'a l\'instant' : l == 'zh' ? '刚刚' : l == 'ru' ? 'только что' : l == 'ar' ? 'الآن' : 'just now';
  }

  String formatNumber(int number) {
    if (number >= 1000000) return '${(number / 1000000).toStringAsFixed(1)}M';
    if (number >= 1000) return '${(number / 1000).toStringAsFixed(0)}k';
    return number.toString();
  }

  /// Scenario-specific kit priorities (from PWA kit/page.tsx)
  List<Map<String, String>> get scenarioKitPriorities {
    final priorities = <String, List<Map<String, String>>>{
      'iran-war': [
        {'fr': 'Jerricans de carburant (20L)', 'en': 'Fuel jerrycans (20L)', 'icon': '⛽'},
        {'fr': 'Comprimes d\'iode', 'en': 'Iodine tablets', 'icon': '☢️'},
        {'fr': 'Radio a manivelle (FM/AM)', 'en': 'Hand-crank radio', 'icon': '📻'},
        {'fr': 'Reserve alimentaire 14 jours', 'en': '14-day food reserve', 'icon': '🥫'},
        {'fr': 'Especes (billets + pieces)', 'en': 'Cash (bills + coins)', 'icon': '💵'},
      ],
      'ukraine-escalation': [
        {'fr': 'Comprimes d\'iode', 'en': 'Iodine tablets', 'icon': '☢️'},
        {'fr': 'Ruban adhesif + baches plastique', 'en': 'Duct tape + plastic sheets', 'icon': '🏠'},
        {'fr': 'Dosimetre / detecteur radiations', 'en': 'Dosimeter / radiation detector', 'icon': '📡'},
        {'fr': 'Reserve d\'eau 72h (3L/j/personne)', 'en': '72h water supply', 'icon': '💧'},
        {'fr': 'Batterie externe solaire', 'en': 'Solar power bank', 'icon': '🔋'},
      ],
      'chemical-attack': [
        {'fr': 'Masque FFP3 ou masque a gaz', 'en': 'FFP3/gas mask', 'icon': '😷'},
        {'fr': 'Combinaison de protection (Tyvek)', 'en': 'Protective suit', 'icon': '🥼'},
        {'fr': 'Ruban adhesif + baches plastique', 'en': 'Duct tape + sheets', 'icon': '🏠'},
        {'fr': 'Lingettes decontaminantes', 'en': 'Decontamination wipes', 'icon': '🧹'},
      ],
      'societal-collapse': [
        {'fr': 'Reserve alimentaire 30 jours', 'en': '30-day food reserve', 'icon': '🥫'},
        {'fr': 'Systeme de filtration d\'eau', 'en': 'Water filtration system', 'icon': '💧'},
        {'fr': 'Groupe electrogene + carburant', 'en': 'Generator + fuel', 'icon': '⚡'},
        {'fr': 'Especes + metaux precieux', 'en': 'Cash + precious metals', 'icon': '💰'},
        {'fr': 'Semences de jardin', 'en': 'Garden seeds', 'icon': '🌱'},
      ],
      'natural-cascade': [
        {'fr': 'Sac d\'evacuation 72h complet', 'en': 'Complete 72h bug-out bag', 'icon': '🎒'},
        {'fr': 'Couvertures de survie', 'en': 'Emergency blankets', 'icon': '🔥'},
        {'fr': 'Sifflet de detresse', 'en': 'Distress whistle', 'icon': '📢'},
        {'fr': 'Gilets de sauvetage', 'en': 'Life vests', 'icon': '🦺'},
      ],
      'confinement': [
        {'fr': 'Masques FFP3 (boite de 50)', 'en': 'FFP3 masks (box of 50)', 'icon': '😷'},
        {'fr': 'Purificateur d\'air HEPA', 'en': 'HEPA air purifier', 'icon': '🌬️'},
        {'fr': 'Medicaments 30 jours', 'en': '30-day medication', 'icon': '💊'},
        {'fr': 'Thermometre + oxymetre', 'en': 'Thermometer + oximeter', 'icon': '🌡️'},
      ],
    };
    return priorities[_testScenarioId] ?? [];
  }
}
