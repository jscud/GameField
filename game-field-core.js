/* Game Field core JavaScript

   This JavaScript library contains the essential parts of the Game Field API.
   If you'd prefer to write JavaScript to set pixels, handle clicks, and power
   the event loop, this is the file for you! This omits extra features like
   editing and saving code in the browser.
 
   To use Game Field core, you'd include this script in your page and call the
   following:
   <div id="container"></div>
   <script>
     GameField.resetCanvas('container', 20, 20);
     GameField.eachTick = function() {
       var tap = GameField.checkTapStart();
       if (tap) {
         GameField.setPixel(tap.x, tap.y, GameField.randomColor());
       }
     };
   </script>

   For a better experience in mobile browsers, you may want to add the
   following in the <head> of the page's HTML:
   <meta name="viewport" content="width=device-width, initial-scale=1">
*/

// Unnamed closure to avoid polluting the global namespace.
(function() {
var publicGameField = {};

var GAME_FIELD_CANVAS_ID_ = 'game-field-canvas';

// Constructor for a game field state container.
function GameEngine() {
  this.numRows = 0;
  this.numCols = 0;
  this.tileSize = 1;
  this.eventLoopDelay = 100;
  this.reset_();
  this.eventLoopInterval = null;
}

// Called before creating a new canvas to remove internal state associated
// with a run on a GameField program.
GameEngine.prototype.reset_ = function() {
  this.tapMoveLastPosition = [];
};

// Starts an event loop to call GameField.eachTick at the interval specified
// by the stored event loop internal.
GameEngine.prototype.resetEventLoop_ = function() {
  if (this.eventLoopInterval) {
    clearInterval(this.eventLoopInterval);
  }
  this.eventLoopInterval = setInterval(function() {
    if (publicGameField.eachTick) {
      publicGameField.eachTick();
    }
  }, this.eventLoopDelay);
};

GameEngine.prototype.convertPageXYToTileXY_ = function(e) {
  var x;
  var y;
  if (e.pageX || e.pageY) { 
    x = e.pageX;
    y = e.pageY;
  } else { 
    x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft; 
    y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop; 
  } 
  var fieldCanvas = document.getElementById(GAME_FIELD_CANVAS_ID_);
  x -= fieldCanvas.offsetLeft;
  y -= fieldCanvas.offsetTop;

  return [Math.floor(x / this.tileSize), Math.floor(y / this.tileSize)];
}

// Starts recording clicks on the canvas, saving them in the GameField click
// queue.
GameEngine.prototype.listenForEvents_ = function() {
  var field = document.getElementById(GAME_FIELD_CANVAS_ID_);
  var thisGameEngine = this;

  field.addEventListener('mousedown', function(e) {
    if (publicGameField.eachTapStart) {
      var tileXY = thisGameEngine.convertPageXYToTileXY_(e);
      publicGameField.eachTapStart(tileXY[0], tileXY[1]);
    }
  }, true);

  field.addEventListener('mouseup', function(e) {
    if (publicGameField.eachTapStop) {
      var tileXY = thisGameEngine.convertPageXYToTileXY_(e);
      publicGameField.eachTapStop(tileXY[0], tileXY[1]);
    }
  }, true);

  field.addEventListener('mousemove', function(e) {
    if (publicGameField.eachTapMove) {
      var position = thisGameEngine.convertPageXYToTileXY_(e);
      if (position[0] != thisGameEngine.tapMoveLastPosition[0] ||
          position[1] != thisGameEngine.tapMoveLastPosition[1]) {
        thisGameEngine.tapMoveLastPosition = position;
        publicGameField.eachTapMove(position[0], position[1])
      }
    }
  }, true);
};

// Creates a blank game field canvas prepared to start running a
// GameField program.
GameEngine.prototype.resetCanvas = function(containerId, numPixelsWide,
    numPixelsHigh, opt_maxWidth, opt_maxHeight) {
  this.reset_();
  // Wipe out old canvas.
  var gameFieldDiv = document.getElementById(containerId);
  gameFieldDiv.innerHTML = '';
  // Determine new game fild pixel size.
  var maxWidth = typeof opt_maxWidth != 'undefined' ?
      opt_maxWidth : document.documentElement.clientWidth - 20;
  var maxHeight = typeof opt_maxHeight != 'undefined' ?
      opt_maxHeight : document.documentElement.clientHeight - 30;
  var maxPixelSizeBasedOnWidth = Math.floor(maxWidth / numPixelsWide);
  var maxPixelSizeBasedOnHeight = Math.floor(maxHeight / numPixelsHigh);
  var pixelSize = Math.min(
      maxPixelSizeBasedOnWidth, maxPixelSizeBasedOnHeight);
  // Create new game field.
  var gameFieldCanvas = document.createElement('canvas');
  gameFieldCanvas.id = GAME_FIELD_CANVAS_ID_;
  gameFieldCanvas.width = pixelSize * numPixelsWide;
  gameFieldCanvas.height = pixelSize * numPixelsHigh;
  gameFieldCanvas.style.border = '1px solid #000000';
  gameFieldDiv.appendChild(gameFieldCanvas);

  this.numRows = numPixelsHigh;
  this.numCols = numPixelsWide;
  this.tileSize = pixelSize;
  this.listenForEvents_();
  this.resetEventLoop_();
};

GameEngine.prototype.setPixel = function(x, y, color) {
  var field = document.getElementById(GAME_FIELD_CANVAS_ID_);
  var fieldContext = field.getContext('2d');
  fieldContext.fillStyle = color;
  fieldContext.fillRect(
      x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
};

function randomNumber(low, high) {
  return Math.floor(Math.random() * ((high - low + 1))) + low;
}

var hexDigits_ = ['0', '1', '2', '3', '4', '5', '6', '7',
                  '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

function randomColor() {
  var digits = ['#'];
  for (var i = 0; i < 6; i++) {
    digits.push(hexDigits_[randomNumber(0, 15)]);
  }
  return digits.join('');
}

// Singleton GameEngine used by functions exposed for users.
var gameField = new GameEngine();

publicGameField.setPixel = function(x, y, color) {
  gameField.setPixel(x, y, color);
};

publicGameField.checkTapStart = function() {
  return gameField.checkTapStart();
};

publicGameField.checkTapMove = function() {
  return gameField.checkTapMove();
};

publicGameField.checkTapEnd = function() {
  return gameField.checkTapEnd();
};

publicGameField.randomNumber = function(low, high) {
  return randomNumber(low, high);
};

publicGameField.randomColor = function() {
  return randomColor();
};

publicGameField.resetCanvas = function(containerId, numPixelsWide,
    numPixelsHigh, opt_maxWidth, opt_maxHeight) {
  gameField.resetCanvas(containerId, numPixelsWide, numPixelsHigh,
      opt_maxWidth, opt_maxHeight);
};

// Expose the GameField namespace.
window['GameField'] = publicGameField;
})();

