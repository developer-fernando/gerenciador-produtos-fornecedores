-- Cria o banco de testes (mesmo engine/serviço do banco de desenvolvimento).
CREATE DATABASE IF NOT EXISTS horizon_testing
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Concede acesso do usuário padrão da aplicação ao banco de testes.
GRANT ALL PRIVILEGES ON horizon_testing.* TO 'horizon'@'%';
FLUSH PRIVILEGES;
