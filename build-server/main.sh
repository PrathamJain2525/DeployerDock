#!/bin/bash
# using the bin/bash - shebang (also called a hashbang) to tell the interpreter that we have to use bash to execute this file

# getting environment variable
export GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"


# cloning the git repo to output folder
git clone "$GIT_REPOSITORY_URL" /home/app/output


# executing out script file which performs all the tasks
exec node script.js