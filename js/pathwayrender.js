//Libraries
var $ = require('jquery');
var cytoscape = require('cytoscape');

var renderPathway = function(data, target){
    
    var positions = {}, node_map = {}, nodes = [], links = [], keggIds = [];
    
    $(data).find('entry').each(function(){
        
        var entry = $(this);
        var type =  entry.attr('type');
        var graphics = entry.find('graphics');
            
        var text_valign = 'center', 
            shape = 'rectangle',
            bkg_color = '#99ff99',
            opacity = 0.9,
            border_width = 0,
            width = $(graphics).attr('width'),
            height = $(graphics).attr('height');
            
        if(type == 'gene'){
            border_width = 2;
        }else if(type == 'ortholog'){
            border_width = 2;
        }else if(type == 'compound'){
            shape = 'ellipse';
            bkg_color = '#aaaaee';
            text_valign = 'bottom';
            opacity = 1
        }else if(type == 'map'){
            shape = 'roundrectangle';
            bkg_color = '#00bfff';
        }else if( type == 'group'){
            //shape = 'roundrectangle';
            //bkg_color = '#ffffff';
            entry.find('component').each(function(){
                node_map[$(this).attr('id')].data.parent = entry.attr('id');
            });
        }
            
        var names = [];
        if(graphics.attr('name') !== undefined){
            names = graphics.attr('name').split(',');
        }
            
        var node = {};
        node.data = {
            id: entry.attr('id'),
            keggId: entry.attr('name').split(' '),
            name: names[0],
            names: names,
            type: type,
            link: entry.attr('link'),
            width: width,
            height: height,
            shape: shape,
            bkg_color: bkg_color,
            text_valign: text_valign,
            'border-width': border_width
        }
            
        keggIds.push(entry.attr('name'));
            
        node_map[entry.attr('id')] = node;
        nodes.push(node);
            
        positions[entry.attr('id')] = {
            x : +graphics.attr('x'),
            y : +graphics.attr('y')
        }
            
    });
        
    $(data).find('relation').each(function(){
        var rel = $(this), type =  rel.attr('type'), subtypes = [];
        
        rel.find('subtype').each(function(){
            var sub = $(this);
            var name = sub.attr('name'),
                line_style = 'solid',
                target_arrow_shape = 'none',
                text = '';
                
            if(name == 'maplink'){
                target_arrow_shape = 'diamond';
            }else if(name == 'indirect effect'){
                line_style = 'dotted';
                target_arrow_shape = 'diamond'
            }else if(name == 'state change'){
                line_style = 'dotted';
            }else if(name == 'missing interaction'){
                line_style = 'dotted';
                target_arrow_shape = 'triangle';
            }else if(name == 'phosphorylation'){
                target_arrow_shape = 'triangle';
                text = 'p+';
            }else if(name == 'dephosphorylation'){
                target_arrow_shape = 'triangle';
                text = 'p-';
            }else if(name == 'glycosylation'){
                line_style = 'dashed';
                target_arrow_shape = 'circle';
            }else if(name == 'ubiquitination'){
                line_style = 'dashed';
                target_arrow_shape = 'circle';
            }else if(name == 'methylation'){
                line_style = 'dashed';
                target_arrow_shape = 'circle';
            }else if(name == 'activation'){
                target_arrow_shape = 'triangle';
            }else if(name == 'inhibition'){
                target_arrow_shape = 'tee';
            }else if(name == 'expression'){
                target_arrow_shape = 'triangle';
            }else if(name == 'repression'){
                target_arrow_shape = 'tee';
            }
                
            links.push({
                data:{
                    source: rel.attr('entry1'),
                    target: rel.attr('entry2'),
                    name: name,
                    reaction: type,
                    line_style: line_style,
                    target_arrow_shape: target_arrow_shape,
                    text: text
                }
            });
        });
    });
    
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
                /*'height':  'data(height)',*/
                'shape':'data(shape)',
                'background-color': 'data(bkg_color)',
                'text-valign': 'data(text_valign)',
                /*'opacity': 'data(opacity)',*/
                'border-color': '#000000',
                'border-width': 'data(border-width)',
                'font-size': 11
            })
            .selector('node')
            .selector('edge').css({
                'content': 'data(text)',
                'target-arrow-shape': 'data(target_arrow_shape)',
                'line-style': 'data(line_style)',
                'line-color':'#000000',
                'target-arrow-color':'#000000',
                'text-valign' : 'bottom'
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