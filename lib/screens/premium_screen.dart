import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});
  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  int _selectedPlan = 1;
  int _selectedTab = 0; // 0=subscriptions, 1=packs

  @override
  Widget build(BuildContext context) {
    return Consumer<EvaqProvider>(
      builder: (context, provider, _) {
        if (provider.isPremium) return _buildPremiumActiveView(provider);
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            // Hero header
            Container(
              width: double.infinity, padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [BoxShadow(color: const Color(0xFFF59E0B).withValues(alpha: 0.25), blurRadius: 16, offset: const Offset(0, 6))],
              ),
              child: Column(children: [
                const Text('⭐', style: TextStyle(fontSize: 40)),
                const SizedBox(height: 10),
                Text(I18n.t('premium.title'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5)),
                const SizedBox(height: 6),
                Text(I18n.t('premium.subtitle'), style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.9), height: 1.4), textAlign: TextAlign.center),
              ]),
            ),

            const SizedBox(height: 20),

            // Features
            _buildFeatureItem(Icons.notifications_active, I18n.t('premium.feat_unlimited_alerts'), AppColors.primary),
            _buildFeatureItem(Icons.map_outlined, I18n.t('premium.feat_risk_map'), AppColors.info),
            _buildFeatureItem(Icons.route, I18n.t('premium.feat_ai_routes'), AppColors.success),
            _buildFeatureItem(Icons.people_outline, I18n.t('premium.feat_family'), const Color(0xFF7C3AED)),
            _buildFeatureItem(Icons.cloud_off_outlined, I18n.t('premium.feat_offline'), const Color(0xFFEC4899)),
            _buildFeatureItem(Icons.speed, I18n.t('premium.feat_priority_notif'), AppColors.warning),

            const SizedBox(height: 20),

            // Tab: Subscriptions / Packs
            Row(children: [
              _buildTabChip(I18n.t('premium.subscriptions'), 0),
              const SizedBox(width: 8),
              _buildTabChip(I18n.t('premium.packs'), 1),
            ]),

            const SizedBox(height: 14),

            if (_selectedTab == 0) ...[
              // Subscription pricing
              Align(alignment: Alignment.centerLeft, child: Text(I18n.t('premium.choose_plan'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary))),
              const SizedBox(height: 10),
              Row(children: [
                Expanded(child: _buildPricingCard(0, I18n.t('premium.monthly'), '4.99', I18n.t('premium.per_month'), false)),
                const SizedBox(width: 10),
                Expanded(child: _buildPricingCard(1, I18n.t('premium.yearly'), '29.99', I18n.t('premium.per_year'), true, savings: I18n.t('premium.savings'))),
              ]),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _showPaymentSheet(context, provider),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF59E0B), foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0,
                  ),
                  child: Text('${I18n.t("premium.subscribe")} — ${_selectedPlan == 0 ? "4.99€${I18n.t("premium.per_month")}" : "29.99€${I18n.t("premium.per_year")}"}',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                ),
              ),
            ] else ...[
              // One-time packs (from PWA)
              _buildPackCard(I18n.t('premium.pack_alert'), '1.99', [I18n.t('premium.feat_unlimited_alerts'), I18n.t('premium.feat_expert_mode')]),
              _buildPackCard(I18n.t('premium.pack_evacuation'), '2.99', [I18n.t('premium.feat_unlimited_routes'), I18n.t('premium.feat_smart_evac')]),
              _buildPackCard(I18n.t('premium.pack_kit'), '2.99', [I18n.t('premium.feat_unlimited_items'), I18n.t('premium.feat_expiry_alerts')]),
              _buildPackCard(I18n.t('premium.pack_preparation'), '4.99', [I18n.t('premium.feat_full_score'), I18n.t('premium.feat_personalized_reco')]),
            ],

            const SizedBox(height: 10),

            Text(I18n.t('premium.terms'), style: const TextStyle(fontSize: 10, color: AppColors.textMuted, height: 1.5), textAlign: TextAlign.center),
            const SizedBox(height: 6),
            TextButton(onPressed: () {}, child: Text(I18n.t('premium.restore'), style: const TextStyle(fontSize: 12, color: AppColors.info))),
            const SizedBox(height: 16),
          ]),
        );
      },
    );
  }

  Widget _buildTabChip(String label, int index) {
    final isSelected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : AppColors.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? AppColors.primary : AppColors.cardBorder),
          ),
          child: Center(child: Text(label, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400, color: isSelected ? AppColors.primary : AppColors.textMuted))),
        ),
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String title, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
      child: Row(children: [
        Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 18)),
        const SizedBox(width: 12),
        Expanded(child: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary))),
        Icon(Icons.check_circle_outline, size: 18, color: color.withValues(alpha: 0.4)),
      ]),
    );
  }

  Widget _buildPricingCard(int index, String title, String price, String period, bool isPopular, {String? savings}) {
    final isSelected = _selectedPlan == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedPlan = index),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.04) : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.cardBorder, width: isSelected ? 2 : 1),
        ),
        child: Column(children: [
          if (isPopular && savings != null)
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), margin: const EdgeInsets.only(bottom: 6),
              decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(10)),
              child: Text(savings, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white))),
          Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isSelected ? AppColors.primary : AppColors.textSecondary)),
          const SizedBox(height: 4),
          Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('$price€', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: isSelected ? AppColors.primary : AppColors.textPrimary)),
            Padding(padding: const EdgeInsets.only(bottom: 3), child: Text(period, style: const TextStyle(fontSize: 11, color: AppColors.textMuted))),
          ]),
          if (index == 1) ...[const SizedBox(height: 3), Text(I18n.t('premium.per_month_equiv'), style: const TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w500))],
        ]),
      ),
    );
  }

  Widget _buildPackCard(String title, String price, List<String> features) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          ...features.map((f) => Row(children: [
            const Icon(Icons.check, size: 12, color: AppColors.success),
            const SizedBox(width: 4),
            Text(f, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
          ])),
        ])),
        ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), elevation: 0, minimumSize: const Size(0, 30)),
          child: Text('$price€', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        ),
      ]),
    );
  }

  Widget _buildPremiumActiveView(EvaqProvider provider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        Container(width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF22C55E), Color(0xFF16A34A)]), borderRadius: BorderRadius.circular(18)),
          child: Column(children: [
            const Icon(Icons.check_circle, size: 48, color: Colors.white),
            const SizedBox(height: 10),
            Text(I18n.t('premium.active'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
            const SizedBox(height: 4),
            Text(I18n.t('premium.active_subtitle'), style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.9))),
          ])),
        const SizedBox(height: 20),
        OutlinedButton(onPressed: () => provider.setPremium(false),
          style: OutlinedButton.styleFrom(foregroundColor: AppColors.textMuted, side: const BorderSide(color: AppColors.cardBorder),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          child: Text(I18n.t('premium.manage'))),
      ]),
    );
  }

  void _showPaymentSheet(BuildContext context, EvaqProvider provider) {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (context) => _PaymentSheet(selectedPlan: _selectedPlan, onSuccess: () {
        Navigator.pop(context);
        provider.setPremium(true);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Row(children: [const Icon(Icons.check_circle, color: Colors.white, size: 18), const SizedBox(width: 8), Text(I18n.t('premium.welcome'))]),
          backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
      }),
    );
  }
}

class _PaymentSheet extends StatefulWidget {
  final int selectedPlan;
  final VoidCallback onSuccess;
  const _PaymentSheet({required this.selectedPlan, required this.onSuccess});
  @override
  State<_PaymentSheet> createState() => _PaymentSheetState();
}

class _PaymentSheetState extends State<_PaymentSheet> {
  int _paymentMethod = 0;
  bool _isProcessing = false;
  final _cardNumberController = TextEditingController(text: '4242 4242 4242 4242');
  final _expiryController = TextEditingController(text: '12/28');
  final _cvcController = TextEditingController(text: '123');

  @override
  void dispose() { _cardNumberController.dispose(); _expiryController.dispose(); _cvcController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final price = widget.selectedPlan == 0 ? '4.99€' : '29.99€';
    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: const BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      child: SingleChildScrollView(child: Column(children: [
        const SizedBox(height: 10),
        Container(width: 36, height: 4, decoration: BoxDecoration(color: AppColors.textMuted.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
        Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.lock_outline, size: 16, color: AppColors.success), const SizedBox(width: 8),
            Text(I18n.t('premium.payment_secure'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const Spacer(),
            IconButton(icon: const Icon(Icons.close, size: 18), onPressed: () => Navigator.pop(context)),
          ]),
          const SizedBox(height: 14),
          // Order summary
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(10)),
            child: Row(children: [
              const Text('⭐', style: TextStyle(fontSize: 20)), const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('EVAQ Premium', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                Text('${widget.selectedPlan == 0 ? I18n.t("premium.monthly") : I18n.t("premium.yearly")}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
              ])),
              Text(price, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ])),
          const SizedBox(height: 16),
          Text(I18n.t('premium.payment_card'), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(children: [
            _buildPaymentTab(0, Icons.credit_card, I18n.t('premium.payment_card')),
            const SizedBox(width: 6),
            _buildPaymentTab(1, Icons.currency_bitcoin, I18n.t('premium.payment_solana')),
          ]),
          const SizedBox(height: 14),
          if (_paymentMethod == 0) _buildCardForm() else _buildSolanaForm(price),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: _isProcessing ? null : _processPayment,
            style: ElevatedButton.styleFrom(
              backgroundColor: _paymentMethod == 0 ? AppColors.primary : const Color(0xFF9945FF),
              foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
            child: _isProcessing
              ? Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                  const SizedBox(width: 10),
                  Text(_paymentMethod == 0 ? I18n.t('premium.processing') : I18n.t('premium.wallet_confirm'), style: const TextStyle(fontSize: 13)),
                ])
              : Text(_paymentMethod == 0 ? '${I18n.t("premium.pay_card")} $price' : I18n.t('premium.pay_solana'), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
          )),
          const SizedBox(height: 10),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.verified_user, size: 12, color: AppColors.success), const SizedBox(width: 3),
            const Text('SSL 256-bit', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
            const SizedBox(width: 12),
            const Icon(Icons.shield, size: 12, color: AppColors.success), const SizedBox(width: 3),
            const Text('PCI DSS', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
            if (_paymentMethod == 1) ...[
              const SizedBox(width: 12),
              Container(width: 12, height: 12, decoration: const BoxDecoration(color: Color(0xFF9945FF), shape: BoxShape.circle)),
              const SizedBox(width: 3),
              const Text('Solana', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
            ],
          ]),
        ])),
      ])),
    );
  }

  Widget _buildPaymentTab(int index, IconData icon, String label) {
    final sel = _paymentMethod == index;
    final c = index == 0 ? AppColors.primary : const Color(0xFF9945FF);
    return Expanded(child: GestureDetector(onTap: () => setState(() => _paymentMethod = index),
      child: Container(padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(color: sel ? c.withValues(alpha: 0.08) : AppColors.background, borderRadius: BorderRadius.circular(10),
          border: Border.all(color: sel ? c : AppColors.cardBorder, width: sel ? 2 : 1)),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 16, color: sel ? c : AppColors.textMuted), const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: sel ? FontWeight.w600 : FontWeight.w400, color: sel ? c : AppColors.textMuted)),
        ]),
      ),
    ));
  }

  Widget _buildCardForm() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _buildField('Numero', _cardNumberController, Icons.credit_card),
      const SizedBox(height: 8),
      Row(children: [
        Expanded(child: _buildField('Exp.', _expiryController, Icons.calendar_today)),
        const SizedBox(width: 8),
        Expanded(child: _buildField('CVC', _cvcController, Icons.lock_outline)),
      ]),
    ]);
  }

  Widget _buildSolanaForm(String price) {
    return Container(padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF9945FF).withValues(alpha: 0.04), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF9945FF).withValues(alpha: 0.15))),
      child: Column(children: [
        Row(children: [
          Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFF9945FF).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: const Center(child: Text('◎', style: TextStyle(fontSize: 20, color: Color(0xFF9945FF))))),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Solana', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            Text(I18n.t('premium.solana_compatible'), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          ])),
        ]),
        const SizedBox(height: 12),
        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.cardBorder)),
          child: Column(children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Montant', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), Text(price, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600))]),
            const SizedBox(height: 6),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('SOL', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), Text('~${widget.selectedPlan == 0 ? "0.035" : "0.21"} SOL', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF9945FF)))]),
          ])),
        const SizedBox(height: 10),
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.info.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(6)),
          child: Row(children: [
            Icon(Icons.info_outline, size: 14, color: AppColors.info), const SizedBox(width: 6),
            Expanded(child: Text(I18n.t('premium.wallet_prompt'), style: TextStyle(fontSize: 10, color: AppColors.info))),
          ])),
      ]),
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon) {
    return TextField(controller: controller, decoration: InputDecoration(
      prefixIcon: Icon(icon, size: 16, color: AppColors.textMuted), hintText: label,
      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
      filled: true, fillColor: AppColors.background,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
      isDense: true,
    ), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500));
  }

  void _processPayment() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) { setState(() => _isProcessing = false); widget.onSuccess(); }
  }
}
