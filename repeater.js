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
    bind: {
        
        events: {
            
            
        }
    }
    
    //not yet implemented
    i18n: false, //true is default,
    addItem: "#addItemButton",
    removeItem: "#removeItemButton",
    paging: 33,
    search: [
        {
            elm: "#searchField",
            ??
        }
    ]
}

// TODO:
- locale change
- add item
- remove item
- paging
- search data
*/
define(["./bind"], function(Bind) {
    
    var List = {
        
        //fetch data from operation
        fetch: function(source, callback) {
            
            if (typeof callback !== "function") {
                
                if (typeof source === "function") {
                    
                    callback = source;
                    source = null;
                }
                else {
                    
                    callback = function() {};
                }
            }
            
            var self = this;
            
            self.obs.f("fetchStart");
            
            source = N.merge(source || {}, this.source || {});
            
            //get data
            self.inst.link(source, function(err, result) {
                
                if (err) {
                    
                    self.obs.f("fetchError", err);
                    return callback(err);
                }
              
              self.render(result);
              
              self.obs.f("fetchDone", result);
              
              return callback(null, result);
            });
        },
        
        //render data
        render: function(data) {
            
            if (!(data instanceof Array)) {
                
                return;
            }
            
            var df = document.createDocumentFragment();
            
            console.log(this);
            
            var bind = Bind({scope: this.scope || this.inst});
            
            for (var i = 0, l = data.length; i < l; ++i) {
                
                var item = document.createElement(this.itemTag);
                
                if (this.itemHTML) {
                    
                    item.innerHTML = this.itemHTML;
                }
                
                for (var n = 0, a = data[i].length; n < a; ++n) {
                    
                    data[i][n].elm = item;
                    bind(data[i][n]);
                }
                
                df.appendChild(item);
            }
            
            this.target.innerHTML = "";
            this.target.appendChild(df);
        }
    };
    
    return function(config) {
        
        if (!config.inst || !(config.target instanceof Element)) {
            
            return;
        }
        
        var list = N.clone(List);
        
        list.obs = N.obs();
        
        for (var option in config) {
            
            if (!list[option]) {
                
                list[option] = config[option];
            }
        }
        
        return list;
    };
});