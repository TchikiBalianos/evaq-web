import 'package:flutter_test/flutter_test.dart';
import 'package:evaq/main.dart';

void main() {
  testWidgets('EVAQ app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const EvaqApp());
    expect(find.text('EVAQ'), findsWidgets);
  });
}
