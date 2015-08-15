GameField
=========

Game Field is a simple environment for learning computer science concepts.
Learners write instructions to draw on a row resolution map, setting the
color of individual pixels. Animations can be added by defining an event
loop function with instructions to be executed every so often. The rate
of the even loop is configurable. Learners can include instructions to
get click and touch events and then respond as they see fit.

Simple Example
--------------

This example program checks for a click on each run of the event loop and
sets the clicked pixel to a random color.

    GameField.eachTapStart = function(x, y) {
      GameField.setPixel(x, y, GameField.randomColor());
    };
