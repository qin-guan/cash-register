#!/bin/bash

docker-compose down

docker rmi cash-register-cash-register

docker-compose up -d