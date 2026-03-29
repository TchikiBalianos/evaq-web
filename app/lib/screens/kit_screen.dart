import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';
import '../widgets/common_widgets.dart';

class KitScreen extends StatefulWidget {
  const KitScreen({super.key});
  @override
  State<KitScreen> createState() => _KitScreenState();
}

class _KitScreenState extends State<KitScreen> {
  bool _showRpg = false;
  int _rpgStep = 0;
  final List<int> _rpgAnswers = [];

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        final categories = <String>{};
        for (var item in provider.kitItems) { categories.add(item.category); }
        final checkedCount = provider.kitItems.where((i) => i.isChecked).length;
        final totalCount = provider.kitItems.length;

        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('🎒', style: TextStyle(fontSize: 24)),
                        const SizedBox(width: 10),
                        Expanded(child: Text(I18n.t('kit.title'), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('$checkedCount / $totalCount ${I18n.t("kit.elements")}', style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8))),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: totalCount > 0 ? checkedCount / totalCount : 0,
                        minHeight: 6,
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // RPG Questionnaire card
              _buildRpgCard(provider),

              const SizedBox(height: 16),

              // Scenario-specific priorities
              if (provider.isTestMode && provider.scenarioKitPriorities.isNotEmpty)
                _buildScenarioPriorities(provider),

              PreparationScoreCard(score: provider.preparationScore),

              const SizedBox(height: 16),

              // Kit items by category
              ...categories.map((category) {
                final items = provider.kitItems.where((i) => i.category == category).toList();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6, top: 4),
                      child: Text(category.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 1)),
                    ),
                    ...items.map((item) => Container(
                      margin: const EdgeInsets.only(bottom: 5),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: item.isChecked ? AppColors.success.withValues(alpha: 0.3) : AppColors.cardBorder),
                      ),
                      child: ListTile(
                        dense: true,
                        // FIXED: constrain leading emoji to prevent overflow on S9+
                        leading: SizedBox(width: 28, child: Text(item.icon, style: const TextStyle(fontSize: 20))),
                        title: Text(
                          item.name,
                          style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w500,
                            color: item.isChecked ? AppColors.textMuted : AppColors.textPrimary,
                            decoration: item.isChecked ? TextDecoration.lineThrough : TextDecoration.none,
                          ),
                        ),
                        trailing: SizedBox(
                          width: 28,
                          child: Checkbox(
                            value: item.isChecked,
                            onChanged: (_) => provider.toggleKitItem(item.id),
                            activeColor: AppColors.success,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            visualDensity: VisualDensity.compact,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                        onTap: () => provider.toggleKitItem(item.id),
                      ),
                    )),
                    const SizedBox(height: 6),
                  ],
                );
              }),

              const SizedBox(height: 12),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _showAddItemDialog(context),
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: Text(I18n.t('kit.add_element')),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF7C3AED),
                    side: BorderSide(color: const Color(0xFF7C3AED).withValues(alpha: 0.3)),
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

  Widget _buildRpgCard(EvaqProvider provider) {
    final hasResult = provider.rpgScore >= 0;

    if (_showRpg) return _buildRpgQuiz(provider);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF1A1A2E), const Color(0xFF16213E)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF0F3460).withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🧟', style: TextStyle(fontSize: 24)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(I18n.t('kit.rpg_title'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text(I18n.t('kit.rpg_subtitle'), style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.6))),
                  ],
                ),
              ),
              if (hasResult)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getRpgProfileColor(provider.rpgScore).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    _getRpgProfileLabel(provider.rpgScore),
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _getRpgProfileColor(provider.rpgScore)),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            hasResult ? _getRpgProfileDesc(provider.rpgScore) : I18n.t('kit.rpg_desc'),
            style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.7), height: 1.4),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => setState(() { _showRpg = true; _rpgStep = 0; _rpgAnswers.clear(); }),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE94560),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text(hasResult ? I18n.t('kit.rpg_restart') : I18n.t('kit.rpg_start'), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRpgQuiz(EvaqProvider provider) {
    final questions = [
      {'key': 'rpg.q1', 'options': ['rpg.q1.a', 'rpg.q1.b', 'rpg.q1.c', 'rpg.q1.d']},
      {'key': 'rpg.q2', 'options': ['rpg.q2.a', 'rpg.q2.b', 'rpg.q2.c', 'rpg.q2.d']},
      {'key': 'rpg.q3', 'options': ['rpg.q3.a', 'rpg.q3.b', 'rpg.q3.c', 'rpg.q3.d']},
      {'key': 'rpg.q4', 'options': ['rpg.q4.a', 'rpg.q4.b', 'rpg.q4.c', 'rpg.q4.d']},
      {'key': 'rpg.q5', 'options': ['rpg.q5.a', 'rpg.q5.b', 'rpg.q5.c', 'rpg.q5.d']},
    ];

    if (_rpgStep >= questions.length) {
      // Show results
      final total = _rpgAnswers.fold(0, (a, b) => a + b);
      provider.setRpgScore(total);
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [const Color(0xFF1A1A2E), const Color(0xFF16213E)]),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            const Text('🏆', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 10),
            Text(I18n.t('kit.rpg_result_title'), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Colors.white)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: _getRpgProfileColor(total).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(_getRpgProfileLabel(total), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: _getRpgProfileColor(total))),
            ),
            const SizedBox(height: 8),
            Text(_getRpgProfileDesc(total), style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.7), height: 1.4), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() { _showRpg = false; }),
                    style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: BorderSide(color: Colors.white.withValues(alpha: 0.3))),
                    child: Text(I18n.t('kit.rpg_close'), style: const TextStyle(fontSize: 12)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() { _rpgStep = 0; _rpgAnswers.clear(); }),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE94560), foregroundColor: Colors.white),
                    child: Text(I18n.t('kit.rpg_restart'), style: const TextStyle(fontSize: 12)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    final q = questions[_rpgStep];
    final options = q['options'] as List<String>;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [const Color(0xFF1A1A2E), const Color(0xFF16213E)]),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Progress
          Row(
            children: List.generate(questions.length, (i) => Expanded(
              child: Container(
                height: 3,
                margin: const EdgeInsets.only(right: 3),
                decoration: BoxDecoration(
                  color: i <= _rpgStep ? const Color(0xFFE94560) : Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            )),
          ),
          const SizedBox(height: 14),
          Text(
            '${_rpgStep + 1}/${questions.length}',
            style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.4)),
          ),
          const SizedBox(height: 6),
          Text(I18n.t(q['key'] as String), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white, height: 1.3)),
          const SizedBox(height: 14),
          ...options.asMap().entries.map((e) {
            final idx = e.key;
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _rpgAnswers.add(idx);
                    _rpgStep++;
                  });
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 22, height: 22,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE94560).withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Center(child: Text(String.fromCharCode(65 + idx), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFE94560)))),
                      ),
                      const SizedBox(width: 10),
                      Expanded(child: Text(I18n.t(e.value), style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.85)))),
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildScenarioPriorities(EvaqProvider provider) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text(I18n.t('kit.scenario_priority'), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 4),
          Text(I18n.t('kit.scenario_critical'), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          const SizedBox(height: 8),
          ...provider.scenarioKitPriorities.map((item) {
            final label = I18n.locale == 'en' ? (item['en'] ?? item['fr']!) : item['fr']!;
            final owned = provider.kitItems.any((k) => k.name.toLowerCase().contains(label.toLowerCase().substring(0, (label.length > 8 ? 8 : label.length))));
            return Container(
              margin: const EdgeInsets.only(bottom: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: owned ? AppColors.success.withValues(alpha: 0.05) : AppColors.surface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: owned ? AppColors.success.withValues(alpha: 0.2) : AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  Text(item['icon'] ?? '📦', style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 8),
                  Expanded(child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textPrimary))),
                  Text(
                    owned ? I18n.t('kit.owned') : I18n.t('kit.missing'),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: owned ? AppColors.success : AppColors.primary),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  String _getRpgProfileLabel(int score) {
    if (score >= 15) return I18n.t('rpg.profile.survivant');
    if (score >= 10) return I18n.t('rpg.profile.preparateur');
    if (score >= 5) return I18n.t('rpg.profile.initie');
    return I18n.t('rpg.profile.novice');
  }

  String _getRpgProfileDesc(int score) {
    if (score >= 15) return I18n.t('rpg.profile.survivant_desc');
    if (score >= 10) return I18n.t('rpg.profile.preparateur_desc');
    if (score >= 5) return I18n.t('rpg.profile.initie_desc');
    return I18n.t('rpg.profile.novice_desc');
  }

  Color _getRpgProfileColor(int score) {
    if (score >= 15) return AppColors.success;
    if (score >= 10) return AppColors.info;
    if (score >= 5) return AppColors.warning;
    return AppColors.primary;
  }

  void _showAddItemDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(I18n.t('kit.add_element')),
        content: Text(I18n.t('kit.add_dialog_msg')),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(I18n.t('kit.ok')))],
      ),
    );
  }
}
