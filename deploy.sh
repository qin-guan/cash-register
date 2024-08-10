#!/bin/bash

docker-compose down

docker build . -t cash-register

docker-compose up -d