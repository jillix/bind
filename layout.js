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
    },
    bind: [
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
}
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
            
            var layout = N.clone(Layout);
            
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
            
            //bind data
            if (config.source || config.data) {
                
                var bind = Bind({elm: this.$, scope: layout});
                
                if (config.data) {
                    
                    bind(config.data);
                }
                
                if (config.source) {
                
                    N.link(config.source, function(err, result) {
                        
                        if (!err && result) {
                            
                            bind(result);
                        }
                    });
                }
            }
        }
    };
});