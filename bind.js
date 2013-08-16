function findValue (parent, dotNot) {

    if (!dotNot) return undefined;

    var splits = dotNot.split(".");
    var value;

    for (var i = 0; i < splits.length; i++) {
        value = parent[splits[i]];
        if (value === undefined) return undefined;
        if (typeof value === "object") parent = value;
    }

    return value;
}

function findFunction (parent, dotNot) {

    var func = findValue(parent, dotNot);

    if (typeof func !== "function") {
        return undefined;
    }

    return func;
}

var Bind = module.exports = function (bind, dataContext) {

    var self = this;

    var context = $(this.dom);
    if (bind.context) {
        context = $(bind.context, context);
    }
    var target = context;
    if (bind.target) {
        target = $(bind.target, context);
    }

    dataContext = dataContext || {};

    function computeStringOrSourceDataValue(dataType, dataContext) {
        var value = "";
        if (typeof dataType === "string") {
            value = dataType;
        } else {
            value = computeDataValue(dataType, dataContext);
        }
        return value;
    }

    function computeDataValue(dataType, dataContext) {

        var dataSource = undefined;

        if (dataType.source === "$") {
            dataSource = dataContext.toString();
        } else {
            dataSource = findValue(dataContext, dataType.source);
        }

        if (dataSource === undefined || dataSource === null) {
            if (typeof dataType["default"] === "string") {
                value = dataType["default"];
            } else {
                value = "?" + dataType.source + "?";
            }
        } else if (typeof dataSource === "object") {
            var locale = M.getLocale();
            value = dataSource[locale] || "Missing value for '" + locale + "' language";
        } else {
            value = dataSource.toString();
        }

        var filterFunction = findFunction(self, dataType.filter) || findFunction(window, dataType.filter);
        if (typeof filterFunction === "function") {
            value = filterFunction(self, dataContext, dataType.source, value);
        }

        return value;
    };

    var domManipulators = {

        // add/modify attribute
        /* Examples:
         *  "binds": [
         *      {
         *          "attr": [
         *              {
         *                  "name": "the_attribute name",
         *                  "value": "a_string_value"
         *              },
         *              {
         *                  "name": "the_attribute name",
         *                  "value": {
         *                      "source": "the_field_name_from_a_source"
         *                  }
         *              },
         *              ...
         *          ]
         *      }
         *  ]
         */
        attr: function(target, context, attrTypes, dataContext) {
            for (var i in attrTypes) {
                var value = computeStringOrSourceDataValue(attrTypes[i].value, dataContext);
                target.attr(attrTypes[i].name, value);
            }
        },

        // add class
        /* Examples:
         *  "binds": [
         *      {
         *          "addClass": [
         *              "class_1",
         *              "class_2",
         *              ...
         *          ]
         *      }
         *  ]
         */
        addClass: function(target, context, classes, dataContext) {
            for (var i in classes) {
                target.addClass(classes[i]);
            }
        },

        // remove class
        /* Examples:
         *  "binds": [
         *      {
         *          "removeClass": [
         *              "class_1",
         *              "class_2",
         *              ...
         *          ]
         *      }
         *  ]
         */
        removeClass: function(target, context, classes, dataContext) {
            for (var i in classes) {
                target.removeClass(classes[i]);
            }
        },

        // innerHTML
        /* Examples:
         *  "binds": [
         *      {
         *          "html": "a_string_value"
         *      },
         *
         *      {
         *          "html": {
         *              "source": "the_field_name_from_a_source"
         *          }
         *      }
         *  ]
         */
        html: function(target, context, dataType, dataContext) {
            var value = computeStringOrSourceDataValue(dataType, dataContext);
            target.html(value);
        },

        // repeat the target for each item in array source
        /*
         *   "binds": [
         *       {
         *           "repeat": {
         *               "source": "the_array_name_from_a_source",
         *               "preFilter": "handler_name",
         *               "postFilter": "handler_name",
         *               "binds": [
         *                   ...
         *               ]
         *           }
         *       }
         *   ]
         */
        repeat: function(target, context, bindTemplate, dataContext) {

            if (!target.length) {
                console.warn("Empty bind 'repeat' target");
                return;
            }

            if (typeof dataContext !== "object" || !dataContext) {
                console.warn("A bind 'repeat' can only be used with an object data context");
                return;
            }

            var sourceArray = dataContext[bindTemplate.source] || [];

            if (Object.prototype.toString.call(sourceArray) !== "[object Array]" ) {
                console.warn("A bind 'repeat' did not find an array in the source field of the data context");
                return;
            }

            var template = target.clone();
            var container = target.parent();

            // run the pre-filtering handler
            var filterFunction = findFunction(self, bindTemplate.preFilter) || findFunction(window, bindTemplate.prefilter);
            if (filterFunction) {
                sourceArray = filterFunction(self, dataContext, bindTemplate.source, sourceArray, container);
            }

            // run the binds for each item
            for (var i = 0; i < sourceArray.length; ++i) {

                var newDom = template.clone();

                if (!bindTemplate.binds || !bindTemplate.binds.length) {
                    continue;
                }

                for (var j = 0; j < bindTemplate.binds.length; ++j) {
                    var bind = bindTemplate.binds[j];
                    bind.context = newDom;
                    Bind.call(self, bind, sourceArray[i]);
                }

                container.append(newDom);
            }

            // run the post-filtering handler
            filterFunction = findFunction(self, bindTemplate.postFilter) || findFunction(window, bindTemplate.postFilter);
            if (filterFunction) {
                sourceArray = filterFunction(self, dataContext, bindTemplate.source, sourceArray, container);
            }

            target.remove();
        }
    }

    for (var i in bind) {
        if (domManipulators[i]) {
            domManipulators[i](target, context, bind[i], dataContext);
        }
    }

    for (var i in bind.on) {
        var curOn = bind.on[i];
        if (curOn.handler || curOn.emit) {
            (function (curOn) {
                target.on(curOn.name, function(event) {
                    event.stopPropagation();

                    var name = curOn.handler;
                    var args = [];

                    if (name instanceof Object) {
                        name = name.name;
                        args = name.args;
                    }

                    var handler = findFunction(self, name) || findFunction(window, name);
                    args.push(dataContext);

                    if (typeof handler === "function") {
                        handler.apply(self, args);
                    }
                    if (curOn.emit) {
                        self.emit(curOn.emit, dataContext);
                    }

                    return false;
                });
            })(curOn);
        }
    }

    for (var i in bind.listen) {
        var curListen = bind.listen[i];
        self.on(curListen.name, curListen.miid, self[curListen.handler]);
    }
};
