import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class ActionButton extends StatelessWidget {
  final String label;
  final String emoji;
  final VoidCallback onTap;

  const ActionButton({super.key, required this.label, required this.emoji, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 1))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // FIXED: constrain emoji size to prevent overflow on S9+
            Text(emoji, style: const TextStyle(fontSize: 26)),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class TestModeBanner extends StatelessWidget {
  final bool isTestMode;
  final String scenario;
  final VoidCallback onToggle;
  final VoidCallback onChangeScenario;

  const TestModeBanner({super.key, required this.isTestMode, required this.scenario, required this.onToggle, required this.onChangeScenario});

  @override
  Widget build(BuildContext context) {
    if (!isTestMode) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      color: AppColors.primaryLight,
      child: Row(
        children: [
          Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
          const SizedBox(width: 6),
          Text(I18n.t('test.mode'), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              scenario,
              style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ),
          GestureDetector(
            onTap: onChangeScenario,
            child: Text(I18n.t('test.change'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.warning)),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onToggle,
            child: Text(I18n.t('test.disable'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.info)),
          ),
        ],
      ),
    );
  }
}

class PreparationScoreCard extends StatelessWidget {
  final int score;
  const PreparationScoreCard({super.key, required this.score});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(I18n.t('dashboard.preparation_score'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Text('$score%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: _getScoreColor())),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(value: score / 100, minHeight: 7, backgroundColor: AppColors.divider, valueColor: AlwaysStoppedAnimation<Color>(_getScoreColor())),
          ),
          const SizedBox(height: 6),
          Text(I18n.t('dashboard.complete_kit'), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Color _getScoreColor() {
    if (score >= 70) return AppColors.success;
    if (score >= 40) return AppColors.warning;
    return AppColors.primary;
  }
}

class NotificationCard extends StatelessWidget {
  final bool enabled;
  final VoidCallback onToggle;
  const NotificationCard({super.key, required this.enabled, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(I18n.t('notif.title'), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 2),
              Text(enabled ? I18n.t('notif.active') : I18n.t('notif.inactive'), style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            ],
          ),
          ElevatedButton(
            onPressed: onToggle,
            style: ElevatedButton.styleFrom(
              backgroundColor: enabled ? AppColors.textMuted : AppColors.success,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              elevation: 0,
              minimumSize: const Size(0, 32),
            ),
            child: Text(enabled ? I18n.t('notif.disable') : I18n.t('notif.enable'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class LocationBadge extends StatelessWidget {
  final String location;
  const LocationBadge({super.key, required this.location});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 7, height: 7, decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle)),
          const SizedBox(width: 5),
          Text(location, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
