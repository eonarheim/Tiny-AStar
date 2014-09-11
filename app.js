/// A* Javascript
var AStarTester = function (targetElementId, viewWidth, viewHeight, squaresX, squaresY) {
	var me = this;
	var _started = false;
	// Grab the canvas
	me.canvas = document.getElementById(targetElementId);
	me.ctx = me.canvas.getContext("2d");

	// Initialize page styles
	var body = document.getElementsByTagName('body')[0];
	body.style.margin = '0px';

	// Set start position
	var startX = 0;
	var startY = 0;

	// Set end position
	var endX = squaresX - 1;
	var endY = squaresY - 10;

	// Set height and width to window inner height
	me.canvas.width = viewWidth || 600;
  	me.canvas.height = viewHeight || 600;

  	squaresX = squaresX || 20;
  	squaresY = squaresY || 20;

  	var _squareWidth = me.canvas.width/squaresX;
  	var _squareHeight = me.canvas.height/squaresY;

	var grid = new Grid(squaresX, squaresY);

	me.start = function(){
		me.update();
		if(!_started){
			_started = true;
			setInterval(function(){
				me.update();
				me.draw();
			},60);
		}
	};

	// Handle Click events
	var _mouseDown = false;
	var handleClick = function(event){
		var x = event.pageX - me.canvas.offsetLeft;
		var y = event.pageY - me.canvas.offsetTop;
		
		var i = Math.floor(x/_squareWidth);
		var j = Math.floor(y/_squareHeight);
		var node = grid.getNode(i, j);
		if(solidClick){         
			grid.getNode(i, j).solid = true;
			return;
		}

		if(node.weight < 100){
			grid.getNode(i, j).weight++;// = true;
		}
	};

	var solidClick = false;
	me.canvas.addEventListener('mousedown', function(event){
		_mouseDown = true;

		var rightClick = false;
		if ("which" in event) {  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        	rightClick = event.which == 3; 
    	} else if ("button" in event) {  // IE, Opera 
        	rightClick = event.button == 2; 
    	}

    	if(rightClick){
			solidClick = true;
		}
		handleClick(event);
		me.canvas.addEventListener('mousemove', handleClick);
	});

	me.canvas.addEventListener('mouseup', function(event){
		_mouseDown = false;
		solidClick = false;
		me.update();
		me.canvas.removeEventListener('mousemove', handleClick);
	});

	window.oncontextmenu = function (){
    	return false; // cancel default menu
	}

	// Handle Key Events
	var keys = [];
	window.onkeydown = function(ev){
		if(keys.indexOf(ev.keyCode)<0){
			keys.push(ev.keyCode);
		}
	};
	window.onkeyup = function(ev){
		var key = keys.indexOf(ev.keyCode);
		keys.splice(key,1);
	};


	var path = [];
	me.search = function(startX, startY, endX, endY){
		startX = startX?startX:0;
		startY = startY?startY:0;
		endX = endX || squaresX -1;
		endY = endY || squaresY -1;
		path = grid.findPath(startX, startY, endX, endY, true);
	};


	me.update = function(){
		me.search(startX, startY, endX, endY);
	};

	me.draw = function(){
		// Erase previous draw
		me.ctx.fillStyle = 'white';
	 	me.ctx.fillRect(0,0,me.canvas.width,me.canvas.height);


	 	// Draw squares on the last path
	 	grid.filter(function(node){
	 		return path.indexOf(node) > -1;
	 	}).forEach(function(node){
	 		me.ctx.fillStyle = 'green';
	 		me.ctx.fillRect(node.x * _squareWidth, node.y * _squareHeight, _squareWidth, _squareHeight);
	 		me.ctx.fillStyle = 'white';
	 		me.ctx.fillText("G:" + node.gscore, node.x * _squareWidth + _squareWidth/2 - 10, node.y * _squareHeight + _squareHeight/2);
	 		me.ctx.fillText("H:" + node.hscore.toFixed(2), node.x * _squareWidth + _squareWidth/2 - 10, node.y * _squareHeight + _squareHeight/2+10);
	 	});

	 	// Draw node cost
	 	grid.filter(function(node){
	 		return !node.solid && path.indexOf(node) === -1;
	 	}).forEach(function(node){
	 		me.ctx.fillStyle = 'rgba(255,0,0,' + node.weight/100 + ')';
	 		me.ctx.fillRect(node.x * _squareWidth, node.y * _squareHeight, _squareWidth, _squareHeight);
	 		me.ctx.fillStyle = 'black';
	 		me.ctx.fillText(node.hscore.toFixed(0), node.x * _squareWidth + _squareWidth/2, node.y * _squareHeight + _squareHeight/2);
	 	});

		
	 	// Draw solid squares
	 	var solidSquares = grid.filter(function(node){
	 		return node.solid;
	 	});
	 	solidSquares.forEach(function(node){
	 		me.ctx.fillStyle = 'black';
	 		me.ctx.fillRect(node.x * _squareWidth, node.y * _squareHeight, _squareWidth, _squareHeight);
	 		me.ctx.fillStyle = 'white';
	 		me.ctx.fillText(node.weight, node.x * _squareWidth + _squareWidth/2, node.y * _squareHeight + _squareHeight/2);
	 	});



	 	


	 	me.ctx.fillStyle = 'gray';

	 	// Draw grid
	 	for(var x = 0; x <= viewWidth; x+=_squareWidth){
	 		me.ctx.beginPath();
	 		me.ctx.moveTo(x, 0);
	 		me.ctx.lineTo(x, viewHeight);
	 		me.ctx.stroke();
	 	};

	 	for(var y = 0; y <= viewHeight; y+= _squareHeight){
	 		me.ctx.beginPath();
	 		me.ctx.moveTo(0, y);
	 		me.ctx.lineTo(viewWidth, y);
	 		me.ctx.stroke();	
	 	};

	};return me;

	
};

var app = new AStarTester("game", 1000, 1000, 30, 30);
app.start();

