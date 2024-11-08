#!/bin/bash

# Step 1: Install node_modules
echo "Installing node modules..."
npm install

# Step 2: Compile the project using webpack
echo "Running Webpack build..."
npx webpack --config webpack.config.js

echo "Done!"