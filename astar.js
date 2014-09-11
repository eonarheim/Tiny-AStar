/// Small A* implementation in javascript

var Node = function(x, y, weight){
	var me = this;
	me.x = x;
	me.y = y;
	me.weight = weight;
	me.hscore = 0;
	me.gscore = 0;
	me.solid = false;
	me.previousNode = null;

   me.reset = function(){
      me.hscore = 0;
      me.gscore = 0;
      me.previousNode = null;
   }

	me.distance = function(node){
		return Math.sqrt(Math.pow(node.x - me.x,2.0) + Math.pow(node.y -me.y,2.0));
	};

	return me;	
}

var Grid = function(width, height){
	var me = this;
	me.width = width;
	me.height = height;

	// Initialize A Star grid space on construction
	var _grid = new Array(width*height);
	for(var i = 0; i < width; i++){
		for(var j = 0; j < height; j++){
			(function(){
				_grid[i+j*width] = new Node(i, j, 1);
			})();			
		}
	}

	me.filter = function(fcn) {
		return _grid.filter(fcn);
	};

	me.getGrid = function(){
		return _grid;
	};

	me.getNode = function(x,y){
		return _grid[x+y*width];
	};

	me.neighbors = function(node, diagonals){
		var results = [];
		if(node.x+1 < width) results.push(me.getNode(node.x+1, node.y));
		if(node.y+1 < height) results.push(me.getNode(node.x, node.y+1));
		if(node.y-1 >= 0) results.push(me.getNode(node.x, node.y-1));
		if(node.x-1 >= 0) results.push(me.getNode(node.x-1, node.y));

		if(diagonals){
			if(node.x+1 < width && node.y+1 < height) results.push(me.getNode(node.x+1, node.y+1));
			if(node.x+1 < width && node.y-1 >= 0) results.push(me.getNode(node.x+1, node.y-1));		
			if(node.x-1 >= 0 && node.y+1 < height) results.push(me.getNode(node.x-1, node.y+1));
			if(node.x-1 >= 0 && node.y-1 >= 0) results.push(me.getNode(node.x-1,node.y-1));	
		}

		return results;
	};
	var _euclideanHeuristic = function(start, end){
		return Math.sqrt(Math.pow(start.x -end.x,2) + Math.pow(start.y - end.y,2));
	};


	var _fewestTurn = function(start, end){

		
		var current = start.previousNode;
		var weight = 0;
		if(current){
			var ancestor = start.previousNode.previousNode
			if(ancestor){
				if((ancestor.x == current.x && ancestor.y != current.y) && (current.y == start.y && current.x != start.x)){
					// This is a turn
					weight = +10;
				}else if ((ancestor.x != current.x && ancestor.y == current.y) && (current.x == start.x && current.y != start.y)){
					// This is a turn

					weight = +10;
				}else{
					weight = -0;
				}
			}
		}

		return (Math.abs(start.x - end.x) + Math.abs(start.y - end.y) + weight)*1.1;
	};

	var _manhattanHeuristic = function(start, end){
		return (Math.abs(start.x - end.x) + Math.abs(start.y - end.y))*1.5;
	}
	

	var _buildPath = function(current){
		var path = [];
		while(current.previousNode !== null){
			path.unshift(current);
			current = current.previousNode;
		}
		path.unshift(current);
		return path;
	};

	// Returns a list of nodes that consist of the sortest path
   // startx - starting x position on the grid
   // starty - stasrting y postion on the grid
   // endx - ending x position on the grid
   // endy - ending y position on the grid
   // [diagonals=true] - indicates whether diagonal moves are valid paths
   // [heuristicFcn=_manhattanHeuristic] - evaluate node score, defaults to basic manhattan for A*
   // [heuristicWeight=1.0] - weight node evaluation heuristic more or less.
	me.findPath = function(startx, starty, endx, endy, diagonals, heuristicFcn, heuristicWeight){
		heuristicWeight = heuristicWeight || 1.0;
      diagonals = diagonals || true;

		// clear nodes of pre-existing values
		_grid.forEach(function(node){
			node.reset();
		});

		heuristicFcn = heuristicFcn || _manhattanHeuristic;		
		var startingNode = me.getNode(startx, starty);
		var endingNode = me.getNode(endx, endy);

		startingNode.gscore = 0;
		startingNode.hscore = startingNode.gscore + heuristicFcn(startingNode, endingNode) * heuristicWeight;

		var openNodes = [startingNode];
		var closeNodes = [];
		var path = {};
		var bestPathScore = 0;

		while(openNodes.length > 0){
			var current = openNodes.sort(function(a,b){
				return a.hscore - b.hscore;
			})[0];


			// Done!
			if(current == endingNode){
				return _buildPath(current);
			}

			// Remove current from the open node set
			var index = openNodes.indexOf(current);
			openNodes.splice(index,1);
			closeNodes.push(current);


			// Find the neighbors
			var neighbors = me.neighbors(current, diagonals).filter(function(node){
				return !node.solid;
			}).filter(function(node){
				return closeNodes.indexOf(node) === -1;
			});
			

			neighbors.forEach(function(node){

				if(openNodes.indexOf(node) === -1){
					node.previousNode = current;
					node.gscore = node.weight + current.gscore;
					node.hscore = node.gscore + heuristicFcn(node, endingNode) * heuristicWeight;

					openNodes.push(node);
				}

			});
		}

		// no path found return empty array
		return [];
	};


	return me;
}

