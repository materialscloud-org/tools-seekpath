#!/bin/bash

cd ../user_static
./minify.sh
cd ..

docker build -t tools-seekpath .
