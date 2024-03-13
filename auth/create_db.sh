#!/bin/bash
set -e

docker exec -e "PGPASSWORD=$3" -it $1 psql -v ON_ERROR_STOP=1 --username $2 -c "CREATE DATABASE hrm_authentication;"
docker exec -e "PGPASSWORD=$3" -it $1 psql -v ON_ERROR_STOP=1 --username $2 -c "CREATE DATABASE hrm_employee;"
