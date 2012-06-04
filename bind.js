/*
config = {
    
    val: "i am the content",
    mod: "module_instance_id",
    elm: Element,
    query: ".class > li",
    attr: "class",
    scope: {},
    events: {
        
        mousedown: [
            {
                scope: myClass,
                method: "myFunction1",
                args: [1, "two", {}, []],
                useCapture: true //false is default
            }
        ],
        
        mouseup: {
            
            scope: myClass,
            method: "myFunction2",
            args: ["xyz"]
        }
    },
    filters: {
        
        fixed: 2,
        max: 32,
        min: 1,
        pre: "./image/",
        post: ".jpg"
    }
};
*/
"use strict";

define(function() {
    
    // TODO load filters on demand
    var Filters = {
        
        'max': function(value, number) {
            
            if (value > number) {
                
                return number;
            }
            
            return value;
        },
        'min': function(value, number) {
            
            if (value < number) {
                
                return number;
            }
            
            return value;
        },
        'fixed': function(value, digits) {
            
            return value.toFixed(digits);
        },
        'maxChars': function(value, number) {
            
            if (value.length > number) {
                
                return value.substr(0, number);
            }
            
            return value;
        },
        'minChars': function(value, number) {
            
            if (value.length < number) {
                
                return "";
            }
            
            return value;
        },
        'int': function(value, radix) {
            
            return parseInt(value, radix || 10) || 0;
        },
        'float': function(value) {
            
            return parseFloat(value) || 0;
        },
        'pre': function(value, content) {
            
            return content + value;
        },
        'post': function(value, content) {
            
            return value + content;
        }
    };
    
    // TODO create removeEvent function
    // TODO check memory usage
    function addEvent(element, event, config) {
        
        var handler = function() {
            
            if (config.scope[config.method]) {
            
                config.scope[config.method].apply(config.scope, config.args);
            }
            
            return null;
        };
        
        if (element.addEventListener) {
            
            element.addEventListener(event, handler, config.useCapture || false);
        }
        else if (element.attachEvent) {
            
            element.attachEvent(event, handler);
        }
    }
    
    function Bind(config) {
        
        // TODO find a better solution.. this is no good
        config = N.merge(config, this);
        
        //check mandatory config attributes
        if (typeof config.val !== "undefined" || typeof config.events === "object") {
            
            //set element to the document instance if element is not a DOM element
            if (!(config.elm instanceof Document || config.elm instanceof Element)) {
                
                config.elm = document;
            }
            
            //a selector is required if element is the document instance
            if (config.elm instanceof Document && typeof config.query !== "string") {
                
                return;
            }
            
            //get the child element, if selector is given
            if (typeof config.query == "string") {
                
                config.elm = config.elm.querySelector(config.query);
                
                if (!config.elm) {
                    
                    return;
                }
            }
            
            //add events to dom elements
            if (typeof config.events === "object") {
                
                for (var event in config.events) {
                    
                    if (config.events[event] instanceof Array) {
                        
                        for (var i = 0, l = config.events[event].length; i < l; ++i) {
                            
                            config.events[event][i].scope = config.events[event][i].scope || this.scope;
                            
                            addEvent(config.elm, event, config.events[event][i]);
                        }
                    }
                    else {
                        
                        config.events[event].scope = config.events[event].scope || this.scope;
                        
                        addEvent(config.elm, event, config.events[event]);
                    }
                }
            }
            
            if (config.val) {
                
                //filter content
                if (typeof config.filters === "object" || this.filters) {
                    
                    for (var filter in config.filters) {
                        
                        if (Filters[filter]) {
                            
                            config.val = Filters[filter](config.val, config.filters[filter]);
                        }
                    }
                }
                
                //set content
                if (typeof config.attr === "string") {
                    
                    config.elm.setAttribute(config.attr, config.val);
                }
                else {
                    
                    config.elm.textContent = config.val;
                }
            }
            
            if (config.miid) {
                
                N.mod(config.elm, config.miid, config.onModuleLoad);
            }
        }
    }
    
    return function(defaultConfig) {
        
        var bind = defaultConfig || {};
        
        return function(elementConfig) {
            
            if (elementConfig instanceof Array) {
                
                for (var i = 0, l = elementConfig.length; i < l; ++i) {
                    
                    Bind.call(bind, elementConfig[i]);
                }
            }
            else {
                
                Bind.call(bind, elementConfig);
            }
        };
    };
});