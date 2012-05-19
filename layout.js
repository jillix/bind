/*
config = {
    
    title: "Test Title",
    modules: {
        
        'idOfDomElement1': "miid",
        'idOfDomElement2': "miid"
    },
    source: {
    
        name: "operationName",
        path: "",
        data: {}
    }
}

result = [
    {
        val: "Logout",
        query: "#logout"
        events: {
            
            mouseup: {
                
                method: "logout",
                args: ["/route/to/public/page"]
            }
        }
    },
    {
        val: "DE",
        query: "#i18n_de"
        events: {
            
            mouseup: {
                
                method: "i18n",
                args: ["de"]
            }
        }
    },
    {
        val: "EN",
        query: "#i18n_en"
        events: {
            
            mouseup: {
                
                method: "i18n",
                args: ["en"]
            }
        }
    }
]
*/
        
define(["./bind"], function(Bind) {
    
    var Layout = {
        
        i18n: function(locale) {
            
            N.obs("i18n").f("change", locale);
            // TODO fetch own data
        },
        
        logout: function(route) {
            
            N.logout(function() {
                
                window.location(route || "/");
            });
        }
    };
    
    return {
        
        init: function(config) {
            
            var self = this;
            
            //load modules
            if (config.modules) {
                
                for (var selector in config.modules) {
                    
                    N.mod(selector, config.modules[selector]);
                }
            }
            
            //set document title
            if (config.title) {
                
                document.title = config.title;
            }
            
            //get data from source
            if (config.source) {
                
                var data;
                
                if (config.source.data || config.source.path) {
                    
                    data = config.source;
                    delete data.name;
                }
                
                N.link(config,source.name, data, function(err, result) {
                    
                    if (!err && result) {
                        
                        //bind data/events to html
                        Bind({elm: self.$, scope: Layout})(result);
                    }
                });
            }
        }
    };
});