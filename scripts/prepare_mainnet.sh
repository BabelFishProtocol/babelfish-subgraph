export NETWORK=mainnet;
red=`tput setaf 1`
yellow=`tput setaf 3`
green=`tput setaf 2`
reset=`tput sgr0`
echo "Preparing subgraph for ${yellow}$NETWORK${reset} network" && echo;
npx mustache config/RSK.mainnet.json subgraph.template.yaml > subgraph.yaml;
echo "File: ${green}subgraph.yaml${reset} has been mustached";
npx mustache config/RSK.mainnet.json docker-compose.template.yml > docker-compose.yml;
echo "File: ${green}docker-compose.yml${reset} has been mustached";
echo "Copying bassets file for ${yellow}$NETWORK${reset} network" && echo
cp src/utils/bAssets.mainnet.ts src/utils/bAssets.ts
echo "bAssets file has been copied" && echo
echo "Copying env file file for ${yellow}$NETWORK${reset} network" && echo
cp .env_rsk .env
echo "env file has been copied" && echo