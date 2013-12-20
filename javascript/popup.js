$(document).ready(function() {
	
	Events.enableFocusCall();
	Events.submitFormOnEnterAndAutoSearchArrows();
	
	$('#searchField').focus();
	$('#searchField').keyup(Events.typingInSearchField);
	$('#searchButton').click(Events.submitForm);
	
});
