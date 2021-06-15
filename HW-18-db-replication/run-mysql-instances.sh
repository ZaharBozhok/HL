#!/bin/bash
mkdir -p master-data slave1-data slave2-data
docker-compose up -d mysql-m mysql-s1 mysql-s2