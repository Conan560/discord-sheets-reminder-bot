# Bot Discord Google Sheets pour la classe

Le bot lit une feuille Google Sheets et envoie automatiquement :

- un rappel pour un **Devoir** exactement **2 jours** avant ;
- un rappel pour un **Examen** exactement **7 jours** avant ;
- un seul rappel par ligne, grâce aux colonnes de suivi ;
- un ping `@everyone` ou un rôle Discord configurable.

## 1. Créer le bot Discord

1. Ouvre le portail Discord Developer : https://discord.com/developers/applications
2. Crée une application, puis un bot.
3. Active l'autorisation `Send Messages` pour le bot.
4. Dans le serveur Discord, invite le bot avec au minimum :
   - `View Channels`
   - `Send Messages`
   - `Mention Everyone` si tu utilises `@everyone`
5. Active « Server Members Intent » uniquement si tu prévois une future commande/listing des membres ; ce bot n'en a pas besoin.
6. Copie le token du bot dans `.env`.

Récupère l'ID du canal Discord : fais un clic droit sur le canal avec le mode développeur activé, puis « Copier l'identifiant ».

## 2. Préparer Google Sheets

1. Crée un Google Sheets nommé, par exemple, `Planning de classe`.
2. Donne au bot une colonne de planification :

| ID | Type | Matiere | Titre | A faire | Date | Statut | Rappel devoir | Rappel examen |
|---|---|---|---|---|---|---|---|---|

Tu peux partir d'une feuille vide : le bot crée automatiquement cette première ligne au démarrage.

- `Type` : `Devoir`, `Examen` ou `Leçon`.
- `Date` : format `JJ/MM/AAAA`, par exemple `02/12/2026`.
- `Statut` : laisse vide pour actif ; mets `Rendu`, `Termine` ou `Annule` pour désactiver le rappel.
- Les élèves peuvent modifier toutes les cellules.
- Les colonnes `Rappel devoir` et `Rappel examen` sont ajoutées automatiquement par le bot ; ne les supprime pas.

## 3. Créer le compte Google

1. Ouvre Google Cloud Console : https://console.cloud.google.com/
2. Crée un projet.
3. Active l'API **Google Sheets API**.
4. Crée un compte de service.
5. Télécharge sa clé JSON et renomme-la `google-credentials.json` à la racine du projet.
6. Dans Google Sheets, utilise « Partager » et ajoute l'adresse `client_email` du JSON avec l'autorisation « Éditeur ».
7. Copie l'ID du Sheets depuis son URL :
   `https://docs.google.com/spreadsheets/d/ID_DU_SHEET/edit`

## 4. Installer et lancer

Avec Node.js 20 ou plus installé :

```powershell
cd C:\code\discord-sheets-bot
Copy-Item .env.example .env
npm install
Copy-Item google-credentials.json.example google-credentials.json
npm start
```

Remplace ensuite les valeurs de `.env` et renseigne la vraie clé dans `google-credentials.json`.

Pour utiliser un rôle plutôt que `@everyone`, rends son identifiant disponible dans `PING_ROLE_ID`. Sinon laisse-le vide.

## 5. Vérifier

Le bot vérifie immédiatement au démarrage, puis toutes les `CHECK_INTERVAL_MINUTES` minutes.

Test rapide :

```powershell
npm test
```

## Installation sur un NAS avec Docker

Depuis le dossier du projet :

```powershell
Copy-Item .env.example .env
# Place la clé Google dans ./google-credentials.json
docker compose up -d --build
docker compose logs -f
```

Sur Synology, QNAP ou un autre NAS :

1. Installe Docker/Container Manager.
2. Copie tout le dossier du projet sur le NAS.
3. Place `.env` et `google-credentials.json` dans ce dossier.
4. Lance `docker compose up -d --build` depuis un terminal SSH.

Le conteneur redémarre automatiquement. Ne publie jamais `.env` ni `google-credentials.json` sur GitHub.
