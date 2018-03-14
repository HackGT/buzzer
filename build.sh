#!/usr/bin/env bash
SOURCE_DIR=$(readlink -f "${BASH_SOURCE[0]}")
cd "$(dirname "$SOURCE_DIR")"
set -xeuo pipefail

./node_modules/tslint/bin/tslint -p server/
./node_modules/typescript/bin/tsc -p server/

# Generate merged.graphql
node dist/typeDefs.js

# Generated types for api
./node_modules/.bin/graphql-typewriter -i ./merged.graphql
mv ./merged.graphql.types.ts ./server/graphql.types.ts

# Lint and compile app
./node_modules/tslint/bin/tslint -p server/app.tsconfig.json server/app.ts
# Dunno how to compile just server
./node_modules/typescript/bin/tsc -p server/app.tsconfig.json

