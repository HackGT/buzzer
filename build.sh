#!/usr/bin/env bash
SOURCE_DIR=$(readlink -f "${BASH_SOURCE[0]}")
cd "$(dirname "$SOURCE_DIR")" || exit 1
set -xeuo pipefail

./node_modules/tslint/bin/tslint -p server/
./node_modules/typescript/bin/tsc -p server/
