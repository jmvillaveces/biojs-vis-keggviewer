//Libraries
var xhr = require('nets');
var $ = require('jquery');

// load all ui everything 
require('jquery-ui');

//Modules
var render = require('./pathwayrender.js');

//Private members
var _KEGGAPI = 'http://rest.kegg.jp/get/';

var _target = null, _pathway = 'hsa04910', _proxy = null, _expression = null, _cy = null, _conditions = null, _interval = null;

var _query = function(){
    
    var url = _KEGGAPI+_pathway+'/kgml';
    url = (typeof _proxy === 'function') ? _proxy(url) : url;
    
    xhr({
        url: url,
        method: 'GET',
        encoding: undefined
    }, 
    function(err, resp, body){
        
        if(err){ 
            console.error(err); 
            return;
        }
        
        // Create container div
        var div = _target[0].appendChild(document.createElement('div'));
            div.style.left = 0;
            div.style.top = 0;
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.position = 'absolute';
        
        _cy = render(resp.rawRequest.responseXML, div);
    });
};

var _clearExpression = function(){
    var nodes = _cy.nodes();
    for(var j=0; j<nodes.length; j++){
        for(var k=0; k<_expression.genes.length; k++){
            if(nodes[j].data().keggId == _expression.genes[k]){
                nodes[j].css('background-color', nodes[j].data().bkg_color);
            }
        }
    }
};

var _paintExpression = function(){
    
    if($('#condition').val() == 'nocondition') _clearExpression();
        
    var min = $("#slider-range").slider("values", 0);
    var max = $("#slider-range").slider("values", 1);
            
    var condition = {};
    for(var i=0; i<_expression.conditions.length; i++){
        if(_expression.conditions[i].name == $('#condition').val()){
            condition = _expression.conditions[i];    
                    
            var nodes = _cy.nodes();
            for(var j=0; j<nodes.length; j++){
                for(var k=0; k<_expression.genes.length; k++){
                        
                    var inArray = $.inArray(_expression.genes[k], nodes[j].data().keggId );
                    if(inArray != -1){
                                
                        var exp = condition.values[k];
                        var color = nodes[j].data().bkg_color;
                        if(exp < min){
                            color = _expression.downColor;
                        }else if(exp > max){
                            color = _expression.upColor;
                        }
                        nodes[j].css("background-color", color);
                    }
                }
            }
            break;
        }
    }  
};

var _initControlBar = function(){
    
    var cond = '<option value="nocondition">No Condition</option>';
    _expression.conditions.forEach(function(e, i){
        cond+='<option value="'+e.name+'">'+e.name+'</option>';
    });
    
    $('<div id="toolbar" style="position:relative;z-index:999999;top:20px;float:right;font-size:0.8em"><select id="condition">'+cond+'</select><button id="play">play</button><button       id="refresh">refresh</button><p><label for="amount">Expression range:</label><label id="amount" style=" color: #f6931f; font-weight: bold;margin-left:10px;"></label></p><div id="slider-range"></div></div>').appendTo(_target);
    
    $( "#play" ).button({
        text: false,
        icons: {
            primary: "ui-icon-play"
        }
    }).click(function() {
        var options;
        if ( $(this).text() === "play" ) {
            options = {
                label: "stop",
                icons: {
                    primary: "ui-icon-stop"
                }
            };
            $("#refresh").button("disable");
        
                _interval = setInterval(function(){
                    
                    _conditions = $("#condition > option");
                    var selected = $('#condition').val();

                    var index;
                    for(var i=0; i<_conditions.length; i++){
                        if($(_conditions[i]).val() == selected){
                            index = i;
                            break;
                        }
                    }
                   
                    if(index === _conditions.length - 1){
                        $('#condition').val($(_conditions[0]).val());
                    }else{
                        $('#condition').val($(_conditions[index+1]).val());
                    }
                    _paintExpression();
                }, 2000);
                
        }else{
            options = {
                label: "play",
                icons: {
                    primary: "ui-icon-play"
                }
            };
            $( "#refresh" ).button("enable");
            window.clearInterval(_interval);
        }
        $(this).button( "option", options );
    });
        
    $( "#refresh" ).button({
        text: false,
        icons: {
            primary: "ui-icon-refresh"
        }
    }).click(function() {
        _paintExpression();
    });
    
    var min, max;
    for(var i=0; i<_expression.conditions.length; i++){
        var condition = _expression.conditions[i];
        for(var j=0; j<condition.values.length; j++){
            var val = condition.values[j];
            
            if(min == undefined && max == undefined){
                min = val;
                max = val;
            }else if(val<min){
                min = val;
            }else if(val>max){
                max = val;
            }
        }
    }
    
    _expression.min = min;
    _expression.max = max;
        
    $( "#slider-range" ).slider({
        range: true,
        min: min,
        max: max,
        step: 0.01,
        slide: function( event, ui ) {
            $( "#amount" ).text(ui.values[ 0 ] + " , " + ui.values[ 1 ] );
        }
    });
    
    $("#amount").text($("#slider-range").slider("values", 0) +" , " + $("#slider-range").slider("values", 1));
        
    $('#condition').change(function(){
        //self._paintExpression(self);
    });
};

// Public members
var app = function(){};

app.target = function(_){
    if (!arguments.length)
        return _target;
    _target = $(_);
    return app;
};

app.pathway = function(_){
    if (!arguments.length)
        return _pathway;
    _pathway = _;
    return app;
};

app.proxy = function(_){
    if (!arguments.length)
        return _proxy;
    _proxy = _;
    return app;
};

app.expression = function(_){
    if (!arguments.length)
        return _expression;
    _expression = _;
    return app;
};

app.init = function(){
    //if(_expression !== null) _initControlBar();
    _query();
};

module.exports = app;