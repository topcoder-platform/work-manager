#!/usr/bin/env bash

# Usage:
#   source ./work-manager/dev-start.sh
#
# The script is designed to be sourced so that exported variables from S3
# are applied to your current shell session. If you execute it without
# sourcing, child processes will still see the variables, but your shell won't.

set -euo pipefail

# Resolve repo/work-manager directory regardless of where this script is sourced from
_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${_SCRIPT_DIR}"

# Defaults and config
APPVAR_S3_URI="${APPVAR_S3_URI:-s3://tc-platform-dev/security-manager/dev-challenge-engine-ui-appvar.json}"
LOCAL_FALLBACK_JSON="${LOCAL_FALLBACK_JSON:-$HOME/Downloads/dev-challenge-engine-ui-appvar.json}"
PORT_VALUE="${PORT_VALUE:-5000}"
PROXY_HOST="${PROXY_HOST:-challenges-local.topcoder-dev.com}"
PROXY_SOURCE_PORT="${PROXY_SOURCE_PORT:-443}"
PROXY_TARGET_PORT="${PROXY_TARGET_PORT:-$PORT_VALUE}"
PROXY_KEY_PATH="${PROXY_KEY_PATH:-${_SCRIPT_DIR}/challenges-local.topcoder-dev.com-key.pem}"
PROXY_CERT_PATH="${PROXY_CERT_PATH:-${_SCRIPT_DIR}/challenges-local.topcoder-dev.com.pem}"
PROXY_LOG_FILE="${PROXY_LOG_FILE:-/tmp/local-ssl-proxy-work-manager.log}"
PROXY_PID_FILE="${PROXY_PID_FILE:-${_SCRIPT_DIR}/.local-ssl-proxy.pid}"

echo "[work-manager] Exporting app vars from: ${APPVAR_S3_URI}"

# Ensure prerequisites
need() { command -v "$1" >/dev/null 2>&1 || { echo "Error: required command '$1' not found." >&2; return 1; }; }

if ! need jq; then
  echo "Please install 'jq' (e.g., 'sudo apt-get install jq' or 'brew install jq')." >&2
  return 1 2>/dev/null || exit 1
fi

# Try to fetch the JSON from S3; fall back to local file if AWS CLI is missing or S3 copy fails
JSON_CONTENT=""
if command -v aws >/dev/null 2>&1; then
  if JSON_CONTENT=$(aws s3 cp "${APPVAR_S3_URI}" - 2>/dev/null); then
    :
  else
    echo "[work-manager] Warning: failed to fetch from S3, will try local fallback: ${LOCAL_FALLBACK_JSON}" >&2
  fi
else
  echo "[work-manager] Warning: 'aws' not found, will try local fallback: ${LOCAL_FALLBACK_JSON}" >&2
fi

if [[ -z "${JSON_CONTENT}" ]]; then
  if [[ -f "${LOCAL_FALLBACK_JSON}" ]]; then
    JSON_CONTENT="$(cat "${LOCAL_FALLBACK_JSON}")"
  else
    echo "Error: Could not obtain JSON from S3 and fallback file not found: ${LOCAL_FALLBACK_JSON}" >&2
    return 1 2>/dev/null || exit 1
  fi
fi

# Validate JSON
if ! echo "${JSON_CONTENT}" | jq -e . >/dev/null 2>&1; then
  echo "Error: Retrieved content is not valid JSON." >&2
  return 1 2>/dev/null || exit 1
fi

# Export each key/value to the current shell
# Only allow POSIX-safe var names; values are safely shell-quoted via @sh
EXPORT_LINES=$(echo "${JSON_CONTENT}" | jq -r '
  to_entries
  | map(select(.key|test("^[A-Za-z_][A-Za-z0-9_]*$")))
  | .[]
  | "export \(.key)=\(.value|@sh)"')

if [[ -n "${EXPORT_LINES}" ]]; then
  eval "${EXPORT_LINES}"
  echo "[work-manager] Exported $(echo "${EXPORT_LINES}" | wc -l | awk '{print $1}') variables to current shell."
else
  echo "[work-manager] No variables exported (no matching keys)." >&2
fi

# Prepare nvm in non-interactive shells, then use it if available
if ! command -v nvm >/dev/null 2>&1; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1090
  if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi
  # shellcheck disable=SC1091
  if [ -s "$NVM_DIR/bash_completion" ]; then . "$NVM_DIR/bash_completion"; fi
fi

if command -v nvm >/dev/null 2>&1; then
  echo "[work-manager] Using Node via nvm..."
  nvm use
else
  echo "[work-manager] Warning: 'nvm' not found; using system Node." >&2
fi

export PORT="${PORT_VALUE}"
echo "[work-manager] Set PORT=${PORT}"

# Manage existing proxy, if any
stop_proxy() {
  if [[ -f "${PROXY_PID_FILE}" ]]; then
    local pid
    pid="$(cat "${PROXY_PID_FILE}" 2>/dev/null || true)"
    if [[ -n "${pid}" ]] && ps -p "${pid}" >/dev/null 2>&1; then
      echo "[work-manager] Stopping existing local-ssl-proxy (pid ${pid})..."
      kill "${pid}" 2>/dev/null || true
      # Give it a moment to exit gracefully
      sleep 0.5
      if ps -p "${pid}" >/dev/null 2>&1; then
        kill -9 "${pid}" 2>/dev/null || true
      fi
    fi
    rm -f "${PROXY_PID_FILE}" || true
  fi
}

start_proxy() {
  if [[ ! -f "${PROXY_KEY_PATH}" || ! -f "${PROXY_CERT_PATH}" ]]; then
    echo "[work-manager] Warning: SSL key/cert not found; skipping local-ssl-proxy." >&2
    echo "  Expected key:  ${PROXY_KEY_PATH}" >&2
    echo "  Expected cert: ${PROXY_CERT_PATH}" >&2
    return 0
  fi

  local proxy_cmd
  if command -v local-ssl-proxy >/dev/null 2>&1; then
    proxy_cmd=(local-ssl-proxy)
  else
    if command -v npx >/dev/null 2>&1; then
      proxy_cmd=(npx -y local-ssl-proxy)
    else
      echo "[work-manager] Warning: neither 'local-ssl-proxy' nor 'npx' found; skipping proxy." >&2
      return 0
    fi
  fi

  echo "[work-manager] Starting local-ssl-proxy on :${PROXY_SOURCE_PORT} -> :${PROXY_TARGET_PORT} (${PROXY_HOST})..."
  ( "${proxy_cmd[@]}" \
      --key "${PROXY_KEY_PATH}" \
      --cert "${PROXY_CERT_PATH}" \
      -n "${PROXY_HOST}" \
      -s "${PROXY_SOURCE_PORT}" \
      -t "${PROXY_TARGET_PORT}" \
      >"${PROXY_LOG_FILE}" 2>&1 & echo $! > "${PROXY_PID_FILE}" )
}

# Ensure any old proxy is stopped, then start a fresh one
stop_proxy || true
start_proxy || true

# On exit of the dev server, stop the proxy we started
_cleanup() {
  stop_proxy || true
}

# Preserve any existing EXIT trap, set our own while the dev server runs
_old_exit_trap="$(trap -p EXIT || true)"
trap _cleanup EXIT

echo "[work-manager] Ensuring pnpm is available via corepack..."
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    corepack prepare pnpm@9.12.0 --activate >/dev/null 2>&1 || true
  fi
fi

RUNNER="pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v npm >/dev/null 2>&1; then
    echo "[work-manager] pnpm not found; falling back to npm."
    RUNNER="npm"
  else
    echo "Error: neither pnpm nor npm is available in PATH." >&2
    return 1 2>/dev/null || exit 1
  fi
fi

echo "[work-manager] Starting app: ${RUNNER} run start:dev (PORT=${PORT})"
"${RUNNER}" run start:dev

echo "[work-manager] Dev server stopped. Cleaning up."
_cleanup || true

# Restore previous EXIT trap (or clear if none)
if [[ -n "${_old_exit_trap}" ]]; then
  eval "${_old_exit_trap}"
else
  trap - EXIT
fi
