#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Usage: $0 <input_folder> <output_file>"
    exit 1
fi

input_folder="$1"
output_file="$2"

# Ensure the output file exists (create it if it doesn't)
touch "$output_file"

process_file() {
    local file="$1"
    if [ -r "$file" ]; then  # Check if file is readable
        echo "----- $file -----" >> "$output_file"
        cat "$file" >> "$output_file"
        echo "" >> "$output_file"  # Add a blank line for separation
    fi
}

process_directory() {
    local dir="$1"
    for entry in "$dir"/*; do
        if [ -f "$entry" ]; then
            # Ignore package-lock.json, result.txt, and files with .txt extension
            if [[ "$entry" != *"package-lock.json"* && "$entry" != *"result.txt"* && "${entry##*.}" != "txt" ]]; then
                process_file "$entry"
            fi
        elif [ -d "$entry" ]; then
            # Ignore node_modules, storage, playground, and assets folders
            if [[ "$entry" != *"node_modules"* && "$entry" != *"storage"* && "$entry" != *"playground"* && "$entry" != *"assets"* ]]; then
                process_directory "$entry"
            fi
        fi
    done
}

process_directory "$input_folder"