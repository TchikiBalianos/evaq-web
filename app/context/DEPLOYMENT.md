# EVAQ — Guide de build, signing et deploiement

Ce document explique comment compiler, signer et deployer l'application EVAQ sur les differentes plateformes.

---

## 1. Pre-requis environnement

### SDK et outils

| Outil | Version | Chemin |
|-------|---------|--------|
| Flutter SDK | 3.35.4 | `/opt/flutter` |
| Dart SDK | 3.9.2 | Inclus dans Flutter |
| Android SDK | API 35 (Android 15) | `/home/user/android-sdk` |
| Build Tools | 35.0.0 | `/home/user/android-sdk/build-tools/35.0.0` |
| Java | OpenJDK 17.0.2 | `/usr/lib/jvm/java-17-openjdk-amd64` |
| Gradle | Kotlin DSL | Via wrapper dans `android/` |

### Verification de l'environnement

```bash
flutter --version
# Flutter 3.35.4 • Dart 3.9.2

flutter doctor -v
# Verifie tous les composants

java -version
# openjdk version "17.0.2"
```

---

## 2. Structure de build Android

### Fichiers de configuration

```
android/
├── app/
│   ├── build.gradle.kts       # Config Gradle Kotlin DSL
│   └── src/main/
│       ├── AndroidManifest.xml # Manifest Android
│       └── kotlin/com/evaq/app/
│           └── MainActivity.kt  # Activite principale
├── build.gradle.kts            # Config projet
├── settings.gradle.kts         # Settings Gradle
├── key.properties              # Credentials du keystore
└── release-key.jks             # Keystore de signature
```

### Configuration du build (`android/app/build.gradle.kts`)

```kotlin
android {
    namespace = "com.evaq.app"
    compileSdk = flutter.compileSdkVersion    // 35

    defaultConfig {
        applicationId = "com.evaq.app"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode     // 3
        versionName = flutter.versionName     // "1.2.0"
    }

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"]
            keyPassword = keystoreProperties["keyPassword"]
            storeFile = keystoreProperties["storeFile"]
            storePassword = keystoreProperties["storePassword"]
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
            isShrinkResources = false
        }
    }
}
```

---

## 3. Signing (signature)

### Keystore

- **Fichier** : `android/release-key.jks`
- **Type** : JKS (Java Keystore)
- **Taille** : 2732 octets

### Configuration (`android/key.properties`)

```properties
storePassword=evaq2024secure
keyPassword=evaq2024secure
keyAlias=evaq-key
storeFile=../release-key.jks
```

### Verification du keystore

```bash
keytool -list -v -keystore android/release-key.jks -storepass evaq2024secure
```

---

## 4. Build APK release

### Commande complete

```bash
cd /home/user/flutter_app

# 1. Nettoyer le cache Android
rm -rf android/build android/app/build android/.gradle

# 2. Resoudre les dependances
flutter pub get

# 3. Analyser le code
flutter analyze

# 4. Build APK release
flutter build apk --release
```

### Sortie

```
Built build/app/outputs/flutter-apk/app-release.apk (52.0MB)
```

### Verification de l'APK

```bash
ls -lh build/app/outputs/flutter-apk/app-release.apk
# -rw-r--r-- 1 user user 52M ... app-release.apk
```

### Optimisations automatiques

Le build Flutter effectue automatiquement :
- **Tree-shaking des fonts** : MaterialIcons reduit de 1.6MB a ~14KB (99.1%)
- **Tree-shaking Cupertino** : CupertinoIcons reduit de 257KB a ~1.5KB (99.4%)
- **Compilation AOT** : Code Dart compile en code machine natif
- **ProGuard** : Configure mais desactive (isMinifyEnabled = false)

---

## 5. Build Web release

### Commande

```bash
cd /home/user/flutter_app

flutter build web --release \
  --dart-define=flutter.inspector.structuredErrors=false \
  --dart-define=debugShowCheckedModeBanner=false
```

### Sortie

```
flutter_app/build/web/
├── assets/               # Fichiers Dart compiles + assets
├── canvaskit/           # Moteur de rendu CanvasKit
├── favicon.png
├── flutter.js           # Bootstrap Flutter
├── flutter_bootstrap.js
├── flutter_service_worker.js
├── icons/
├── index.html           # Point d'entree
└── manifest.json        # Manifest PWA
```

### Servir le build web

```bash
# Option 1 : Serveur Python simple
cd build/web
python3 -m http.server 5060 --bind 0.0.0.0

# Option 2 : Serveur avec CORS (necessaire pour preview en iframe)
cd build/web
python3 -c "
import http.server, socketserver
class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('X-Frame-Options', 'ALLOWALL')
        self.send_header('Content-Security-Policy', 'frame-ancestors *')
        super().end_headers()
with socketserver.TCPServer(('0.0.0.0', 5060), CORSRequestHandler) as httpd:
    httpd.serve_forever()
"
```

---

## 6. Versioning

### Schema de version

```
version: MAJOR.MINOR.PATCH+BUILD_NUMBER
         1.2.0+3
```

| Composant | Signification |
|-----------|---------------|
| MAJOR (1) | Version majeure (breaking changes) |
| MINOR (2) | Ajout de fonctionnalites |
| PATCH (0) | Correctifs de bugs |
| BUILD (3) | Numero de build incremental |

### Historique des versions

| Version | Build | Date | Description |
|---------|-------|------|-------------|
| 1.0.0 | 1 | 2026-03-28 | Creation initiale Flutter |
| 1.1.0 | 2 | 2026-03-28 | Migration complete PWA → Flutter |
| 1.2.0 | 3 | 2026-03-28 | Carte interactive + verification complete |
| 1.2.1 | 3 | 2026-03-28 | Fix mode test + alertes reelles |

### Modifier la version

Dans `pubspec.yaml` :
```yaml
version: 1.2.1+4
```

---

## 7. Deploiement sur Solana Mobile dApp Store

### Pre-requis

1. **Compte developpeur** sur le Solana Mobile dApp Store
2. **APK signe** en release (voir section 4)
3. **Metadonnees** : nom, description, captures d'ecran, icone
4. **Wallet Solana** pour les frais de publication

### Preparation de l'APK

```bash
# Verifier la signature
jarsigner -verify -verbose build/app/outputs/flutter-apk/app-release.apk

# Verifier l'alignement
zipalign -c 4 build/app/outputs/flutter-apk/app-release.apk
```

### Metadonnees requises

| Champ | Valeur |
|-------|--------|
| Nom | EVAQ — Crisis Alert |
| Package | com.evaq.app |
| Description courte | Alertes de crise geolocalisees et plans d'evacuation |
| Categorie | Outils / Securite |
| Langues | FR, EN, ZH, RU, AR |
| Taille | ~52 MB |
| SDK min | Android API 21 |
| SDK cible | Android API 35 |

---

## 8. GitHub — Gestion du code source

### Repository

- **URL** : `https://github.com/TchikiBalianos/evaq-web`
- **Branche principale** : `main`

### Commandes Git

```bash
cd /home/user/flutter_app

# Verifier le statut
git status

# Ajouter les modifications
git add .

# Commit avec message descriptif
git commit -m "v1.2.1: description des changements"

# Push
git push origin main
```

### Historique des commits

```
3b30259 v1.2.1: fix mode test reactivable + alertes reelles en mode normal (GDACS, ReliefWeb, SENTINEL)
065b16f v1.2.0: carte interactive alertes, i18n 5 langues, RPG kit, packs post-rally, premium Solana, fix UI S9+
```

### .gitignore

Le fichier `.gitignore` exclut :
- `build/` — Artefacts de compilation
- `android/.gradle/` — Cache Gradle
- `.dart_tool/` — Cache Dart
- `.idea/` — Configuration IDE
- `*.iml` — Fichiers IntelliJ

---

## 9. Workflow de release complet

### Checklist pre-release

```
[ ] Code analyse sans erreurs critiques (flutter analyze)
[ ] Version incrementee dans pubspec.yaml
[ ] Toutes les traductions presentes (FR, EN, ZH, RU, AR)
[ ] Tests manuels sur web preview
[ ] Tests manuels sur emulateur Android
[ ] Keystore de signature valide
```

### Etapes de release

```bash
# 1. Analyser le code
cd /home/user/flutter_app
flutter analyze

# 2. Builder le web preview
flutter build web --release

# 3. Builder l'APK
flutter build apk --release

# 4. Verifier la taille
ls -lh build/app/outputs/flutter-apk/app-release.apk

# 5. Commit et push
git add .
git commit -m "v1.2.1: release notes..."
git push origin main

# 6. (Optionnel) Creer un tag Git
git tag -a v1.2.1 -m "Release v1.2.1"
git push origin v1.2.1
```

---

## 10. Troubleshooting

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ClassNotFoundException: MainActivity` | Package Android incorrect | Verifier que le namespace, applicationId et le chemin MainActivity correspondent a `com.evaq.app` |
| `Keystore not found` | Chemin key.properties incorrect | Verifier `storeFile=../release-key.jks` dans key.properties |
| `dart2js exit code -9` | Memoire insuffisante (web build) | Utiliser `flutter build web --release` sans le serveur de dev |
| `Port 5060 already in use` | Ancien serveur encore actif | `lsof -ti:5060 \| xargs -r kill -9` |
| `flutter analyze` warnings | Lint issues non critiques | Les warnings n'empechent pas le build, seules les erreurs bloquent |

### Nettoyage complet

```bash
cd /home/user/flutter_app

# Nettoyage Android uniquement
rm -rf android/build android/app/build android/.gradle

# Nettoyage Web uniquement
rm -rf build/web

# Nettoyage complet
flutter clean
flutter pub get
```
