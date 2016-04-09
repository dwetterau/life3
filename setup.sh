#!/usr/bin/env bash
rm -rf .meteor/ packages/
meteor create . &&\
meteor remove autopublish && \
meteor remove insecure && \
meteor add accounts-ui accounts-password && \
meteor add kadira:react-layout kadira:flow-router
