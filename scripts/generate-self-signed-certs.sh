#!/usr/bin/env bash

set -euo pipefail

CERTS_DIR="${1:-certs}"
KEY_FILE="${CERTS_DIR}/privkey.pem"
CERT_FILE="${CERTS_DIR}/fullchain.pem"
CSR_FILE="${CERTS_DIR}/domain.csr"

mkdir -p "${CERTS_DIR}"

if [[ -f "${KEY_FILE}" || -f "${CERT_FILE}" ]]; then
  echo "Removing existing certificate files in ${CERTS_DIR}"
  rm -f "${KEY_FILE}" "${CERT_FILE}"
fi

read -rp "Common Name (CN) for the certificate (default: localhost): " COMMON_NAME
COMMON_NAME=${COMMON_NAME:-localhost}

read -rp "Additional Subject Alternative Names (comma-separated, optional): " SAN_INPUT

declare -a SAN_ENTRIES
declare -A SAN_SEEN

add_san() {
  local value="$1"
  [[ -z "${value}" ]] && return
  if [[ -n "${SAN_SEEN[$value]+x}" ]]; then
    return
  fi
  SAN_SEEN["$value"]=1
  SAN_ENTRIES+=("$value")
}

add_san "${COMMON_NAME}"
if [[ "${COMMON_NAME}" != "localhost" ]]; then
  add_san "localhost"
fi

IFS=',' read -r -a SAN_ARRAY <<< "${SAN_INPUT}"
for SAN in "${SAN_ARRAY[@]}"; do
  SAN_TRIMMED=$(echo "${SAN}" | xargs)
  add_san "${SAN_TRIMMED}"
done

echo "Generating private key..."
openssl genrsa -out "${KEY_FILE}" 2048 >/dev/null

OPENSSL_CONFIG=$(mktemp)

{
  echo "[req]"
  echo "default_bits = 2048"
  echo "prompt = no"
  echo "default_md = sha256"
  echo "req_extensions = v3_req"
  echo "distinguished_name = dn"
  echo
  echo "[dn]"
  echo "CN = ${COMMON_NAME}"
  echo
  echo "[v3_req]"
  echo "subjectAltName = @alt_names"
  echo
  echo "[alt_names]"
} > "${OPENSSL_CONFIG}"

dns_index=1
ip_index=1
for SAN in "${SAN_ENTRIES[@]}"; do
  if [[ "${SAN}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "IP.${ip_index} = ${SAN}" >> "${OPENSSL_CONFIG}"
    ((ip_index++))
  else
    echo "DNS.${dns_index} = ${SAN}" >> "${OPENSSL_CONFIG}"
    ((dns_index++))
  fi
done

echo "Generating certificate signing request..."
openssl req -new -key "${KEY_FILE}" -out "${CSR_FILE}" \
  -config "${OPENSSL_CONFIG}" >/dev/null

echo "Self-signing certificate..."
openssl x509 -req -in "${CSR_FILE}" -signkey "${KEY_FILE}" \
  -out "${CERT_FILE}" -days 365 -extensions v3_req \
  -extfile "${OPENSSL_CONFIG}" >/dev/null

rm -f "${CSR_FILE}"
rm -f "${OPENSSL_CONFIG}"

echo "Self-signed certificate generated:"
echo "  Key:  ${KEY_FILE}"
echo "  Cert: ${CERT_FILE}"
