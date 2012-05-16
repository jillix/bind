define(function() {
    
    // TODO load filters on demand
    var filters = {
        
        max: function(value, number) {
            
            if (value > number) {
                
                return number;
            }
            
            return value;
        },
        min: function(value, number) {
            
            if (value < number) {
                
                return number;
            }
            
            return value;
        },
        fixed: function(value, digits) {
            
            return value.toFixed(digits);
        },
        maxChars: function(value, number) {
            
            if (value.length > number) {
                
                return value.substr(0, number);
            }
            
            return value;
        },
        minChars: function(value, number) {
            
            if (value.length < number) {
                
                return "";
            }
            
            return value;
        },
        int: function(value, radix) {
            
            return parseInt(value, radix || 10) || 0;
        },
        float: function(value) {
            
            return parseFloat(value) || 0;
        }
    };
    
    // TODO create removeEvent function
    // TODO checke memory usage
    function addEvent(element, event, config) {
        
        var handler = function() {
            
            config.object[config.method].apply(config.object, config.args);
        };
        
        if (element.addEventListener) {
            
            element.addEventListener(event, handler, config.useCapture || false);
        }
        else if (element.attachEvent) {
            
            element.attachEvent(event, handler);
        }
    }   
    /*
    config = {
    
        value: "i am the content", //mandatory!
        element: Element, //mandatory!
        selector: "",
        filters: {
            
            fixed: 2,
            max: 32,
            min: 1,
        },
        pre: "./image/",
        post: ".jpg",
        events: {
            
            "mousedown": [
                {
                    object: myClass,
                    method: "myFunction1",
                    args: [1, "two", {}, []],
                    useCapture: true //false is default
                }
            ],
            
            "mouseup": {
                
                object: myClass,
                method: "myFunction2",
                args: ["xyz"]
            }
            
            //"error": []
        },
        attr: "class"
    };
    */
    function Bind(config) {
        
        //check mandatory config attributes
        if (typeof config === "object" && (typeof config.value === "string" || typeof config.value === "number" || typeof config.event === "object")) {
            
            //set element to the document instance if element is not a DOM element
            if (!(config.element instanceof Document || config.element instanceof Element)) {
                
                config.element = document;
            }
            
            //a selector is required if element is the document instance
            if (config.element instanceof Document && typeof config.selector !== "string") {
                
                return;
            }
            
            //get the child element, if selector is given
            if (typeof config.selector == "string") {
                
                config.element = config.element.querySelector(config.selector);
                
                if (!config.element) {
                    
                    return;
                }
            }
            
            //add events to dom elements
            if (typeof config.events === "object") {
                
                for (var event in config.events) {
                    
                    if (!config.events[event].object) {
                        
                        config.events[event].object = this.eventObject || {};
                    }
                    
                    if (config.events[event] instanceof Array) {
                        
                        for (var i = 0, l = config.events[event].length; i < l; ++i) {
                            
                            if (!config.events[event][i].object) {
                                
                                config.events[event][i].object = this.eventObject || {};
                            }
                            
                            addEvent(config.element, event, config.events[event][i]);
                        }
                    }
                    else {
                        
                        addEvent(config.element, event, config.events[event]);
                    }
                }
            }
            
            if (config.value) {
                
                //filter content
                if (typeof config.filters === "object") {
                    
                    for (var filter in config.filters) {
                        
                        if (filters[filter]) {
                            
                            config.value = filters[filter](config.value, config.filters[filter]);
                        }
                    }
                }
                
                //attach pre/post values
                config.value = (config.pre || this.pre || "") + config.value + (config.post || this.post || "");
                
                //set content
                if (typeof config.attr === "string") {
                    
                    config.element.setAttribute(config.attr, config.value);
                }
                else {
                    
                    config.element.innerHTML = config.value;
                }
            }
        }
        
        return;
    }
    
    /*
    config = {
        
        eventObject: {},
        pre: ""
        post: ""
    }
    */
    return function(defaultConfig) {
        
        var bind = {};
        
        if (defaultConfig.eventObject) {
            
            bind.eventObject = defaultConfig.eventObject;
        }
        
        if (defaultConfig.pre) {
            
            bind.pre = defaultConfig.pre;
        }
        
        if (defaultConfig.post) {
            
            bind.post = defaultConfig.post;
        }
        
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