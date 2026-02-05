#!/bin/sh
set -e

npx drizzle-kit migrate
exec node .output/server/index.mjs