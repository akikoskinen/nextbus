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

var Departure = React.createClass({
	render: function () {
		var line = lineFromJORE(this.props.code);
		var time = printableTime(this.props.time);
		return (
			<li>
			{line}: {time}
			</li>
		);
	}
});

var Departures = React.createClass({
	render: function () {
		var departures = this.props.data.map(function(departure) {
			return (
				<Departure code={departure.code} time={departure.time} />
			);
		});
		return (
			<ul>
			{departures}
			</ul>
		);
	}
});

var BusStopInfo = React.createClass({
	getInitialState: function () {
		return { departures: [] };
	},
	componentDidMount: function () {
		var self = this;
		var req = new XMLHttpRequest();
		req.addEventListener('load', function () {
			var res = JSON.parse(this.responseText)[0];
			self.setState(res);
		});
		req.addEventListener('error', function () {
			console.log(this.status);
		});
		var cred = 'userhash=6cd8b2e103f12ac32f5a217e5ff4b36aec11f6fe3c77';
		req.open('GET', 'http://api.reittiopas.fi/hsl/beta/?' + cred + '&epsg_in=wgs84&epsg_out=wgs84&request=stop&code=' + this.props.code + '&time_limit=60&p=110000100011');
		req.send();
	},
	render: function () {
		return (
			<Departures data={this.state.departures} />
		);
	}
});

ReactDOM.render(
	<BusStopInfo code="1412118" />,
	document.getElementById('stop')
);
