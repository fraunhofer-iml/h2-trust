#!/bin/bash

# Array of directories to navigate to
directories=(
    "apps/batch-svc"
    "apps/bff"
    "apps/bff-e2e"
    "apps/frontend"
    "apps/frontend-e2e"
    "apps/general-svc"
    "libs/amqp"
    "libs/api"
    "libs/blockchain"
    "libs/configuration"
    "libs/database"
    "libs/storage"
    "libs/utils"
)

# Log file
log_file="run-code-quality-tools.log"

# Clear the log file
>"$log_file"

echo "[INFO] CODE QUALITY started." | tee -a "$log_file"

# Loop through each directory and run eslint
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "[INFO] Running ESLint in $dir" | tee -a "$log_file"
        (cd "$dir" && >"$log_file" && npx eslint --fix './**/*.{ts,js}' 2>&1 | tee -a "$log_file")

        echo "[INFO] Running Prettier in $dir" | tee -a "$log_file"
        (cd "$dir" && >"$log_file" && npx prettier --write './**/*.{ts,js,json}' 2>&1 | tee -a "$log_file")
    else
        echo "[ERROR] Directory $dir does not exist. Skipping..." | tee -a "$log_file"
    fi
done

echo "[INFO] CODE QUALITY completed in all specified directories." | tee -a "$log_file"
