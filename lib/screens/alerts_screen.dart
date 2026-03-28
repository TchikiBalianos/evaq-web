import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';
import '../widgets/alert_card.dart';
import 'alert_detail_screen.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  String _selectedFilter = 'all';
  String _sortBy = 'severity';

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        final allCategories = <String>{};
        for (var a in provider.nearbyAlerts) {
          allCategories.add(a.category);
        }

        final filteredAlerts = _selectedFilter == 'all'
            ? provider.nearbyAlerts
            : provider.nearbyAlerts.where((a) => a.category == _selectedFilter).toList();

        // Sort
        final sorted = List.of(filteredAlerts);
        switch (_sortBy) {
          case 'severity':
            sorted.sort((a, b) => b.severity.compareTo(a.severity));
            break;
          case 'date':
            sorted.sort((a, b) => b.timestamp.compareTo(a.timestamp));
            break;
          case 'distance':
            sorted.sort((a, b) => a.distance.compareTo(b.distance));
            break;
        }

        // Filter by reliability in sage mode
        final displayed = provider.expertMode
            ? sorted
            : sorted.where((a) => a.scoreFiabilite >= 80).toList();

        return Column(
          children: [
            // Mode sage/expert toggle
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Row(
                children: [
                  _buildModeChip(
                    label: I18n.t('alerts.mode_sage'),
                    isSelected: !provider.expertMode,
                    onTap: () { if (provider.expertMode) provider.toggleExpertMode(); },
                    color: AppColors.success,
                  ),
                  const SizedBox(width: 8),
                  _buildModeChip(
                    label: I18n.t('alerts.mode_expert'),
                    isSelected: provider.expertMode,
                    onTap: () { if (!provider.expertMode) provider.toggleExpertMode(); },
                    color: AppColors.warning,
                  ),
                ],
              ),
            ),

            // Info banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: (provider.expertMode ? AppColors.warning : AppColors.success).withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  provider.expertMode ? I18n.t('alerts.expert_info') : I18n.t('alerts.sage_info'),
                  style: TextStyle(fontSize: 11, color: provider.expertMode ? AppColors.warning : AppColors.success),
                ),
              ),
            ),

            const SizedBox(height: 4),

            // Filter chips
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildFilterChip(I18n.t('alerts.all'), 'all', provider.nearbyAlerts.length),
                  ...allCategories.map((cat) {
                    final count = provider.nearbyAlerts.where((a) => a.category == cat).length;
                    return _buildFilterChip(cat, cat, count);
                  }),
                ],
              ),
            ),

            const SizedBox(height: 4),

            // Sort + count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    '${displayed.length} ${I18n.t("alerts.active")}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                  const Spacer(),
                  _buildSortChip(I18n.t('alerts.sort_severity'), 'severity'),
                  const SizedBox(width: 4),
                  _buildSortChip(I18n.t('alerts.sort_date'), 'date'),
                  const SizedBox(width: 4),
                  _buildSortChip(I18n.t('alerts.sort_distance'), 'distance'),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Alert list
            Expanded(
              child: displayed.isEmpty
                  ? _buildEmptyState(provider)
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      physics: const BouncingScrollPhysics(),
                      itemCount: displayed.length + 1, // +1 for RSS section
                      itemBuilder: (context, index) {
                        if (index == displayed.length) return _buildRssSection();
                        final alert = displayed[index];
                        return AlertCard(
                          alert: alert,
                          timeAgo: provider.getTimeAgo(alert.timestamp),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(
                              builder: (context) => AlertDetailScreen(
                                alert: alert,
                                timeAgo: provider.getTimeAgo(alert.timestamp),
                              ),
                            ));
                          },
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildModeChip({required String label, required bool isSelected, required VoidCallback onTap, required Color color}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.12) : AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? color : AppColors.cardBorder),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 6, height: 6, decoration: BoxDecoration(color: isSelected ? color : AppColors.textMuted, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400, color: isSelected ? color : AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, int count) {
    final isSelected = _selectedFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text('$label ($count)', style: TextStyle(fontSize: 11)),
        selected: isSelected,
        onSelected: (_) => setState(() => _selectedFilter = value),
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.primary.withValues(alpha: 0.1),
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
        ),
        side: BorderSide(color: isSelected ? AppColors.primary : AppColors.cardBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  Widget _buildSortChip(String label, String value) {
    final isSelected = _sortBy == value;
    return GestureDetector(
      onTap: () => setState(() => _sortBy = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(fontSize: 10, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400, color: isSelected ? AppColors.primary : AppColors.textMuted),
        ),
      ),
    );
  }

  Widget _buildEmptyState(EvaqProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shield_outlined, size: 64, color: AppColors.success.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(I18n.t('alerts.none'), style: const TextStyle(fontSize: 15, color: AppColors.textMuted)),
          const SizedBox(height: 4),
          Text(I18n.t('alerts.good_news'), style: const TextStyle(fontSize: 13, color: AppColors.success)),
        ],
      ),
    );
  }

  /// RSS monitoring info section — shows that RSS feeds power the detection
  Widget _buildRssSection() {
    return Container(
      margin: const EdgeInsets.only(top: 16, bottom: 24),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.info.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.info.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.rss_feed, size: 16, color: AppColors.info),
              const SizedBox(width: 8),
              Text(
                I18n.t('alerts.rss_monitoring'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            I18n.t('alerts.rss_sources'),
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
          const SizedBox(height: 10),
          _buildRssSource('🌍', I18n.t('alerts.rss_gdacs'), 'https://www.gdacs.org/xml/rss.xml'),
          _buildRssSource('🔴', I18n.t('alerts.rss_reliefweb'), 'https://reliefweb.int/updates/rss.xml'),
          _buildRssSource('🤖', I18n.t('alerts.rss_sentinel'), 'NLP analysis — OSINT feeds'),
        ],
      ),
    );
  }

  Widget _buildRssSource(String icon, String label, String url) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
                Text(url, style: TextStyle(fontSize: 9, color: AppColors.textMuted)),
              ],
            ),
          ),
          Container(
            width: 6, height: 6,
            decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
          ),
        ],
      ),
    );
  }
}
