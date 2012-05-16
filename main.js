define(function() {
    
    // TODO load filters on demand
    var Filters = {
        
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
        },
        pre: function(value, content) {
            
            return content + value;
        },
        post: function(value, content) {
            
            return value + content;
        }
    };
    
    // TODO create removeEvent function
    // TODO checke memory usage
    function addEvent(element, event, config) {
        
        var handler = function() {
            
            config.scope[config.method].apply(config.scope, config.args);
        };
        
        if (element.addEventListener) {
            
            element.addEventListener(event, handler, config.useCapture || false);
        }
        else if (element.attachEvent) {
            
            element.attachEvent(event, handler);
        }
    }
    
    function mergeObjects(prio1, prio2) {
        
        for (var key in prio2) {
            
            if (prio2.hasOwnProperty(key)) {
                
                if (typeof prio1[key] === "object" || typeof prio1[key] === "undefined") {
                    
                    if (key !== "scope" && typeof prio2[key] === "object") {
                        
                        if (prio1[key] instanceof Array) {
                            
                            if (prio2[key] instanceof Array) {
                            
                                for (var i = 0, l = prio2[key].length; i < l; ++i) {
                                    
                                    prio1[key].push(prio2[key][i]);
                                }
                            }
                            else {
                                
                                prio1[key].push(prio2[key]);
                            }
                        }
                        else if (prio2[key] instanceof Array) {
                            
                            prio2[key].push(prio1[key]);
                            
                            prio1[key] = prio2[key];
                        }
                        else {
                            
                            if (!prio1[key]) {
                                
                                prio1[key] = {};
                            }
                            
                            mergeObjects(prio1[key], prio2[key]);
                        }
                    }
                    else if (typeof prio1[key] === "undefined") {
                        
                        prio1[key] = prio2[key];
                    }
                }
            }
        }
        
        return prio1;
    }
    /*
    config = {
    
        value: "i am the content",  //mandatory!
        element: Element,           //mandatory!
        selector: "",
        attr: "class",
        scope: {},
        events: {
            
            "mousedown": [
                {
                    scope: myClass,
                    method: "myFunction1",
                    args: [1, "two", {}, []],
                    useCapture: true //false is default
                }
            ],
            
            "mouseup": {
                
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
    function Bind(config) {
        
        if (typeof config !== "object") {
            
            return;
        }
        
        config = mergeObjects(config, this);
        
        //check mandatory config attributes
        if (typeof config.value === "string" || typeof config.value === "number" || typeof config.event === "object") {
            
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
                    
                    if (config.events[event] instanceof Array) {
                        
                        for (var i = 0, l = config.events[event].length; i < l; ++i) {
                            
                            config.events[event][i].scope = config.events[event][i].scope || config.scope;
                            
                            addEvent(config.element, event, config.events[event][i]);
                        }
                    }
                    else {
                        
                        config.events[event].scope = config.events[event].scope || config.scope;
                        
                        addEvent(config.element, event, config.events[event]);
                    }
                }
            }
            
            if (config.value) {
                
                //filter content
                if (typeof config.filters === "object" || this.filters) {
                    
                    for (var filter in config.filters) {
                        
                        if (Filters[filter]) {
                            
                            config.value = Filters[filter](config.value, config.filters[filter]);
                        }
                    }
                }
                
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
    
    return function(defaultConfig) {
        
        var bind = {};
        
        if (typeof defaultConfig === "object") {
            
            for (var option in defaultConfig) {
                
                bind[option] = defaultConfig[option];
            }
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