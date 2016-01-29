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
	var minutesLen = time.length - 2;
	return new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2), time.substr(0, minutesLen), time.substr(minutesLen, 2));
}

var Departure = React.createClass({
	render: function () {
		var line = lineFromJORE(this.props.data.code);
		var time = this.props.data.time;
		var minutesUntil = parseInt((time - this.props.now) / 60000);
		return (
			<tr className={minutesUntil < 10 ? 'danger' : ''}>
			<td>{line}</td>
			<td>{time.getHours() + '.' + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes()}</td>
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
				<Departure data={departure} now={this.props.now} key={departure.code + departure.time} />
			);
		}, this);
		return (
			<table className="table table-striped table-bordered table-condensed">
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

			var coords = res.wgs_coords.split(',');
			res.lon = coords[0];
			res.lat = coords[1];

			self.setState(res);

			setTimeout(self._getInfo, NormalFetchInterval);
		});
		req.addEventListener('error', function () {
			console.log(this.status);
			setTimeout(self._getInfo, FailedFetchInterval);
		});
		var cred = 'userhash=6cd8b2e103f12ac32f5a217e5ff4b36aec11f6fe3c77';
		req.open('GET', '//api.reittiopas.fi/hsl/beta/?' + cred + '&request=stop&code=' + this.props.code);
		req.send();
	},
	getInitialState: function () {
		return {};
	},
	componentDidMount: function () {
		this._getInfo();
		document.addEventListener('visibilitychange', function () {
			if (!document.hidden) {
				this._getInfo();
			}
		}.bind(this));
	},
	render: function () {
		if (this.state.departures == undefined) {
			return (
			<h3>Hetkinen...</h3>
			);
		}

		var lon = this.state.lon;
		var lat = this.state.lat;
		var mapUrl = '//www.openstreetmap.org/export/embed.html?bbox=' + lon + ',' + lat + ',' + lon + ',' + lat + '&layer=transportmap&marker=' + lat + ',' + lon;
		return (
			<div>
			<h3>{this.state.address_fi}</h3>
			<Departures data={this.state.departures} now={this.props.now} />
			<iframe className="map" src={mapUrl}></iframe>
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
		document.addEventListener('visibilitychange', function () {
			if (!document.hidden) {
				this._updateState();
			}
		}.bind(this));
	},
	render: function () {
		var stopInfos = this.props.stopCodes.map(function (stopCode) {
			return (
				<StopInfo code={stopCode} now={this.state.now} key={stopCode} />
			);
		}, this);
		return (
			<div>
			{stopInfos}
			</div>
		);
	}
});

var stopCodes = location.hash.substr(1).split(',').map(function (str) {
	return str.trim();
}).filter(function (str) {
	return str.length > 0;
});

ReactDOM.render(
	<StopInfos stopCodes={stopCodes} />,
	document.getElementById('root')
);
