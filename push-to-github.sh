#!/bin/bash

# Replace YOUR_USERNAME with your actual GitHub username
# Replace YOUR_REPOSITORY with your actual repository name (probably parcel-ocr-system)

echo "🚀 Pushing to GitHub..."
echo "Make sure you've created the repository on GitHub first!"
echo ""

read -p "Enter your GitHub username: " username
read -p "Enter your repository name (default: parcel-ocr-system): " reponame

if [ -z "$reponame" ]; then
    reponame="parcel-ocr-system"
fi

echo ""
echo "Adding remote origin..."
git remote add origin "https://github.com/$username/$reponame.git"

echo "Setting main branch..."
git branch -M main

echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub:"
echo "https://github.com/$username/$reponame"