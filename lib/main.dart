import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/evaq_provider.dart';
import 'utils/constants.dart';
import 'utils/i18n.dart';
import 'screens/home_screen.dart';
import 'screens/alerts_screen.dart';
import 'screens/evacuation_screen.dart';
import 'screens/kit_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/premium_screen.dart';
import 'widgets/common_widgets.dart';

void main() {
  runApp(const EvaqApp());
}

class EvaqApp extends StatelessWidget {
  const EvaqApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => EvaqProvider(),
      child: Consumer<EvaqProvider>(
        builder: (context, provider, _) {
          return MaterialApp(
            title: 'EVAQ',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              useMaterial3: true,
              colorSchemeSeed: AppColors.primary,
              scaffoldBackgroundColor: AppColors.background,
              fontFamily: 'Roboto',
              appBarTheme: const AppBarTheme(
                backgroundColor: AppColors.surface,
                elevation: 0,
                scrolledUnderElevation: 1,
                centerTitle: false,
                titleTextStyle: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: 1.5,
                ),
              ),
              cardTheme: CardThemeData(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: AppColors.cardBorder),
                ),
              ),
            ),
            home: const EvaqShell(),
          );
        },
      ),
    );
  }
}

class EvaqShell extends StatelessWidget {
  const EvaqShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        final screens = [
          const HomeScreen(),
          const AlertsScreen(),
          const EvacuationScreen(),
          const KitScreen(),
          const PremiumScreen(),
          const SettingsScreen(),
        ];

        final navLabels = [
          I18n.t('nav.home'),
          I18n.t('nav.alerts'),
          I18n.t('nav.evacuation'),
          I18n.t('nav.kit'),
          I18n.t('nav.premium'),
          I18n.t('nav.settings'),
        ];

        return Scaffold(
          appBar: AppBar(
            title: Row(
              children: [
                const Text('EVAQ'),
                if (provider.isTestMode) ...[
                  const SizedBox(width: 8),
                  _buildTestBadge(),
                ],
              ],
            ),
            actions: [
              // Language indicator
              GestureDetector(
                onTap: () => _showLanguageDialog(context, provider),
                child: Container(
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.info.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    AppLocale.flag(provider.locale),
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
              ),
            ],
          ),
          body: SafeArea(
            child: Column(
              children: [
                TestModeBanner(
                  isTestMode: provider.isTestMode,
                  scenario: provider.testScenario,
                  onToggle: () => provider.toggleTestMode(),
                  onChangeScenario: () => _showScenarioDialog(context, provider),
                ),
                Expanded(
                  child: screens[provider.selectedTab],
                ),
              ],
            ),
          ),
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(context, Icons.home_rounded, navLabels[0], 0, provider),
                    _buildNavItem(context, Icons.warning_amber_rounded, navLabels[1], 1, provider),
                    _buildNavItem(context, Icons.map_rounded, navLabels[2], 2, provider),
                    _buildNavItem(context, Icons.backpack_rounded, navLabels[3], 3, provider),
                    _buildNavItem(context, Icons.star_rounded, navLabels[4], 4, provider),
                    _buildNavItem(context, Icons.settings_rounded, navLabels[5], 5, provider),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTestBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.warning_rounded, size: 10, color: AppColors.warning),
          const SizedBox(width: 3),
          Text(
            I18n.t('test.on'),
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.warning),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, IconData icon, String label, int index, EvaqProvider provider,
  ) {
    final isSelected = provider.selectedTab == index;
    // Fix: constrain icon+text within nav item to prevent overflow on S9+
    return Expanded(
      child: GestureDetector(
        onTap: () => provider.setSelectedTab(index),
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 4),
          decoration: isSelected
              ? BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                )
              : null,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: isSelected ? AppColors.primary : AppColors.textMuted),
              const SizedBox(height: 1),
              Text(
                label,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? AppColors.primary : AppColors.textMuted,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLanguageDialog(BuildContext context, EvaqProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(I18n.t('settings.change_language')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: AppLocale.supported.map((code) {
            final isSelected = code == provider.locale;
            return ListTile(
              leading: Text(AppLocale.flag(code), style: const TextStyle(fontSize: 24)),
              title: Text(
                AppLocale.label(code),
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                ),
              ),
              trailing: isSelected ? const Icon(Icons.check_circle, color: AppColors.primary, size: 20) : null,
              onTap: () {
                provider.setLocale(code);
                Navigator.pop(context);
              },
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showScenarioDialog(BuildContext context, EvaqProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(I18n.t('test.choose_scenario')),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: EvaqProvider.testScenarios.map((scenario) {
              final isSelected = scenario['id'] == provider.testScenarioId;
              final name = I18n.locale == 'en'
                  ? scenario['name_en'] as String
                  : scenario['name_fr'] as String;
              return ListTile(
                leading: Text(scenario['icon'] as String, style: const TextStyle(fontSize: 22)),
                title: Text(
                  name,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  ),
                ),
                trailing: isSelected
                    ? const Icon(Icons.check_circle, color: AppColors.primary, size: 18)
                    : null,
                onTap: () {
                  provider.changeScenario(scenario['id'] as String);
                  Navigator.pop(context);
                },
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                dense: true,
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
