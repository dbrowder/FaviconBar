//var safariLinks = "https://apple.com/; https://parse.com; https://trello.com/; https://bitbucket.org; https://github.com/; https://sidefield.com; https://news.ycombinator.com; https://www.reddit.com/r/all; https://www.youtube.com/; https://pinboard.in/u:umfana; http://xkcd.com/; https://twitter.com; https://facebook.com; https://dropbox.com; http://getbootstrap.com/; https://mail.google.com; https://buffer.com/; http://facebook.github.io/react/; http://facebook.github.io/react-native/; http://www.munichirishrovers.de/; https://www.bitfountain.io/; http://www.pivotaltracker.com/; https://talky.io/; https://www.evernote.com/; https://c9.io/; https://delicious.com/umfana; http://ionicframework.com/docs/components/; https://www.quora.com/; https://web.whatsapp.com/; https://www.coinbase.com/; https://www.fastmail.com/mail/Inbox/?u=1c944178; http://umfana.github.io/FaviconBar/";

var settings = [];

messageHandler = function(msg) {
	if(msg.name == 'returnSetting') {
	settings[msg.message.name] = msg.message.value;
	updateSettings();
	}
}

updateSettings = function() {
	if (settings["iconSize"]) {	$("p.iconrow img").removeClass("small normal large 0").addClass(settings["iconSize"]);$("#iconSize").val(settings["iconSize"]);}
	if (settings["centerBar"]) {	if (settings["centerBar"] == "center") { $("#centerBar").prop('checked',true); } else { $("#centerBar").prop('checked',false); }}
	if (settings["settingsIcon"]) {	if (settings["settingsIcon"] == "fullwidth") { $("#settingsIcon").prop('checked',true); } else { $("#settingsIcon").prop('checked',false); }}
}

renderLinkHtml = function(l){
	//Additional logic for separators, labels and children will go here.
	if (l) {
	if (l.type == "icon") {
		return 	"<p class='iconrow' data-title=\""+l.title+"\" data-url=\""+l.link+"\" data-icon=\""+l.icon+"\"><img title='Click to choose image' class=\"normal\" src=\""+l.icon+"\"><span title='Click to edit' class='icontitle'>"+l.title+"</span><span title='Click to edit' class='iconlink'>"+l.link+"</span></p>";
	} else if (l.type == "separator") {
		return 	"<hr>";
	}
	} else {
	return "";
	}
}

iconLookup = function(link) {
	var retval = "";
	
	result = $.ajax({
		method: "GET",
		dataType: "json",
		url: "https://icons.better-idea.org/allicons.json?url="+link, 
		async: false
	}).responseJSON;
	
	$.each(result.icons, function(i, itm) {
		retval += "<img class='favicon "+settings["iconSize"]+"'  src='" + itm.url + "'>";
	});
	
	retval += "<img class='favicon "+settings["iconSize"]+"' src='http://www.google.com/s2/favicons?domain_url=" + link + "'>";

	return retval; 
}


$(document).ready(function(){

	safari.self.addEventListener('message', messageHandler, false);
	safari.self.tab.dispatchMessage('getSetting', 'centerBar');
	safari.self.tab.dispatchMessage('getSetting', 'iconSize');
	safari.self.tab.dispatchMessage('getSetting', 'settingsIcon');

	$("#centerBar").change(function () {
		var val = "0";
		if (this.checked) { val = "center"; } 
		var setting = {
			name: "centerBar",
			value: val
		}
		safari.self.tab.dispatchMessage('setSetting',setting);
	});

	$("#settingsIcon").change(function () {
		var val = "0";
		if (this.checked) { val = "fullwidth"; } 
		var setting = {
			name: "settingsIcon",
			value: val
		}
		safari.self.tab.dispatchMessage('setSetting',setting);
	});

	$("#iconSize").change(function () {
		var setting = {
			name: "iconSize",
			value: $(this).val()
		}
		safari.self.tab.dispatchMessage('setSetting',setting);
	});
	
	var results = "";
	var links = localStorage.getItem('links');
	links = JSON.parse(links);	
	links.map(function(l){
			results += renderLinkHtml(l);
	});
	$('#linksContainer').html(results);
	
	$(".icontitle, .iconlink").bind("click", function() {
		$(this).attr("contentEditable", true);
		$(this).addClass("editable");
		$(this).trigger("focus");
	}).blur(function() {
		$(this).attr("contentEditable", false);
		$(this).removeClass("editable");
	});
	
	$(".iconrow > img").bind("click", function() {
		$("#iconContainer").html(iconLookup($(this).parent().data("url")));
		$("#iconURL").val($(this).parent().data("icon")).change();
		$("#lnktitle").text($(this).parent().data("title"));
		$("#popOver").show();
		$("#btnsave").data("referrer",$(this).parent());
	});
	
	$("#iconURL").bind("change", function() {
		$(this).css("backgroundImage","url("+$(this).val()+")");
	});
	
	$("#iconContainer").on("click", "img", function(){
		$("#iconURL").val($(this).attr("src")).change();
	});
	
	$("#btnsave").bind("click", function() {
		$($("#btnsave").data("referrer")).data("icon",$("#iconURL").val());
		$("img",$("#btnsave").data("referrer")).attr("src",$("#iconURL").val());
		$("#popOver").hide();
	});

	$("#btncancel").bind("click", function() {
			$("#popOver").hide();
	});

	$("#popOver").bind("dragenter dragover drop", function(event) {
	    event.stopPropagation();
		event.preventDefault();
	});

	$("#iconURL").bind("dragenter dragover", function(event) {
		if (!event.originalEvent.dataTransfer) {
			return false;
		}
		event.originalEvent.dataTransfer.dropEffect = "copy";	
	    event.stopPropagation();
		event.preventDefault();
	});
	
	$("#iconURL").bind("drop", function(event) {
		if (!event.originalEvent.dataTransfer) {
			return false;
		}
	    event.stopPropagation();
		event.preventDefault();

        if(event.originalEvent.dataTransfer.files.length > 0) {
        
        file = event.originalEvent.dataTransfer.files[0];
            var fileReader = new FileReader();
                fileReader.onload = (function(file) {
                   return function(event) { 
                     $("#iconURL").val(event.target.result).change(); 
                   }; 
                })(file);
            fileReader.readAsDataURL(file);
		}

	});

});

