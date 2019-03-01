#!/bin/bash
docker run -p 8092:80 --rm --name=seekpath-instance seekpath && echo "You can connect to http://localhost:8092"