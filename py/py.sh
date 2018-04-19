#!/usr/bin/env bash

py() {
    if [ -z "$1" ]; then
        python
    else
        $GCJ_TEMPLATE_DIR/py/py.js $@
    fi
}
