#!/bin/bash

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ./setup-kong-route.sh $WEB_SERVER_SSH_HOST:/root/dev/koi/setup-kong-route.sh
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ./docker-compose.yaml $WEB_SERVER_SSH_HOST:$COMPOSE_FILE_DIR/$COMPOSE_FILE_NAME

echo $KONG_DATABASE_NAME
echo $DB_HOST
echo $DB_USERNAME
echo $DB_PASSWORD

ssh $WEB_SERVER_SSH_HOST << EOF
    docker system prune -af
    docker login swr.ap-southeast-3.myhuaweicloud.com -u $REGISTRY_USERNAME -p $REGISTRY_PASSWORD
    
    export ENV_DEPLOY_TAG=$DEPLOY_TAG
    export ENV_KONG_PG_DATABASE=$KONG_DATABASE_NAME
    export ENV_KONG_PG_HOST=$DB_HOST
    export ENV_KONG_PG_USER=$DB_USERNAME
    export ENV_KONG_PG_PASSWORD='$DB_PASSWORD'

    docker compose -f $COMPOSE_FILE_DIR/$COMPOSE_FILE_NAME pull
    docker compose -f $COMPOSE_FILE_DIR/$COMPOSE_FILE_NAME up -d
EOF
sleep 30