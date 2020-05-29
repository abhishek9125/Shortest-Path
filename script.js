
onload = function(){

	let curr_data,V,src,dst;

	const container = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const temptext = document.getElementById('temptext');
    const temptext2 = document.getElementById('temptext2');

    const cities = ['Delhi',"Mumbai","Gujarat","Goa","Kanpur","Jammu","Hyderabad","Gangtok","Bangalore","Meghalaya",
					"Patiala","Agra","Mathura","Jaipur","Chandigarh","Kerala","Port Blair","Meerut","Surat","Kurukshetra"];

	const options = {
		edges: {
			labelHighlightBold: true,
			font: {
				size: 20
			}
		},

		nodes: {
			font: '12px arial red',
			scaling: {
				label: true
			},
			shape: 'icon',
			icon: {
				face: 'FontAwesome',
				code: '\uf015',
				size: 40,
				color: '#991133'
			}
		}
	};

	const network = new vis.Network(container);
	network.setOptions(options);

	const network2 = new vis.Network(container2);
	network2.setOptions(options);

	function createData(){

		V  = Math.max(7,Math.floor(Math.random()*cities.length)); // Selecting number of vertices
		
		let nodes = [];
		for(let i=1;i<=V;i++){
			nodes.push({id:i, label: cities[i-1]});  //Making nodes with corresponding labels of cities
		}

		// Prepares vis.js style nodes for our data
		nodes = new vis.DataSet(nodes);

		let edges = [];
		for(let i=2;i<=V;i++){
			let neighbour = i - Math.floor(Math.random()*Math.min(i-1,3) + 1);
			edges.push({
				type: 0,
				from: i,
				to: neighbour,
				color: "orange",
				label: String(Math.floor(Math.random()*70)+31)
			});
		}

		// Randomly Adding Edges to the Graph
        // Bus Edge is represented by 0
        // Plane Edge is represented by 1

        for(let i=1;i<=V/2;){
        	let n1 = Math.floor(Math.random()*V)+1;
            let n2 = Math.floor(Math.random()*V)+1; //n1 and n2 are any random vertices

            if(n1!=n2){
            	if(n1<n2){
            		let temp = n1;
            		n1 = n2;
            		n2 = temp;
            	}

            	//Checking if an Edge already exists between n1 and n2 and of which type 
                let works = 0;
                for(let j=0;j<edges.length;j++){
                	if(edges[j]['from']===n1 && edges[j]['to']===n2){
                		if(edges[j]['type']===0){
                			works = 1;
                		}
                		else{
                			works = 2;
                		}
                	}
                }

                //if works=0 then no edge, if works=1 then bus edge and if works=2 then plane edge
                if(works<=1){
                	if(works===0 && i<(V/4)){
                		edges.push({
                			type: 0,
                			from: n1,
                			to: n2,
                			color: "orange",
                			label: String(Math.floor(Math.random() * 70) + 31)
                		});
                	}
                	else{
                		edges.push({	 //Adding a Plane Edge if Bus Edge already exist or adding edges in second half of iterations to 
                            type: 1,	//avoid clustering in starting
                            from: n1,
                            to: n2,
                            color: 'green',
                            label: String(Math.floor(Math.random() * 50) + 1)
                        });
                	}
                	i++;
                }

            }
        }

        // const cities = ['Delhi',"Mumbai","Gujarat","Goa","Kanpur","Jammu","Hyderabad","Gangtok","Bangalore","Meghalaya",
                    //     "Patiala","Agra","Mathura","Jaipur","Chandigarh","Kerala","Port Blair","Meerut","Surat","Kurukshetra"];

        src = 1;
        dst = V;

		curr_data = {
			nodes: nodes,
			edges: edges
		};
	}

	genNew.onclick = function(){		//Create New Data and Display the Problem Graph 
		createData();
		network.setData(curr_data);
		temptext2.innerText = 'Find least time path from '+cities[src-1]+' to '+cities[dst-1];
        temptext.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";
	};

	solve.onclick = function(){        //Create the Solution Graph with shortest path
        temptext.style.display  = "none";
        temptext2.style.display  = "none";
        container2.style.display = "inline";
        network2.setData(solveData());
	};

    function djikstra(graph,sz,src){
        let visited = Array(sz).fill(0);
        let distances = [];
        for(let i=1;i<=sz;i++){
            distances.push([10000,-1]);
        }
        distances[src][0] = 0;

        for(let i=0;i<sz-1;i++){
            let mn = -1
            for(let j=0;j<sz;j++){
                if(visited[j]===0){
                    if(mn===-1 || distances[j][0]<distances[mn][0]){
                        mn = j;
                    }
                }
            }
            visited[mn] = 1;
            for(let j in graph[mn]){
                let edge = graph[mn][j];
                if(visited[edge[0]]===0 && distances[edge[0]][0]>distances[mn][0]+edge[1]){
                    distances[edge[0]][0] = distances[mn][0]+edge[1];
                    distances[edge[0]][1] = mn;
                }
            }
        }

        return distances;
    }

    function createGraph(data){
        let graph = [];
        for(let i=1;i<=V;i++){
            graph.push([]);
        }

        for(let i=0;i<data['edges'].length;i++){
            let edge = data['edges'][i];
            if(edge['type']===1){
                continue;
            }
            graph[edge['to']-1].push([edge['from']-1,parseInt(edge['label'])]);
            graph[edge['from']-1].push([edge['to']-1,parseInt(edge['label'])]);
        }
        return graph;
    }

    function takePlane(edges,dist1,dist2,mn_dist){
        plane = 0;
        p1 = -1;    // Plane Start
        p2 = -1;    // PLane Land

        for(let pos in edges){
            let edge = edges[pos];
            if(edge['type']===1){
                let to = edge['to'] - 1;    //We go to variable 'to' from src
                let from = edge['from'] - 1; //We go from variable 'from' to destination
                let weight = parseInt(edge['label']);
                if(dist1[to][0] + weight + dist2[from][0] < mn_dist){
                    plane = weight;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0] + weight + dist2[from][0];
                }
                if(dist2[to][0] + weight + dist1[from][0] < mn_dist){
                    plane = weight;
                    p2 = to;
                    p1 = from;
                    mn_dist = dist1[to][0] + weight + dist2[from][0];
                }
            }
        }
        return {plane,p1,p2};
    }

    function solveData(){
        const data = curr_data;
        const graph = createGraph(data); //Creating Adjacency List Matrix
        let dist1 = djikstra(graph,V,src - 1);  //Finding distance of all nodes from source
        let dist2 = djikstra(graph,V,dst - 1);  //Finding distance of all nodes from destination

        let mn_dist = dist1[dst-1][0];     // Minimum distance from source to destination

        let {plane,p1,p2} = takePlane(data['edges'],dist1,dist2,mn_dist);   //Should you take a plane

        let new_edges = [];    // For Solution Graph
        if(plane!==0){          //Means there is some weight in plane from takePlane function and hence plane will be used
            new_edges.push({
                arrows: {
                    to: {
                        enabled: true
                    }
                },
                from: p1+1,
                to: p2+1,
                color: 'green',
                label: String(plane)
            });
            new_edges.push(...pushEdges(dist1,p1,false));
            new_edges.push(...pushEdges(dist2,p2,true));
        }
        else{
            new_edges.push(...pushEdges(dist1, dst-1, false));
        }

        const ans_data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return ans_data;
    }

    function pushEdges(dist,curr,reverse){
        let temp_edges = [];
        while(dist[curr][0]!==0){
            let fm = dist[curr][1];
            if(reverse){
                temp_edges.push({
                    arrows: {
                        to:{
                            enabled: true
                        }
                    },
                    from: curr+1,
                    to: fm+1,
                    color: "orange",
                    label: String(dist[curr][0] - dist[fm][0])
                });
            }
            else{
                temp_edges.push({
                    arrows: {
                        to:{
                            enabled: true
                        }
                    },
                    from: fm+1,
                    to: curr+1,
                    color: "orange",
                    label: String(dist[curr][0] - dist[fm][0])
                });
            }
            curr = fm;
        }
        return temp_edges;
    }
	genNew.click();
};