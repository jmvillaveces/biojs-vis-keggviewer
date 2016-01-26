//Libraries
var xhr = require('nets');
var Slider = require("bootstrap-slider");

//Modules
var render = require('./pathwayrender.js');

//Private members
var _KEGGAPI = 'http://rest.kegg.jp/get/';

var _target = null, _pathway = 'hsa04910', _proxy = null, _expression = null, _cy = null, _conditions = null, _interval = null, _slider = null;

var _finder = function(cmp, arr){
    var y = arr[0] || null;
    for(var i = 1; i < arr.length; i++){
        y = cmp(y, arr[i]);
    }
    return y;
};

var _setBackground = function(el, bkg){
    
    el.setAttribute('style', 'background:'+bkg);
    
    var content = el.innerHTML;
    container.innerHTML= content;
};

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
        var div = _target.appendChild(document.createElement('div'));
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

var _paintExpression = function(condition){
    
    
    if(condition.name == 'no condition'){ 
        _clearExpression();
        return;
    }
    
    var slider = _slider.getValue();
        
    var min = slider[0];
    var max = slider[1];
    
    var nodes = _cy.nodes();
    for(var i = 0; i < _expression.genes.length; i++){
        
        var node = nodes.filterFn(function(ele){
            
            var ids = ele.data().keggId;
            for(var j = 0; j < ids.length; j++){
                
                if(ids[j].toLowerCase() === _expression.genes[i].toLowerCase()) return true;
                
            }
            return false;
        });
                
        if(node.length !== 0){
            
            var exp = condition.values[i];
            var color = node.data().bkg_color;
            
            if(exp < min){
                color = _expression.downColor;
            }else if(exp > max){
                color = _expression.upColor;
            }
            node.css('background-color', color);
        }
    }
};

var _initControlBar = function(){
    
    var min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
    
    var toolbar = document.createElement('div');
    toolbar.setAttribute('style', 'position:relative;z-index:999999;top:20px;float:right;font-size:0.8em;margin-right: 20px;');
    toolbar.setAttribute('class', 'well form-group');
    
    /*Select*/
    var select = document.createElement('select');
    select.setAttribute('class', 'form-control');
    
    _expression.conditions.unshift({name : 'no condition'});
    
    
    for(var i=0; i<_expression.conditions.length; i++){
        var e = _expression.conditions[i];
        var opt = document.createElement('option');
        opt.setAttribute('value', e.name);
        opt.text = e.name;
        
        select.appendChild(opt);
        
        if(e.values){
            max = Math.max(max, _finder(Math.max, e.values));
            min = Math.min(min, _finder(Math.min, e.values));
        }
    }
    
    /*On Change Event*/
    select.addEventListener('change', function(){
        _paintExpression(_expression.conditions[select.selectedIndex]);
    });
    
    /* Play Button */
    var span = document.createElement('span');
    span.setAttribute('class', 'glyphicon glyphicon-play');
    span.setAttribute('aria-hidden', 'true');
    
    
    var playBtn = document.createElement('button');
    playBtn.setAttribute('type', 'button');
    playBtn.setAttribute('class', 'btn btn-default btn-sm form-control');
    playBtn.setAttribute('style', 'margin-top:5px;margin-bottom:5px;');
    playBtn.appendChild(span);
    
    /*On Click Event*/
    playBtn.addEventListener('click', function(e){
        
        
        if(span.className.lastIndexOf('glyphicon-play') != -1){
            
            //Play
            span.className = span.className.replace('glyphicon-play' , 'glyphicon-stop' );
            
            _interval = setInterval(function(){
                
                select.selectedIndex = (select.selectedIndex === select.length - 1) ? 0 : select.selectedIndex + 1;
                _paintExpression(_expression.conditions[select.selectedIndex]);
            
            }, 2000);
            
            
        }else{
            //Stop
            span.className = span.className.replace('glyphicon-stop' , 'glyphicon-play' );
            window.clearInterval(_interval);
        }
        
    });
    
    /* Slider Input */
    var input = document.createElement('input');
    input.setAttribute('id', 'sl');
    input.setAttribute('class', 'slider');
    
    /* Slider Style */
    var style = document.createElement('style');
    style.innerHTML = '.slider-track-high { background: '+ _expression.upColor +';} .slider-track-low { background: '+ _expression.downColor +';}';
    document.getElementsByTagName('head')[0].appendChild(style);
    
    toolbar.appendChild(select);
    toolbar.appendChild(playBtn);
    toolbar.appendChild(input);
    
    _target.appendChild(toolbar);
    
    var cut = (max - min)/4;
    
    //Init slider
    _slider = new Slider('#sl', {min  : min, max  : max, value: [ min + cut, max - cut ], step:0.01});
    _slider.on('slideStop', function(e){
        _paintExpression(_expression.conditions[select.selectedIndex]);
    });
};

// Public members
var app = function(){};

app.target = function(_){
    if (!arguments.length)
        return _target;
    _target = _;
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
    if(_expression !== null) _initControlBar();
    _query();
};

module.exports = app;