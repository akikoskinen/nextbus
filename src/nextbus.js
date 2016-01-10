'use strict';

var NormalFetchInterval = 60 * 60 * 1000;
var FailedFetchInterval =  1 * 60 * 1000;
var MaxTimeUntilDeparture = 60 * 60 * 1000;

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

function dateTimeIntsToDate(date, time) {
	date = '' + date;
	time = '' + time;
	return new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2), time.substr(0, 2), time.substr(2, 2));
}

var Departure = React.createClass({
	render: function () {
		var line = lineFromJORE(this.props.data.code);
		var time = this.props.data.time;
		var minutesUntil = parseInt((time - this.props.now) / 60000);
		return (
			<tr>
			<td>{line}</td>
			<td>{time.getHours() + '.' + time.getMinutes()}</td>
			<td>{minutesUntil}</td>
			</tr>
		);
	}
});

var Departures = React.createClass({
	render: function () {
		var departures = this.props.data.filter(function (departure) {
			return departure.time > this.props.now && (departure.time - this.props.now) < MaxTimeUntilDeparture;
		}, this).map(function(departure) {
			return (
				<Departure data={departure} now={this.props.now} />
			);
		}, this);
		return (
			<table>
			<thead><tr><th>Linja</th><th>Ohittaa</th><th>Minuuttia aikaa</th></tr></thead>
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
			res.departures.forEach(function (value) {
				value.time = dateTimeIntsToDate(value.date, value.time);
				delete value.date;
			});
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
			<Departures data={this.state.departures} now={this.props.now} />
			</div>
		);
	}
});

var StopInfos = React.createClass({
	_updateState: function () {
		var now = new Date();
		this.setState({ now: now });
		setTimeout(this._updateState, 65000 - now.getSeconds() * 1000 - now.getMilliseconds()) ;
	},
	getInitialState: function () {
		return { now: new Date() };
	},
	componentDidMount: function () {
		this._updateState();
	},
	render: function () {
		var stopInfos = this.props.stopCodes.map(function (stopCode) {
			return (
				<StopInfo code={stopCode} now={this.state.now} />
			);
		}, this);
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
