#!/bin/bash
# File run by jenkins to install/test app

# Things we have to do manually until new jenkins builder is done
# 1. Set artifactory up
# 2. Publish tap test results
# Other things needed
# 1. .netrc configuration files

# Make sure we have the right version of node running, using nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
# Fail on first error, but after loading nvm, since above line exits with status of 3
set -e

nvm install
echo -n "Node version: "
node -v
echo -n "NPM version: "
npm -v

# Install dependencies
# set the cache folder to be in the workspace to avoid issues caused by sharing the folder with other jobs
npm config set cache $WORKSPACE/npm-cache --global
rm -rf node_modules
rm -rf bower_components
npm install -g bower bower-art-resolver gulp grunt-cli phantomjs-prebuilt
npm install
bower install

# Run tests
# node node_modules/ember-cli/bin/ember test > results.tap

# Set build version for dist artifact
now=`date -u +"%Y%m%d%H%M%S"`
gitHash=${GIT_COMMIT:0:7}
app_name=`cat package.json | grep -oP '"name": "\K(.*)(?=",)'`
package_version=`cat package.json | grep -oP '"version": "\K(.*)(?=",)'`
app_version="${package_version}-build.${BUILD_NUMBER}+${now}-${gitHash}"
cat <<EOT > ${WORKSPACE}/build.properties
app_version=${app_version}
app_name=${app_name}
tag=${app_version}
EOT

# Zip up project to be archived
zip -r ${app_name}-${app_version}.zip "."

# Send notificaton in slack
# ghetto url encode :)
URL_SAFE_REV=`echo $app_version | sed 's/+/%2B/g'`
BUILD_TYPE=`echo $JOB_NAME | sed "s/$app_name-//g"`
BRANCH=`echo $GIT_BRANCH | sed "s/origin\///g"`
URL="http://dev-rundeck-manual01.aws.tfly-internal.com:4440/project/engineering/job/show/9ddab825-0f59-42ec-a4a5-8a8317eaec0d?argString=-REVISION+${URL_SAFE_REV}+-BUILD_TYPE+${BUILD_TYPE}+-PROJECT+${app_name}"
MESSAGE="*$JOB_NAME* build $BUILD_NUMBER completed \`$BRANCH\` \`$app_version\`
><$BUILD_URL|Info>
><$URL|Deploy>"


curl -X POST --data-urlencode "payload={\"channel\": \"#ember-deploy\", \"username\": \"Jenkins Build\", \"text\": \"$MESSAGE\", \"icon_emoji\": \":dark_sunglasses:\"}" https://hooks.slack.com/services/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
