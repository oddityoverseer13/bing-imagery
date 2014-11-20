var Combinatorics = require('js-combinatorics').Combinatorics
, request = require('request')
, qs = require('querystring')
, _ = require('underscore')

function base4(dec) {
	return Number(dec).toString(4);
}

function pad(num, size) {
	 var s = num+"";
	 while (s.length < size) s = "0" + s;
	 return s;
}



function getCubeIds(w,n,e,s,cb) {
	var streetside_api_url = "http://dev.virtualearth.net/mapcontrol/HumanScaleServices/GetBubbles.ashx";
	var ids = [];

	var url = streetside_api_url + '?' + qs.stringify({c:1, n:n, s:s, e:e, w:w})

	// TODO: remove dependency on jQuery. Maybe request?
	request(url, function(err,res,data){
		ids = _.map(JSON.parse(data).slice(1),function(obj){ return obj["id"]});
		cb(ids)
	})
}

function imgURL(id,dir,zoom_coords) {
	var DIR_STRINGS = { "FRONT": 1, "RIGHT": 2, "BACK": 3, "LEFT": 4, "UP": 5, "DOWN": 6 };
	if (typeof dir == "string") {
		dir = DIR_STRINGS[dir];
	}
	var url_id = pad(base4(id),16);
	var url_dir = pad(base4(dir),2);
	var url_tile_coord = zoom_coords.join('');

	var url_param = url_id + url_dir + url_tile_coord;
	//console.log("url_id:" + url_id + " url_dir:" + url_dir + " url_tile_coord: " + url_tile_coord)
	//console.log("http://ak.t1.tiles.virtualearth.net/tiles/hs" + url_param + ".jpg?g=2981&n=z")
	return "http://ak.t1.tiles.virtualearth.net/tiles/hs" + url_param + ".jpg?g=2981&n=z"
}


function imgURLs(ids,dirs,zoom,cb) {
	ids.forEach(function(id){
		dirs.forEach(function(dir){
			var all_zoom_coords = Combinatorics.baseN([0,1,2,3],zoom)
			all_zoom_coords.toArray().forEach(function(zoom_coords){
				cb(imgURL(id,dir,zoom_coords))
			})
		})
	})
}

exports.getDetections = function(w,n,e,s) {
	var zoom = 3
	var dirs = ['LEFT','RIGHT']
	getCubeIds(w,n,e,s, function(cubeIds){
		// TODO: Compare to DB
		// Generate URLS
		var imageURLs = imgURLs(cubeIds,dirs,zoom,function(url){
			console.log(url)
		})
	})
}