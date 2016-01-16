#!/bin/sh

[ -d build ] || mkdir build

./node_modules/.bin/browserify -t [ babelify --presets [ react ] ] src/nextbus.js -o build/nextbus.js
