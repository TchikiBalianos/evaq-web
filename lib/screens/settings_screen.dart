import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile
              Container(
                width: double.infinity, padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.cardBorder)),
                child: Row(children: [
                  CircleAvatar(radius: 24, backgroundColor: AppColors.primary.withValues(alpha: 0.1), child: const Icon(Icons.person_outline, color: AppColors.primary, size: 24)),
                  const SizedBox(width: 14),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(I18n.t('settings.account'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(height: 2),
                    Text(I18n.t('settings.account_subtitle'), style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ])),
                  const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
                ]),
              ),

              const SizedBox(height: 20),

              _buildSectionTitle(I18n.t('settings.general')),

              // LANGUAGE SELECTOR - functional
              GestureDetector(
                onTap: () => _showLanguageDialog(context, provider),
                child: _buildSettingTile(
                  icon: Icons.language,
                  title: I18n.t('settings.language'),
                  subtitle: '${AppLocale.flag(provider.locale)} ${AppLocale.label(provider.locale)}',
                  color: AppColors.info,
                ),
              ),
              _buildSettingTile(icon: Icons.location_on_outlined, title: I18n.t('settings.location'), subtitle: provider.locationString, color: AppColors.success),
              _buildSettingTile(icon: Icons.notifications_outlined, title: I18n.t('settings.notifications'), subtitle: I18n.t('settings.notif_config'), color: AppColors.warning),

              const SizedBox(height: 20),

              _buildSectionTitle(I18n.t('settings.application')),
              _buildSettingTile(icon: Icons.shield_outlined, title: I18n.t('settings.security'), subtitle: I18n.t('settings.security_subtitle'), color: const Color(0xFF7C3AED)),
              _buildSettingTile(icon: Icons.storage_outlined, title: I18n.t('settings.offline'), subtitle: I18n.t('settings.offline_subtitle'), color: const Color(0xFF059669)),
              _buildSettingTile(icon: Icons.color_lens_outlined, title: I18n.t('settings.appearance'), subtitle: I18n.t('settings.appearance_subtitle'), color: const Color(0xFFEC4899)),

              const SizedBox(height: 20),

              _buildSectionTitle(I18n.t('settings.info')),
              _buildSettingTile(icon: Icons.info_outline, title: I18n.t('settings.about'), subtitle: I18n.t('settings.version'), color: AppColors.textSecondary),
              _buildSettingTile(icon: Icons.description_outlined, title: I18n.t('settings.tos'), subtitle: I18n.t('settings.tos_subtitle'), color: AppColors.textSecondary),
              _buildSettingTile(icon: Icons.help_outline, title: I18n.t('settings.help'), subtitle: I18n.t('settings.help_subtitle'), color: AppColors.textSecondary),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.logout, size: 18),
                  label: Text(I18n.t('settings.logout')),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              Center(child: Text(I18n.t('settings.build'), style: const TextStyle(fontSize: 10, color: AppColors.textMuted))),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
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
              leading: Text(AppLocale.flag(code), style: const TextStyle(fontSize: 22)),
              title: Text(AppLocale.label(code), style: TextStyle(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              )),
              trailing: isSelected ? const Icon(Icons.check_circle, color: AppColors.primary, size: 18) : null,
              onTap: () {
                provider.setLocale(code);
                Navigator.pop(context);
              },
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              dense: true,
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 1.2)),
    );
  }

  Widget _buildSettingTile({required IconData icon, required String title, required String subtitle, required Color color}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 5),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.cardBorder)),
      child: ListTile(
        dense: true,
        leading: Container(width: 34, height: 34, decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 18)),
        title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        trailing: const Icon(Icons.chevron_right, size: 16, color: AppColors.textMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10),
      ),
    );
  }
}
