#!/bin/bash

ts_files=$(find src | grep -v '[[:upper:]]' | grep -v src/tests | grep .ts)

generated_ts_files=$(find src | grep '[[:upper:]]' | grep -v src/tests | grep .ts)

derw_files=$(find src | grep '[[:upper:]]' | grep -v src/tests | grep .derw)

cloc $ts_files $derw_files --force-lang=elm,derw | sed s/'Elm '/Derw/g
# cloc $generated_ts_files
# cloc $derw_files --force-lang=elm,derw | sed s/Elm/Derw/g