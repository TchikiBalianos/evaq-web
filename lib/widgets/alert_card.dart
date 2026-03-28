import 'package:flutter/material.dart';
import '../models/alert_model.dart';
import '../utils/constants.dart';

class AlertCard extends StatelessWidget {
  final AlertModel alert;
  final String timeAgo;
  final VoidCallback? onTap;

  const AlertCard({
    super.key,
    required this.alert,
    required this.timeAgo,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: alert.severity >= 90
                ? AppColors.primary.withValues(alpha: 0.3)
                : AppColors.cardBorder,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Severity dot
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: _getSeverityColor(),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _getSeverityColor().withValues(alpha: 0.4),
                    blurRadius: 6,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (alert.isSimulated) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.simBadge.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'SIM',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.simBadge,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Expanded(
                        child: Text(
                          alert.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${alert.category} — ${alert.distance.toStringAsFixed(0)} km · $timeAgo',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Severity percentage
            Text(
              '${alert.severity}%',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: _getSeverityColor(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor() {
    if (alert.severity >= 90) return AppColors.primary;
    if (alert.severity >= 75) return AppColors.accent;
    if (alert.severity >= 50) return AppColors.warning;
    return AppColors.textMuted;
  }
}
