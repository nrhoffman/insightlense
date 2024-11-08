#!/bin/bash

# Step 1: Install node_modules
echo "Installing node modules..."
npm install

# Step 2: Compile the project using webpack
echo "Running Webpack build..."
npx webpack --config webpack.config.js

# Define the extension path
EXTENSION_PATH="$(pwd)"

# Define Canary Path For Windows 10/11
CHROME_CANARY_PATH="$USERPROFILE\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe"

# Step 3: Open Chrome Canary with the extension loaded
echo "Launching Chrome Canary with extension..."
"$CHROME_CANARY_PATH" --load-extension="$EXTENSION_PATH" --user-data-dir=/tmp/temp_chrome_canary_profile

# Check if Chrome Canary launched successfully
if [ $? -ne 0 ]; then
    echo "Autoload failed - load to Canary manually."
else
    echo "Chrome Canary launched successfully."
fi

echo "Done!"