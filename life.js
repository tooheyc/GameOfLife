//Rules for Conway's game of life
//At each step in time, the following transitions occur:
//
//Any live cell with fewer than two live neighbors dies, as if caused by under-population.
//Any live cell with two or three live neighbors lives on to the next generation.
//Any live cell with more than three live neighbors dies, as if by over-population.
//Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

// Using a single global to hold the settings
var lifeSettings = {
	mapSize : 29,
	runSpeed : 1000,
	running : false,
	pixelSize : 20,
	cellFlipped : false,
	count : 1,
	showNeighbors: "aCell noNeighbors",
	gridButton: "SHOW"
};

// A 2 dimensional array containing all of the "Life" cells.
var lifeMap = new Array(lifeSettings.mapSize);

function initialize() {
	var theSize = (12+lifeSettings.mapSize*lifeSettings.pixelSize)+"px";
	document.getElementById('wrapper').style.maxWidth = theSize;
	document.getElementById('wrapper').style.minWidth = theSize;
	document.getElementById('buttonWrap').style.maxWidth = theSize;
	document.getElementById('buttonWrap').style.minWidth = theSize;
	var explainSize = (lifeSettings.mapSize*lifeSettings.pixelSize -50)+"px";
	document.getElementById('explanation').style.maxWidth = explainSize;
	document.getElementById('explanation').style.minWidth = explainSize;
	
	var theMap = document.getElementById('Amap');

	for(i = 0; i < lifeSettings.mapSize; i++) {
		lifeMap[i] = new Array(lifeSettings.mapSize);
		for(j = 0; j < lifeSettings.mapSize; j++) {
		 	var square = document.createElement('div');
		 	square.id = "pxl_"+i+"_"+j;
		 	square.className = lifeSettings.showNeighbors + ' deadcell';
		 	square.style.top = i*lifeSettings.pixelSize+"px";
		 	square.style.left = j*lifeSettings.pixelSize+"px";
		 	square.onclick = (function(a,b,c) { 
		 		return function() {
		 			toggleCell(a,b,c); 
		 		};
		 	})(square.id,i,j);
		 		
			theMap.appendChild(square);		 	
			lifeMap[i][j] = {
				sqr : square,
    			neighbors : 0,
				living : 0
			};
		}
	}
	
	// We have a square map with no living cells, so here we add some.
	initialLiving();
}

function changeGrid() {
	var myNode = document.getElementById("Amap");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
	lifeSettings.count = 1;
	lifeSettings.mapSize = document.getElementById("grid").value;
	document.getElementById('counter').innerHTML = "GENERATION: 0";

	initialize();
}

function initialLiving() {
	// There are five shapes to start. They're defined here:
	var aliveTop = new Array({x:0,y:0}, {x:0,y:2}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:2,y:1});
	var aliveBottom = new Array({x:0,y:1}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:2,y:0}, {x:2,y:2});
	var aliveLeft = new Array({x:0,y:0}, {x:0,y:1}, {x:1,y:1}, {x:1,y:2}, {x:2,y:0}, {x:2,y:1});
	var aliveRight = new Array({x:0,y:1}, {x:0,y:2}, {x:1,y:0}, {x:1,y:1}, {x:2,y:1}, {x:2,y:2});
	var midPoint = new Array({x:Math.floor(lifeSettings.mapSize/2),y:Math.floor(lifeSettings.mapSize/2)});

	// Here we deterimine where to place the shapes on the board.
	for(i = 0; i < aliveTop.length; i++) {
		aliveTop[i].x += Math.floor(lifeSettings.mapSize/4 - 2);
		aliveTop[i].y += Math.floor(lifeSettings.mapSize/2 - 1);
		aliveBottom[i].x += Math.floor(3*lifeSettings.mapSize/4);
		aliveBottom[i].y += Math.floor(lifeSettings.mapSize/2 - 1);
		aliveLeft[i].x += Math.floor(lifeSettings.mapSize/2 - 1);
		aliveLeft[i].y += Math.floor(lifeSettings.mapSize/4 - 2);
		aliveRight[i].x += Math.floor(lifeSettings.mapSize/2 - 1);
		aliveRight[i].y += Math.floor(3*lifeSettings.mapSize/4 );
	}

	setPattern(aliveTop);
	setPattern(aliveBottom);
	setPattern(aliveLeft);
	setPattern(aliveRight);
	setPattern(midPoint);
	
	// Having set some live cells, we need to count living neighbors for all cells.
	for(i = 0; i < lifeSettings.mapSize; i++) {
		for(j = 0; j < lifeSettings.mapSize; j++) {
			countNeighbors(i,j);
		}
	}

	displayGrid();
}

// Place a shape on the board.
function setPattern(cells) {
	var sr, sc;
	var str = "";
	for(start = 0; start < cells.length; start++) {
		sr = cells[start].x;
		sc = cells[start].y;
		str += sr+","+sc+"\n";
		lifeMap[sr][sc].living = 1;
		lifeMap[sr][sc].sqr = document.getElementById("pxl_"+sr+"_"+sc);
		lifeMap[sr][sc].sqr.className = lifeSettings.showNeighbors + ' livecell';
	}
}

// Used when a user clicks a cell. If a cell is living, kill it. If it's dead, bring it to life.
function toggleCell(cellId, r, c) {
	if(lifeMap[r][c].living) {
		lifeMap[r][c].living = 0;
		lifeMap[r][c].sqr.className = lifeSettings.showNeighbors + ' deadcell';
	} else {
		lifeMap[r][c].living = 1;
		lifeMap[r][c].sqr.className = lifeSettings.showNeighbors + ' livecell';
	}

// Having toggled it, all of its neighbors need to be updated.
	var iMin = Math.max(0, r-1), iMax = Math.min(lifeSettings.mapSize, r+2);
	var jMin = Math.max(0, c-1), jMax = Math.min(lifeSettings.mapSize, c+2);
	for(i = iMin; i < iMax; i++) {
		for(j = jMin; j < jMax; j++) {
			countNeighbors(i,j);
		}
	}

	displayGrid();
}

function Iterate() {
	// If living and has more than 3 or less than 2 neigbors, the cell dies. If dead and has 3 neighbors, it is born. 
	// Others don't change.
	var noCellFlipped = true;
	for(i = 0; i < lifeSettings.mapSize; i++) {
		for(j = 0; j < lifeSettings.mapSize; j++) {
			if( (lifeMap[i][j].living && (lifeMap[i][j].neighbors > 3 || lifeMap[i][j].neighbors < 2))
			 || (!lifeMap[i][j].living && lifeMap[i][j].neighbors == 3) ) {
				lifeMap[i][j].living = !lifeMap[i][j].living;
				noCellFlipped = false;
			}
		}
	}
	
	// If no cell changed living status, we're done.
	if(noCellFlipped) {
		haltIterate();
	}
	
	document.getElementById('counter').innerHTML = "GENERATION: "+lifeSettings.count;
	document.getElementById('gridToggle').innerHTML = 'GRID: <button id="neighbor" class="buttn buttonSmall" onclick="toggleNeighbor();">'+lifeSettings.gridButton+'</button>';
	
	var boardCleared = true;
	for(i = 0; i < lifeSettings.mapSize; i++) {
		for(j = 0; j < lifeSettings.mapSize; j++) {
			if(lifeMap[i][j].living) boardCleared = false;
			countNeighbors(i,j);
		}
	}
	
	if(boardCleared) {
		haltIterate();
	} else {
		lifeSettings.count++;
	}

	displayGrid();
}

// Iterate over grid turning on/off cells according to their living status.
function displayGrid() {
	for(gridRow = 0; gridRow < lifeSettings.mapSize; gridRow++) {
		for(gridCol = 0; gridCol < lifeSettings.mapSize; gridCol++) {
			if(lifeMap[gridRow][gridCol].living) lifeMap[gridRow][gridCol].sqr.className = lifeSettings.showNeighbors + ' livecell';
			else lifeMap[gridRow][gridCol].sqr.className = lifeSettings.showNeighbors + ' deadcell';
			
			lifeMap[gridRow][gridCol].sqr.innerHTML = lifeMap[gridRow][gridCol].neighbors;			

		}
	}	
}

function toggleNeighbor() {
	if(lifeSettings.showNeighbors == "aCell") {
		lifeSettings.showNeighbors = "aCell noNeighbors"; 
		lifeSettings.gridButton = "SHOW";
	} else {
		lifeSettings.showNeighbors = "aCell";
		lifeSettings.gridButton = "HIDE";
	}
	document.getElementById('neighbor').innerHTML = lifeSettings.gridButton;
	displayGrid();
}

function clearBoard() {
	for(i = 0; i < lifeSettings.mapSize; i++) {
		for(j = 0; j < lifeSettings.mapSize; j++) {
			lifeMap[i][j].living = 0;
		}
	}
	for(i = 0; i < lifeSettings.mapSize; i++) {
		for(j = 0; j < lifeSettings.mapSize; j++) {
			countNeighbors(i,j);
		}
	}
	lifeSettings.count = 1;
	document.getElementById('counter').innerHTML = "GENERATION: 0";
	displayGrid();
}

function resetBoard() {
	clearBoard();
	initialLiving();
	displayGrid();
}

function countNeighbors(row, col) {
	var firstRow, lastRow, firstCol, lastCol, maxLast = lifeSettings.mapSize - 1;
	// We only want to check the neighbor count of the current cell and neighbors to the current cell.
	firstRow = row > 0 ? row-1 : row;
	lastRow = row < maxLast ? row+1 : row;
	firstCol = col > 0 ? col-1 : col;
	lastCol = col < maxLast ? col+1 : col;	
	lifeMap[row][col].neighbors = 0;
	if(lifeMap[row][col].living) lifeMap[row][col].neighbors--;
	for(r = firstRow; r <= lastRow; r++) {
		for(c=firstCol; c <= lastCol; c++) {
			if(lifeMap[r][c].living) {
				lifeMap[row][col].neighbors++;
			}
		}
	}
}

function explain() {
	document.getElementById("explanation").style.visibility="visible";
}

function explainClose() {
	document.getElementById("explanation").style.visibility="hidden";
}

var myLoop;

function reIterate() {
	// Start running "Life" again.
	var button = document.getElementById("buttn");
	button.className = "buttn buttnFade";
	button.innerHTML = "STOP";
	button.onclick = function() {haltIterate()};
	Iterate();
	lifeSettings.running = true;
	myLoop = setInterval(Iterate, lifeSettings.runSpeed);
}

function haltIterate() {
	// Stop running "Life"
	var button = document.getElementById("buttn");
	button.innerHTML = "START";
	button.className = "buttn";
	lifeSettings.running = false;
	// Set onclick to start Life
	button.onclick = function() {reIterate()};
	clearInterval(myLoop);
}

function changeSpeed() {
	// Change speed to user selected value.
	lifeSettings.runSpeed = document.getElementById("speed").value;
	if(lifeSettings.running) {
		clearInterval(myLoop);
		myLoop = setInterval(Iterate, lifeSettings.runSpeed);	
	}
}
