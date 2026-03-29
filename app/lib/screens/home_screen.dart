import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';
import '../widgets/defcon_card.dart';
import '../widgets/alert_card.dart';
import '../widgets/common_widgets.dart';
import 'alert_detail_screen.dart';
import 'advisor_screen.dart';
import 'neighborhood_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        return Stack(
          children: [
            SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  DefconCard(level: provider.defconLevel),
                  const SizedBox(height: 8),
                  if (provider.isTestMode)
                    Center(
                      child: RichText(
                        text: TextSpan(
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          children: [
                            TextSpan(text: '${provider.activeAlertsCount} ${I18n.t("dashboard.alerts_analyzed")} '),
                            TextSpan(
                              text: '(${provider.simulatedAlertsCount} ${I18n.t("dashboard.simulated")})',
                              style: const TextStyle(color: AppColors.info),
                            ),
                          ],
                        ),
                      ),
                    ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        I18n.t('dashboard.nearby_alerts'),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                      const Icon(Icons.tune_rounded, color: AppColors.accent, size: 22),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...provider.nearbyAlerts.map(
                    (alert) => AlertCard(
                      alert: alert,
                      timeAgo: provider.getTimeAgo(alert.timestamp),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(
                          builder: (context) => AlertDetailScreen(alert: alert, timeAgo: provider.getTimeAgo(alert.timestamp)),
                        ));
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Action buttons - FIXED sizing for S9+
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.6,
                    children: [
                      ActionButton(emoji: '⚡', label: I18n.t('dashboard.view_alerts'), onTap: () => provider.setSelectedTab(1)),
                      ActionButton(emoji: '🤖', label: 'SENTINEL AI', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdvisorScreen()))),
                      ActionButton(emoji: '🌍', label: I18n.t('dashboard.evacuation_plan'), onTap: () => provider.setSelectedTab(2)),
                      ActionButton(emoji: '🤝', label: I18n.t('dashboard.neighborhood'), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NeighborhoodScreen()))),
                      ActionButton(emoji: '🎒', label: I18n.t('dashboard.my_kit'), onTap: () => provider.setSelectedTab(3)),
                      ActionButton(emoji: '⭐', label: I18n.t('dashboard.premium'), onTap: () => provider.setSelectedTab(4)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  NotificationCard(
                    enabled: provider.notificationsEnabled,
                    onToggle: () => provider.toggleNotifications(),
                  ),
                  const SizedBox(height: 16),
                  PreparationScoreCard(score: provider.preparationScore),
                  const SizedBox(height: 16),
                ],
              ),
            ),
            Positioned(
              bottom: 16, right: 16,
              child: LocationBadge(location: provider.locationString),
            ),
          ],
        );
      },
    );
  }
}
