npm run build

rm -rf /var/www/element/*

mv packages/examples/dist/* /var/www/element

echo "deploy complete success"
