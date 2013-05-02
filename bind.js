
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
            dataSource = dataContext[dataType.source];
        }

        if (dataSource === undefined || dataSource === null) {
            value = "?" + dataType.source + "?";
        } else if (typeof dataSource === "object") {
            var locale = M.getLocale();
            value = dataSource[locale] || "Missing value for '" + locale + "' language";
        } else {
            value = dataSource.toString();
        }

        var filterFunction = self[dataType.filter] || window[dataType.filter];
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
                console.error("Empty bind 'repeat' target");
                return;
            }

            if (typeof dataContext !== "object" || !dataContext) {
                console.error("A bind 'repeat' can only be used with an object data context");
                return;
            }

            var sourceArray = dataContext[bindTemplate.source];

            if (Object.prototype.toString.call(sourceArray) !== "[object Array]" ) {
                console.error("A bind 'repeat' did not find an array in the source field of the data context");
                return;
            }

            var template = target.clone();
            var container = target.parent();

            // run the pre-filtering handler
            var filterFunction = self[bindTemplate.preFilter] || window[bindTemplate.prefilter];
            if (typeof filterFunction === "function") {
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
            filterFunction = self[bindTemplate.postFilter] || window[bindTemplate.postFilter];
            if (typeof filterFunction === "function") {
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
            target.on(curOn.name, function(event) {
                event.stopPropagation();

                var handler = self[curOn.handler];
                if (typeof handler === "function") {
                    handler(dataContext);
                }
                if (curOn.emit) {
                    self.emit(curOn.emit, dataContext);
                }

                return false;
            });
        }
    }

    for (var i in bind.listen) {
        var curListen = bind.listen[i];
        self.on(curListen.name, curListen.miid, self[curListen.handler]);
    }
};

