
(function(win) {
	var global = {};
	// Mapping for the remote control
	var keyCodeDic= {};
	// Layer for listing the dramas
	var layer1 = {};
	// Layer for showing info about a drama
	var layer2 = {};
	// Layer for the video
	var layer3 = {};
	// Current active layer
	var currentLayer = layer1;
	// Data for each drama
	var globalData = [];
	/////////////////////////////////////////////
	//   Drama Time                            //
	/////////////////////////////////////////////
	//                        //               //
	//      LAYER 1           //   LAYER 2     //
	//                        //               //
	/////////////////////////////////////////////

	keyCodeDic[38] = "arrowup";
	keyCodeDic[40] = "arrowdown";
	keyCodeDic[37] = "arrowleft";
	keyCodeDic[39] = "arrowright";
	keyCodeDic[13] = "ok";
	keyCodeDic[8] = "return";
	
	global.win = win;
	global.doc = win.document;


	/////////////////////////
	//                     //
	//       LAYER 1       //
	//                     //
	/////////////////////////

	// Max elements in a row
	layer1.rowMaxElem = 1;
	// Current element selected
	layer1.currentSelected = 0;
	// Last element in the table
	layer1.lastElement = 0;
	// Current page loaded
	layer1.currentPageLoaded=1;
	// Create the table and load all the titles
	layer1.load = function () 
	{
		layer1.rowMaxElem = (($("#dramasList").width()-20)/138)>>0;
		layer1.getPage(layer1.currentPageLoaded);
		console.log("aqui");
	};
	layer1.getPage = function (n) 
	{
		$.ajax(
		{
			type: "POST",
			data: {"page":n},
	  		url: "layer1.php",
	  		success: function (result) 
	  		{
	  			try {
						result=JSON.parse(result);
					}
					catch(err) 
					{
	  					result={videos:[]};
					}
				var videos=result["videos"];
				
				for (var i = 0; i < videos.length; i++)
				{
					globalData.push(videos[i]);
					var id=globalData.length-1;
					layer1.lastElement=id;
					layer1.appendDrama(id);
				}
				// if (layer1.currentPageLoaded==1)
				// 	layer1.select();

				if (layer1.currentPageLoaded!=0)
				{
					layer1.currentPageLoaded=layer1.currentPageLoaded+1;
					layer1.getPage(layer1.currentPageLoaded);
				}
	      	}
		});
	}
	// Append a drama to the table
	layer1.appendDrama = function (id) 
	{
		var dramasList = $('#dramasList');
		var newelem = $(document.createElement('div')).addClass("cell");
		var a = $(document.createElement('a')).text(globalData[id]["ShortTitle"]);
		var img = $(document.createElement("img")).attr('src', globalData[id]["Image"]);
		newelem.append(img);
		newelem.append(a);
		if (dramasList.children().last().find("div").size()==layer1.rowMaxElem)
		{
			dramasList.append($("<div class='row'></div>"));
		}
		dramasList.children().last().append(newelem);
		newelem.attr("id", "drama"+id);
	}
	// Select a cell
	layer1.select = function () 
	{
		var id=layer1.currentIdString();
		$(id).addClass("selected");
		layer1.updatePlot();
		layer1.scroll();
	}
	// Auto scroll
	layer1.scroll = function () 
	{
		var h1=$('#dramasList').height();
		var rowSize=$('#dramasList').find(".row").first().height();
		var row=((layer1.currentSelected/layer1.rowMaxElem)>>0);
		if (row*rowSize>h1/2)
			$('#dramasList').animate({ scrollTop: row*rowSize}, 0);
		else
			$('#dramasList').animate({ scrollTop: 0}, 0);
	}
	// Get the current celected as a string
	layer1.currentIdString = function () 
	{
		return "#drama"+layer1.currentSelected;
	}
	// Remove the section from a cell
	layer1.removeSelection = function () 
	{
		var id=layer1.currentIdString();
		$(id).removeClass("selected");
	}
	// keyboard left
	layer1.kbleft = function () 
	{
		layer1.removeSelection();
		if (layer1.currentSelected>0)
			layer1.currentSelected=layer1.currentSelected-1;
		else
			layer1.currentSelected=layer1.lastElement;
		layer1.select();
	}
	// keyboard right
	layer1.kbright = function () 
	{
		layer1.removeSelection();
		if (layer1.currentSelected==layer1.lastElement)
			layer1.currentSelected=0;
		else
			layer1.currentSelected=layer1.currentSelected+1;
		layer1.select();
	}
	// keyboard up
	layer1.kbup = function () 
	{
		layer1.removeSelection();
		if ((layer1.currentSelected-layer1.rowMaxElem)>=0)
			layer1.currentSelected=layer1.currentSelected-layer1.rowMaxElem;
		layer1.select();
	}
	// keyboard down
	layer1.kbdown = function () 
	{
		layer1.removeSelection();
		if ((layer1.currentSelected+layer1.rowMaxElem)<=layer1.lastElement)
			layer1.currentSelected=layer1.currentSelected+layer1.rowMaxElem;
		layer1.select();
	}
	// keyboard ok
	layer1.kbok = function () 
	{
		layer1.removeSelection();
		currentLayer=layer2;
		layer2.load();
	}
	// keyboard return
	layer1.kbreturn = function () 
	{
		currentLayer=layer1;
		location.reload(true); 
	}
	layer1.updatePlot = function () 
	{
		console.log(globalData[id]);
		var id=layer1.currentSelected;
		var html="<div class='plotTitle'>"+globalData[id]["Title"]+"</div>";
		html=html+globalData[id]["Plot"];
		$("#plot").html(html);
	}

	/////////////////////////
	//                     //
	//       LAYER 2       //
	//                     //
	/////////////////////////

	// Current element selected
	layer2.currentSelected = 0;
	// Last element in the list
	layer2.lastElement = 0;
	// Link for the episode
	layer2.epLink="";
	// Bottom position
	layer2.bpos=0;
	// Text size
	layer2.tsize=0;
	layer2.of=0;
	// Create the list and load all the episodes
	layer2.load = function () 
	{
		var id=layer1.currentSelected;
		var data=globalData[id]["Link"];
		$.ajax(
		{
			type: "POST",
			data: {"link":data},
	  		url: "layer2.php",
	  		success: function (result) 
	  		{
	  			globalData[id]["episodes"]=[];
				result=JSON.parse(result);
				var episodes=result["episodes"];
				$('#episodeList').text("");
				for (var i = 0; i < episodes.length; i++)
				{
					layer2.lastElement=i;
					globalData[id]["episodes"].push(episodes[i]);
					layer2.appendEpisode(episodes[i]);
				}
				layer2.select();
	      	}
		});
      	layer2.bpos=$('#sideInfo').offset().top+$('#sideInfo').height();
      	layer2.tsize=$('#episodeList').first().height();
	};
	// Select an episode
	layer2.select = function () 
	{
		var id=layer2.currentIdString();

		var h1=$('#episodeList').height();
		var rowSize=50;
		var row=layer2.currentSelected;
		
		if (row*rowSize>h1/2)
		{
			$('#episodeList').scrollTop(300);
			console.log($('#episodeList'));
		}
		else
			$('#episodeList').animate({ scrollTop: 0}, 10);


		$(id).addClass("selected");
	}
	// Get the current celected as a string
	layer2.currentIdString = function () 
	{
		return "#episode"+layer2.currentSelected;
	}
	// Remove the section from an episode
	layer2.removeSelection = function () 
	{
		var id=layer2.currentIdString();
		$(id).removeClass("selected");
	}
	// Append an episode to the list
	layer2.appendEpisode = function (episode) 
	{
		var episodeList = $('#episodeList');
		var newelem = $(document.createElement('div'))
		.text(episode["title"])
		.attr("id","episode"+layer2.lastElement);
		episodeList.append(newelem);
	}
	// keyboard left
	layer2.kbleft = function () 
	{
	}
	// keyboard right
	layer2.kbright = function () 
	{
	}
	// keyboard up
	layer2.kbup = function () 
	{
		layer2.removeSelection();
		if (layer2.currentSelected!=0)
			layer2.currentSelected=layer2.currentSelected-1;
		else
			layer2.currentSelected=layer2.lastElement;
		layer2.select();
	}
	// keyboard down
	layer2.kbdown = function () 
	{
		layer2.removeSelection();
		if (layer2.currentSelected!=layer2.lastElement)
			layer2.currentSelected=layer2.currentSelected+1;
		else
			layer2.currentSelected=0;
		layer2.select();
	}
	// keyboard ok
	layer2.kbok = function () 
	{
		layer2.epLink=globalData[layer1.currentSelected]["episodes"][layer2.currentSelected]["link"];
		// layer2.removeSelection();
		currentLayer=layer3;
		layer3.load();
	}
	// keyboard return
	layer2.kbreturn = function () 
	{
		currentLayer=layer1;
		layer2.currentSelected=1;
		layer2.removeSelection();
		$("#episodeList").text("");
		layer1.select();
	}

	/////////////////////////
	//                     //
	//       LAYER 3       //
	//                     //
	/////////////////////////

	layer3.videoStateSreen = 0;
	layer3.videoStatePlay = 0;
	layer3.playRate = 1;
	// Load the video screen
	layer3.load = function () 
	{
		var id=layer1.currentSelected;
		var data=layer2.epLink;
		$.ajax(
		{
			type: "POST",
			data: {"link":data},
	  		url: "layer3.php",
	  		success: function (result) 
	  		{
				result=JSON.parse(result);
				console.log(result);
				$("#videoEpisode").show();
				$("#dramasList").hide();
				layer3.myPlayer = videojs('videoEpisode');
				layer3.myPlayer.src([{ type: "video/mp4", src:  result["video"][1]["link"]}])
				layer3.myPlayer.autoplay(true);
				layer3.myPlayer.controls(true);
				layer3.myPlayer.on('ended',layer3.reproduceNext);
	      	}
		});
		$("#videoEpisode").css("visibility", "visible");
		$("#videoEpisode").height($( document ).height()-90);
		$("#videoEpisode").width($( document ).width()-410);
		layer3.playRate=1;
	};
	// Reproduce the next episode
	layer3.reproduceNext = function () 
	{
		console.log("teste testoso");
		var c=layer2.currentSelected;
		layer2.kbdown();
		if (c!=layer2.currentSelected)
			layer3.load();
	}
	// keyboard ok
	layer3.kbok = function () 
	{
		if (layer3.playRate!=1)
		{
			layer3.playRate=1;
			layer3.myPlayer.playbackRate( layer3.playRate );
			return;
		}
		if (layer3.videoStatePlay==0)
		{
			layer3.myPlayer.play();
		}
		else if (layer3.videoStatePlay==1)
		{
			layer3.myPlayer.pause();
		}
		layer3.videoStatePlay=!layer3.videoStatePlay;
	}
	// keyboard return
	layer3.kbreturn = function () 
	{
		layer3.videoState=0;
		layer3.myPlayer.pause();
		layer3.normalScreen();
		$("#dramasList").show();
		$("#videoEpisode").css("visibility", "hidden");
		currentLayer=layer2;
		layer2.select();
	}
	// keyboard left
	layer3.kbleft = function () 
	{
		layer3.playRate = layer3.playRate/2;
		layer3.myPlayer.playbackRate(layer3.playRate);
	}
	// keyboard right
	layer3.kbright = function () 
	{
		layer3.playRate = layer3.playRate*2;
		layer3.myPlayer.playbackRate(layer3.playRate);
		// layer3.myPlayer.currentTime(layer3.myPlayer.currentTime()+60);
	}
	// keyboard up
	layer3.kbup = function () 
	{
		if (layer3.videoStateSreen==0)
		{
			layer3.fullScreen();
		}
		else
		{
			layer3.normalScreen();
		}
		layer3.videoStateSreen=!layer3.videoStateSreen;
	}
	// keyboard down
	layer3.kbdown = function () 
	{
		layer3.myPlayer.currentTime(layer3.myPlayer.currentTime()-10);
	}
	// Full screen mode
	layer3.fullScreen = function () 
	{
		$("#videoEpisode").find("video").height("100%").width("100%");
		layer3.myPlayer.requestFullscreen();
	}
	// Normal screen mode
	layer3.normalScreen = function () 
	{
		layer3.myPlayer.exitFullscreen();
	}
	_target = function(e) 
	{
		!e && (e = window.event);
		
		var target = (e.target || e.srcElement) || {};
		
		target.keyCode = e.which;
		
		return target;
	};
	window.document.onkeydown = function (e, eventType) 
	{
		var target = _target(e);
		var keyCode = target.keyCode;
		var key = keyCodeDic[keyCode];
		if (key=="ok")
		{
			currentLayer.kbok();
		}
		if (key=="return")
		{
			e.preventDefault();
			currentLayer.kbreturn();
		}
		else if (key=="arrowup")
		{

			currentLayer.kbup();
		}	
		else if (key=="arrowdown")
		{
			currentLayer.kbdown();
		}
		else if (key=="arrowleft")
		{
			currentLayer.kbleft();
		}
		else if (key=="arrowright")
		{
			currentLayer.kbright();
		}
		else
		{

		}
	}
	win.onload = function() 
	{
		var win = window,
			doc = win.document,
			global = win.global;
		$("#dramasList").height($( document ).height()-100);
		$("#video").height($( document ).height()-90);
		$("#video").width($( document ).width()-410);
		$("#video").css("visibility", "hidden");
		$("iframe").remove();
		$("body").find("div").each(function(index)
		{
			try {
				if ($(this).attr("id").indexOf("beacon")!=-1)
					$(this).remove();
				}
				catch(err) 
				{}

		});
		$("body").find("script").remove();
		$("body").find("noscript").remove();
		layer1.load();
	}
	
	win.global = global;
})(window);