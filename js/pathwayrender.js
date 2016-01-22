//Libraries
var cytoscape = require('cytoscape');

//Variables
var positions = {}, node_map = {}, nodes = [], links = [];

function _processEntry(entry){

    var node = {
        shape: 'rectangle',
        bkg_color: '#99ff99',
        text_valign: 'center',
        border_width: 0
    };
    
    var graphics = entry.getElementsByTagName('graphics')[0];
    var type = entry.getAttribute('type');
    var names = (graphics.getAttribute('name') !== null) ? graphics.getAttribute('name').split(',') : [];
        
    node.width = graphics.getAttribute('width');
    node.height = graphics.getAttribute('height');
    node.type = type;
    node.id = entry.getAttribute('id');
    node.keggId = entry.getAttribute('name').split(' ');
    node.name = names[0] || '';
    node.names = names;
    node.link = entry.getAttribute('link');
    
    if(type == 'ortholog' || type == 'gene'){
            node.border_width = 1;
    }else if(type == 'compound'){
        node.shape = 'ellipse';
        node.bkg_color = '#aaaaee';
        node.text_valign = 'bottom';
    }else if(type == 'map'){
        node.shape = 'roundrectangle';
        node.bkg_color = '#00bfff';
    }else if( type == 'group'){
        
        var components = entry.getElementsByTagName('component');
        for(var i = 0; i < components.length; i++){
            node_map[components[i].getAttribute('id')].data.parent = node.id;
        }
    }
    
    node_map[node.id] = {data: node};
    nodes.push(node_map[node.id]);
            
    positions[node.id] = {
        x : +graphics.getAttribute('x'),
        y : +graphics.getAttribute('y')
    };
};

function _processRelation(rel){
    var type = rel.getAttribute('type'), subtypes = [];
    
    var subs = rel.getElementsByTagName('subtype');
    for(var i=0; i<subs.length; i++){
        var sub = subs[i];
        
        var edge = {
            source: rel.getAttribute('entry1'),
            target: rel.getAttribute('entry2'),
            name: sub.getAttribute('name'),
            reaction: type,
            line_style: 'solid',
            target_arrow_shape: 'none',
            text: ''
        };
        
        if(edge.name == 'maplink'){
            edge.target_arrow_shape = 'diamond';
        }else if(edge.name == 'indirect effect'){
            edge.line_style = 'dotted';
            edge.target_arrow_shape = 'diamond'
        }else if(edge.name == 'state change'){
            edge.line_style = 'dotted';
        }else if(edge.name == 'missing interaction'){
            edge.line_style = 'dotted';
            edge.target_arrow_shape = 'triangle';
        }else if(edge.name == 'phosphorylation'){
            edge.target_arrow_shape = 'triangle';
            edge.text = 'p+';
        }else if(edge.name == 'dephosphorylation'){
            edge.target_arrow_shape = 'triangle';
            edge.text = 'p-';
        }else if(edge.name == 'glycosylation'){
            edge.line_style = 'dashed';
            edge.target_arrow_shape = 'circle';
        }else if(edge.name == 'ubiquitination'){
            edge.line_style = 'dashed';
            edge.target_arrow_shape = 'circle';
        }else if(edge.name == 'methylation'){
            edge.line_style = 'dashed';
            edge.target_arrow_shape = 'circle';
        }else if(edge.name == 'activation'){
            edge.target_arrow_shape = 'triangle';
        }else if(edge.name == 'inhibition'){
            edge.target_arrow_shape = 'tee';
        }else if(edge.name == 'expression'){
            edge.target_arrow_shape = 'triangle';
        }else if(edge.name == 'repression'){
            edge.target_arrow_shape = 'tee';
        }
        
        links.push({
            data:edge
        });
        
    };
};

var renderPathway = function(data, target){
    
    
    
    var entries = data.getElementsByTagName('entry');
    for(var i = 0; i < entries.length; i++){
        _processEntry(entries[i]);
    }
    
    var rels = data.getElementsByTagName('relation');
    for(var i = 0; i < rels.length; i++){
        _processRelation(rels[i]);
    }
    
    var cy = cytoscape({
        container: target,
        elements: {
            nodes : nodes,
            edges : links
        },
        style: cytoscape.stylesheet()
            .selector('node').css({
                'content': 'data(name)',
                'text-valign': 'center',
                'width':  'data(width)',
                'height':  'data(height)',
                'shape':'data(shape)',
                'background-color': 'data(bkg_color)',
                'text-valign': 'data(text_valign)',
                /*'opacity': 'data(opacity)',*/
                'border-color': '#000000',
                'border-width': 'data(border_width)',
                'font-size': 11,
                'text-wrap': 'wrap',
                'text-max-width': 'data(width)'
            })
            .selector('node')
            .selector('edge').css({
                'content': 'data(text)',
                'target-arrow-shape': 'data(target_arrow_shape)',
                'line-style': 'data(line_style)',
                'line-color':'#000000',
                'target-arrow-color':'#000000',
                'text-valign' : 'bottom',
                'font-size': 11
            }),
        layout: {
            name: "preset",
            fit: false,
            positions: positions
        },ready:function(){
            console.log('Kegg Viewer ready');
        }
    });
    
    return cy;
};
module.exports = renderPathway;