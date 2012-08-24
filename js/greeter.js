var DEBUG = false;
var selectedUser = null;

/**
 * UI Initialization.
 */
$(document).ready(function() {
	// User list building
	var dockList = document.getElementById('dockList');
	for (i in lightdm.users)
	{
		user = lightdm.users[i];
		var imageSrc = user.image.length > 0 ? user.image : 'img/default.png';
		var li = '<li id="' + user.name + '">' +
			'<a href="#' + user.name + '" onclick="startAuthentication(\'' + user.name + '\')">' +
			'<em><span>' + user.display_name + '</span></em>' + 
			'<img src="' + imageSrc + '" alt="' + user.display_name + '" onerror="imgNotFound(this)"/> ' +
			'</a>' +
	   		'</li>';
		$(dockList).append(li);
	}
	
	// Password key trigger registering
	$("#passwordField").keypress(function() {
		log("keypress(" + event.which + ")")
		if (event.which == 13) { // 'Enter' key
			submitPassword();
		}

	});
	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // 'Escape' char
			cancelAuthentication();
		}
	});
	
	// Action buttons
	addActionLink("shutdown");
	addActionLink("hibernate");
	addActionLink("suspend");
	addActionLink("restart");

	// Logs ?
	if (DEBUG) {
		$("#logArea").show();
	}
});

/**
 * Actions management.
 */

function addActionLink(id) {
	if (eval("lightdm.can_" + id)) {
		var label = id.substr(0,1).toUpperCase() + id.substr(1,id.length-1); 
		$("#actionsArea").append('\n<img src="img/action_' + id + '.png" alt="' + label + '" title="' + label + '" onclick="handleAction(\'' + id + '\')"/>');
	}
}

function handleAction(id) {
	log("handleAction(" + id + ")");
	eval("lightdm." + id + "()");
}

function startAuthentication(userId) {
	log("startAuthentication(" + userId + ")");
	cancelAuthentication();
	selectedUser = userId;
	lightdm.start_authentication(selectedUser);
}

function cancelAuthentication() {
	log("cancelAuthentication()");
	$('#statusArea').hide();
	$('#timerArea').hide();
	if (selectedUser != null) {
		lightdm.cancel_authentication();
		log("authentication cancelled for " + selectedUser);
		selectedUser = null;
		$('#passwordArea').hide();
	}
	return true;
}

function submitPassword()
{
	log("provideSecret()");
	lightdm.provide_secret($('#passwordField').val());
	$('#passwordArea').hide();
	$('#timerArea').show();
	log("done");
}

/**
 * Image loading management.
 */

function imgNotFound(source){
	source.src = 'img/default.png';
	source.onerror = "";
	return true;
}


/**
 * Lightdm Callbacks
 */
function show_prompt(text) {
	log("show_prompt(" + text + ")");
	$('#passwordField').val("");
	$('#passwordArea').show();
	$('#passwordField').focus();
}

function authentication_complete() {
	log("authentication_complete()");
	$('#timerArea').hide();
	if (lightdm.is_authenticated) {
		log("authenticated !");
		lightdm.login (lightdm.authentication_user, lightdm.default_session);
	}
	else {
		log("not authenticated !");
		$('#statusArea').show();
	}
}

/**
 * Logs.
 */
function log(text) {
	if (DEBUG) {
		$('#logArea').append(text);
		$('#logArea').append('<br/>');
	}
}
