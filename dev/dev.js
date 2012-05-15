window.onload = function(){
    
    var test = {
        
        name: "ruedi",
        hoi: function() {
            
            console.log(this.name);
            console.log(arguments);
            console.log(this);
        }
    };
    
    require(["../main"], function(bind) {
        
        bind({
            
            value: 12.5684,
            element: document.getElementById("test"),
            //selector: "#test",
            filters: {
                
                fixed: 2
            },
            pre: "CHF ",
            post: " Post content",
            events: {
                
                "mousedown": [
                    {
                        object: test,
                        method: "hoi",
                        args: [1, 2, "3"]
                    }
                ],
                
                "mouseup": {
                    
                    object: test,
                    method: "hoi",
                    args: ["mouseup"]
                }
            }
        });
        
        bind({
            
            value: "trucken",
            element: document.getElementById("test"),
            attr: "class"
        });
    });
};