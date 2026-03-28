import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../models/alert_model.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class AlertDetailScreen extends StatelessWidget {
  final AlertModel alert;
  final String timeAgo;

  const AlertDetailScreen({super.key, required this.alert, required this.timeAgo});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(I18n.t('event.${alert.eventType}'), style: const TextStyle(fontSize: 16)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Severity badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getSeverityColor().withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 8, height: 8, decoration: BoxDecoration(color: _getSeverityColor(), shape: BoxShape.circle)),
                      const SizedBox(width: 6),
                      Text('${alert.severity}%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _getSeverityColor())),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                if (alert.isSimulated)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.simBadge.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('SIM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.simBadge)),
                  ),
                const Spacer(),
                Text(timeAgo, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
              ],
            ),

            const SizedBox(height: 16),

            // Title
            Text(alert.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.3)),

            const SizedBox(height: 8),

            // Meta info
            Wrap(
              spacing: 12,
              runSpacing: 4,
              children: [
                _metaChip(Icons.location_on_outlined, '${alert.distance.toStringAsFixed(0)} km'),
                _metaChip(Icons.radar, '${I18n.t("alerts.radius")}: ${alert.radiusKm.toStringAsFixed(0)} km'),
                _metaChip(Icons.source, '${I18n.t("alerts.source")}: ${alert.source}'),
                if (alert.scoreFiabilite > 0)
                  _metaChip(Icons.verified, '${alert.scoreFiabilite}%'),
              ],
            ),

            const SizedBox(height: 20),

            // Description
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Text(
                alert.localizedDescription,
                style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
              ),
            ),

            const SizedBox(height: 16),

            // Evolution
            _buildInfoRow(
              I18n.t('alerts.evolution'),
              _getEvolutionLabel(alert.evolution),
              _getEvolutionColor(alert.evolution),
              _getEvolutionIcon(alert.evolution),
            ),

            if (alert.affectedPeople > 0) ...[
              const SizedBox(height: 8),
              _buildInfoRow(
                I18n.t('alerts.affected'),
                _formatNumber(alert.affectedPeople),
                AppColors.textPrimary,
                Icons.people_outline,
              ),
            ],

            const SizedBox(height: 20),

            // Affected zones
            if (alert.affectedZones.isNotEmpty) ...[
              Text(
                I18n.t('alerts.affected_zones'),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              ...alert.affectedZones.map((zone) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Container(width: 6, height: 6, decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.5), shape: BoxShape.circle)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(zone, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary))),
                  ],
                ),
              )),
              const SizedBox(height: 20),
            ],

            // Recommendations
            if (alert.localizedRecommendations.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.warning.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.lightbulb_outline, size: 18, color: AppColors.warning),
                        const SizedBox(width: 8),
                        Text(
                          I18n.t('alerts.guide_title'),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...alert.localizedRecommendations.asMap().entries.map((entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 22, height: 22, margin: const EdgeInsets.only(top: 1),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: Center(child: Text('${entry.key + 1}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.warning))),
                          ),
                          const SizedBox(width: 10),
                          Expanded(child: Text(entry.value, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4))),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 20),

            // Interactive map showing alert location
            _buildAlertMap(),

            const SizedBox(height: 20),

            // See evacuation plan button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.map_rounded, size: 18),
                label: Text(I18n.t('alerts.see_plan')),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _metaChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.textMuted),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
          const Spacer(),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }

  String _getEvolutionLabel(String evo) {
    switch (evo) {
      case 'aggravation': return I18n.t('alerts.aggravation');
      case 'stabilisation': return I18n.t('alerts.stabilisation');
      default: return I18n.t('alerts.stable');
    }
  }

  Color _getEvolutionColor(String evo) {
    switch (evo) {
      case 'aggravation': return AppColors.primary;
      case 'stabilisation': return AppColors.info;
      default: return AppColors.warning;
    }
  }

  IconData _getEvolutionIcon(String evo) {
    switch (evo) {
      case 'aggravation': return Icons.trending_up;
      case 'stabilisation': return Icons.trending_down;
      default: return Icons.trending_flat;
    }
  }

  Color _getSeverityColor() {
    if (alert.severity >= 90) return AppColors.primary;
    if (alert.severity >= 75) return AppColors.accent;
    if (alert.severity >= 50) return AppColors.warning;
    return AppColors.textMuted;
  }

  String _formatNumber(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(0)}k';
    return n.toString();
  }

  Widget _buildAlertMap() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.map_outlined, size: 18, color: AppColors.textPrimary),
            const SizedBox(width: 8),
            Text(
              I18n.t('alerts.affected_zones'),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          height: 220,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 3))],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Stack(
              children: [
                Container(
                  color: const Color(0xFFE8EEF1),
                  child: CustomPaint(
                    size: const Size(double.infinity, 220),
                    painter: _AlertMapPainter(
                      lat: alert.latitude,
                      lng: alert.longitude,
                      radiusKm: alert.radiusKm,
                      severity: alert.severity,
                    ),
                  ),
                ),
                // Coordinates overlay
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4)],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.location_on, size: 12, color: _getSeverityColor()),
                        const SizedBox(width: 4),
                        Text(
                          '${alert.latitude.toStringAsFixed(2)}, ${alert.longitude.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ),
                // Radius badge
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                    decoration: BoxDecoration(
                      color: _getSeverityColor(),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.radar, size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          '${alert.radiusKm.toStringAsFixed(0)} km',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
                // Source badge
                Positioned(
                  bottom: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      alert.source,
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AlertMapPainter extends CustomPainter {
  final double lat;
  final double lng;
  final double radiusKm;
  final int severity;

  _AlertMapPainter({
    required this.lat,
    required this.lng,
    required this.radiusKm,
    required this.severity,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Paint()..color = const Color(0xFFE8EEF1),
    );

    // Grid lines (map tiles simulation)
    final gridPaint = Paint()
      ..color = const Color(0xFFD1D9DE)
      ..strokeWidth = 0.5;
    for (double x = 0; x < size.width; x += 25) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 25) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Simulated terrain features
    final parkPaint = Paint()..color = const Color(0xFFD4E8D0).withValues(alpha: 0.5);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.1, size.height * 0.15, 60, 45),
        const Radius.circular(8),
      ),
      parkPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.65, size.height * 0.6, 55, 40),
        const Radius.circular(8),
      ),
      parkPaint,
    );

    // Water feature
    final waterPaint = Paint()..color = const Color(0xFFB3D4E8).withValues(alpha: 0.4);
    final waterPath = Path()
      ..moveTo(0, size.height * 0.45)
      ..quadraticBezierTo(size.width * 0.25, size.height * 0.5, size.width * 0.5, size.height * 0.42)
      ..quadraticBezierTo(size.width * 0.75, size.height * 0.35, size.width, size.height * 0.4)
      ..lineTo(size.width, size.height * 0.48)
      ..quadraticBezierTo(size.width * 0.75, size.height * 0.43, size.width * 0.5, size.height * 0.5)
      ..quadraticBezierTo(size.width * 0.25, size.height * 0.58, 0, size.height * 0.53)
      ..close();
    canvas.drawPath(waterPath, waterPaint);

    // Roads
    final roadPaint = Paint()
      ..color = const Color(0xFFCDD5DA)
      ..strokeWidth = 2.5;
    canvas.drawLine(
      Offset(size.width * 0.2, 0),
      Offset(size.width * 0.4, size.height),
      roadPaint,
    );
    canvas.drawLine(
      Offset(0, size.height * 0.3),
      Offset(size.width, size.height * 0.65),
      roadPaint,
    );

    // Alert zone center
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Severity-based color
    Color alertColor;
    if (severity >= 90) {
      alertColor = const Color(0xFFDC2626);
    } else if (severity >= 75) {
      alertColor = const Color(0xFFEF4444);
    } else if (severity >= 50) {
      alertColor = const Color(0xFFF59E0B);
    } else {
      alertColor = const Color(0xFF9CA3AF);
    }

    // Alert radius zone (multiple concentric rings)
    final maxRadius = math.min(size.width, size.height) * 0.38;

    // Outer glow
    canvas.drawCircle(
      Offset(cx, cy),
      maxRadius,
      Paint()
        ..color = alertColor.withValues(alpha: 0.06)
        ..style = PaintingStyle.fill,
    );

    // Middle ring
    canvas.drawCircle(
      Offset(cx, cy),
      maxRadius * 0.7,
      Paint()
        ..color = alertColor.withValues(alpha: 0.1)
        ..style = PaintingStyle.fill,
    );

    // Inner ring
    canvas.drawCircle(
      Offset(cx, cy),
      maxRadius * 0.4,
      Paint()
        ..color = alertColor.withValues(alpha: 0.15)
        ..style = PaintingStyle.fill,
    );

    // Dashed circle border
    final dashPaint = Paint()
      ..color = alertColor.withValues(alpha: 0.5)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(Offset(cx, cy), maxRadius, dashPaint);

    // Center pin
    canvas.drawCircle(
      Offset(cx, cy),
      10,
      Paint()..color = alertColor.withValues(alpha: 0.3),
    );
    canvas.drawCircle(
      Offset(cx, cy),
      7,
      Paint()..color = Colors.white,
    );
    canvas.drawCircle(
      Offset(cx, cy),
      5,
      Paint()..color = alertColor,
    );
    canvas.drawCircle(
      Offset(cx, cy),
      2,
      Paint()..color = Colors.white,
    );

    // Pulse animation ring (static representation)
    canvas.drawCircle(
      Offset(cx, cy),
      16,
      Paint()
        ..color = alertColor.withValues(alpha: 0.15)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
