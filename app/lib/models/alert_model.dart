import '../utils/i18n.dart';

class AlertModel {
  final String id;
  final String titleFr;
  final String titleEn;
  final String eventType;
  final String category;
  final double distance;
  final int severity;
  final int scoreFiabilite;
  final DateTime timestamp;
  final bool isSimulated;
  final AlertSeverity severityLevel;
  final String description;
  final String descriptionEn;
  final String source;
  final List<String> recommendations;
  final List<String> recommendationsEn;
  final List<String> affectedZones;
  final String evolution;
  final double latitude;
  final double longitude;
  final double radiusKm;
  final DateTime? lastUpdate;
  final int affectedPeople;
  final String status;

  /// Returns the title in the current locale
  String get title => I18n.locale == 'en' ? titleEn : titleFr;

  /// Returns the subtitle (category translated)
  String get subtitle => I18n.t('event.$eventType');

  /// Returns description in current locale
  String get localizedDescription => I18n.locale == 'en' && descriptionEn.isNotEmpty ? descriptionEn : description;

  /// Returns recommendations in current locale
  List<String> get localizedRecommendations =>
      I18n.locale == 'en' && recommendationsEn.isNotEmpty ? recommendationsEn : recommendations;

  AlertModel({
    required this.id,
    required this.titleFr,
    required this.titleEn,
    required this.eventType,
    required this.category,
    required this.distance,
    required this.severity,
    this.scoreFiabilite = 80,
    required this.timestamp,
    this.isSimulated = false,
    this.severityLevel = AlertSeverity.high,
    this.description = '',
    this.descriptionEn = '',
    this.source = 'EVAQ Intelligence',
    this.recommendations = const [],
    this.recommendationsEn = const [],
    this.affectedZones = const [],
    this.evolution = 'stable',
    this.latitude = 48.8698,
    this.longitude = 2.2219,
    this.radiusKm = 100,
    this.lastUpdate,
    this.affectedPeople = 0,
    this.status = 'active',
  });
}

enum AlertSeverity { critical, high, medium, low }

extension AlertSeverityExt on AlertSeverity {
  String get label {
    switch (this) {
      case AlertSeverity.critical: return I18n.t('severity.5');
      case AlertSeverity.high: return I18n.t('severity.4');
      case AlertSeverity.medium: return I18n.t('severity.3');
      case AlertSeverity.low: return I18n.t('severity.1');
    }
  }
}
