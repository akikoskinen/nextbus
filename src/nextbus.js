'use strict';

var NormalFetchInterval = 60 * 60 * 1000;
var FailedFetchInterval =  1 * 60 * 1000;

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
		var line = lineFromJORE(this.props.data.code);
		var time = printableTime(this.props.data.time);
		return (
			<tr>
			<td>{line}</td>
			<td>{time}</td>
			</tr>
		);
	}
});

var Departures = React.createClass({
	render: function () {
		var departures = this.props.data.map(function(departure) {
			return (
				<Departure data={departure} />
			);
		});
		return (
			<table>
			<thead><tr><th>Linja</th><th>Ohittaa</th></tr></thead>
			<tbody>
			{departures}
			</tbody>
			</table>
		);
	}
});

var StopInfo = React.createClass({
	_getInfo: function () {
		var self = this;
		var req = new XMLHttpRequest();
		req.addEventListener('load', function () {
			var res = JSON.parse(this.responseText)[0];
			self.setState(res);
			setTimeout(self._getInfo, NormalFetchInterval);
		});
		req.addEventListener('error', function () {
			console.log(this.status);
			setTimeout(self._getInfo, FailedFetchInterval);
		});
		var cred = 'userhash=6cd8b2e103f12ac32f5a217e5ff4b36aec11f6fe3c77';
		req.open('GET', 'http://api.reittiopas.fi/hsl/beta/?' + cred + '&request=stop&code=' + this.props.code);
		req.send();
	},
	getInitialState: function () {
		return { departures: [] };
	},
	componentDidMount: function () {
		this._getInfo();
	},
	render: function () {
		return (
			<div>
			<h3>{this.state.address_fi}</h3>
			<Departures data={this.state.departures} />
			</div>
		);
	}
});

var StopInfos = React.createClass({
	render: function () {
		var stopInfos = this.props.stopCodes.map(function (stopCode) {
			return (
				<StopInfo code={stopCode} />
			);
		});
		return (
			<div>
			{stopInfos}
			</div>
		);
	}
});

var stopCodes = ['1412118', '1412134'];
ReactDOM.render(
	<StopInfos stopCodes={stopCodes} />,
	document.getElementById('root')
);
