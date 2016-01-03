'use strict';

function lineFromJORE(jore) {
	if (jore.length == 7) {
		jore = jore.substr(1, 4);
		while (jore.charAt(0) == '0') {
			jore = jore.substr(1);
		}
		jore = jore.trim();
	}
	return jore;
}

function printableTime(time) {
	time = '' + time;
	if (time.length == 4) {
		time = time.substr(0, 2) + '.' + time.substr(2, 2);
	}
	return time;
}

function getStop(code) {
	var req = new XMLHttpRequest();
	req.addEventListener('load', function () {
		var res = JSON.parse(this.responseText)[0];

		var list = document.getElementById('times');
		res.departures.forEach(function (departure) {
			var li = document.createElement('li');
			li.innerHTML = lineFromJORE(departure.code) + ': ' + printableTime(departure.time);
			list.appendChild(li);
		});
	});
	req.addEventListener('error', function () {
		console.log(this.status);
	});
	var cred = 'userhash=6cd8b2e103f12ac32f5a217e5ff4b36aec11f6fe3c77';
	req.open('GET', 'http://api.reittiopas.fi/hsl/beta/?' + cred + '&epsg_in=wgs84&epsg_out=wgs84&request=stop&code=' + code + '&time_limit=60&p=110000100011');
	req.send();
}

getStop('1412118');
