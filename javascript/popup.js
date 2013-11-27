$(document).ready(function() {
	
	UI.stylishForms();
	
	Events.enableFocusCall();
	Events.submitFormOnEnterAndAutoSearchArrows();
	
	$('#searchField').focus();
	$('#searchField').keyup(Events.typingInSearchField);
	$('#searchButton').click(Events.submitForm);

});