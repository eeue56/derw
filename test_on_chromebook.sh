#!/bin/bash
set -e
for i in {0..250..30}
do
    npx @eeue56/bach -- --in-chunks 30 --chunk-start $i
done