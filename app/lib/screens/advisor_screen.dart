import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/evaq_provider.dart';
import '../utils/constants.dart';
import '../utils/i18n.dart';

class AdvisorScreen extends StatefulWidget {
  const AdvisorScreen({super.key});

  @override
  State<AdvisorScreen> createState() => _AdvisorScreenState();
}

class Message {
  final String content;
  final bool isUser;
  final DateTime timestamp;

  Message({required this.content, required this.isUser, required this.timestamp});
}

class _AdvisorScreenState extends State<AdvisorScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Message> _messages = [];
  bool _isTyping = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _messages.add(Message(
      content: I18n.locale == 'fr' 
          ? "Bonjour. Je suis SENTINEL, votre conseiller d'urgence. Je suis prêt à vous guider dans toute situation critique. Comment puis-je vous aider ?" 
          : "Hello. I am SENTINEL, your emergency advisor. I am ready to guide you through any critical situation. How can I help you?",
      isUser: false,
      timestamp: DateTime.now(),
    ));
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isTyping) return;

    setState(() {
      _messages.add(Message(content: text, isUser: true, timestamp: DateTime.now()));
      _controller.clear();
      _isTyping = true;
    });
    _scrollToBottom();

    // Mock AI Logic (Parity with PWA sentinel-logic.ts)
    await Future.delayed(const Duration(milliseconds: 1500));
    
    String response = "";
    final lower = text.toLowerCase();
    final l = I18n.locale;

    if (lower.contains('nucléaire') || lower.contains('radiation') || lower.contains('iode')) {
      response = l == 'fr' 
        ? "### Protocole : Menace Nucléaire ☢️\n\n- Entrez dans le bâtiment le plus proche\n- Fermez tout et calfeutrez\n- Prenez l'iode sur consigne officielle uniquement\n- Écoutez la radio officielle."
        : "### Protocol: Nuclear Threat ☢️\n\n- Enter the nearest building\n- Close everything and seal\n- Take iodine only when instructed\n- Listen to official radio.";
    } else if (lower.contains('inondation') || lower.contains('eau')) {
      response = l == 'fr'
        ? "### Protocole : Inondation 🌊\n\n- Montez dans les étages\n- Coupez le gaz/élec\n- Ne traversez pas d'eau à pied/voiture\n- Kit de survie prêt."
        : "### Protocol: Flood 🌊\n\n- Move to upper floors\n- Cut gas/elec\n- Do not cross water on foot/car\n- Survival kit ready.";
    } else {
      response = l == 'fr'
        ? "Je ne reconnais pas cette menace. Précisez la situation (ex: 'Que faire en cas de séisme ?')."
        : "I don't recognize this threat. Please clarify (e.g., 'What to do in an earthquake?').";
    }

    if (mounted) {
      setState(() {
        _messages.add(Message(content: response, isUser: false, timestamp: DateTime.now()));
        _isTyping = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Consumer<EvaqProvider>(
          builder: (context, provider, _) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('SENTINEL AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
                  if (provider.isPremium) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.1), border: Border.all(color: Colors.amber.withValues(alpha: 0.3)), borderRadius: BorderRadius.circular(4)),
                      child: const Text('PRO', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.amber)),
                    ),
                  ],
                ],
              ),
              Row(
                children: [
                  Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                  const SizedBox(width: 4),
                  const Text('EN LIGNE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1, color: AppColors.textMuted)),
                ],
              ),
            ],
          ),
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.info_outline, size: 20)),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageTile(msg);
              },
            ),
          ),
          if (_isTyping) 
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
                  const SizedBox(width: 8),
                  Text(I18n.locale == 'fr' ? 'Analyse en cours...' : 'Analyzing...', style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontStyle: FontStyle.italic)),
                ],
              ),
            ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageTile(Message msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: msg.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!msg.isUser) _buildAvatar(false),
          const SizedBox(width: 10),
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: msg.isUser ? Colors.black : AppColors.surface,
                borderRadius: BorderRadius.circular(16).copyWith(
                  topLeft: msg.isUser ? const Radius.circular(16) : Radius.zero,
                  topRight: msg.isUser ? Radius.zero : const Radius.circular(16),
                ),
                border: Border.all(color: msg.isUser ? Colors.black : AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    msg.content, 
                    style: TextStyle(color: msg.isUser ? Colors.white : AppColors.textPrimary, fontSize: 13, height: 1.4)
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${msg.timestamp.hour}:${msg.timestamp.minute.toString().padLeft(2, "0")}',
                    style: TextStyle(fontSize: 8, color: (msg.isUser ? Colors.white : AppColors.textMuted).withValues(alpha: 0.6))
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          if (msg.isUser) _buildAvatar(true),
        ],
      ),
    );
  }

  Widget _buildAvatar(bool isUser) {
    return Container(
      width: 32, height: 32,
      decoration: BoxDecoration(
        color: isUser ? AppColors.surface : AppColors.primary.withValues(alpha: 0.1),
        shape: BoxShape.circle,
        border: Border.all(color: isUser ? AppColors.cardBorder : AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Icon(isUser ? Icons.person : Icons.shield, size: 16, color: isUser ? AppColors.textSecondary : AppColors.primary),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      decoration: const BoxDecoration(color: AppColors.surface, border: Border(top: BorderSide(color: AppColors.cardBorder))),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: I18n.locale == 'fr' ? 'Demander conseil...' : 'Ask for advice...',
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              style: const TextStyle(fontSize: 13),
              onSubmitted: (_) => _handleSend(),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _handleSend,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
              child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
