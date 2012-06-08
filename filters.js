"use strict";

define(function() {
    
    return {
        
        'max': function(value, number) {
            
            if (value > number) {
                
                return number;
            }
            
            return value;
        },
        'min': function(value, number) {
            
            if (value < number) {
                
                return number;
            }
            
            return value;
        },
        'fixed': function(value, digits) {
            
            return value.toFixed(digits);
        },
        'maxChars': function(value, number) {
            
            if (value.length > number) {
                
                return value.substr(0, number);
            }
            
            return value;
        },
        'minChars': function(value, number) {
            
            if (value.length < number) {
                
                return "";
            }
            
            return value;
        },
        'int': function(value, radix) {
            
            return parseInt(value, radix || 10) || 0;
        },
        'float': function(value) {
            
            return parseFloat(value) || 0;
        },
        'pre': function(value, content) {
            
            return content + value;
        },
        'post': function(value, content) {
            
            return value + content;
        }
    };
});