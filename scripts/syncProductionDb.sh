#!/bin/bash
heroku pg:backups:capture
heroku pg:backups:download
pg_restore --verbose --clean --no-acl --no-owner -h localhost -U postgres -d direct_index latest.dump
rm -rf latest.dump
