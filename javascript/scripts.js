var currentSong = {
	title: null,
	length: null,
	url: null,
	tags: null
};

Events = {};

Events.enableFocusCall = function() {
	if (location.search !== "?foo") {
		location.search = "?foo";
		throw new Error;
	}
};

Events.selectedInAutoComplete = -1;

Events.upInAutoComplete = function(){
	if (Events.selectedInAutoComplete > 0)
		Events.selectedInAutoComplete--;
	$.map($("#autoComplete li"),function(a,i){
		a = $(a);
		if (i == Events.selectedInAutoComplete)
			$("#autoComplete li").eq(i).css('background-color','#F5F5F5');
		else 
			$("#autoComplete li").eq(i).css('background-color','white');
	});
	return false;
};

Events.downInAutoComplete = function(){
	var qteTerms = $("#autoComplete li").length;
	if (Events.selectedInAutoComplete < qteTerms-1)
		Events.selectedInAutoComplete++;
	
	$.map($("#autoComplete li"),function(a,i){
		a = $(a);
		if (i == Events.selectedInAutoComplete)
			$("#autoComplete li").eq(i).css('background-color','#F5F5F5');
		else 
			$("#autoComplete li").eq(i).css('background-color','white');
	});
	return false;
	
};

Events.submitFormOnEnterAndAutoSearchArrows = function() {
	window.addEventListener("keydown", function(event) {
		switch (event.keyCode){
		case(13): 
			if (Events.selectedInAutoComplete != -1){
				var searchTerm = $('#autoComplete li').eq(Events.selectedInAutoComplete).html();
				$('#searchField').val(searchTerm);
				Events.submitForm();
			}
			return Events.submitForm();
		case(38): return Events.upInAutoComplete();
		case(40): return Events.downInAutoComplete();
		}
	}, false);
};



Events.submitForm = function() {	
	var q = $('#searchField').val();
	
	$("#autoComplete").hide();
	$("#musics").html("");
	$("#loading").show();
	
	$.get('http://mp3skull.com/search.php?q=' + escape(q), function(data) {
		$("#autoComplete").hide();
		$("#loading").hide();
		var page = data.responseText;
		//console.log(page);

		var musics = $.map($("div[class*=show]", page), function(musica) {
			var item = {};
			item.name = $(musica).find('strong').text();			
			item.fileUrl = $(musica).find("a").attr("href");

			var moreInfo = $(musica).find('.left').html().replace(/<.*>/,
					'').replace(/<br>/g, '|').trim().split("|");

			$.map(moreInfo, function(valor) {
				if (valor.indexOf("kbps") != -1) {
					item.bitTrate = valor;
				}
				if (valor.indexOf("mb") != -1) {
					item.size = valor;
				}
				if (valor.indexOf(":") != -1) {
					item.length = valor;
				}
			});
			return item;
		});			
			
		$('#musicTable').html( '<table id="search_table"></table>' );
		
		var oTable = $('#search_table').dataTable( {
			//"sScrollY": "200px",
			"bPaginate": true,
			"bInfo": false,
			"bFilter": true,
			"bAutoWidth": false,
			"aoColumns": [
				{ "sTitle": "Name", "sWidth": "80%" },
				{ "sTitle": "Length", "sWidth": "20%"  },
				{ "bVisible": false}
			]
		});
		
		$("#search_table").on("click", "tr", function() {
			var data = oTable.fnGetData(this);
			currentSong.title = data[0];
			currentSong.length = data[1];
			currentSong.url = data[2];
			//console.log(data[2]);
			playMusic(currentSong.title, currentSong.url);
		});		
		
		renderResults(musics);

		$("#musics li").click(function() {
			window.open($(this).find('.fileUrl').val());
		});
	});
	
	return false;
};

Events.tagForm = function() {
	var tag = $('#tagField').val();	
	var list = $.map(tag.split(","), $.trim);
	// console.log(list);
	// console.log(currentSong.title);
	// console.log(currentSong.url);    
	// console.log(currentSong.length);
	
	$.post( "tag", { 
	  action: "add", 
	  song_name: currentSong.title,
	  song_url: currentSong.url,
	  song_length: currentSong.length,
	  song_tag: list
	  }).done(function( data ) {
		  setTimeout(getTagList,1000);
		  $('#tagField').val('');
      });
};

Events.toLisnForm = function() {
	var toLisn = $('#toLisnField').val();	
	$.post( "tolisn", { action: "add", content: toLisn })
      .done(function( data ) {
        //console.log( "Data Loaded: " + data );
		$('#tolisn_table').dataTable().fnAddData( [
		  toLisn ] );
		$('#toLisnField').val('');
      });	 
};

Events.typingInSearchField = function(event) {
	if (event.keyCode > 47 && event.keyCode < 91 || event.keyCode == 8){
		Events.selectedInAutoComplete = -1;
		
		//"http://clients1.google.com/complete/search?client=youtube-reduced&q="+$('#searchField').val()+"&gs_nf=1&ds=yt&cp=5&gs_id=12&callback=Events.autoCompleteResults",
		$.get("http://ac1.mp3skull.com/autocomplete/get.php?q="+
				$('#searchField').val().replace("%20",""), function(x){
			x = x.responseText.match(/new Array.*?\)/)
			x = "Events.autoCompleteResults(" + x + ")";
			eval(x);
		});
	}
	return false;
};

Events.autoCompleteResults = function(results){
	var values = $.map(results,function(item){
		return "<li>" + item + "</li>";
	}).join('');
	
	$("#autoComplete ").html(values);
	$("#autoComplete").show();
	$("#autoComplete li").click(Events.selectItemInAutoComplete);
};

Events.selectItemInAutoComplete = function(item){
	var searchTerm = item.toElement.innerHTML;
	$('#searchField').val(searchTerm);
	Events.submitForm();
};

function renderResults(musics){
	if(musics.length == 0) {
	  $("#musics").html("<b class=\"notFound\">No results found for "+$('#searchField').val()+"</b>");
	  return;
	}
	
	$.map(musics,function(music,index){
		var shared4 = "";
		music.name = music.name.replace("mp3","").replace(/([A-z]+\.)+[A-z]+/,"").replace(/\s*-\s*$/,"").replace(/\(.*\)/,"");
		
		if (music.fileUrl.indexOf("4shared") != -1)
			shared4 = ' class="shared4"';		
				
		$('#search_table').dataTable().fnAddData( [
			music.name.trim(),	
			music.length != null ? music.length.trim() : '' ,
			music.fileUrl.trim() ]
		);
	});		
};
	
function playMusic(title, url) {

	$("#jquery_jplayer_1").jPlayer("destroy");
	
	$("#jquery_jplayer_1").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				mp3: url
			});
			$(this).jPlayer("play", 0);
		},
		swfPath: "/",
		supplied: "mp3, m4a, oga",
		wmode: "window",
		smoothPlayBar: true,
		keyEnabled: true
	});
	
	$('.jp-title li').text(title);

}

function initLisnTable() {
	$('#toLisnTable').html( '<table id="tolisn_table"></table>' );		
	var oTable = $('#tolisn_table').dataTable( {
		"sScrollY": "200px",
		"bPaginate": false,
		"bInfo": false,
		"bFilter": false,
		"aoColumns": [
			null
		]
	});
	
	$.post( "tolisn", { action: "list" })
	  .done(function( data ) {
	    var list = data.split('\n');
		for (var i=0; i < list.length-1; i++) {
			//console.log('list data '+list[i]);
			oTable.fnAddData([ list[i] ]);
		}
	  });
	
	$("#tolisn_table").on("click", "tr", function() {		
        if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
        }
        else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
        }
    });
     
    /* Add a click handler for the delete row */
    $('#deleteToLisn').click( function() {		
        var anSelected = oTable.$('tr.row_selected');
        if ( anSelected.length !== 0 ) {
			var del_data = oTable.fnGetData( anSelected[0] );
			//console.log("del data "+del_data[0]);
			$.post( "tolisn", { action: "delete", content: del_data[0] })
			  .done(function( data ) {
			    oTable.fnDeleteRow( anSelected[0] );
			  });            
        }
    });		
}

function getTagList() {
	$.post( "tag", { 
	  action: "list", 
	  tag: "all"
	  }).done(function( data ) {
          //console.log( "tag list: " + data );
		  $(".tags").remove();
		  $("#tagList").append("<a class='tags' href='#'>all</a>");
		  var tags = data.split(':');
		  for(var i=0;i<tags.length;i++) {
			$("#tagList").append("<a class='tags' href='#' style='padding-left:1em'>"+tags[i]+"</a>");
		  }
		  $('.tags').click( function() {
		    var tag = $(this).text();
			if(tag == "all")
			  getAllSongs();
			else
			  getSongs(tag);
		  });
      });	
}

function getAllSongs() {
	$.post( "songs", { 
	  action: "list", 
	  tag: "all"
	  }).done(function( data ) {
	      if(data)
		    initSongTable();
		  var songs = data.split('\r');
		  for(var i = 0; i<songs.length-1; i++) {
		    var info = songs[i].split('\n');
		    $('#song_table').dataTable().fnAddData( [
			  info[0],	
			  info[2],
			  info[3].replace(/\:/g,','),
			  info[1] ]
		    );
		  }
	});
}

function getSongs(tag) {
	$.post( "songs", { 
	  action: "list", 
	  tag: tag
	  }).done(function( data ) {
	      if(data) 
		    initSongTable();
          var songs = data.split('\r');
		  for(var i = 0; i<songs.length-1; i++) {
		    var info = songs[i].split('\n');
		    $('#song_table').dataTable().fnAddData( [
			  info[0],	
			  info[2],
			  info[3].replace(/\:/g,','),
			  info[1] ]
		    );
		  }
	});
}

function initSongTable() {
	$('#musicTable').html( '<table id="song_table"></table>' );
		
	var oTable = $('#song_table').dataTable( {
		//"sScrollY": "200px",
		"bPaginate": true,
		"bInfo": false,
		"bFilter": true,
		"bAutoWidth": false,
		"aoColumns": [
			{ "sTitle": "Name", "sWidth": "60%" },
			{ "sTitle": "Length", "sWidth": "10%" },
			{ "sTitle": "Tags", "sWidth": "30%" },
			{ "bVisible": false}
		]
	});
		
	$("#song_table").on("click", "tr", function() {
		var data = oTable.fnGetData(this);
		currentSong.title = data[0];
		currentSong.length = data[1];
		currentSong.tags = data[2];
		currentSong.url = data[3];
		//console.log(data[2]);
		playMusic(currentSong.title, currentSong.url);
		
		if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
        }
        else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
        }
	});		
}

function deleteSong() {	
	var anSelected = $('#song_table').dataTable().$('tr.row_selected');	
	if ( anSelected.length !== 0 ) {
		var song_url = $('#song_table').dataTable().fnGetData( anSelected[0], 3 );
		//console.log("del data "+del_data);
		$.post( "songs", { action: "delete", url: song_url })
		  .done(function( data ) {
			$('#song_table').dataTable().fnDeleteRow( anSelected[0] );
			setTimeout(getTagList,1000);
		  });
	}
	else
		console.log("select a row");
}

$(document).ready(function() {
	
	Events.enableFocusCall();
	Events.submitFormOnEnterAndAutoSearchArrows();
	
	$('#searchField').focus();
	$('#searchField').keyup(Events.typingInSearchField);
	$('#searchButton').click(Events.submitForm);
	$('#tagButton').click(Events.tagForm);
	$('#toLisnButton').click(Events.toLisnForm);
	$('#deleteSong').click(deleteSong);
  	
    $("#jquery_jplayer_1").jPlayer(); 

	getAllSongs();
	initLisnTable();
	getTagList();
});
