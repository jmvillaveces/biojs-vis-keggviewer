// if you don't specify a html file, the sniper will generate a div
var biojsviskegg = require("biojs-vis-keggviewer");

var expression = {
    upColor:'red',
    downColor:'blue',
    genes: ['hsa:7248', 'hsa:51763', 'hsa:2002', 'hsa:2194'],
    conditions: [
        {
            name: 'condition 1',
            values: [-1, 0.5, 0.7, -0.3]
        },
        {
            name: 'condition 2',
            values: [0.5, -0.1, -0.2, 1]
        },
        {
            name: 'condition 3',
            values: [0, 0.4, -0.2, 0.5]
        }
    ]
};
        
// Use heroku proxy
var proxy = function(url){
    return 'https://cors-anywhere.herokuapp.com/'+url;
};
        
biojsviskegg.pathway('hsa04910').proxy(proxy).expression(expression).target(rootDiv).init();