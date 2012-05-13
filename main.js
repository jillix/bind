define(function() {
    
    // TODO create filters
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
    
    return function(config) {
        
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
                
                "click": [
                    
                    {
                        //fn ?? observer event??,
                        params: [1, 2, "3"]
                    }
                ],
                
                "error": []
            },
            attr: "class"
        };
        */
        
        //check if config variable is an object
        if (typeof config !== "object" ) {
            
            return;
        }
        
        //check if value is a string or number
        if (typeof config.value !== "string" || typeof config.value !== "number") {
            
            return;
        }
        
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
        
        //filter content
        if (typeof config.filters === "object") {
            
            for (var filter in config.filters) {
                
                if (filters[filter]) {
                    
                    config.value = filters[filter](config.value, filters[filter]);
                }
            }
        }
        
        //attach pre/post values
        config.value = (config.pre || "") + config.value + (config.post || "");
        
        if (typeof config.events === "object") {
            
            // TODO bind events
        }
        
        //set content
        if (typeof config.attr === "string") {
            
            config.element.setAttribute(config.attr, config.value);
        }
        else {
            
            config.element.innerHTML = config.value;
        }
    };
});