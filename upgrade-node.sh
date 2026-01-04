#!/bin/bash

# Script to upgrade Node.js in WSL to latest LTS version
# Run this in your WSL terminal: bash upgrade-node.sh

echo "Current Node.js version:"
node -v

echo ""
echo "Checking if nvm is installed..."

# Check if nvm is installed
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "nvm is already installed!"
    source "$HOME/.nvm/nvm.sh"
    
    echo "Installing latest LTS Node.js..."
    nvm install --lts
    nvm use --lts
    nvm alias default node
    
    echo ""
    echo "New Node.js version:"
    node -v
    
elif command -v nvm &> /dev/null; then
    echo "nvm is available, installing latest LTS..."
    nvm install --lts
    nvm use --lts
    nvm alias default node
    
    echo ""
    echo "New Node.js version:"
    node -v
else
    echo "nvm not found. Installing nvm..."
    
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # Source nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    echo "Installing latest LTS Node.js..."
    nvm install --lts
    nvm use --lts
    nvm alias default node
    
    echo ""
    echo "New Node.js version:"
    node -v
    
    echo ""
    echo "⚠️  IMPORTANT: Add these lines to your ~/.bashrc or ~/.zshrc:"
    echo "export NVM_DIR=\"\$HOME/.nvm\""
    echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\""
    echo "[ -s \"\$NVM_DIR/bash_completion\" ] && \. \"\$NVM_DIR/bash_completion\""
fi

echo ""
echo "✅ Node.js upgrade complete!"
echo "Run 'node -v' to verify the version"

