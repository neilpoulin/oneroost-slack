#!/usr/bin/env bash
echo Cleaning DB
mongo localhost:27017/oneroost-slack clean.js
echo finished cleaning db