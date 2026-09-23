#!/usr/bin/env bash
# First-time Ubuntu setup. Run as root. Does not write app secrets.
set -euo pipefail

APP_USER="${APP_USER:-deploy}"
APP_ROOT="/var/www/acme"
NODE_VERSION="22.19.0"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash config/deploy/bootstrap.sh"
  exit 1
fi

if [[ ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
  build-essential git curl ca-certificates xz-utils \
  ruby ruby-dev \
  libpq-dev postgresql postgresql-contrib \
  nginx libyaml-dev zlib1g-dev libssl-dev libreadline-dev \
  libffi-dev pkg-config

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
    | tar -xJ -C /usr/local --strip-components=1
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${APP_USER}"
fi

usermod -aG sudo "${APP_USER}"
cat > "/etc/sudoers.d/${APP_USER}-acme" <<EOF
${APP_USER} ALL=(ALL) NOPASSWD: /bin/systemctl, /usr/sbin/nginx, /usr/bin/install, /usr/bin/ln
EOF
chmod 440 "/etc/sudoers.d/${APP_USER}-acme"

install -d -o "${APP_USER}" -g "${APP_USER}" -m 700 "/home/${APP_USER}/.ssh"
touch "/home/${APP_USER}/.ssh/authorized_keys"
chown "${APP_USER}:${APP_USER}" "/home/${APP_USER}/.ssh/authorized_keys"
chmod 600 "/home/${APP_USER}/.ssh/authorized_keys"

gem install bundler -v 2.7.2 --no-document

install -d -o "${APP_USER}" -g "${APP_USER}" -m 755 \
  "${APP_ROOT}/shared/config" \
  "${APP_ROOT}/shared/log" \
  "${APP_ROOT}/shared/tmp/pids" \
  "${APP_ROOT}/shared/tmp/cache" \
  "${APP_ROOT}/shared/tmp/sockets" \
  "${APP_ROOT}/shared/public/system" \
  "${APP_ROOT}/shared/storage"

systemctl enable --now postgresql nginx

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='acme'" | grep -q 1; then
  sudo -u postgres createuser acme
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='acme_production'" | grep -q 1; then
  sudo -u postgres createdb -O acme acme_production
fi
sudo -u postgres psql -d acme_production -c 'CREATE EXTENSION IF NOT EXISTS pg_trgm;'

rm -f /etc/nginx/sites-enabled/default

echo "ruby=$(ruby -v)"
echo "node=$(node -v)"
echo "bundle=$(bundle -v)"
echo "Bootstrap done. Add the deploy SSH public key to /home/${APP_USER}/.ssh/authorized_keys."
echo "Copy config/master.key and shared/config/database.yml from your laptop — do not commit them."
