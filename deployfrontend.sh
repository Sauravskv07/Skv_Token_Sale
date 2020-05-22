rsync -r src/ docs/
rsync  build/contracts/ docs/
git add .
git commit -m "compiles assets for Githhub Pages"
git push -u origin master
