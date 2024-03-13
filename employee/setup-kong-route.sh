#!/bin/bash


kong_url=$1
is_prod_running=$2

authentication_service_url="http://host.docker.internal:8080"
employee_service_url="http://host.docker.internal:8081"
scheduler_service_url="http://host.docker.internal:8083"

if [ $is_prod_running = true ] ; then
    authentication_service_url="http://hrm_authentication:8080"
    employee_service_url="http://hrm_employee:8081"
    scheduler_service_url="http://hrm_scheduler:8083"
fi

# Setup Service

curl --silent --output /dev/null POST --url http://$kong_url/services/ \
    --data 'name=auth' \
    --data "url=$authentication_service_url"

curl --silent --output /dev/null POST --url http://$kong_url/services/ \
    --data 'name=authentication' \
    --data "url=$authentication_service_url"

curl --silent --output /dev/null POST --url http://$kong_url/services/ \
    --data 'name=employee' \
    --data "url=$employee_service_url"

curl --silent --output /dev/null POST --url http://$kong_url/services/ \
    --data 'name=employee-swagger' \
    --data "url=$employee_service_url"

curl --silent --output /dev/null POST --url http://$kong_url/services/ \
    --data 'name=scheduler' \
    --data "url=$scheduler_service_url"

# Setup route

curl --silent --output /dev/null POST --url http://$kong_url/services/employee/routes \
    -H "Content-Type: application/json" -d '{"name": "employee-routes", "paths": ["/employee"]}'

curl --silent --output /dev/null POST --url http://$kong_url/services/employee-swagger/routes \
    -H "Content-Type: application/json" -d '{"name": "employee-swagger-routes", "paths": ["/employee-swagger"]}'

curl --silent --output /dev/null POST --url http://$kong_url/services/authentication/routes \
    -H "Content-Type: application/json" -d '{"name": "authentication-routes", "paths": ["/authentication"]}'

curl --silent --output /dev/null POST --url http://$kong_url/services/scheduler/routes \
    -H "Content-Type: application/json" -d '{"name": "scheduler-routes", "paths": ["/scheduler"]}'

curl --silent --output /dev/null POST --url http://$kong_url/services/auth/routes \
    -H "Content-Type: application/json" -d '{"name": "auth-routes", "paths": ["/auth"]}'

# Setup JWT Plugin

curl --silent --output /dev/null POST http://$kong_url/services/scheduler/plugins \
    --data "name=jwt" \
    --data "config.secret_is_base64=false" \
    --data "config.run_on_preflight=true" \
    --data "config.claims_to_verify=exp"

curl --silent --output /dev/null POST http://$kong_url/services/employee/plugins \
    --data "name=jwt" \
    --data "config.secret_is_base64=false" \
    --data "config.run_on_preflight=true" \
    --data "config.claims_to_verify=exp"

curl --silent --output /dev/null POST http://$kong_url/services/authentication/plugins \
    --data "name=jwt" \
    --data "config.secret_is_base64=false" \
    --data "config.run_on_preflight=true" \
    --data "config.claims_to_verify=exp"

curl --silent --output /dev/null POST http://$kong_url/services/scheduler/plugins \
    --data "name=jwt" \
    --data "config.secret_is_base64=false" \
    --data "config.run_on_preflight=true" \
    --data "config.claims_to_verify=exp"
# Setup Cors

curl --silent --output /dev/null POST http://$kong_url/services/employee/plugins \
    --data "name=cors" \
    --data "config.origins=*" \
    --data "config.methods=GET" \
    --data "config.methods=DELETE" \
    --data "config.methods=POST" \
    --data "config.methods=PATCH" \
    --data "config.methods=OPTIONS" \
    --data "config.methods=HEAD" \
    --data "config.methods=PUT" \
    --data "config.headers=*" \
    --data "config.credentials=true" \
    --data "config.max_age=3600"

curl --silent --output /dev/null POST http://$kong_url/services/auth/plugins \
    --data "name=cors" \
    --data "config.origins=*" \
    --data "config.methods=GET" \
    --data "config.methods=DELETE" \
    --data "config.methods=POST" \
    --data "config.methods=PATCH" \
    --data "config.methods=OPTIONS" \
    --data "config.methods=HEAD" \
    --data "config.methods=PUT" \
    --data "config.headers=*" \
    --data "config.credentials=true" \
    --data "config.max_age=3600"

curl --silent --output /dev/null POST http://$kong_url/services/authentication/plugins \
    --data "name=cors" \
    --data "config.origins=*" \
    --data "config.methods=GET" \
    --data "config.methods=DELETE" \
    --data "config.methods=POST" \
    --data "config.methods=PATCH" \
    --data "config.methods=OPTIONS" \
    --data "config.methods=HEAD" \
    --data "config.methods=PUT" \
    --data "config.headers=*" \
    --data "config.credentials=true" \
    --data "config.max_age=3600"

curl --silent --output /dev/null POST http://$kong_url/services/scheduler/plugins \
    --data "name=cors" \
    --data "config.origins=*" \
    --data "config.methods=GET" \
    --data "config.methods=DELETE" \
    --data "config.methods=POST" \
    --data "config.methods=PATCH" \
    --data "config.methods=OPTIONS" \
    --data "config.methods=HEAD" \
    --data "config.methods=PUT" \
    --data "config.headers=*" \
    --data "config.credentials=true" \
    --data "config.max_age=3600"

curl --silent --output /dev/null POST http://$kong_url/services/employee-swagger/plugins \
    --data "name=cors" \
    --data "config.origins=*" \
    --data "config.methods=GET" \
    --data "config.methods=POST" \
    --data "config.methods=PATCH" \
    --data "config.methods=DELETE" \
    --data "config.methods=OPTIONS" \
    --data "config.methods=HEAD" \
    --data "config.methods=PUT" \
    --data "config.headers=*" \
    --data "config.credentials=true" \
    --data "config.max_age=3600"