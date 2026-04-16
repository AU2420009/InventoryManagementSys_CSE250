#!/usr/bin/env bash
set -euo pipefail

DOCROOT_DEFAULT="/var/www/html"
SITE_CONF_DEFAULT=""

DOCROOT="${1:-}"
SITE_CONF="${2:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "This script must run as root (use: sudo $0 [docroot] [site_conf])" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_SRC="${REPO_ROOT}/frontend"

if [[ ! -d "${FRONTEND_SRC}" ]]; then
  echo "Frontend folder not found: ${FRONTEND_SRC}" >&2
  exit 1
fi

detect_server_config() {
  local cmd out httpd_root server_config_file resolved

  for cmd in apache2ctl apachectl httpd; do
    if ! command -v "${cmd}" >/dev/null 2>&1; then
      continue
    fi

    out="$("${cmd}" -V 2>/dev/null || true)"
    httpd_root="$(awk -F'"' '/HTTPD_ROOT/ {print $2; exit}' <<<"${out}")"
    server_config_file="$(awk -F'"' '/SERVER_CONFIG_FILE/ {print $2; exit}' <<<"${out}")"

    if [[ -z "${server_config_file}" ]]; then
      continue
    fi

    if [[ "${server_config_file}" = /* ]]; then
      resolved="${server_config_file}"
    else
      resolved="${httpd_root}/${server_config_file}"
    fi

    if [[ -f "${resolved}" ]]; then
      echo "${resolved}"
      return 0
    fi
  done

  # Fallback common locations
  for resolved in \
    "/etc/apache2/apache2.conf" \
    "/etc/httpd/conf/httpd.conf" \
    "/usr/local/etc/httpd/httpd.conf" \
    "/opt/homebrew/etc/httpd/httpd.conf"; do
    if [[ -f "${resolved}" ]]; then
      echo "${resolved}"
      return 0
    fi
  done

  return 1
}

detect_docroot_from_conf() {
  local conf="${1}"
  local docroot
  docroot="$(awk '
    BEGIN{doc=""}
    /^[[:space:]]*#/ {next}
    /^[[:space:]]*DocumentRoot[[:space:]]+/{
      doc=$2
      gsub(/"/,"",doc)
    }
    END{print doc}
  ' "${conf}" 2>/dev/null || true)"

  if [[ -n "${docroot}" ]]; then
    echo "${docroot}"
    return 0
  fi
  return 1
}

# Auto-detect when not provided
if [[ -z "${SITE_CONF}" ]]; then
  SITE_CONF="$(detect_server_config || true)"
fi

if [[ -z "${SITE_CONF}" ]]; then
  echo "Apache config not found." >&2
  echo "Pass it explicitly: sudo $0 [docroot] /path/to/apache.conf" >&2
  echo "Tip: try: apachectl -V | grep SERVER_CONFIG_FILE" >&2
  exit 1
fi

if [[ ! -f "${SITE_CONF}" ]]; then
  echo "Apache config not found: ${SITE_CONF}" >&2
  exit 1
fi

if [[ -z "${DOCROOT}" ]]; then
  DOCROOT="$(detect_docroot_from_conf "${SITE_CONF}" || true)"
fi

if [[ -z "${DOCROOT}" ]]; then
  DOCROOT="${DOCROOT_DEFAULT}"
fi

echo "==> Enabling Apache rewrite module (idempotent)"
if command -v a2enmod >/dev/null 2>&1; then
  a2enmod rewrite >/dev/null || true
else
  # Best-effort for non-Debian layouts: uncomment (preferred) or add a LoadModule line.
  if grep -Eq '^[[:space:]]*#[[:space:]]*LoadModule[[:space:]]+rewrite_module' "${SITE_CONF}"; then
    cp -a "${SITE_CONF}" "${SITE_CONF}.bak.$(date +%s)"
    # Uncomment the existing line, preserving the module path.
    sed -i 's/^[[:space:]]*#[[:space:]]*LoadModule[[:space:]]\\+rewrite_module/LoadModule rewrite_module/' "${SITE_CONF}"
  elif ! grep -Eq '^[[:space:]]*LoadModule[[:space:]]+rewrite_module' "${SITE_CONF}"; then
    cp -a "${SITE_CONF}" "${SITE_CONF}.bak.$(date +%s)"
    cat >> "${SITE_CONF}" <<'EOF'

# IMS_FRONTEND_REWRITE_MODULE
LoadModule rewrite_module modules/mod_rewrite.so
EOF
  fi
fi

echo "==> Ensuring Apache allows .htaccess in docroot"
echo "    Config: ${SITE_CONF}"
echo "    Docroot: ${DOCROOT}"

MARK_BEGIN="# IMS_FRONTEND_BEGIN"
MARK_END="# IMS_FRONTEND_END"

if ! grep -qF "${MARK_BEGIN}" "${SITE_CONF}"; then
  cp -a "${SITE_CONF}" "${SITE_CONF}.bak.$(date +%s)"
  cat >> "${SITE_CONF}" <<EOF

${MARK_BEGIN}
<Directory ${DOCROOT}>
    Options FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
${MARK_END}
EOF
fi

echo "==> Deploying static frontend to ${DOCROOT}"
mkdir -p "${DOCROOT}"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude 'node_modules' "${FRONTEND_SRC}/" "${DOCROOT}/"
else
  rm -rf "${DOCROOT:?}/"*
  cp -a "${FRONTEND_SRC}/." "${DOCROOT}/"
fi

echo "==> Setting permissions"
if id -u www-data >/dev/null 2>&1; then
  chown -R www-data:www-data "${DOCROOT}" || true
elif id -u http >/dev/null 2>&1; then
  chown -R http:http "${DOCROOT}" || true
fi
find "${DOCROOT}" -type d -exec chmod 755 {} \;
find "${DOCROOT}" -type f -exec chmod 644 {} \;

echo "==> Testing Apache config"
if command -v apache2ctl >/dev/null 2>&1; then
  apache2ctl configtest
fi

echo "==> Reloading Apache"
if command -v systemctl >/dev/null 2>&1; then
  if systemctl list-unit-files 2>/dev/null | grep -qE '^apache2\\.service'; then
    systemctl reload apache2 || systemctl restart apache2
  elif systemctl list-unit-files 2>/dev/null | grep -qE '^httpd\\.service'; then
    systemctl reload httpd || systemctl restart httpd
  else
    systemctl reload apache2 2>/dev/null || systemctl reload httpd 2>/dev/null || true
  fi
else
  if command -v service >/dev/null 2>&1; then
    service apache2 reload 2>/dev/null || service httpd reload 2>/dev/null || true
  fi

  if command -v apache2ctl >/dev/null 2>&1; then
    apache2ctl -k graceful 2>/dev/null || true
  elif command -v apachectl >/dev/null 2>&1; then
    apachectl -k graceful 2>/dev/null || true
  elif command -v httpd >/dev/null 2>&1; then
    httpd -k graceful 2>/dev/null || true
  fi
fi

echo "==> Done"
echo "Frontend deployed to: ${DOCROOT}"
echo "Try: http://localhost/ (or /staff, /admin, /customer, /login)"
