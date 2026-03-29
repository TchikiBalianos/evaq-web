import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class NeighborhoodScreen extends StatelessWidget {
  const NeighborhoodScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(I18n.t('home.neighborhood')),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🤝', style: TextStyle(fontSize: 60)),
            const SizedBox(height: 20),
            Text(
              I18n.t('home.neighborhood'),
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Discussion locale et entraide en cours de déploiement.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
