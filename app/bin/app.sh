#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/app_base.sh"

# waiting for db
python $manage wait-for-db

# django init
if [ ! -f .init ]; then
    python $manage migrate --noinput
    python $manage bower_install --allow-root
    touch .init
fi

# run migrations
python $manage migrate --noinput

# timeside setup
python $manage timeside-create-admin-user
python $manage timeside-create-boilerplate

# if [ $DEBUG = "False" ]; then
#     python $manage update_index --workers $processes &
# fi

# app start
if [ "$1" = "--runserver" ]
then
    python $manage runserver 0.0.0.0:8000
else
    # static files auto update
    python $manage collectstatic --noinput -i *node_modules*

    # fix media access rights
    find $media -maxdepth 1 -path ${media}import -prune -o -type d -not -user www-data -exec chown www-data:www-data {} \;

    # watchmedo shell-command --patterns="*.js;*.css" --recursive \
    #     --command='python '$manage' collectstatic --noinput' $src &

    uwsgi --socket :$port --wsgi-file $wsgi --chdir $app --master \
        --processes $processes --threads $threads \
        --uid $uid --gid $gid --logto $log --touch-reload $wsgi
fi
