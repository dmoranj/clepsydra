"use strict";

function tabs(n) {
    var tabulation = '';

    for (var i=0; i < n; i++) {
        tabulation += '\t\t\t\t\t\t\t\t\t\t\t\t';
    }

    return tabulation;
}

exports.tabs = tabs;