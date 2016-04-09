var counter = document.getElementById("exerciseProgress");
var canvas = document.getElementById("circle");
var output = document.getElementById("output");
var circleImg = new Image();
circleImg.src = "img/CircleGesture.png";

var knuckleImg = new Image();
knuckleImg.src = "img/knuckle.jpg";

var thumbImg = new Image();
thumbImg.src = "img/thumb.jpg";

var twistsImg = new Image();
twistsImg.src = "img/twists.jpg";

var twistsV = new Image();
twistsV.src = "img/twistsV.jpg";


var hand, finger;
var handType =  [["Right", "left", 1],["Left", "right", 1],["Both", "", 2]];
var handStatus;
var hs;
var extendedFingers = 0;
var wristNormal;
var repDone = 1;
var exerciseCounter = 0;
var exerciseRepeats = 0;
var exercise;
var currWrkrDOM;

var ctx = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;
var radius = 20;



var controller = new Leap.Controller({
	enableGestures: true,
	frameEventName: 'animationFrame'
}), 
callMuteRequestMade = false;

function draw_circle(){
	canvas.width = canvas.width;

	
	ctx.moveTo(0, canvas.height/2);
	ctx.lineTo(canvas.width/2, 0);
	ctx.moveTo(canvas.width/2, 0);
	ctx.lineTo(canvas.width, canvas.height/2);
	ctx.moveTo(canvas.width, canvas.height/2);
	ctx.lineTo(canvas.width/2, canvas.height);
	ctx.moveTo(canvas.width/2, canvas.height);
	ctx.lineTo(0, canvas.height/2);
	ctx.strokeStyle = '#337ab7';
	ctx.stroke();

	

}
function interactive(frame){	

	var pointable = frame.pointables[0];
	var interactionBox = frame.interactionBox;	
	var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);
	var canvasX = canvas.width * normalizedPosition[0];
	var canvasY = canvas.height * (1 - normalizedPosition[1]);

	draw_circle();
	ctx.beginPath(); 
	ctx.fillStyle = '#6520c7';
	ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI, true); 
	ctx.fill();
		

}

function next_wrkr(){
	exerciseCounter = 0;
	
	
	var nextWrkrDOM = $(currWrkrDOM).next();
	exercise = $(nextWrkrDOM).attr( "id" );
	if(exercise === undefined){ // exercise ended
		$(".action").removeClass("list-group-item-success").attr("style", "");
		
		 
		handStatus = hs.next();

		$(".hand").html("<p>"+ handType[handStatus.value][0] +" hand(s)</p>");
		exercise = Object.keys(exercises)[0];
		
		$(".exDescription").html("<h3>"+ exercises[exercise].name +"</h3><p>"+ exercises[exercise].text() +"</p>");
		$(".exDescription").append(exercises[exercise].picture);
	
		currWrkrDOM = $( ".action" ).first();
		$(currWrkrDOM).addClass( "active" );
		
	
		exerciseRepeats = exercises[exercise].numRepeats;
		$("#exerciseRepeats").text(exerciseRepeats);
		//repDone = 0;
		
		return false;
	}
	$(nextWrkrDOM).addClass( "active" );
	$(".exDescription").html("<h3>"+ exercises[exercise].name +"</h3><p>"+ exercises[exercise].text() +"</p>");
	$(".exDescription").append(exercises[exercise].picture);
	exerciseRepeats = exercises[exercise].numRepeats;
	$("#exerciseRepeats").text(exerciseRepeats);
	
	
	currWrkrDOM = nextWrkrDOM;
	
}

$(".action").click(function(){
	exercise = this.id;
	$(this).addClass( "active" );
	exerciseCounter = 0;
});

$("#start-wrkr").click(function begin_workout(){
	//for(var keys in exercises){
		//	console.log(exercises[keys].name);
		//}
		//console.log(Object.keys(exercises)[0]); //get key
		//console.log(exercises[Object.keys(exercises)[0]].name); //get value
		//console.log(exercises.hand_type[1]); // same value
		
		draw_circle();
		for(var keys in exercises)
			$(".exList").append("<button id='"+ keys +"' class='action list-group-item'>" + exercises[keys].name + " x" + exercises[keys].numRepeats +"</button>");
	
		hs = handType.keys();
		//console.table(hs);
		handStatus = hs.next();

		$(".hand").html("<p>"+ handType[handStatus.value][0] +" hand</p>");
	
		//var iter = Object.keys(exercises);
		//var ex = iter.next();
	
		//console.table(iter);
		exercise = Object.keys(exercises)[0];
	
		$(".exDescription").html("<h3>"+ exercises[exercise].name +"</h3><p>"+ exercises[exercise].text() +"</p>");
		$(".exDescription").append(exercises[exercise].picture);
		//$(".progressArea").show(); ///take it out later
		$(".ibox").show();
	
		currWrkrDOM = $( ".action" ).first();
		$(currWrkrDOM).addClass( "active" );
		exerciseCounter = 0;
		exerciseRepeats = exercises[exercise].numRepeats;
		$("#exerciseRepeats").text(exerciseRepeats);
	
	
		controller.loop(function(frame) {
			if (frame.hands.length < 1) return;
		  
			hand = frame.hands[0];
			len = frame.hands.length;
			
			interactive(frame);	//ibox
		
			var percentDone = Math.round((exerciseCounter/exerciseRepeats)*100);
			$(currWrkrDOM).css({
				backgroundImage: "url(img/bg.png)",
				backgroundRepeat: "repeat-y",
				backgroundSize: percentDone+"% auto"
			}); 
		
		
			if(exerciseCounter == exerciseRepeats){
				$(currWrkrDOM).removeClass( "active" ).addClass( "list-group-item-success");
				next_wrkr();
			}

				if(hand.type !== handType[handStatus.value][1] && len == handType[handStatus.value][2]){
					$(".hand").removeClass("bg-info").removeClass("bg-danger").addClass("bg-success");
				
					exercises[exercise].exercise(frame); ////Here is the thing
				}else{
					$(".hand").removeClass("bg-success").removeClass("bg-danger").addClass("bg-danger");
				}

				//counter.innerHTML = exerciseCounter; playback plugin is used
		
			});


	
	
			return false;

		});

		$.ajax({
			method: "GET",
			url: "js/exercises.js",
			dataType: "script"
		});

  

		controller.connect();
  