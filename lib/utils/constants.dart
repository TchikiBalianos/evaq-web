import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFDC2626);
  static const Color primaryDark = Color(0xFFB91C1C);
  static const Color primaryLight = Color(0xFFFEE2E2);
  static const Color accent = Color(0xFFEF4444);
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textMuted = Color(0xFF9CA3AF);
  static const Color defconBlack = Color(0xFF1A1A1A);
  static const Color alertDot = Color(0xFFEF4444);
  static const Color simBadge = Color(0xFFDC2626);
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color divider = Color(0xFFF3F4F6);
}

class DefconLevel {
  final int level;
  final String label;
  final String description;
  final Color color;
  final Color bgColor;

  const DefconLevel({
    required this.level,
    required this.label,
    required this.description,
    required this.color,
    required this.bgColor,
  });

  static const List<DefconLevel> levels = [
    DefconLevel(
      level: 1,
      label: 'Urgence',
      description: 'Urgence imminente. Evacuez si necessaire.',
      color: Colors.white,
      bgColor: Color(0xFF1A1A1A),
    ),
    DefconLevel(
      level: 2,
      label: 'Critique',
      description: 'Situation critique. Preparez-vous a evacuer.',
      color: Colors.white,
      bgColor: Color(0xFFDC2626),
    ),
    DefconLevel(
      level: 3,
      label: 'Alerte',
      description: 'Risque eleve. Restez vigilant.',
      color: Colors.white,
      bgColor: Color(0xFFF59E0B),
    ),
    DefconLevel(
      level: 4,
      label: 'Vigilance',
      description: 'Risque modere. Surveillez la situation.',
      color: Color(0xFF1A1A1A),
      bgColor: Color(0xFFFDE68A),
    ),
    DefconLevel(
      level: 5,
      label: 'Normal',
      description: 'Situation normale. Aucun risque identifie.',
      color: Color(0xFF1A1A1A),
      bgColor: Color(0xFF86EFAC),
    ),
  ];
}
