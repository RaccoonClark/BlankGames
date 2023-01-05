var gameState=1;
var image = 0;
//GameState1
var lamp = false;
var heat = 50;
var love = 0;
var loveCD = 0;
var easter = 400;
var eggHud1;
var eggHud2;

//GameState2
var wet;
var waterCD = 0;
var dialogueCD = 0;
var foodCD = 0;
var snakeHud1;
var snakeHud2;
var snakeDialogue = ["The egg hatched into a snake", "Give him love to help him grow",
                    "Give him a drink to keep him hydrated", "Don't let the snake get too cold"];

//GameState3
var fire = false;
var fireTimer = 0;
var food;
var babyDHud1;
var babyDHud2;
var firstFood = true;
var sprBool = false;

//GameState4
var playerHealth;
var dragonHealth;
var attack;
var bigDHud1;
var bigDHud2;
var bigDHud3;
var bigDHud4;
var cracks = ["", "", "", ""];
var crack = 0;


var printStats = function(){
	if(gameState == 1) {
        for (var i = 4; i < 28; i++) {
            if (i < (heat / (100 / 24) + 4)) {
                PS.glyph(i, 21, 0x1F31E);
            }
            else {
                PS.glyph(i, 21, "");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (love / (100 / 24) + 4)) {
                PS.glyph(i, 22, "❤");
                PS.glyphColor(i, 22, PS.COLOR_RED)
            }
            else {
                PS.glyph(i, 22, "");
            }
        }
    }
    if(gameState == 2){
        for (var i = 4; i<28; i++){
            if(i < (wet / (100 / 24) +4)){
                PS.glyph(i,20, 0x1F4A7);
                PS.glyphColor(i,20,PS.COLOR_BLUE);
            }
            else{
                PS.glyph(i,20,"");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (heat / (100 / 24) + 4)) {
                PS.glyph(i, 21, 0x1F31E);
            }
            else {
                PS.glyph(i, 21, "");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (love / (100 / 24) + 5)) {
                PS.glyph(i, 22, "❤");
                PS.glyphColor(i, 22, PS.COLOR_RED)
            }
            else {
                PS.glyph(i, 22, "");
            }
        }
    }
    if(gameState == 3){
        for (var i = 4; i<28; i++){
            if(i < (food / (100 / 24) +4)){
                PS.glyph(i,20, 0x1F357);
            }
            else{
                PS.glyph(i,20,"");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (heat / (100 / 24) + 4)) {
                PS.glyph(i, 21, 0x1F525);
            }
            else {
                PS.glyph(i, 21, "");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (love / (100 / 24) + 4)) {
                PS.glyph(i, 22, "❤");
                PS.glyphColor(i, 22, PS.COLOR_RED)
            }
            else {
                PS.glyph(i, 22, "");
            }
        }
    }
    if(gameState == 4){
        for (var i = 4; i<28; i++){
            if(i < (attack / (100 / 24) +4)){
                PS.glyph(i,20, 0x26A1);
            }
            else{
                PS.glyph(i,20,"");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (heat / (100 / 24) + 4)) {
                PS.glyph(i, 21, 0x1F525);
            }
            else {
                PS.glyph(i, 21, "");
            }
        }
        for (var i = 4; i < 28; i++) {
            if (i < (love / (100 / 24) + 4)) {
                PS.glyph(i, 22, "❤");
                PS.glyphColor(i, 22, PS.COLOR_RED)
            }
            else {
                PS.glyph(i, 22, "");
            }
        }
    }
};


var button1 = function(){
    if(gameState === 1){
        PS.audioPlay("fx_click");
        lamp = !lamp;
        if(lamp){
            PS.spriteShow(eggHud2, false);
            PS.spriteShow(eggHud1, true);
        }
        else{
            PS.spriteShow(eggHud1, false);
            PS.spriteShow(eggHud2, true);
        }
    }
    if(gameState == 2){
        PS.audioPlay("fx_click");
        lamp = !lamp;
        if(lamp){
            PS.spriteShow(snakeHud2, false);
            PS.spriteShow(snakeHud1, true);
        }
        else{
            PS.spriteShow(snakeHud1, false);
            PS.spriteShow(snakeHud2, true);
        }
    }
    if(gameState == 3){
        if(foodCD >= 90){
            PS.audioPlay("fx_click");
            foodCD = 0;
            dialogueCD = 0;
            if(heat < 30){
                PS.statusText("It's undercooked...");
                food += 8;
            }
            else if(heat>60){
                PS.statusText("It's burnt.");
                food += 8;
            }
            else{
                PS.statusText("Ahh... A well cooked chicken leg");
                food += 20;
            }
        }
    }
    if(gameState == 4){
        if(heat>80){
            PS.audioPlay("fx_click");
            PS.statusText("You blind the dragon and he loses his fire.");
            heat = 0;
        }
    }
};

var button2 = function(){
    if(gameState == 1 || gameState == 2){
        if(loveCD >= 30) {
            PS.audioPlay("fx_click");
            love += 4;
            loveCD = 0;
        }
    }
    if(gameState == 3){
        if(heat > 30){
            PS.audioPlay("fx_click");
            PS.statusText("He's too hot to touch.");
            dialogueCD = 0;
        }
        else if(love == food){
            PS.audioPlay("fx_click");
            PS.statusText("He's too hungry to touch.");
            dialogueCD = 0;
        }
        else{
            PS.audioPlay("fx_click");
            PS.statusText("You bonded a little over the food.");
            dialogueCD = 0;
            love = food;
            loveCD = 0;
        }
    }
    if(gameState == 4){
        if(loveCD >= 60){
            if(love>90) {
                PS.statusText("You hit him. Keep going!");
            }
            if(love<30){
                PS.statusText("Almost there. Keep it up!");
            }
            love-=5;
            loveCD = 0;
        }
    }
};

var button3 = function(){
    if(gameState == 2){
        if(wet <= 20 && waterCD>=30){
            PS.audioPlay("fx_click");
            wet = 100;
            waterCD = 0;
        }
        else{
            PS.statusText("He isn't thirsty right now.")
        }
    }
    if(gameState == 3){
        PS.audioPlay("fx_click");
        fire = true;
        fireTimer = 0;
        if(!sprBool){
            PS.spriteShow(babyDHud2, false);
            PS.spriteShow(babyDHud1, true);
            sprBool = true;
        }
    }
    if(gameState == 4){
        PS.audioPlay("fx_click");
        if(attack>80 && fire<80){
            PS.statusText("The dragon attacks, but you blocked it.");
            attack = 0;
        }
        else if(attack>80 && fire>80){
            PS.statusText("Your shield can't block his fire!");
            attack = 0;
            fire = 0;
        }
        else{
            PS.statusText("You guard but the dragon didn't attack");
            attack +=5;
        }
    }
};

var eggTimerID;
var eggTimer = function(){
    if(love <= 0){
        easter--;
    }
    if(love >= 10){
        easter = 900;
    }
    printStats();
	adder = .1 + love/400;
	if(loveCD<30){
	    loveCD++;
    }
	if(lamp){
	    if(heat<100){
            heat += adder;
        }
        else{
            heat = 100;
        }
	}
	else{
	    if(heat>0) {
            heat -= adder;
        }
        else{
            heat = 0;
        }
	}
	PS.statusText("Give the egg love to make him hatch!")
	if(heat<0){heat = 0;}
	if(heat>100){heat = 100;}
	if(heat > 65){
	    PS.statusText("Getting a little too hot.");
	    love -= (heat-65)/300 +.005;
    }
    if(heat < 35){
        PS.statusText("Getting kinda chilly.")
        love -= (35-heat)/300 +.005;
    }
    if(love<0){
        love = 0;
    }
    if(love > 100){
        PS.timerStop(eggTimerID);
        PS.statusText("Success! He's hatching!");
        gameState = 2;
        var loader1 = function(image){
            snakeHud1 = PS.spriteImage(image);
            PS.spriteDelete(eggHud1);
            PS.spritePlane(snakeHud1, 1);
            PS.spriteMove(snakeHud1, 0, 0);
        };
        var loader2 = function(image){
            snakeHud2 = PS.spriteImage(image);
            PS.spriteDelete(eggHud2);
            PS.spritePlane(snakeHud2, 2);
            PS.spriteMove(snakeHud2, 0, 0);
            PS.spriteShow(snakeHud2, false);
        };
        PS.imageLoad("images/snake_dark.png", loader2);
        PS.imageLoad("images/snake_light.png", loader1);
        love = 0;
        wet = 0;
        wetCD = 30;
        snakeTimerID = PS.timerStart(1, snakeTimer)
    }
    if(easter <= 0){
        PS.timerStop(eggTimerID);
        PS.audioPlay("fx_tada");
        PS.statusText("The dragon was slain! YOU WIN!");
    }
};

var snakeTimerID;
var snakeTimer = function(){
    printStats();
    if(waterCD < 30){
        waterCD++;
    }
    if(wet>0){
        adder = .4;
    }
    else{
        adder = 1.2;
    }

    if(loveCD<30){
        loveCD++;
    }
    if(waterCD<600){
        waterCD++;
    }
    if(lamp){
        if(heat<100){
            heat += adder;
        }
        else{
            heat = 100;
        }
    }
    else{
        if(heat>0) {
            heat -= adder;
        }
        else{
            heat = 0;
        }
    }

    if(heat<0){heat = 0;}
    if(heat>100){heat = 100;}
    if(heat > 60){
        love -= (heat-60)/300 +.05;
        PS.statusText("He's too hot.")
    }
    if(heat < 30){
        love -= (30-heat)/300 +.05;
        PS.statusText("He's too cold.")
    }
    if(wet>0){
        wet-=.3;
    }
    if(wet<10){
        PS.statusText("The snake is thirsty. Quench him!")
    }
    if(love<0){
        love = 0;
    }
    if(love > 100){
        PS.timerStop(snakeTimerID);
        PS.statusText("Nice job, he's getting bigger.");
        gameState = 3;
        var loader1 = function(image){
            babyDHud1 = PS.spriteImage(image);
            PS.spriteDelete(snakeHud1);
            PS.spritePlane(babyDHud1, 1);
            PS.spriteMove(babyDHud1, 0, 0);
            PS.spriteShow(babyDHud1, false);
        };
        var loader2 = function(image){
            babyDHud2 = PS.spriteImage(image);
            PS.spriteDelete(snakeHud2);
            PS.spritePlane(babyDHud2, 2);
            PS.spriteMove(babyDHud2, 0, 0);
        };
        PS.imageLoad("images/babyd_default.png", loader2);
        PS.imageLoad("images/babyd_fire.png", loader1);
        love = 0;
        heat = 0;
        food = 0;
        fire = false;
        babyTimerID = PS.timerStart(1, babyTimer);
    }
};


var babyTimerID;
var babyTimer = function(){
    printStats();

    if(dialogueCD<60){
        dialogueCD++;
    }
    else{
        PS.statusText("He is hungry.");
    }

    if(love>food){
        love = food;
    }


    if(fire && heat<100){
        heat++;
    }
    else if(heat>0){
        heat--;
    }
    if(fireTimer<130){
        fireTimer++;
    }
    else{
        fire = false;
    }

    if(sprBool && !fire){
        PS.spriteShow(babyDHud1, false);
        PS.spriteShow(babyDHud2, true);
        sprBool = false;
    }

    if(foodCD<90){
        foodCD++;
    }
    if(food>love && food>0){
        food-=.1;
        if(firstFood) {
            PS.statusText("Quick, give him love now that he's calm.");
            firstFood = false;
        }
    }
    if(food>100){
        gameState = 4;
        PS.timerStop(babyTimerID);
        PS.statusText("He's growing again. What have you done?");
        love = 100;
        heat = 0;
        attack = 0;
        PS.spriteDelete(babyDHud1);
        PS.spriteDelete(babyDHud2);
        var loader1 = function(image){
            bigDHud1 = PS.spriteImage(image);
            PS.spritePlane(bigDHud1, 1);
            PS.spriteMove(bigDHud1, 0, 0);
        };
        var loader2 = function(image){
            bigDHud2 = PS.spriteImage(image);
            PS.spritePlane(bigDHud2, 2);
            PS.spriteMove(bigDHud2, 0, 0);
            PS.spriteShow(bigDHud2, false);
        };
        var loader3 = function(image){
            bigDHud3 = PS.spriteImage(image);
            PS.spritePlane(bigDHud3, 3);
            PS.spriteMove(bigDHud3, 0, 0);
            PS.spriteShow(bigDHud3, false);
        };
        var loader4 = function(image){
            bigDHud4 = PS.spriteImage(image);
            PS.spritePlane(bigDHud4, 4);
            PS.spriteMove(bigDHud4, 0, 0);
            PS.spriteShow(bigDHud4, false);
        };

        PS.imageLoad("images/bigd_default.png", loader1);
        PS.imageLoad("images/bigd_default_v2.png", loader2);
        PS.imageLoad("images/bigd_fire_v2.png", loader3);
        PS.imageLoad("images/escape.png", loader4);
        var loader5 = function(image){
            cracks[0] = PS.spriteImage(image);
            PS.spritePlane(cracks[0], 5);
            PS.spriteMove(cracks[0], 0,0);
            PS.spriteShow(cracks[0], false);
        }
        var loader6 = function(image){
            cracks[1] = PS.spriteImage(image);
            PS.spritePlane(cracks[1], 6);
            PS.spriteMove(cracks[1], 0,0);
            PS.spriteShow(cracks[1], false);
        }
        var loader7 = function(image){
            cracks[2] = PS.spriteImage(image);
            PS.spritePlane(cracks[2], 7);
            PS.spriteMove(cracks[2], 0,0);
            PS.spriteShow(cracks[2], false);
        }
        var loader8 = function(image){
            cracks[3] = PS.spriteImage(image);
            PS.spritePlane(cracks[3], 8);
            PS.spriteMove(cracks[3], 0,0);
            PS.spriteShow(cracks[3], false);
        }
        PS.imageLoad("images/crack1.png", loader5);
        PS.imageLoad("images/crack2.png", loader6);
        PS.imageLoad("images/crack3.png", loader7);
        PS.imageLoad("images/crack4.png", loader8);
        dragonTimerID = PS.timerStart(1, dragonTimer);
        crack = 0;
    }
}

var dragonTimerID;
var dragonTimer = function(){
    printStats();

    if(loveCD<60){
        loveCD++;
    }

    if(attack<100) {
        attack += .3;
    }
    else{
        attack = 0;
        damage();
    }
    if(heat>80){
        PS.statusText("The dragon is fired up. Try blinding him");
    }
    if(heat<100){
        heat+=.05;
    }

    if(love<=0){
        PS.timerStop(dragonTimerID);
        gameState = 5;
        heat = 0;
        attack = 0;
        printStats();
        PS.audioPlay("fx_tada");
        PS.gridPlane(10);
        PS.statusText("You did it! You slayed the dragon. Nice job!");
        PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);
        PS.alpha(PS.ALL, PS.ALL, 255);
        PS.glyph(PS.ALL, PS.ALL, "");
        PS.timerStart(1, fader);
    }
}

var fade = 0;
var fader = function(){
   if(fade<255){
       fade++;
   }
   PS.alpha(PS.ALL, PS.ALL, fade);
}

var damage = function(){
    if(crack<3) {
        if (crack > 0) {
            PS.spriteShow(cracks[crack - 1], false);
        }
        PS.spriteShow(cracks[crack], true);
        PS.statusText("You failed to guard and the dragon did some damage");
        crack++;
    }
    else{
        PS.spriteShow(cracks[crack-1], false);
        PS.spriteShow(bigDHud4, true);
        PS.statusText("The dragon escaped... Game Over");
        gameState = 5;
        PS.timerStop(dragonTimerID);
    }
}


PS.init = function( system, options ) {
	"use strict";
	//Grid Init stuff
	PS.gridSize(32,32);
	PS.gridColor(PS.COLOR_GRAY);
    PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);
    PS.border(PS.ALL, PS.ALL, 0);
    //PS.dbInit("data");
	gameState=1;
    PS.statusText("An Egg!");
    printStats();
    lamp = true;
//image loader. Increments global variable to assign sprites correctly
    var loader1 = function(image){
        eggHud1 = PS.spriteImage(image);
        PS.spritePlane(eggHud1, 1);
        PS.spriteMove(eggHud1, 0, 0);
    };
    var loader2 = function(image){
        eggHud2 = PS.spriteImage(image);
        PS.spritePlane(eggHud2, 2);
        PS.spriteMove(eggHud2, 0, 0);
        PS.spriteShow(eggHud2, false);
    };
    PS.imageLoad("images/egg_dark.png", loader2);
    PS.imageLoad("images/egg_light.png", loader1);

    eggTimerID = PS.timerStart(1, eggTimer);
};


//This looks janky but it's actually super simple. It checks if you click in a box with corners, x1,y1 and x2,y2
var touchBounds = function(testx, testy, x1, y1, x2, y2){
    if(testx>=x1 && testx<=x2 && testy>=y1 && testy <= y2){
        return true;
    }
    else {
        return false;
    }
}


PS.touch = function( x, y, data, options ) {
	"use strict";
};


//I put the code in here so that players can swipe off of bad clicks. I might move it back idk.
PS.release = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!
    if(gameState == 1) {
        if (touchBounds(x, y, 6, 24, 13, 31)) {
            button1();
        }
        if (touchBounds(x, y, 16, 24, 24, 31)) {
            button2();
        }
    }
    else if(gameState == 2 || gameState == 3 || gameState == 4){
        if (touchBounds(x, y, 1, 24, 8, 31)) {
            button1();
        }
        if (touchBounds(x, y, 11, 24, 19, 31)) {
            button2();
        }
        if(touchBounds(x, y, 22,24,29,31)){
            button3();
        }
    }
};
