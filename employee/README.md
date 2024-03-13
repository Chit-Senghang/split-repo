# How to run core on local

## To create DB and redis
command: `yarn start:db`

After create it will create
    - redis
    - postgres database with all db module

## To see redis GUI

command: `sudo snap install redis-desktop-manager`

## To create kong api gateway

command: `yarn start:kong`
access to UI: localhost:8002

## To Run Authentication
command: `yarn start:local:authentication`

note:
    - must run after set up kong api geteway

## To Run Employee
command: `yarn start:local:employee`

## To setup route

command: `bash setup-kong-route.sh localhost:8001 false`

note:
    - this one must run after `Run Authentication`
    - `localhost:8001`: is the kong config routes
    - `false`: running on local mode
    - if something goes wrong please down kong(yarn down:kong) and start kong (yarn start:kong) and reset routes

## To Request API
http://localhost:8000

## How to run E2E test
command: `yarn test:e2e test/time-and-attendance/overtime-request-type/overtime-request-type-e2e-spec.ts` for specific file
command: `yarn test:e2e -t 'Test Name'` for name parttern
command: `yarn test:e2e test/time-and-attendance/overtime-request-type/overtime-request-type-e2e-spec.ts -t 'Test Name'` for specific file and specific name

## To run with backup db
backup 3 dbs from server: https://wiki.igsaas.asia/en/guide/how-to-back-up-pg-db 

and name it to

    - hrm_employee
    - hrm_authentication
    - local_kong_gateway (for kong db)

yarn start:from:backup

yarn start:local:authentication

yarn start:local:employee

If not working please run 

docker compose -f docker-compose-from-backup.yaml stop

docker compose -f docker-compose-from-backup.yaml start 