#!/bin/sh
OLD_NAME_1="Fon-1"
OLD_NAME_2="ClassroomApp Developer"
CORRECT_NAME="tu1en"
CORRECT_EMAIL="thinhcche171897@fpt.edu.vn"

if [ "$GIT_COMMITTER_NAME" = "$OLD_NAME_1" ] || [ "$GIT_COMMITTER_NAME" = "$OLD_NAME_2" ]; then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_NAME" = "$OLD_NAME_1" ] || [ "$GIT_AUTHOR_NAME" = "$OLD_NAME_2" ]; then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
