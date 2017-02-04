// state
var socket = io();
var keyIsPressed = false;
var lastDirection = null;
var lastShouldShowNipple = null;
var manager = null;
var initialManagerCreate=true;
var timeToWait=null;
var activeSlotTime=5;
var waitingTimeHandler = null;
var myId = null;
var isActive = false;


$(function() {
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
        showOrHideNipple();
    });

    showOrHideNipple();

    socket.on("connected", function(data) {
        myId = data.uuid;
    });
    socket.on("start", function(data) {
        console.log("command obtained");
        $(".lscat-video-area").css("border", "5px solid green");
        $(".lscat-ctrls").show();
        if(shouldShowNipple()) {
            showNipple();
        }
        isActive = true;

    });
    socket.on("stop", function(data) {
        console.log("command lost");
        $(".lscat-video-area").css("border", "5px solid white");
        $(".lscat-ctrls").hide();
        hideNipple();
        isActive = false;
    });

    socket.on("waitingTimeUpdate", function(data) {
        if(data.currentUuid === myId) {
            if(waitingTimeHandler) {
                clearInterval(waitingTimeHandler);
            }
            timeToWait = 0;
            $(".lscar-waiting-timer").html(timeToWait)
        } else {
            if(data.currentUser < data.myPos) {
                // current user is in front of me
                timeToWait = (data.myPos - data.currentUser) * activeSlotTime;
            } else {
                timeToWait = (data.count - data.currentUser + data.myPos) * activeSlotTime;
            }
            var time = timeToWait;
            waitingTimeHandler = setInterval(function () {
                time -= 1;
                $(".lscar-waiting-timer").html(time);
            }, 1000);
        }
    });

    socket.on("userCountChange", function(data) {
        console.log("user count: " + data.count);
        $(".lscat-usr-count").html(data.count);
    });
});

// --- Methods
function showOrHideNipple() {
    var ssn = shouldShowNipple();
    if(lastShouldShowNipple != ssn) {
        if(ssn) {
            if(initialManagerCreate) {
                manager = createNippleManager();
                initialManagerCreate = false;
            }
            if(isActive)
                showNipple();
        } else {
            hideNipple();
        }
        lastShouldShowNipple = ssn;
    }
}

function createNippleManager() {
    var manager = nipplejs.create({
        zone: document.getElementsByClassName("lscat-video-area")[0],
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
    return manager;
}

function showNipple() {
    $(".nipple").show();
}

function hideNipple() {
    $(".nipple").hide();
}

function shouldShowNipple() {
    return ($('#desktopTest').is(':hidden'));
}

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