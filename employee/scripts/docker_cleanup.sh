#!/bin/bash

# remove old images
if docker images -q -f "reference=*authentication*|*employee*|*scheduler*" | grep -q .; then
    docker images -q -f "reference=*authentication*|*employee*|*scheduler*" | xargs docker rmi
fi

# remove container
if [ "$(docker ps -aq)" ]; then
    docker rm $(docker ps -aq)
fi

# remove vaolume
docker volume prune -f