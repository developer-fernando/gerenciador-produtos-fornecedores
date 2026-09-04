FROM php:8.4-cli

# Dependências de sistema e extensões PHP necessárias ao Laravel + MySQL
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring bcmath zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer (copiado da imagem oficial)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Entrypoint de bootstrap (fora de /app para não ser sombreado pelo bind mount)
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
