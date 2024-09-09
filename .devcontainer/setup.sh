#!/bin/bash
echo "Setting up environment..."

# Set up Git user name and email
git config --global user.name "harry"
git config --global user.email "harry@hskr.xyz"

# Add a docker context for motherhouse
docker context create motherhouse --docker "host=ssh://motherhouse" --description "motherhouse docker context"