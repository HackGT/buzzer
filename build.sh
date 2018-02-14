#!/usr/bin/env bash
SOURCE_DIR=$(readlink -f "${BASH_SOURCE[0]}")
cd "$(dirname "$SOURCE_DIR")" || exit
set -xeuo pipefail

# Error below : can't install graphql proper version
# ./node_modules/.bin/graphql-typewriter -i ./api.graphql
# mv ./api.graphql.types.ts ./server/config/

./node_modules/tslint/bin/tslint -p server/
./node_modules/typescript/bin/tsc -p server/
