/**
 * Revision3 plugin for showtime version 0.4  by NP
 *
 *  Copyright (C) 2011 NP
 *
 * 	ChangeLog:
 *  0.51
 * 	Minor fix
 *  0.5
 *  Added Bookmarks
 * 	Added Search Support
 *  New icon
 *  0.4
 *  New API support
 * 	Support for Show Notes in old episodes
 * 	0.3
 * 	Major rewrite
 * 	Add support to Archives
 * 	Add suport to all episodes 
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//TODO : Clean up

(function(plugin) {


//settings 

  var service =
    plugin.createService("Revision3", "revision3:start", "tv", true,
			   plugin.path + "logo_large.png");
  
  var settings = plugin.createSettings("Revision3",
					  plugin.path + "logo_large.png",
					 "Revison3: The Best TV Shows on the net");

  settings.createInfo("info",
			     plugin.path + "logo_large.png",
			     "Internet Television any way you want it.\n\n"+
				 "Revision3 is the leading television network for the internet generation.\n"+
				 "We create and produce all-original episodic community driven programs watched\n"+
				 "by a super-committed and passionate fan base. Learn more on wwww.revision3.com \n" + 
				 "Plugin developed by NP \n");

/*    settings.createBool("hd", "HD", false, function(v) {
    service.hd = v;
  });
*/
		
//store
	var bookmarks = plugin.createStore('bookmarks', true);

	if(!bookmarks.episodes)
		bookmarks.episodes = '';
		
		
function startPage(page) {      	
		
		var content = showtime.httpGet("http://revision3.com/shows").toString();
		var inicio = content.indexOf('<ul id="shows">');
		var fim = content.indexOf('</ul>', inicio);
		var nice = content.slice(inicio, fim+6);
		var split = nice.split('</li>');
	
		for each (var show in split) {
			if(show.toString().match('<h3><a href="/.*">.*</a></h3>') != null){
			var metadata = {
				title: show.toString().match('<h3><a href="/.*">.*</a></h3>').toString().match('">.*</a></h3>').toString().replace('</a></h3>',"").replace('">',""),
				icon: show.toString().match('<img src=".*" /></a>').toString().replace('<img src="',"").replace('" /></a>',"")
			};
			
			var url = show.toString().match('<h3><a href="/.*">').toString().replace('<h3><a href="/',"").replace('">','');
			page.appendItem("revision3:show:feed:" + url,"directory", metadata);
		}
		}
		
		//Archives	
		page.appendItem("revision3:archives", "directory", {
		  title: "Archived Shows",
		  icon:  plugin.path + "logo_large.png"
		  });
		
		if(bookmarks.episodes.length >= 10){  
			page.appendItem("revision3:bookmarks", "directory", {
				title: "Bookmarks",
				icon:  plugin.path + "logo_large.png"
				});
		}
			
	page.type = "directory";
    page.contents = "items";
    page.loading = false;

    page.metadata.logo = plugin.path + "icon.png";
    page.metadata.title = "Revision3";

  }


plugin.addURI("revision3:archives", function(page) {

   page.type = "directory";
   page.contents = "items";
   page.loading = false;

   page.metadata.logo = plugin.path + "icon.png";
   page.metadata.title = "Archived Shows";

   var content = showtime.httpGet("http://revision3.com/shows/archive").toString();
		var inicio = content.indexOf('<ul id="shows">');
		var fim = content.indexOf('</ul>', inicio);
		var nice = content.slice(inicio, fim+6);
		var split = nice.split('</li>');
	
		for each (var show in split) {
			if(show.toString().match('<h3><a href="/.*">.*</a></h3>') != null){
			var metadata = {
				title: show.toString().match('<h3><a href="/.*">.*</a></h3>').toString().match('">.*</a></h3>').toString().replace('</a></h3>',"").replace('">',""),
				icon: show.toString().match('<img src=".*" /></a>').toString().replace('<img src="',"").replace('" /></a>',"")
			};
			
			var url = show.toString().match('<h3><a href="/.*">').toString().replace('<h3><a href="/',"").replace('">','');
			page.appendItem("revision3:show:feed:" + url,"directory", metadata);
		}
		}
 


  page.loading = false; 
});



plugin.addURI("revision3:show:feed:([a-z0-9,]*)", function(page, show) {
   
   //if(service.hd == "1"){ var VideoQuality ="MP4-hd30"; }else{ var VideoQuality ="MP4-Large"; }
   var VideoQuality ="MP4-Large";
		
   page.contents = "video";
   page.type = "directory";
   
   page.metadata.logo = plugin.path + "icon.png";
   
   var doc = new XML(showtime.httpGet("http://revision3.com/" + show + "/feed/" + VideoQuality).toString());
   page.metadata.title = doc.channel.title;
	   

   for each (var arg in doc.channel.item) {
		  
	var metadata = {
	      title: arg.title,
	      description: arg.description,
	      icon:  doc.channel.image.url
	  };
	//var url = "http://videos.revision3.com/revision3/web" + arg.guid;
	var url = arg.link.toString().replace('http://','');
	page.appendItem('revision3:link:'+ arg.link.toString().replace('http://',''),"video", metadata);
   }
   
   //All Episodes
   page.appendItem("revision3:show:" + show, "directory", {
		  title: "All Episodes"
		  });
 
   
  page.loading = false; 
});

plugin.addURI("revision3:show:([a-z0-9,]*)", function(page, show) {
	
   page.contents = "video";
   page.type = "directory";
   page.metadata.logo = plugin.path + "icon.png";
   
   
   var content = showtime.httpGet("http://revision3.com/" + show).toString();
   var img = content.match('src="http://videos.revision3.com/revision3/images/shows/.*.jpg"').toString().replace('src="',"").replace('"',""); 
   var inicio = content.indexOf('<tbody>');
   var fim = content.indexOf('</tbody>', inicio);
   var nice = content.slice(inicio, fim+8);
   var split = nice.split('</tr>');
      
   var name = split[1].toString().match('<td class="show" nowrap>.*</td>').toString().replace('<td class="show" nowrap>',"").replace('</td>',"");
   page.metadata.title = name.toString();
   
   for each (var episode in split) {
	   if(episode.toString().match('<td class="title"><a href="/.*">.*</a></td>') != null){
		   var metadata = {
			   title: episode.toString().match('<td class="episode-number" nowrap>.*</td>').toString().replace('<td class="episode-number" nowrap>',"").replace('</td>',"") + '  '+ episode.toString().match('<td class="title"><a href="/.*">.*</a></td>').toString().replace('<td class="title"><a href="',"").match('">.*</a></td>').toString().replace('</a></td>',"").replace('">',""),
			   description: episode.toString().match('<td class="title"><a href="/.*">.*</a></td>').toString().replace('<td class="title"><a href="',"").match('">.*</a></td>').toString().replace('</a></td>',"").replace('">',""), 
			   icon: img,
			   duration: episode.toString().match('<td class="running-time">.*</td>').toString().replace('<td class="running-time">',"").replace('</td>',"")
			};
			   
			   var url = episode.toString().match('<td class="title"><a href="/.*"').toString().replace('<td class="title"><a href="/',"").replace('">','');
			   page.appendItem('revision3:link:revision3.com/' + url ,"video", metadata);
			   
	   }
	}

  page.loading = false; 
});


plugin.addURI("revision3:link:(.*)", function(page, link) {
   	
   page.metadata.logo = plugin.path + "icon.png";
   
   var content = showtime.httpGet("http://" + link.toString().replace('"','')).toString();
   var title = content.match('<title>.*</title>').toString().replace('<title>','').replace('</title>','');
   page.metadata.title = title;  
 
   var runtime = content.match('running time .*</div>').toString().replace('running time ','').replace('</div>','');
   var subtext = content.match('<div class="subtext">.*\\d{4}').toString().replace('<div class="subtext">','');
   var url = content.match('href=".*">Large</a>');
   if(url != null)
	   url = url.toString().replace('href="','').replace('">Large</a>','');

	var img = content.slice(content.lastIndexOf('http://', content.indexOf('thumb.jpg')),content.indexOf('thumb.jpg')+9).replace('-small', '-medium');
	  
	var descrip = null;
	
	if(descrip == null && content.match('<div class="description">.*</div>') != null)
		descrip = content.match('<div class="description">.*</div>').toString().replace('<div class="description">','').replace('</div>','');
	
	if(descrip == null && content.match('<div class="summary">.*</div>') != null)
		descrip = content.match('<div class="summary">.*</div>').toString().replace('<div class="summary">','').replace('</div>','');
	
	if(descrip == null && content.match('<div class="segmentSummary">.*</div>') != null){
		while(content.match('<div class="segmentSummary">.*</div>') !=null){
		var aux=content.match('<div class="segmentSummary">.*</div>').toString();
		content = content.replace(aux, "");
		descrip = aux.replace('<div class="segmentSummary">','').replace('</div>','');
		}
		
	}
 
  page.metadata.icon = img ;
  page.appendPassiveItem("label", subtext);
  page.appendPassiveItem("label", runtime, { title: "Duration"});
  page.appendPassiveItem("bodytext", new showtime.RichText(descrip)); 

  page.appendAction("navopen", url, true, { title: "Watch" });
	
  url = content.match('href=".*">HD</a>').toString().replace('href="','').replace('">HD</a>','');
  if(url != null)
	page.appendAction("navopen", url.toString(), true, { title: "Watch in HD" });
	
	
  //bookmarks		
	if(!bookmarked(link)){
		var bookmakrButton = page.appendAction("pageevent", "bookmark", true,{ title: "Bookmark" });
	}
	else{		
		var bookmakrButton = page.appendAction("pageevent", "bookmark_remove", true,{ title: "Remove Bookmark" });
	}
	
  page.loading = false;
  page.type = "item";
  
  
  	page.onEvent('bookmark', function(){ 
		if(!bookmarked(link)){
			bookmark(link, title)
			showtime.message('Bookmarked: '+ title, true, false);
		}else
			showtime.message('Already Bookmarked: '+ title, true, false);
		});

	page.onEvent('bookmark_remove', function(){ 
		if(!bookmarked(link)){
			showtime.message(title +' Not bookmarked ', true, false);
		}else{
			showtime.message(title + ' bookmark removed' , true, false);
			bookmark_remove(link, title);
		}
		});

});


plugin.addURI("revision3:search:(.*):(.*)", function(page, link, index) {
   page.contents = "video";
   page.type = "directory";
   page.metadata.logo = plugin.path + "icon.png";
	
	var search_content = showtime.httpGet('http://'+link+'&limit=10&page='+index).toString();
	
	search_content = search_content.split('<li class="video">');
    
    var i =1;
    for (i=1;i<search_content.length;i++){
		page.appendItem('revision3:link:' + getLink(search_content[i]).replace('http://','') ,"video", getMetadata(search_content[i]));
		}
	index = parseInt(index)+1;
	if(search_content[0].indexOf('&page='+index) != -1)
    		page.appendItem('revision3:search:' +link+':'+index ,"directory", { title: 'Next' });
    
    page.loading = false;	

});


function getVideo(url){
	url = url.replace('"','');
	var content = showtime.httpGet("http://revision3.com/" + url.toString()).toString();
	if(service.hd == "1"){
		 return content.match('href=".*">HD</a>').toString().replace('href="','').replace('">HD</a>',''); 
		 }else{ 
			 return content.match('href=".*">Tablet</a>').toString().replace('href="','').replace('">Tablet</a>','');
			 }
	}
	
function getMetadata(content){
	var metadata = { title: null, icon: null, description: null };
	
	metadata.title = content.slice(content.indexOf('>',content.indexOf('<a class="title" href="'))+1,
			content.indexOf('</a>',content.indexOf('<a class="title" href="')));
		
	metadata.description = new showtime.RichText(content.slice(content.indexOf('<div class="description">')+25,
			content.indexOf('</div>',content.indexOf('<div class="description">'))));	
		
	metadata.icon = content.slice(content.indexOf('<img src="')+10,
			content.indexOf('"',content.indexOf('<img src="')+11));
			
	return metadata;
 }	

function getLink(content){
	return content.slice(content.indexOf('<a href="')+9,
			content.indexOf('"',content.indexOf('<a href="')+10));
 }  
     
  plugin.addSearcher(
    "Revision3", plugin.path + "icon.png",
    function(page, query) {
	
    showtime.trace('Revision3 - Started Search for: ' +escape(query));

	query = escape(query);
	var search_content = showtime.httpGet('http://revision3.com/search/page?type=video&q=' + query + '&limit=25').toString();
	
	search_content = search_content.split('<li class="video">');
    
    var i =1;
    for (i=1;i<search_content.length;i++){
		page.appendItem('revision3:link:' + getLink(search_content[i]).replace('http://','') ,"video", getMetadata(search_content[i]));
		}
	
	if(search_content[0].indexOf('&page=2') != -1){
    		page.appendItem('revision3:search:'+'revision3.com/search/page?type=video&q=' + query+':'+'2' ,"directory", { title: 'Next' });
    		search_content.length +=1;
		}
    		
    page.type = "directory";
    page.entries = search_content.length-1;
    page.loading = false;
           
 });
   


//bookmarks

plugin.addURI("revision3:bookmarks", function(page) {
	page.type = "directory";
    page.contents = "video";
    page.metadata.logo = plugin.path + "icon.png";
	page.metadata.title = 'Bookmarks';

	
	if(bookmarks.episodes){	
		var split = bookmarks.episodes.split('\n');
		for each (var episode in split){
			if(episode.indexOf('\t') != -1)
				page.appendItem('revision3:link:'+ episode.slice(0, episode.indexOf('\t')) , "video", { title:  episode.slice(episode.indexOf('\t')+1) });
			}
		}
		
	page.loading = false;	
});

function bookmark(link, title){
	
	if(bookmarked(link))
		return;
		
	bookmarks.episodes = bookmarks.episodes + link + "\t" + title + "\n";
}

function bookmark_remove(link, title){
	
	if(!bookmarked(link, title))
		return;
	
	bookmarks.episodes = bookmarks.episodes.replace(link +"\t"+title+"\n", '');
}
function bookmarked(link, title){
	
	if(bookmarks.episodes && bookmarks.episodes.indexOf(link) !=-1){
		return true;
	}else{ return false; }

}

	
		
plugin.addURI("revision3:start", startPage);
})(this);
