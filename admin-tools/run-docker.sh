#!/bin/bash
OLD_INSTANCE=`docker ps -q -f name=tools-seekpath-instance`
if [ "$OLD_INSTANCE" != "" ]
then
    docker kill $OLD_INSTANCE
fi
docker run -d -p 8092:80 --rm --name=tools-seekpath-instance tools-seekpath && echo "You can connect to http://localhost:8092"
