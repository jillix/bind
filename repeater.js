/*
config = {
    
    inst: {}, //Module instance
    target: Element, //DOM reference
    itemTag: "li",
    itemHTML: "<span class='name'></span><img class='edit' src='edit.png'/>",
    source: {
        name: "getMyData",
        //link options
    },
    bindConf: {
        
        events: {
            
            
        }
    }
}
*/
"use strict";

define(["./bind"], function(Bind) {
    
    var Repeater = {
        
        //fetch data from operation
        fetch: function(callback) {
            
            if (typeof callback !== "function") {
                
                callback = function() {};
            }
            
            var self = this;
            
            self.obs.f("fetchStart");
            
            //get data
            self.link(this.conf.source, function(err, result) {
                
                if (err) {
                    
                    self.obs.f("fetchError", err);
                    return callback.call(self, err);
                }
                
                self.render(result);
                
                self.obs.f("fetchDone", result);
                
                return callback.call(self, null, result);
            });
        },
        
        //render data
        render: function(data) {
            
            if (!(data instanceof Array)) {
                
                return;
            }
            
            var df = document.createDocumentFragment();
                        
            for (var i = 0, l = data.length; i < l; ++i) {
                
                var item = document.createElement(this.conf.repeater.itemTag);
                
                if (data[i].itemHTML || this.conf.repeater.itemHTML) {
                    
                    item.innerHTML = data[i].itemHTML || this.conf.repeater.itemHTML;
                }
                
                if (data[i] instanceof Array) {
                    
                    if (data[i].length > 1) {
                    
                        for (var n = 0, a = data[i].length; n < a; ++n) {
                            
                            data[i][n].elm = item;
                            this.bind(data[i][n]);
                        }
                    }
                    else {
                        
                        data[i][0].elm = item;
                        this.bind(data[i][0]);
                    }
                }
                else {
                    
                    data[i].elm = item;
                    this.bind(data[i]);
                }
                
                df.appendChild(item);
            }
            
            this.conf.repeater.target.innerHTML = "";
            this.conf.repeater.target.appendChild(df);
        }
    };
    
    return function(object) {
        
        var repeater = N.ext(Repeater, Bind(object));
        
        repeater.conf.repeater.target = repeater.dom.querySelector(repeater.conf.repeater.target);
        //repeater.repeater.itemHTML
        //repeater.repeater.itemTag
        return repeater;
    };
});