/*
bindConf = {
    
    val: "content",
    attr: "class",
    query: ".class > span",
    eventProperties: {
        
        event: "mouseup",
        method: "myFunction1",
        args: [1, "two", {}, []],
        useCapture: true/false
    },
    defEvents: [
        {
            event: "mousedown",
            method: "myFunction1",
            args: [1, "two", {}, []],
            useCapture: true //false is default
        }
    ],
    filters: {
        
        fixed: 2,
        max: 32,
        min: 1,
        pre: "./image/",
        post: ".jpg"
    }
};

data = {
    
    val: "i am the content",
    elm: Element,
    query: ".class > li",
    attr: "class",
    events: [
        {
            event: "mousedown",
            method: "myFunction1",
            args: [1, "two", {}, []],
            useCapture: true //false is default
        }
    ],
    filters: {
        
        fixed: 2,
        max: 32,
        min: 1,
        pre: "./image/",
        post: ".jpg"
    }
}
*/
"use strict";

// TODO load filters on demand
define(["./filters"], function(Filters) {
    
    // TODO create removeEvent function
    // TODO check memory usage
    function addEvent(scope, element, config) {
        
        if (scope.conf.bind && scope.conf.bind.eventProperties) {
            
            for (var prop in scope.conf.bind.eventProperties) {
                
                if (prop === "args" && config[prop]) {
                    
                    for (var i in scope.conf.bind.eventProperties[prop]) {
                        
                        config[prop].unshift(scope.conf.bind.eventProperties[prop][i]);
                    }
                }
                
                if (!config[prop]) {
                    
                    config[prop] = scope.conf.bind.eventProperties[prop];
                }
            }
        }
        
        if (scope[config.method]) {
        
            var handler = function() {
                
                if (scope[config.method]) {
                    
                    scope[config.method].apply(scope, config.args);
                }
                
                return null;
            };
            
            if (element.addEventListener) {
                
                element.addEventListener(config.event, handler, config.useCapture || false);
            }
            else if (element.attachEvent) {
                
                element.attachEvent(config.event, handler);
            }
        }
    }
    
    function mergeBindConfigs(prio1, prio2) {
        
        for (var key in prio1) {
            
            if (prio1.hasOwnProperty(key)) {
                
                if (key === "filters" && prio2[key]) {
                    
                    mergeBindConfigs(prio1[key], prio2[key]);
                    continue;
                }
                
                prio2[key] = prio1[key];
            }
        }
        
        return prio2;
    }
    
    function bindData(data) {
        
        if (this.conf.bind) {
            
            data = mergeBindConfigs(data, this.conf.bind);
        }
        
        //check mandatory data attributes
        if (typeof data.val !== "undefined" || typeof data.events === "object") {
            
            //set element to the document instance if element is not a DOM element
            if (!(data.elm instanceof Document || data.elm instanceof Element)) {
                
                data.elm = document;
            }
            
            //a selector is required if element is the document instance
            if (data.elm instanceof Document && typeof data.query !== "string") {
                
                return;
            }
            
            //get the child element, if selector is given
            if (typeof data.query == "string") {
                
                data.elm = data.elm.querySelector(data.query);
                
                if (!data.elm) {
                    
                    return;
                }
            }
            
            //default events
            if (this.conf.bind && typeof this.conf.bind.defEvents === "object") {
                
                for (var i in this.conf.bind.events) {
                        
                    addEvent(this, data.elm, this.conf.bind.defEvents[i]);
                }
            }
            
            //events
            if (typeof data.events === "object") {
                
                for (var i in data.events) {
                        
                    addEvent(this, data.elm, data.events[i]);
                }
            }
            
            //content
            if (typeof data.val !== "undefined") {
                
                //filter content
                if (typeof data.filters === "object") {
                    
                    for (var filter in data.filters) {
                        
                        if (Filters[filter]) {
                            
                            data.val = Filters[filter](data.val, data.filters[filter]);
                        }
                    }
                }
                
                //set content
                if (typeof data.attr === "string") {
                    
                    data.elm.setAttribute(data.attr, data.val);
                }
                else {
                    
                    data.elm.textContent = data.val;
                }
            }
        }
    }
    
    var Bind = {
        
        bind: function(data) {
            
            if (data instanceof Array) {
                
                for (var i = 0, l = data.length; i < l; ++i) {
                    
                    bindData.call(this, data[i]);
                }
            }
            else {
                
                bindData.call(this, data);
            }
        }
    }
    
    return function(object) {
        
       return N.ext(Bind, object);
    };
});