#!/usr/bin/env sh
set -e

cd /app

# 1) Garante o .env (recruta que clonou não terá .env, pois é ignorado no Git)
if [ ! -f .env ]; then
  echo "[entrypoint] criando .env a partir de .env.example"
  cp .env.example .env
fi

# 2) Instala dependências se ausentes (volume vendor vazio no primeiro up)
if [ ! -f vendor/autoload.php ]; then
  echo "[entrypoint] composer install..."
  composer install --no-interaction --prefer-dist --no-progress
fi

# 3) Gera APP_KEY se ainda não houver
if ! grep -q "^APP_KEY=base64:" .env; then
  echo "[entrypoint] gerando APP_KEY..."
  php artisan key:generate --force
fi

# 4) Aguarda o banco aceitar conexão
echo "[entrypoint] aguardando o banco de dados..."
until php -r '
  $h = getenv("DB_HOST") ?: "db";
  $p = getenv("DB_PORT") ?: "3306";
  $u = getenv("DB_USERNAME") ?: "horizon";
  $w = getenv("DB_PASSWORD") ?: "secret";
  try { new PDO("mysql:host=$h;port=$p", $u, $w); }
  catch (Exception $e) { exit(1); }
' 2>/dev/null; do
  sleep 2
done
echo "[entrypoint] banco disponível."

# 5) Migrations + seed (idempotente)
php artisan migrate --seed --force || php artisan migrate --force

# 6) Sobe o servidor da API
echo "[entrypoint] iniciando API em http://0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000
