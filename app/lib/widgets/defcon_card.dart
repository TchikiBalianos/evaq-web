import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class DefconCard extends StatelessWidget {
  final int level;
  const DefconCard({super.key, required this.level});

  @override
  Widget build(BuildContext context) {
    final defcon = DefconLevel.levels.firstWhere((d) => d.level == level, orElse: () => DefconLevel.levels.last);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Text(
            I18n.t('dashboard.risk_level').toUpperCase(),
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(color: defcon.bgColor, borderRadius: BorderRadius.circular(24)),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: defcon.color.withValues(alpha: 0.8), shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Text(
                  'DEFCON ${defcon.level}',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: defcon.color, fontFamily: 'monospace', letterSpacing: 1),
                ),
                Text(
                  ' — ${I18n.t("defcon.${defcon.level}")}',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: defcon.color),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            I18n.t('defcon.msg.${defcon.level}'),
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
