define(["/jquery.js"], function() {

    return function(bind, dataContext) {

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

        var computeDataValue = function(dataType, dataContext) {
            var dataSource = dataContext[dataType.source];
            var value = dataSource || "";
            if (value instanceof Object) {
                value = value[self.lang] || "Missing value for '" + self.lang + "' language";
            }
            // apply filters
            return value;
        };

        var domManipulators = {
            // add/modify attribute
            attr: function(target, context, attrTypes, dataContext) {
                for (var i in attrTypes) {
                    var value = "";
                    if (typeof attrTypes[i].value === "string") {
                        value = attrTypes[i].value;
                    } else {
                        value = computeDataValue(attrTypes[i].value, dataContext);
                    }
                    target.attr(attrTypes[i].name, value);
                }
            },

            // innerHTML
            html: function(target, context, dataType, dataContext) {
                var value = "";
                if (typeof dataType === "string") {
                    value = dataType;
                } else {
                    value = computeDataValue(dataType, dataContext);
                }
                target.html(value);
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
    }
});
