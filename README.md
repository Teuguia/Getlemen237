# 237 Gentleman

Boutique e-commerce premium pour vetements, chaussures et accessoires masculins.

## Stack

- Laravel 13
- React + Inertia
- Tailwind CSS
- PostgreSQL
- Vite

## Fonctionnalites

- Accueil public avec design 237 Gentleman.
- Authentification client et seller/admin.
- Comptes clients, paniers, commandes et reservations.
- Dashboard seller/admin.
- Gestion produits, prix, promotions, variantes, tailles, couleurs et stocks.
- Upload reel d'images et videos produits.
- Suivi des commandes et statuts de paiement.
- Tests metier panier, commande, stock et reservation.

## Installation locale

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run build
```

Pour lancer le developpement:

```bash
php artisan serve
npm run dev
```

## Base de donnees

Le projet utilise PostgreSQL en local par defaut.

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=getlemen237
DB_USERNAME=postgres
DB_PASSWORD=
```

Adapter ces valeurs dans `.env` selon l'environnement. Ne jamais commiter `.env`.

## Comptes seedes

Admin:

```text
Email: admin@237gentleman.cm
Mot de passe: password
```

Seller:

```text
Identifiant: FOKOA
Email: fokoa@237gentleman.cm
Mot de passe: FOKOUAsteve
```

Les clients creent eux-memes leurs comptes depuis la page d'inscription.

## Tests

```bash
php artisan test
vendor/bin/pint
npm run build
```

Etat actuel:

- 32 tests passent.
- 110 assertions.
- Build Vite production valide.

## Preparation production

Avant de deployer:

- Configurer `APP_ENV=production`.
- Configurer `APP_DEBUG=false`.
- Generer une vraie `APP_KEY`.
- Configurer PostgreSQL production.
- Configurer `APP_URL` avec le domaine final.
- Executer `php artisan migrate --force`.
- Executer `php artisan storage:link`.
- Donner les permissions d'ecriture a `storage` et `bootstrap/cache`.
- Configurer HTTPS.
- Configurer les sauvegardes de base de donnees et des fichiers uploades.
- Remplacer les mots de passe seedes par des mots de passe forts.

## Push Git

```bash
git init
git add .
git commit -m "Initial 237 Gentleman application"
git branch -M main
git remote add origin <url-du-repo>
git push -u origin main
```
