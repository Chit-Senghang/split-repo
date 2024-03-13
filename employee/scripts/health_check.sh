#!/bin/bash

rounds=10;
isHealthCheckOk=OK;
while [ $rounds -gt 0 ]; do
    response=$(curl $API_URL/auth/health);
    if [ "$response" = "$isHealthCheckOk" ]; then
        echo OK && break;
    else
        echo FAIL;
        if [ $rounds -eq 1 ]; then
            exit 1;
        fi
    fi
    ((rounds--));
    sleep 5;
done;