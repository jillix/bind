"use strict";

// TODO lazy loading of filters
// TODO lazy loading of plugins
define(["./filters"], function(Filters) {
    
    // execute a handler multiple times if params is an array.
    // if params is an object, execute handler once.
    function ao(params, args, handler) {
        
        handler = arguments[arguments.length - 1];
        
        if (typeof handler == "function") {
            
            args = args instanceof Array ? args : [];
            
            if (params instanceof Array) {
                
                for (var i = 0, l = params.length, _args; i < l; ++i) {
                    
                    // copy arguments
                    _args = args.slice();
                    _args.unshift(params[i]);
                    handler.apply(this, _args);
                }
            }   
            else {
                
                args.unshift(params);
                handler.apply(this, args);
            }
        }
    }
    
    // TODO remove this when IE8 is gone
    function isElement(object){
        
        return (
            typeof HTMLElement === "object" ? object instanceof HTMLElement : //DOM2
            object && typeof object === "object" && object.nodeType === 1 && typeof object.nodeName==="string"
        );
    }
    
    function filterContent(value, filters) {
        
        for (var filter in filters) {
            
            if (Filters[filter]) {
                
                value = Filters[filter](value, filters[filter]);
            }
        }
        
        return value;
    }
    
    function createArguments(event, args) {
        
        // copy args array or create a new one
        args = args ? args.slice() : [];
            
        // append event as first argument
        args.unshift(event);
        
        return args;
    }
    
    function addRemoveEventHandler(method, scope, elm, event, remove) {
        
        var fn = remove ? removeEvent : addEvent;
        
        if (typeof method == "object") {
            
            fn(elm, event, method, scope);
        }
        else {
            
            fn(elm, event, {method: method}, scope);
        }
    }
    
    function registerEvent(module, method, event, elm, args) {
        
        // create event chache
        if (!module.__bind_obs) {
            
            module.__bind_obs = {};
        }
        
        if (!module.__bind_obs[event]) {
            
            module.__bind_obs[event] = [];
        }
        
        // add event to observer
        module.__bind_obs[event].push([method, module, createArguments({target: elm}, args)]);
    }
    
    function emitEvents(event, events, result, origin) {
        
        // emit events
        if (events = events[event]) {
            
            for (var i = 0, l = events.length; i < l; ++i) {
                
                events[i][2][0].result = result;
                events[i][2][0].origin = origin;
                events[i][0].apply(events[i][1], events[i][2]);
            }
        }
    }
    
    function addDomEvent(elm, event, handler, useCapture) {
        
        if (elm.addEventListener) {
            
            elm.addEventListener(event, handler, useCapture || false);
        }
        else if (elm.attachEvent) {
            
            elm.attachEvent(event, handler);
        }
    }
    
    // TODO how to pass arguments to event-handler without loosing the ability to remove event-handlers?
    function addEvent(elm, event, options, module) {
        
        var method = typeof options.method == "function" ? options.method : (options.module || module)[options.method];
        
        if (typeof method != "function") {
            
            method = null;
        }
        
        if (method || options.emit) {
            
            var handler = function(event, result) {
                
                if (method) {
                    
                    if (!event.target) {
                        
                        event.target = elm;
                    }
                    
                    event.origin = elm;
                    
                    result = method.apply(options.module || module, createArguments(event, options.args));
                }
                
                // emit events
                if (options.emit && module.__bind_obs) {
                    
                    ao(options.emit, [module.__bind_obs, result, elm], emitEvents);
                }
                
                return;
            };
            
            if (method) {
                
                // register events
                registerEvent(module, method, event, elm, options.args);
            }
            
            // append event to dom
            // TODO check if its a dom event!
            addDomEvent(elm, event, handler, options.useCapture);
        }
    }
    
    // TODO remove event handlers
    function removeEvent(elm, event, options) {
        
    }
    
    function getAttributeValue(element, attribute, value) {
        
        value = element.getAttribute(attribute);
        
        return value ? value.split(" ") : null;
    }
    
    function searchAttributeValue(value, search) {
        
        for (var i in value) {
            
            if (value[i] === search) {
                
                return i;
            }
        }
        
        return -1;
    }
    
    function removeAttribute(value, elm, attr) {
        
        var _value = getAttributeValue(elm, attr);
        
        if (_value) {
            
            if (value) {
                
                var index = searchAttributeValue(_value, value);
                
                if (index > -1) {
                    
                    _value.splice(index, 1);
                    elm.setAttribute(attr, _value.join(" "));
                }
                
                return;
            }
            
            elm.removeAttribute(attr);
        }
    }
    
    function addAttribute(value, elm, attr) {
        
        var _value = getAttributeValue(elm, attr);
        
        if (_value) {
            
            if (searchAttributeValue(_value, value) > -1) {
                
                return;
            }
            
            value = _value.join(" ") + " " + value;
        }
        
        elm.setAttribute(attr, value);
    }
    
    function getDomElement(elm, options, context) {
        
        if (typeof elm == "string") {
            
            if (elm[0] === "<") {
                
                elm = [document.createElement(elm.replace(/[^a-z0-9]/gi, ""))];
            }
            else {
                
                if (!isElement(context)) {
                    
                    if (isElement(options)) {
                        
                        context = options;
                    }
                    else if (options && isElement(options.elm)) {
                        
                        context = options.elm;
                    }
                    else {
                        
                        context = document;
                    }
                }
                
                elm = context.querySelectorAll(elm);
            }
        }
        else if (isElement(elm)) {
            
            elm = [elm];
        }
        
        return elm || [];
    }
    
    function appendChildrendToDf(options, scope, df) {
        
        df.appendChild(bind.call(scope, options));
    }
    
    function handleChildren(elms, options, direction, method) {
        
        var df = document.createDocumentFragment();
        
        ao(options, [this, df], appendChildrendToDf);
        
        if (direction > 0) {
            
            for (var i = 0, l = elms.length; i < l; ++i) {
                
                elms[i].appendChild(df);
            }
        }
        else {
            
            for (var i = 0, l = elms.length; i < l; ++i) {
                
                elms[i].insertBefore(df, elms[i].firstChild);
            }
        }
    }
    
    // TODO use plugins
    function updateDomElements(elms, options) {
        
        if (!options) {
            
            return;
        }
        
        var self = this;
        
        for (var i = 0, l = elms.length; i < l; ++i) {
            
            // set html
            if (options.html) {
                
                elms[i].innerHTML = options.html;
            }
            
            // remove attributes
            if (options.rmAttr) {
                
                for (var rm_attr in options.rmAttr) {
                    
                    ao(options.rmAttr[rm_attr], [elms[i], rm_attr], removeAttribute);
                }
            }
            
            // add attributes
            if (options.attr) {
                
                for (var attr in options.attr) {
                    
                    ao(options.attr[attr], [elms[i], attr], addAttribute);
                }
            }
            
            // TODO how about a class option?
            /*
            if (options.class) {
                
                //...
            }
            */
            
            //remove events
            if (options.rmEvent) {
                
                for (var rm_event in options.rmEvent) {
                    
                    ao(options.rmEvent[rm_event], [self, elms[i], rm_event, true], addRemoveEventHandler);
                }
            }
            
            // listen to events
            if (options.on) {
                
                for (var event in options.on) {
                    
                    ao(options.on[event], [self, elms[i], event], addRemoveEventHandler);
                }
            }
            
            // set css properties
            if (options.css) {
                
                for (var css in options.css) {
                    
                    elms[i].style[css] = options.css[css];
                }
            }
            
            // toggle css properties
            if (options == "toggle") {
                
                if (elms[i].style.display == "none") {
                    
                    elms[i].style.display = "block";
                }
                else {
                    
                    elms[i].style.display = "none";
                }
            }
            
            // append child elements
            if (options.append) {
                
                handleChildren.call(this, elms, options.append, 1);
            }
            
            // prepend child elements
            if (options.prepend) {
                
                handleChildren.call(this, elms, options.prepend, -1);
            }
        }
    }
    
    function bind(elm, options, context) {
        
        var self = this || {};
        
        if (typeof elm == "object" && !(elm instanceof Array) && !isElement(elm)) {
            
            options = elm;
            elm = options.elm;
        }
        
        // get elements
        elm = getDomElement.call(self, elm, options, context);
        
        // check if an element was found
        if (!isElement(elm[0])) {
            
            return;
        }
        
        // filter values
        // use filters only once
        if (typeof options == "object") {
            
            // prepare html value
            if (options.html && typeof options.html.val != "undefined") {
                
                if (options.html.filters) {
                    
                    options.html = filterContent(options.html.val, options.html.filters);
                }
                else {
                    
                    options.html = options.html.val;
                }
            }
            
            // prepare attribute values
            if (typeof options.attr == "object") {
                
                for (var attr in options.attr) {
                    
                    if (options.attr[attr] instanceof Array) {
                        
                        for (var i in options.attr[attr]) {
                            
                            if (options.attr[attr][i].filters) {
                                
                                options.attr[attr][i] = filterContent(options.attr[attr][i].val, options.attr[attr][i].filters);
                            }
                            else {
                                
                                options.attr[attr][i] = options.attr[attr][i].val || options.attr[attr][i];
                            }
                        }
                    }
                }
            }
        }
        
        updateDomElements.call(self, elm, options);
        
        return elm.length == 1 ? elm[0] : elm;
    }
    
    return bind;
});
