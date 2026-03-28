import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../models/kit_model.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';
import 'dart:math' as math;

class EvacuationScreen extends StatefulWidget {
  const EvacuationScreen({super.key});
  @override
  State<EvacuationScreen> createState() => _EvacuationScreenState();
}

class _EvacuationScreenState extends State<EvacuationScreen> {
  int _selectedPlanIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        final selectedPlan = provider.evacuationPlans.isNotEmpty ? provider.evacuationPlans[_selectedPlanIndex] : null;
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                width: double.infinity, padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryDark]),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      const Text('🌍', style: TextStyle(fontSize: 24)),
                      const SizedBox(width: 10),
                      Expanded(child: Text(I18n.t('evac.title'), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
                        child: Text('${provider.evacuationPlans.length} ${I18n.t("evac.plans")}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white)),
                      ),
                    ]),
                    const SizedBox(height: 6),
                    Text(I18n.t('evac.subtitle'), style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8))),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Current location
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
                child: Row(children: [
                  Container(width: 32, height: 32, decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.my_location, color: AppColors.success, size: 16)),
                  const SizedBox(width: 10),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(I18n.t('evac.current_location'), style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                    Text(provider.locationString, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  ])),
                  const Icon(Icons.gps_fixed, color: AppColors.success, size: 14),
                ]),
              ),

              const SizedBox(height: 14),

              // Map
              if (selectedPlan != null) ...[
                Text(I18n.t('evac.map_title'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 10),
                _buildMapWidget(selectedPlan),
                const SizedBox(height: 14),
              ],

              // Plan selector
              Row(
                children: provider.evacuationPlans.asMap().entries.map((entry) {
                  final isSelected = entry.key == _selectedPlanIndex;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedPlanIndex = entry.key),
                      child: Container(
                        margin: EdgeInsets.only(right: entry.key < provider.evacuationPlans.length - 1 ? 8 : 0),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : AppColors.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isSelected ? AppColors.primary : AppColors.cardBorder),
                        ),
                        child: Column(children: [
                          Text(entry.key == 0 ? I18n.t('evac.plan_a') : I18n.t('evac.plan_b'),
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AppColors.textSecondary, letterSpacing: 1)),
                          const SizedBox(height: 2),
                          Text(entry.value.transport, style: TextStyle(fontSize: 10, color: isSelected ? Colors.white.withValues(alpha: 0.8) : AppColors.textMuted)),
                        ]),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 14),

              if (selectedPlan != null) _buildPlanDetail(selectedPlan, _selectedPlanIndex == 0),

              const SizedBox(height: 20),

              // POST-RALLY SECTION — Micro-payment packs
              _buildPostRallySection(),

              const SizedBox(height: 14),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: Text(I18n.t('evac.add_plan')),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: BorderSide(color: AppColors.primary.withValues(alpha: 0.3)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPostRallySection() {
    final packs = [
      {'key': 'shelter', 'icon': '🏕️', 'price': '14.99'},
      {'key': 'water', 'icon': '💧', 'price': '9.99'},
      {'key': 'comm', 'icon': '📡', 'price': '19.99'},
      {'key': 'medical', 'icon': '🩺', 'price': '24.99'},
      {'key': 'energy', 'icon': '⚡', 'price': '29.99'},
    ];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E).withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF0F3460).withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Text('📦', style: TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(I18n.t('evac.post_rally'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              Text(I18n.t('evac.post_rally_desc'), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            ])),
          ]),
          const SizedBox(height: 12),
          ...packs.map((pack) => Container(
            margin: const EdgeInsets.only(bottom: 6),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(children: [
              Text(pack['icon']!, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(I18n.t('evac.pack.${pack["key"]}'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                Text(I18n.t('evac.pack.${pack["key"]}_desc'), style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
              ])),
              const SizedBox(width: 6),
              ElevatedButton(
                onPressed: () => _showPackPayment(context, pack),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary, foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0, minimumSize: const Size(0, 28),
                ),
                child: Text('${pack["price"]}€', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ]),
          )),
        ],
      ),
    );
  }

  void _showPackPayment(BuildContext context, Map<String, String> pack) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(pack['icon']!, style: const TextStyle(fontSize: 40)),
            const SizedBox(height: 12),
            Text(I18n.t('evac.pack.${pack["key"]}'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(I18n.t('evac.pack.${pack["key"]}_desc'), style: const TextStyle(fontSize: 12, color: AppColors.textMuted), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(10)),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(I18n.t('evac.micro_payment'), style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                Text('${pack["price"]}€', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ]),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('${I18n.t("evac.buy_pack")} — ${I18n.t("evac.pack.${pack["key"]}")}'),
                    backgroundColor: AppColors.success,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ));
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary, foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0,
                ),
                child: Text(I18n.t('evac.buy_pack'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildMapWidget(EvacuationPlan plan) {
    return Container(
      height: 240, width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.cardBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Stack(children: [
          Container(color: const Color(0xFFE8EEF1), child: CustomPaint(size: const Size(double.infinity, 240), painter: _MapPainter(plan: plan))),
          Positioned(top: 10, left: 10, child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.95), borderRadius: BorderRadius.circular(8), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4)]),
            child: Row(children: [
              const Icon(Icons.route, size: 12, color: AppColors.primary),
              const SizedBox(width: 4),
              Text('${plan.distanceKm.toStringAsFixed(0)} km', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(width: 6),
              const Icon(Icons.access_time, size: 12, color: AppColors.info),
              const SizedBox(width: 3),
              Text(plan.estimatedTime, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.info)),
            ]),
          )),
          Positioned(top: 10, right: 10, child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              Icon(plan.transport.contains('Voiture') ? Icons.directions_car : Icons.directions_bike, size: 12, color: Colors.white),
              const SizedBox(width: 4),
              Text(plan.transport, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white)),
            ]),
          )),
        ]),
      ),
    );
  }

  Widget _buildPlanDetail(EvacuationPlan plan, bool isPrimary) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isPrimary ? AppColors.primary.withValues(alpha: 0.3) : AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: isPrimary ? AppColors.primary.withValues(alpha: 0.1) : AppColors.textMuted.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(isPrimary ? I18n.t('evac.priority') : I18n.t('evac.alternative'),
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: isPrimary ? AppColors.primary : AppColors.textMuted)),
            ),
            const Spacer(),
            const Icon(Icons.access_time, size: 13, color: AppColors.info),
            const SizedBox(width: 3),
            Text(plan.estimatedTime, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.info)),
          ]),
          const SizedBox(height: 10),
          Text(plan.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 3),
          Text('${plan.destination} · ${plan.distanceKm.toStringAsFixed(0)} km · ${plan.transport}',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          const SizedBox(height: 14),
          ...plan.steps.asMap().entries.map((entry) {
            final i = entry.key; final step = entry.value;
            final isLast = i == plan.steps.length - 1; final isFirst = i == 0;
            return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Column(children: [
                Container(width: 24, height: 24,
                  decoration: BoxDecoration(
                    color: isFirst ? AppColors.success : isLast ? AppColors.primary : (isPrimary ? AppColors.primary.withValues(alpha: 0.1) : AppColors.textMuted.withValues(alpha: 0.1)),
                    shape: BoxShape.circle),
                  child: Center(child: isFirst ? const Icon(Icons.play_arrow, size: 12, color: Colors.white)
                      : isLast ? const Icon(Icons.flag, size: 12, color: Colors.white)
                      : Text('${i + 1}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isPrimary ? AppColors.primary : AppColors.textMuted))),
                ),
                if (!isLast) Container(width: 2, height: 20, color: isPrimary ? AppColors.primary.withValues(alpha: 0.15) : AppColors.cardBorder),
              ]),
              const SizedBox(width: 10),
              Expanded(child: Padding(
                padding: EdgeInsets.only(bottom: isLast ? 0 : 12, top: 3),
                child: Text(step, style: TextStyle(fontSize: 12, fontWeight: (isFirst || isLast) ? FontWeight.w600 : FontWeight.w400, color: (isFirst || isLast) ? AppColors.textPrimary : AppColors.textSecondary)),
              )),
            ]);
          }),
        ],
      ),
    );
  }
}

class _MapPainter extends CustomPainter {
  final EvacuationPlan plan;
  _MapPainter({required this.plan});

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..color = const Color(0xFFE8EEF1));
    final gridPaint = Paint()..color = const Color(0xFFD1D9DE)..strokeWidth = 0.5;
    for (double x = 0; x < size.width; x += 30) canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    for (double y = 0; y < size.height; y += 30) canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    final roadPaint = Paint()..color = const Color(0xFFCDD5DA)..strokeWidth = 3;
    for (double x = 0; x < size.width; x += 90) canvas.drawLine(Offset(x, 0), Offset(x, size.height), roadPaint);
    for (double y = 0; y < size.height; y += 90) canvas.drawLine(Offset(0, y), Offset(size.width, y), roadPaint);
    final parkPaint = Paint()..color = const Color(0xFFD4E8D0).withValues(alpha: 0.6);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.6, size.height * 0.2, 80, 60), const Radius.circular(8)), parkPaint);
    final waterPaint = Paint()..color = const Color(0xFFB3D4E8).withValues(alpha: 0.5);
    final waterPath = Path()..moveTo(0, size.height * 0.35)..quadraticBezierTo(size.width * 0.3, size.height * 0.4, size.width * 0.5, size.height * 0.32)..quadraticBezierTo(size.width * 0.7, size.height * 0.25, size.width, size.height * 0.3)..lineTo(size.width, size.height * 0.38)..quadraticBezierTo(size.width * 0.7, size.height * 0.33, size.width * 0.5, size.height * 0.4)..quadraticBezierTo(size.width * 0.3, size.height * 0.48, 0, size.height * 0.43)..close();
    canvas.drawPath(waterPath, waterPaint);
    if (plan.waypoints.isEmpty) return;
    final points = _getScreenPoints(size);
    final routePaint = Paint()..color = AppColors.primary..strokeWidth = 3..strokeCap = StrokeCap.round..strokeJoin = StrokeJoin.round..style = PaintingStyle.stroke;
    final routePath = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) routePath.lineTo(points[i].dx, points[i].dy);
    canvas.drawPath(routePath, Paint()..color = AppColors.primary.withValues(alpha: 0.15)..strokeWidth = 8..strokeCap = StrokeCap.round..style = PaintingStyle.stroke);
    canvas.drawPath(routePath, routePaint);
    for (int i = 0; i < points.length; i++) {
      final p = points[i]; final isS = i == 0; final isE = i == points.length - 1;
      canvas.drawCircle(p, isS || isE ? 12 : 6, Paint()..color = (isS ? AppColors.success : isE ? AppColors.primary : AppColors.info).withValues(alpha: 0.2));
      canvas.drawCircle(p, isS || isE ? 8 : 5, Paint()..color = Colors.white);
      canvas.drawCircle(p, isS || isE ? 6 : 3, Paint()..color = isS ? AppColors.success : isE ? AppColors.primary : AppColors.info);
      if (isS || isE) canvas.drawCircle(p, 2.5, Paint()..color = Colors.white);
    }
  }

  List<Offset> _getScreenPoints(Size size) {
    if (plan.waypoints.isEmpty) return [];
    double minLat = double.infinity, maxLat = -double.infinity, minLng = double.infinity, maxLng = -double.infinity;
    for (var wp in plan.waypoints) { minLat = math.min(minLat, wp.lat); maxLat = math.max(maxLat, wp.lat); minLng = math.min(minLng, wp.lng); maxLng = math.max(maxLng, wp.lng); }
    const pad = 35.0;
    final lr = maxLat - minLat; final lgr = maxLng - minLng;
    final slr = lr == 0 ? 0.1 : lr; final slgr = lgr == 0 ? 0.1 : lgr;
    return plan.waypoints.map((wp) => Offset(pad + ((wp.lng - minLng) / slgr) * (size.width - pad * 2), pad + ((maxLat - wp.lat) / slr) * (size.height - pad * 2))).toList();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
