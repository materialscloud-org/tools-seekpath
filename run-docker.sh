#!/bin/bash
docker run -p 8092:80 --rm --name=tools-seekpath-instance tools-seekpath && echo "You can connect to http://localhost:8091"