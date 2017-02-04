// state
var socket = io();
var keyIsPressed = false;
var lastDirection = null;
var lastShouldShowNipple = null;
var manager = null;

// --- Events
$('.lscat-ctrl-btn')
	.mousedown(function(event) {
		var direction = $(event.currentTarget).attr("data-direction");
		console.log("fired");
		emitEvent(direction, "down");
	}).mouseup(function(event) {
    	var direction = $(event.currentTarget).attr("data-direction");
    	emitEvent(direction, "up");
	});


$(window)
	.keydown(function(event) {
		handleKeyEvent("down");
        keyIsPressed = true;
		console.log(event.which);
	}).keyup(function(event) {
	    keyIsPressed = false;
		handleKeyEvent("up");
		console.log(event.which);
	});

$(window).resize(function() {
    var ssn = shouldShowNipple();
	if(lastShouldShowNipple != ssn) {
		if(ssn) {
			console.log("here");
            manager = nipplejs.create({
                zone: document.getElementById("lscat-video-area"),
                mode: 'static',
                position: {right: '100px', bottom: '80px'},
                color: 'red'
            });

            manager.on("dir", function (event, nipple) {
                var direction = nipple.direction.angle;
                if (lastDirection != direction) {
                    // direction changed
                    emitEvent(lastDirection, "up");
                }
                lastDirection = direction;
                console.log(direction);
                emitEvent(direction, "down");
            });

            manager.on("end", function (event, nipple) {
                console.log("end");
                emitEvent(lastDirection, "up");
                lastDirection = null;
            });
		} else {
			if(manager != null) {
				manager.destroy();

			}
		}
		lastShouldShowNipple = ssn;
	}

});

function shouldShowNipple() {
    return ($('#desktopTest').is(':hidden'));
}


// --- Methods
function handleKeyEvent(action) {
	if(keyIsPressed == true) {
        return;
    }

    if(event.which == 38) {
        // up
        emitEvent("up", action);
    } else if(event.which == 40) {
        // down
        emitEvent("down", action);
    } else if(event.which == 37) {
        // left
        emitEvent("left", action);
    } else if(event.which == 39) {
        // right
        emitEvent("right", action);
    }
}

function emitEvent(direction, action) {
    socket.emit('button', {direction: direction, action: action});
}