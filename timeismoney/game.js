
// The "use strict" directive in the following line is important. Don't alter or remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't alter or remove them!

/*jslint nomen: true, white: true */
/*global PS */

// >>>> DEV VARIABLES <<<<<
const TELEMETRY = false; //collect telemetry data? turn off to test without sending a million emails
const DEV = false; //play shorter dev version of the game

var G = (function () {
    "use strict";
    // NON-SPECIFIC VARIABLES

    const RED_GUY_TEXT = PS.COLOR_RED;
    const BLUE_GUY_TEXT = 0x3d7ce2;
    var cutsceneNum = 0; //cutscene counter
    var isInitState = true;
    var gameState = 0; //0 for cutscene, 1 for convenience store, 2 for shooter
    var s_ticks = 0;
    if (DEV) {
        var s_ticks = 10
    }
    var imageNum = 0; //ticks through to allow assignment of images to the correct variable
    var s_timer = 0; //id to stop timer at end of game
    var glyphDraw = 0; //for dollar bill drawing

    // STORE SPECIFIC VARIABLES

    // Constants are in all upper-case.

    var IMG_STORE_BACK = 0;
    var IMG_DUDE = 0;
    var IMG_PEOPLE = 0;
    var IMG_REGISTER = 0;
    var IMG_STORE_COLOR = 0;
    var IMG_STORE_DATA = 0;
    var IMG_MAP_COLOR = 0;
    var IMG_MAP_DATA = 0;
    const FADE_PLANE = 10;
    const STORE_BACKGROUND = 0x70d2ef; //light blue
    const SHOOTER_BACKGROUND = 0xe55d4b; //light red/pink orange whatever
    const MAX_PURCHASES = 12;
    const NAMES = ["Soda", "Cereal", "Milk", "Bread", "Paper Towels", "Tissues", "Light Bulbs", "Tape", "Scissors", "Soap", "Trash Bags", "Coffee"];
    const PRICES = [1.99, 4.25, 1.69, 1.30, 10.55, 5.43, 8.75, 7.11, 6.17, 3.29, 12.96, 1.06];
    const PAYMENT = [2, 5, 2, 2, 15, 10, 10, 20, 10.25, 5.50, 100, 1.10];
    var PLAYER = "";
    const rows = [26, 29];

    // Variables

    var purchases = [];
    var isPurchasing = false; //checks if player is currently processing a transaction
    var purchaseNum = 0; //which purchase in the array are we on?
    if (DEV) {
        purchaseNum = 11;
    }
    var countDown = 0; //count down till next purchase arrives
    var guessInt = 0;
    
    // SHOOTER SPECIFIC VARIABLES

    var myImage;
    var enemySpawnCD=100;
    var WALL = 0x000000;
    var points = 0;
    var blockers = [WALL];
    var bullets = [[0,0,0,0,1]];
    var enemBullets = [[0,0,0,0,1]];
    var enemies = [];
    var moveCD = 0;
    var player = {
        x : 0,
        y : 0,
        gunX : 0,
        gunY : 0,
        health : 0
    };
    var cx = 0;
    var cy = 0;
//          w      a      s      d      space
    var keys = [false, false, false, false, false];
    var win = false;

    var numTicks = 5000;
    if (DEV) {
        numTicks = 5000;
    }
    var timerID;

    //Finale Variables:
    var spawners = [];
    // FUNCTIONS

    // -------> GLOBAL FUNCTIONS <--------
    var audioChannel
    var audioManage = function(data) {
        audioChannel = data.channel;
    };

    var tick_s = function () {  //controls shifting of control between the two games and is responsible for starting cutscenes
        ++s_ticks;
        if (!gameState && isInitState) {
            PS.timerStop(s_timer);
            s_timer = PS.timerStart(60, tick_cs01);
        }
        else if (gameState === 1) {
            if ((s_ticks >= 240 && !isPurchasing) || purchaseNum>=12) {
                s_ticks = 0;
                PS.statusText("Time's Up!");
                PS.audioPlay("fx_whistle");
                PS.timerStop(s_timer);
                PS.touch = null;
                s_timer = PS.timerStart(60, tick_cs02);
                //PS.dbEvent("story_game", "end_store", true);
                //PS.dbSend("story_game", "tmtawadros", {discard : true});
            }
            else if (countDown<=0) {
                isPurchasing = true;
                PS.statusText(purchases[purchaseNum].name + ": $" + purchases[purchaseNum].price + "; paid $" + purchases[purchaseNum].payment);
                if(getGuess()) {
                    ++purchaseNum;
                    guessInt = 0;
                    isPurchasing = false;
                    if (TELEMETRY) {
                        //PS.dbEvent( "story_game", "Show Purchase", purchaseNum, "name", purchases[purchaseNum].name, "price", purchases[purchaseNum].price, "payment", purchases[purchaseNum].payment);
                    }
                    countDown = 1;
                }
            }
            else{
                countDown--;
            }
        }
        else if (gameState === 2) {
            if (isInitState) {
                PS.timerStop(s_timer);
                ctrlShooter(); //hand over controls
                timerID = PS.timerStart(1, game);
                isInitState = false;
                PS.statusColor(PS.COLOR_BLACK);
                PS.statusText( "Survive" );
            }
        }
    };

    var tick_cs01 = function () {
        ++s_ticks;
        switch (s_ticks) {
            case 2:
                PS.statusColor(RED_GUY_TEXT);
                PS.statusText("You're home early. What's wrong?");
                break;
            case 4:
                PS.statusColor(BLUE_GUY_TEXT);
                PS.statusText("Shut up! I gotta go.");
                break;
            case 6:
                PS.statusText("The mob is after me.");
                break;
            case 8:
                PS.statusText("I can't pay my debt!");
                break;
            case 10:
                PS.statusColor(RED_GUY_TEXT);
                PS.statusText("Don't worry. I've got a job.");
                break;
            case 12: //draw underneath
                PS.statusText("");
                PS.statusColor(PS.DEFAULT);
                PS.gridColor(STORE_BACKGROUND);
                PS.imageBlit(IMG_STORE_BACK, 0, 0);
                PS.gridPlane(1);
                PS.imageBlit(IMG_PEOPLE, 0, 0);
                PS.gridPlane(2);
                PS.imageBlit(IMG_DUDE, 0, 0);
                PS.gridPlane(3);
                PS.imageBlit(IMG_REGISTER, 0, 0);
                PS.gridPlane(PS.DEFAULT);
                PS.gridRefresh();
                //PS.glyphAlpha(PS.ALL, PS.ALL, 0);
                break;
            case 14:
                PS.audioPlay("store", { loop : true, volume : 0.25, path : "audio/", fileTypes : ["mp3"], onLoad : audioManage });
                PS.gridPlane(FADE_PLANE);
                PS.fade(PS.ALL, PS.ALL, 120);
                PS.alpha(PS.ALL, PS.ALL, 0);
                PS.gridPlane(PS.DEFAULT);
                break;
            case 15:
                PS.gridRefresh();
                gameState = 1;
                s_ticks = 0;
                PS.timerStop(s_timer);
                s_timer = PS.timerStart(60, tick_s);
                //PS.debug("gamestate = 1");
                break;
        }
    };

    var stopPlaying = function () {
        PS.audio
    };

    var tick_cs02 = function () {
        ++s_ticks;
        switch (s_ticks) {
            case 2: //fade out
                PS.audioFade(audioChannel, 1, 0, 2000, stopPlaying);
                PS.gridPlane(FADE_PLANE);
                PS.fade(PS.ALL, PS.ALL, 120);
                PS.alpha(PS.ALL, PS.ALL, 255);
                PS.gridPlane(PS.DEFAULT);
                PS.gridColor(PS.COLOR_BLACK);
                break;
            case 5: //draw underneath
            PS.statusText("");
                PS.gridPlane(1);
                PS.alpha(PS.ALL, PS.ALL, 0);
                PS.gridPlane(2);
                PS.alpha(PS.ALL, PS.ALL, 0);
                PS.gridPlane(3);
                PS.alpha(PS.ALL, PS.ALL, 0);
                PS.gridPlane(PS.DEFAULT);
                PS.statusColor(RED_GUY_TEXT);
                PS.glyph(PS.ALL, PS.ALL, "");
                //PS.debug(PS.gridPlane());
                draw();
                break;
                case 6 : 
                PS.statusText("Well, that was...");
                break;
                case 7 : 
                PS.statusText("...interesting.");
                break;
                case 8 : 
                PS.statusText("I wonder how BLUE's doing...");
                break;
            case 9:
                PS.statusText("");
                PS.gridPlane(FADE_PLANE);
                PS.fade(PS.ALL, PS.ALL, 120);
                PS.alpha(PS.ALL, PS.ALL, 0);
                PS.gridPlane(PS.DEFAULT);
                PS.gridColor(SHOOTER_BACKGROUND);
                break;
            case 11:
            PS.fade(PS.ALL, PS.ALL, 4);
            PS.audioPlay("baccano", { volume : 0.25, path : "audio/", fileTypes : ["mp3"] });
                s_ticks = 0;
                PS.timerStop(s_timer); //stop cutscene
                gameState = 2;
                s_timer = PS.timerStart(60, tick_s);
                break;
        }
    };

    var tick_cs03 = function () {
        ++s_ticks;
        switch (s_ticks) {
            case 1 :
            PS.statusText("I gotta find RED!");
            break;
            case 2 : //fade out
            PS.gridPlane(FADE_PLANE);
            PS.fade(PS.ALL, PS.ALL, 120);
            PS.alpha(PS.ALL, PS.ALL, 255);
            PS.gridPlane(PS.DEFAULT);
            PS.gridColor(PS.COLOR_BLACK);
            break;
            case 4 : //draw underneath
            PS.fade(PS.ALL, PS.ALL, 0);
            PS.imageBlit(IMG_STORE_COLOR, 0, 0);
            break;
            case 5 : //fade in
            PS.gridPlane(FADE_PLANE);
            PS.fade(PS.ALL, PS.ALL, 120);
            PS.alpha(PS.ALL, PS.ALL, 0);
            PS.gridPlane(PS.DEFAULT);
            break;  
            case 7 :
            PS.statusColor(RED_GUY_TEXT);
            PS.statusText("Hey BLUE, how wa--");
            break;
            case 8 :
            PS.statusColor(BLUE_GUY_TEXT);
            PS.statusText("They're right outside!");
            break;
            case 9 :
            PS.statusText("Get to cover!");
            break;
            case 10 :
            PS.statusText("");
            break;
        }
    };

    var imageLoader = function (data) {
        switch (imageNum) {
            case 0:
                IMG_STORE_BACK = data;
                imageNum++;
                PS.imageLoad("images/dude.png", imageLoader);
                break;
            case 1:
                IMG_DUDE = data;
                imageNum++;
                PS.imageLoad("images/map_data.bmp", imageLoader, 1);
                break;
            case 2:
                IMG_MAP_DATA = data;
                myImage = IMG_MAP_DATA;
                imageNum++;
                for(var i = 0; i<myImage.width; i++){
                    for(var j = 0; j<myImage.height; j++){
                        if(loadValue(i,j) === 0xFBF236){
                            player.x = i;
                            player.y = j;
                        }
                    }
                }
                cx = player.x-15;
                cy = player.y-15;
                if(cx<0){
                    cx = 0;
                }
                if(cx+31>myImage.width){
                    cx = myImage.width-31;
                }
                if(cy<0){
                    cy = 0;
                }
                if(cy+31>myImage.height){
                    cy = myImage.height-31;
                }
                PS.imageLoad("images/people.png", imageLoader);
                break;
            case 3:
                IMG_PEOPLE = data;
                imageNum++;
                PS.imageLoad("images/register.png", imageLoader);
                break;
            case 4:
                IMG_REGISTER = data;
                imageNum++;
                PS.imageLoad("images/store_map.png", imageLoader);
                break;
            case 5:
                IMG_STORE_COLOR = data;
                imageNum++;
                PS.imageLoad("images/store_data.bmp", imageLoader, 1);
                break;
            case 6:
                IMG_STORE_DATA = data;
                imageNum++;
                PS.imageLoad("images/map_color.bmp", imageLoader, 1);
                break;
            case 7:
                IMG_MAP_COLOR = data;
                imageNum++;
                break;
        }
    };

    var loadValue = function(x, y){
        if(x>myImage.width){
        }
        if(y>myImage.height){
        }
        return myImage.data[x+y*myImage.width];
    };

    var finalInit = function(){
        for(var i = 0; i<myImage.width; i++){
            for(var j = 0; j<myImage.height; j++){
                if(loadValue(i,j) === 0xFBF236){
                    player.x = i;
                    player.y = j;
                }
                if(loadValue(i,j) === 0xdf7126){
                    var spawner = {
                        x : i,
                        y : j,
                        CD : 30
                    }
                    spawners.push(spawner);
                }
            }
        }

    };


    // ------> STORE GAME FUNCTIONS <-------
    var touchBounds = function(testx, testy, x1, y1, x2, y2){
        if(testx>=x1 && testx<=x2 && testy>=y1 && testy <= y2){
            return true;
        }
        else {
            return false;
        }
    }

    var guessing = false;
    var getGuess = function(){
        guessing = true;
        if (Math.round(100*guessInt) === Math.round(100*(purchases[purchaseNum].payment - purchases[purchaseNum].price))) {
            PS.audioPlay("cash_reg", { volume : 0.25, path : "audio/", fileTypes : ["mp3"] });
            for(var i = 0; i<6; i++){
                PS.glyph(24+i,2, "");
            }
            guessing = false;
            PS.statusText("Have a nice day!");
            return true;
            //PS.dbEvent( "story_game", "correct guess", guessInt);
            //PS.debug("correct");
        }
        else if(guessInt >=  purchases[purchaseNum].payment - purchases[purchaseNum].price) {
            for(var i = 0; i<6; i++){
                PS.glyph(24+i,2, "");
            }
            PS.audioPlay("fx_bloink");
            guessInt = 0;
            //PS.dbEvent( "story_game", "false guess", guessInt);
        }
        else{
            return false;
        }
    };
    var ctrlStore = function () {
        PS.touch = function(x,y,data,options){
            if(guessing) {
                if (touchBounds(x, y, 8, 11, 11, 31)) {
                    guessInt += 5.0;
                }
                if (touchBounds(x, y, 14, 26, 17, 31)) {
                    guessInt += 1.0;
                }
                if (touchBounds(x, y, 20, 26, 21, 30)) {
                    guessInt += .25;
                }
                if (touchBounds(x, y, 23, 26, 24, 30)) {
                    guessInt += .10;
                }
                if (touchBounds(x, y, 26, 26, 27, 30)) {
                    guessInt += .05;
                }
                if (touchBounds(x, y, 29, 26, 30, 30)) {
                    guessInt += .01;
                }
                guessInt = +Number(guessInt).toPrecision(4);
                var guessDisplay = guessInt + "";
                PS.glyph(24, 2, "$");
                PS.glyph(25, 2, "0");
                PS.glyph(26, 2, "0");
                PS.glyph(27, 2, ".");
                PS.glyph(28, 2, "0");
                PS.glyph(29, 2, "0");
                var a = 0;

                if(guessInt>=10){
                    a = 25;
                }
                else if(guessInt>=1){
                    a = 26;
                }
                else if(guessInt>=.01){
                    a = 26;
                }
                else{
                    a = 29;
                }

                for(var i = 0; i<guessDisplay.length; i++) {
                    if(a+i==27){
                        i++;
                    }
                    PS.glyph(a+i, 2, guessDisplay.substring(i, i + 1))
                }

            }
        };
    };



    // -------> SHOOTER GAME FUNCTIONS <-------

    var ctrlShooter = function () {
        PS.touch = function(x,y,data,options){
            shoot();
        };

        PS.keyDown = function(key, shift, ctrl, options){
            if(key === 100 || key === 1007){
                keys[3] = true;
            }
            if(key === 119 || key === 1006){
                keys[0] = true;
            }
            if(key === 97 || key === 1005){
                keys[1] = true;
            }
            if(key === 115 || key === 1008){
                keys[2] = true;
            }
            if(key === 32){
                keys[4] = true;
            }
        };

        PS.keyUp = function( key, shift, ctrl, options ) {
            if(key === 100 || key === 1007){
                keys[3] = false;
            }
            if(key === 119 || key === 1006){
                keys[0] = false;
            }
            if(key === 97 || key === 1005){
                keys[1] = false;
            }
            if(key === 115 || key === 1008){
                keys[2] = false;
            }
            if(key === 32){
                keys[4] = false;
            }
        };

        PS.enter = function(x,y,data,option){
            "use strict";
            var angle = Math.atan2(y - (player.y-cy), x-(player.x-cx))*180/Math.PI + 202.5;

            if(angle > 360){
                angle -= 360;
            }
            player.gunX = 0;
            player.gunY = 0;


            if(angle>0 && angle<=45){
                player.gunX = -1;
            }
            else if(angle>45 && angle<=90){
                player.gunX = -1;
                player.gunY = -1;
            }
            else if(angle>90 && angle<=135){
                player.gunY = -1;
            }
            else if(angle>135 && angle<=180){
                player.gunX = 1;
                player.gunY = -1;
            }
            else if(angle>180 && angle<=225){
                player.gunX = 1;
            }
            else if(angle>225 && angle<=270){
                player.gunX = 1;
                player.gunY = 1;
            }
            else if(angle>270 && angle<315){
                player.gunY = 1;
            }
            else if(angle>315){
                player.gunX = -1;
                player.gunY = 1;
            }
        };
    };

    var draw = function(){
        //drawMap
        myImage = IMG_MAP_COLOR;
        for(var i = cx; i<cx+31; i++) {
            for (var j = cy; j < cy+31; j++) {
                PS.color(i-cx,j-cy,loadValue(i,j));
            }
        }
        myImage = IMG_MAP_DATA;

        //drawPlayer
        PS.color(player.x-cx, player.y-cy, PS.COLOR_GREEN);

        //drawPlayerWep
        var checkX = player.x-cx+player.gunX;
        var checkY = player.y-cy+player.gunY;
        if(checkX<31 && checkY<31 && checkX>=0 && checkY >=0) {
            PS.color(checkX, checkY, PS.COLOR_GRAY);
        }

        //drawBullets
        for(var i = 0; i<bullets.length; i++){
            if(bullets[i][0]>=cx && bullets[i][0]<cx+31 && bullets[i][1]>=cy && bullets[i][1]<cy+31){
                PS.color(bullets[i][0]-cx, bullets[i][1]-cy, PS.COLOR_RED);
            }
        }

        //drawEnemies
        for(var i = 0; i<enemies.length; i++){
            checkX = enemies[i].x-cx+enemies[i].gunX;
            checkY = enemies[i].y-cy+enemies[i].gunY;
            if(enemies[i].x>=cx && enemies[i].x<cx+31 && enemies[i].y>=cy && enemies[i].y<cy+31){
                PS.color(enemies[i].x-cx,enemies[i].y-cy,PS.COLOR_ORANGE);
            }
            if(checkX<31 && checkY<31 && checkX>=0 && checkY >=0){
                PS.color(checkX, checkY, PS.COLOR_GRAY);
            }
        }

        //Draw enemBullets
        for(var i = 0; i<enemBullets.length; i++){
            if(enemBullets[i].x>=cx && enemBullets[i].x<cx+31 && enemBullets[i].y>=cy && enemBullets[i].y<cy+31){
                PS.color(enemBullets[i].x-cx, enemBullets[i].y-cy, PS.COLOR_RED);
            }
        }

        //drawStats
        PS.color(0,0,PS.COLOR_GRAY);
        PS.color(1,0,PS.COLOR_GRAY);
        PS.color(2,0,PS.COLOR_GRAY);
        PS.color(3,0,PS.COLOR_GRAY);
        PS.color(4,0,PS.COLOR_GRAY);
        var money = (points*50)+"";
        if(money>10000){
            money = 9999;
        }
        PS.glyph(0,0,"$");
        PS.glyph(1,0,money.substring(0,1));
        if(money>=10) {
            PS.glyph(2, 0, money.substring(1, 2));
        }
        if(money>=100) {
            PS.glyph(3,0, money.substring(2,3));
        }
        if(money>=1000){
            PS.glyph(4,0, money.substring(3,4));
        }

        var time = (200 - Math.floor(numTicks/60))+"";
        PS.color(28,0,PS.COLOR_GRAY);
        PS.color(29,0,PS.COLOR_GRAY);
        PS.color(30,0,PS.COLOR_GRAY);
        if(time>=100){
            PS.glyph(28,0,time.substring(0,1));
            PS.glyph(29,0,time.substring(1,2));
            PS.glyph(30,0,time.substring(2,3));
        }
        else if(time>=10){
            PS.glyph(28,0,"");
            PS.glyph(29,0,time.substring(0,1));
            PS.glyph(30,0,time.substring(1,2));
        }
        else{
            PS.glyph(28,0,"");
            PS.glyph(29,0,"");
            PS.glyph(30, 0, time);
        }
    };

    var game = function(){
        numTicks++;
        cx = player.x-15;
        cy = player.y-15;
        if(cx<0){
            cx = 0;
        }
        if(cx+31>myImage.width){
            cx = myImage.width-31;
        }
        if(cy<0){
            cy = 0;
        }
        if(cy+31>myImage.height){
            cy = myImage.height-31;
        }
        draw();
        move();
        bulletHit();

        if(points>=30){
            PS.statusText("YOU WIN! Points: " + points);
            if(!win) {
                //PS.dbEvent("story_game", "Win", points);
                PS.audioPlay("fx_tada");
                win = true;
            }
        }
        if(numTicks>12000){
            PS.audioPlay("fx_whistle");
            s_timer = PS.timerStart(60, tick_cs03);
            PS.timerStop(timerID);
        }
    };

    var move = function(){
        //playerMovement
        var moveCDset = 6;
        if((moveCD <= 4 && keys[4]) || moveCD<=0) {
            if (keys[0] && blockers.indexOf(loadValue(player.x, player.y - 1)) == -1 && player.y - 1 >= 0) {
                player.y--;
                moveCD = moveCDset;
            }
            if (keys[1] && blockers.indexOf(loadValue(player.x - 1, player.y)) == -1 && player.x - 1 >= 0) {
                player.x--;
                moveCD = moveCDset;
            }
            if (keys[2] && blockers.indexOf(loadValue(player.x, player.y + 1)) == -1 && player.y + 1 < myImage.height) {
                player.y++;
                moveCD = moveCDset;
            }
            if (keys[3] && blockers.indexOf(loadValue(player.x + 1, player.y)) == -1 && player.x + 1 < myImage.width) {
                player.x++;
                moveCD = moveCDset;
            }
        }
        moveCD--;

        for(var i = 0; i<bullets.length; i++){
            if(bullets[i][5] <= 0){
                bullets[i][0] += bullets[i][2];
                bullets[i][1] += bullets[i][3];
                bullets[i][5] = bullets[i][4];
            }
            else{
                bullets[i][5]--;
            }

            if(loadValue(bullets[i][0], bullets[i][1]) === 0x000000){
                bullets.splice(i,1);
                i--;
            }
        }
        for(var i = 0; i<bullets.length; i++){
            if(bullets[i][0] < 0 || bullets[i][0] > myImage.width || bullets[i][1] < 0 || bullets > myImage.height){
                bullets.splice(i, 1);
                i--;
            }
        }
        if(enemySpawnCD<=0){
            spawn();
            enemySpawnCD = 1000;
        }
        else{
            enemySpawnCD--;
        }

        //Enemy movement
        for(var i = 0; i<enemies.length; i++){
            if(enemies[i].shootCD>100){
                var enemBullet = {
                    x : enemies[i].x + enemies[i].gunX,
                    y : enemies[i].y + enemies[i].gunY,
                    gunX : enemies[i].gunX,
                    gunY : enemies[i].gunY,
                    speed : 2,
                    cd : 0
                };
                enemies[i].shootCD = 0;
                enemBullets.push(enemBullet);
            }
            else{
                enemies[i].shootCD++;
            }
            var angle = Math.atan2(enemies[i].y - (player.y), enemies[i].x-(player.x))*180/Math.PI + 225;
            if(angle>360){
                angle-=360;
            }
            enemies[i].gunX=0;
            enemies[i].gunY=0;
            if(angle>0 && angle<=45){
                enemies[i].gunX = 1;
            }
            else if(angle>45 && angle<=90){
                enemies[i].gunX = 1;
                enemies[i].gunY = 1;
            }
            else if(angle>90 && angle<=135){
                enemies[i].gunY = 1;
            }
            else if(angle>135 && angle<=180){
                enemies[i].gunX = -1;
                enemies[i].gunY = 1;
            }
            else if(angle>180 && angle<=225){
                enemies[i].gunX = -1;
            }
            else if(angle>225 && angle<=270){
                enemies[i].gunX = -1;
                enemies[i].gunY = -1;
            }
            else if(angle>270 && angle<315){
                enemies[i].gunY = -1;
            }
            else if(angle>315){
                enemies[i].gunX = 1;
                enemies[i].gunY = -1;
            }

        }
        //Enemy Bullet Movement
        for(var i = 0; i<enemBullets.length; i++) {
            if (enemBullets[i].cd <= 0) {
                enemBullets[i].x += enemBullets[i].gunX;
                enemBullets[i].y += enemBullets[i].gunY;
                enemBullets[i].cd = enemBullets[i].speed;
            }
            else {
                enemBullets[i].cd--;
            }

            if(loadValue(enemBullets[i].x, enemBullets[i].y) ===0x000000){
                enemBullets.splice(i,1);
                i--;
            }
        }
    };

    var spawn = function(){
        if(gameState = 2) {
            for (var i = 0; i < 10; i++) {
                var x = PS.random(myImage.width - 1);
                var y = PS.random(myImage.height - 1);
                while (blockers.indexOf(loadValue(x, y)) != -1) {
                    x = PS.random(myImage.width - 1);
                    y = PS.random(myImage.height - 1);
                }
                var angle = Math.atan2(y - (player.y), x - (player.x)) * 180 / Math.PI + 202.5;
                var gunX = 0;
                var gunY = 0;
                if (angle > 0 && angle <= 45) {
                    gunX = -1;
                } else if (angle > 45 && angle <= 90) {
                    gunX = 1;
                    gunY = 1;
                } else if (angle > 90 && angle <= 135) {
                    gunY = 1;
                } else if (angle > 135 && angle <= 180) {
                    gunX = -1;
                    gunY = 1;
                } else if (angle > 180 && angle <= 225) {
                    gunX = -1;
                } else if (angle > 225 && angle <= 270) {
                    gunX = -1;
                    gunY = -1;
                } else if (angle > 270 && angle < 315) {
                    gunY = -1;
                } else if (angle > 315) {
                    gunX = 1;
                    gunY = -1;
                }

                var enemy = {
                    x: x,
                    y: y,
                    gunX: gunX,
                    gunY: gunY,
                    shootCD: 0
                };

                enemies.push(enemy);
            }
        }
        else if(gameState = 3){
            var x = PS.random(myImage.width - 1);
            var y = PS.random(myImage.height - 1);
            while (blockers.indexOf(loadValue(x, y)) != -1) {
                x = PS.random(myImage.width - 1);
                y = PS.random(myImage.height - 1);
            }
            var angle = Math.atan2(y - (player.y), x - (player.x)) * 180 / Math.PI + 202.5;
            var gunX = 0;
            var gunY = 0;
            if (angle > 0 && angle <= 45) {
                gunX = -1;
            } else if (angle > 45 && angle <= 90) {
                gunX = 1;
                gunY = 1;
            } else if (angle > 90 && angle <= 135) {
                gunY = 1;
            } else if (angle > 135 && angle <= 180) {
                gunX = -1;
                gunY = 1;
            } else if (angle > 180 && angle <= 225) {
                gunX = -1;
            } else if (angle > 225 && angle <= 270) {
                gunX = -1;
                gunY = -1;
            } else if (angle > 270 && angle < 315) {
                gunY = -1;
            } else if (angle > 315) {
                gunX = 1;
                gunY = -1;
            }

            var enemy = {
                x: x,
                y: y,
                gunX: gunX,
                gunY: gunY,
                shootCD: 0
            };

            enemies.push(enemy);
        }
    };

    var bulletHit = function() {
        for(var i =0; i<bullets.length; i++){
            for(var j = 0;j<enemies.length; j++){
                if(bullets[i][0] === enemies[j].x && bullets[i][1] === enemies[j].y){
                    bullets.splice(i,1);
                    i--;
                    enemies.splice(j,1);
                    j--;
                    points++;
                    if(points == 1){
                        //PS.dbEvent("story_game", "First", points);
                    }
                    PS.statusText("Points: "+points);
                }
            }
        }

        for(var i = 0; i<enemBullets.length; i++){
            if(enemBullets[i].x===player.x && enemBullets[i].y === player.y){
                enemBullets.splice(i, 1);
                i--;
                points -= 1;
                if(points<0){
                    points = 0;
                }
                PS.statusText("Points: "+points);
            }
            if(enemBullets[i].x < 0 || enemBullets[i].y < 0 || enemBullets[i].x >= myImage.width || enemBullets[i].y >= myImage.height){
                enemBullets.splice(i,1);
                i--;
            }
        }

    };

    var shoot = function(){
        if(player.gunY != 0 || player.gunX !=0){
            bullets.push([player.x + player.gunX, player.y + player.gunY, player.gunX, player.gunY, 1, 0]);
        }
    };

    // Public functions are exposed in the global G object, which is defined here
    // and returned as the value of the IIFE.

    return {
        // Initialize the game
        // Called once at startup

        init: function () {

            //load images
            PS.imageLoad("images/store_back_v2.png", imageLoader);

            //load purchases
            var i;
            for (i = 0; i < MAX_PURCHASES; i++) {
                var name = NAMES[i];
                var price = PRICES[i];
                var payment = PAYMENT[i];
                var purchase = {
                    name: "null",
                    price: 0,
                    payment: 0
                };
                purchase.name = name;
                purchase.price = price;
                purchase.payment = payment;
                purchases[i] = purchase;
            }

            //grid init
            PS.gridSize(31, 31);
            PS.border(PS.ALL, PS.ALL, 0);
            PS.gridColor(PS.COLOR_BLACK);
            PS.gridFade(120);
            PS.statusColor(PS.COLOR_WHITE);

            //fade plane to black initially
            PS.gridPlane(FADE_PLANE);
            PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
            PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_OPAQUE);
            PS.gridPlane(PS.DEFAULT);

            //telemetry initialization and start timer after user has entered name
            var callback = function(id, name) {
                PLAYER = name;
                PS.statusText("");

                //ticks every second
                s_timer = PS.timerStart(60, tick_s);
                //PS.dbEvent("story_game", "player", PLAYER);
            };

            if (TELEMETRY) {
                PS.dbInit("story_game", { login : callback, prompt : "Username: " } );
            }
            else {
                PS.statusText("");
                s_timer = PS.timerStart(60, tick_s);
            }

            ctrlStore();
        },

        /*shutdown : function () {
            PS.dbEvent("story_game", "shutdown", true);
            PS.dbEvent("story_game", "Points", points);
            PS.dbSend("story_game","tcurtis");
            PS.dbSend("story_game", "tmtawadros", {discard : true});
        } */
    };
}()); // end of IIFE

PS.init = G.init;