rm -rf .meteor/ packages/
meteor create . &&\
meteor remove autopublish && \
meteor add react && \
meteor add accounts-ui accounts-password && \
meteor add meteorhacks:npm cosmos:browserify
