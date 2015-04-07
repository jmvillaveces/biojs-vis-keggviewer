# biojs-vis-keggviewer

[![NPM version](http://img.shields.io/npm/v/biojs-vis-keggviewer.svg)](https://www.npmjs.org/package/biojs-vis-keggviewer)

## About
KEGGViewer is a [BioJS](http://biojs.io) component to visualize [KEGG](http://www.genome.jp/kegg/) pathways and to allow their visual integration with functional data. Click [here](http://biojs.io/d/biojs-vis-keggviewer) to see a working example!

## Getting Started
Install it using npm: `npm install biojs-vis-keggviewer`

```
var rootDiv = document.getElementById('snippetDiv'); //Div to render the component 

var biojsviskegg = require("biojs-vis-keggviewer"); // Keggviewer instance

//Optial object to highlight expression changes
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
        
// Use heroku proxy for Ajax calls
var proxy = function(url){
    return 'https://cors-anywhere.herokuapp.com/'+url;
};
        
biojsviskegg.pathway('hsa04910').proxy(proxy).expression(expression).target(rootDiv).init(); // Initialize component
```

## Cite
If you use Keggviewer please cite the article [here](http://www.ncbi.nlm.nih.gov/pmc/articles/PMC3954160/).

## Contributing

Please submit all issues and pull requests to the [jmVillaveces/biojs-vis-keggviewer](http://github.com/jmVillaveces/biojs-vis-keggviewer) repository!

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/jmVillaveces/biojs-vis-keggviewer/issues).

## License 


This software is licensed under the Apache 2 license, quoted below.

Copyright (c) 2014, José Villaveces

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
