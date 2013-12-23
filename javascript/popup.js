$(document).ready(function() {
	
	Events.enableFocusCall();
	Events.submitFormOnEnterAndAutoSearchArrows();
	
	$('#searchField').focus();
	$('#searchField').keyup(Events.typingInSearchField);
	$('#searchButton').click(Events.submitForm);
  
    $("#jquery_jplayer_1").jPlayer();
});