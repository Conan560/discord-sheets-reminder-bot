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

## 3. Aucun compte Google requis

Le bot lit directement le tableau public. Il n'a besoin ni de clé Google Cloud, ni de compte de service, ni de fichier JSON.

L'identifiant du tableau est déjà configuré dans `.env.example` :
`1jJe1ZutUI0hm-SwT1uaD-pYEwt03rE69Ra5ENvciB5M`

Tu dois seulement copier `.env.example` vers `.env`, puis renseigner le token Discord et l'ID du canal.

## 4. Installer et lancer

Avec Node.js 20 ou plus installé :

```powershell
cd C:\code\discord-sheets-bot
Copy-Item .env.example .env
npm install
npm start
```

Renseigne ensuite `DISCORD_TOKEN` et `DISCORD_CHANNEL_ID` dans `.env`.

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
docker compose up -d --build
docker compose logs -f
```

Sur Synology, QNAP ou un autre NAS :

1. Installe Docker/Container Manager.
2. Copie tout le dossier du projet sur le NAS.
3. Place `.env` dans ce dossier.
4. Lance `docker compose up -d --build` depuis un terminal SSH.

Le conteneur redémarre automatiquement. Les rappels déjà envoyés sont conservés dans `./data/reminders.json`. Ne publie jamais `.env` sur GitHub.
