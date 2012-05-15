var N = {
    
    clone: function(obj){

        function O(){}
        O.prototype = obj;
        return new O();
    }
};

window.onload = function(){
    
    var test = {
        
        name: "ruedi",
        hoi: function() {
            
            console.log(this.name);
            console.log(arguments);
            console.log(this);
        }
    };
    
    require(["../main"], function(Bind) {
        
        //set default values
        var bind = Bind({
            
            eventObject: test,
            pre: "pre value "
        });
        
        bind({
            
            value: 12.5684,
            element: document.getElementById("test"),
            filters: {
                
                fixed: 2
            },
            post: " Post content",
            events: {
                
                "mousedown": [
                    {
                        method: "hoi",
                        args: [1, 2, "3"]
                    }
                ],
                
                "mouseup": {
                    
                    method: "hoi",
                    args: ["mouseup"]
                }
            }
        });
        
        bind([{
            value: "attribute value",
            pre: "my pre value ",
            element: document.getElementById("test"),
            attr: "class"
        }]);
    });
};