/**
 * Bind
 * ====
 *
 * Bind content and events to the DOM and create DOM Elements.
 *
 * */
var Bind = module.exports = function (bind, dataContext) {

    var self = this
      , context = $(this.dom)
      ;

    if (bind.context) {
        context = $(bind.context, context);
    }

    var target = context;
    if (bind.target) {
        target = $(bind.target, context);
    }

    dataContext = dataContext || {};

    function computeStringOrSourceDataValue (dataType, dataContext) {

        var value = "";
        if (typeof dataType === "string") {
            value = dataType;
        } else {
            value = computeDataValue(dataType, dataContext);
        }

        return value;
    }

    function computeDataValue (dataType, dataContext) {

        var dataSource = undefined;

        // if the source is $ the value the data context will be considered the value
        if (dataType.source === "$") {
            dataSource = dataContext.toString();
        } else {
            dataSource = Utils.findValue (dataContext, dataType.source);
        }

        if (dataSource === undefined || dataSource === null) {
            if (typeof dataType["default"] === "string") {
                value = dataType["default"];
            } else {
                value = "?" + dataType.source + "?";
            }
        } else if (dataSource.constructor.name === "Object") {
            var locale = M.getLocale();
            value = dataSource[locale] || "Missing value for '" + locale + "' language";
        } else {
            value = dataSource;
        }

        var filterFunction = Utils.findFunction (self, dataType.filter) || Utils.findFunction (window, dataType.filter);
        if (typeof filterFunction === "function") {
            value = filterFunction (self, dataContext, dataType.source, value);
        }

        return value;
    };

    var domManipulators = {

        /**
         *  Add/modify attribute
         *
         *  Examples:
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
         *                      "source": "the_field_value_from_a_source"
         *                  }
         *              },
         *              ...
         *          ]
         *      }
         *  ]
         */
        attr: function (target, context, attrTypes, dataContext) {
            if (!attrTypes || !attrTypes.length) {
                return;
            }
            for (var i = 0; i < attrTypes.length; ++i) {
                var value = computeStringOrSourceDataValue (attrTypes[i].value, dataContext);
                target.attr(attrTypes[i].name, value);
            }
        },

        /**
         *  Add/modify properties
         *
         *  Examples:
         *  "binds": [
         *      {
         *          "prop": [
         *              {
         *                  "name": "prop name",
         *                  "value": "a_string_value"
         *              },
         *              {
         *                  "name": "prop name",
         *                  "value": {
         *                      "source": "the_prop_value_from_a_source"
         *                  }
         *              },
         *              ...
         *          ]
         *      }
         *  ]
         */
        prop: function (target, context, propTypes, dataContext) {

            if (!propTypes || !propTypes.length) {
                return;
            }

            for (var i = 0; i < propTypes.length; ++i) {
                var value = computeStringOrSourceDataValue (propTypes[i].value, dataContext);
                target.prop(propTypes[i].name, value);
            }
        },

        /**
         *  Add class
         *  Examples:
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
            if (!classes || !classes.length) {
                return;
            }
            for (var i = 0; i < classes.length; ++i) {
                target.addClass(classes[i]);
            }
        },

        /**
         *  Remove class
         *  Examples:
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

            if (!classes || !classes.length) {
                return;
            }

            for (var i = 0; i < classes.length; ++i) {
                target.removeClass(classes[i]);
            }
        },

        /**
         *  Modify HTML
         *
         *  Examples:
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

            var value = computeStringOrSourceDataValue (dataType, dataContext);

            if (value === undefined || value === null) {
                value = '';
            } else {
                value = value.toString();
            }

            target.html(value);
        },

        /*
         *  Repeat the target for each item in array source
         *
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

            if (!sourceArray || sourceArray.constructor.name !== "Array" ) {
                console.warn("A bind 'repeat' did not find an array in the source field of the data context");
                return;
            }

            var template = target.clone()
              , container = target.parent()
              ;

            // run the pre-filtering handler
            var filterFunction = Utils.findFunction (self, bindTemplate.preFilter) || Utils.findFunction (window, bindTemplate.prefilter);
            if (filterFunction) {
                sourceArray = filterFunction (self, dataContext, bindTemplate.source, sourceArray, container);
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
                    Bind.call (self, bind, sourceArray[i]);
                }

                container.append(newDom);
            }

            // run the post-filtering handler
            filterFunction = Utils.findFunction (self, bindTemplate.postFilter) || Utils.findFunction (window, bindTemplate.postFilter);
            if (filterFunction) {
                sourceArray = filterFunction (self, dataContext, bindTemplate.source, sourceArray, container);
            }

            target.remove();
        }
    }

    for (var key in bind) {
        if (!bind.hasOwnProperty(key)) continue;

        if (domManipulators[key]) {
            domManipulators[key](target, context, bind[key], dataContext);
        }
    }

    if (bind.on) {
        for (var i = 0; i < bind.on.length; ++i) {
            var curOn = bind.on[i];
            if (curOn.handler || curOn.emit) {
                (function (curOn) {
                    var t = target;
                    var s = null;

                    // of the delegated option is set, this bind will work for future DOM insertions
                    if (curOn.delegated) {
                        t = context;
                        s = target.selector;
                    }

                    t.on(curOn.name, s,function(event) {
                        event.stopPropagation();

                        var name = curOn.handler;
                        var args = [];

                        if (typeof name === "object") {
                            args = name.args || [];
                            name = name.name;
                        }

                        // if the noEvent option is set, the DOM event will not be passed to the called handler or emitted event
                        if (!curOn.noEvent) {
                            args.push(event);
                        }

                        args.push(dataContext);

                        if (typeof name === "function") {
                            name.apply(self, args);
                            return false;
                        }

                        var handler = Utils.findFunction (self, name) || Utils.findFunction (window, name);

                        if (typeof handler === "function") {
                            handler.apply(self, args);
                        }

                        if (curOn.emit) {
                            self.emit (curOn.emit, dataContext);
                        }

                        return false;
                    });
                })(curOn);
            }
        }
    }

    for (var key in bind.listen) {
        if (!bind.listen.hasOwnProperty(key)) continue;

        var curListen = bind.listen[key];
        self.on (curListen.name, curListen.miid, self[curListen.handler]);
    }
};
