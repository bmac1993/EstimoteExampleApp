var app = app || {};

app.BEACONS = {};

app.main = {

	// Timer that displays list of beacons.
	updateTimer: null,
	// Custom timer to get users location
	locationTimer: null,

	startScan: function()
	{
		function onBeaconsRanged(beaconInfo)
		{
			console.log('onBeaconsRanged: ' + JSON.stringify(beaconInfo))
			for (var i in beaconInfo.beacons)
			{
				// Insert beacon into table of found beacons.
				var beacon = beaconInfo.beacons[i];
				beacon.timeStamp = Date.now();
				var key = beacon.major + ":" + beacon.minor;
				app.BEACONS[key] = beacon;
			}
		}

		function onError(errorMessage)
		{
			console.log('Ranging beacons did fail: ' + errorMessage);
		}

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		estimote.requestAlwaysAuthorization();

		// Start ranging beacons.
		estimote.startRangingBeaconsInRegion(
			{}, // Empty region matches all beacons
			    // with the Estimote factory set UUID.
			onBeaconsRanged,
			onError);
	},
	
	initialize: function()
	{
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	
	displayBeaconList: function()
	{
		// Clear beacon list.
		$('#found-beacons').empty();

		var timeNow = Date.now();
		
		// Update beacon list.
		$.each(app.BEACONS, function(key, beacon)
		{	
			// Only show beacons that are updated during the last 20 seconds.
			if (beacon.timeStamp + 20000 > timeNow)
			{
				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	app.utils.proximityHTML(beacon)
					+	app.utils.distanceHTML(beacon)
					+	app.utils.rssiHTML(beacon)
					+ '</li>'
				);
				
				$('#found-beacons').append(element);
			}
		});
		
		app.main.updateLocation();
	},
	
	onDeviceReady: function()
	{
		// Specify a shortcut for the location manager holding the iBeacon functions.
		window.estimote = EstimoteBeacons;

		// Start tracking beacons!
		app.main.startScan();

		// Display refresh timer.
		updateTimer = setInterval(app.main.displayBeaconList, 500);
	},
	
	updateLocation: function()
	{
		timeNow = Date.now();
		
		var nearestBeacon;
		var secondNearestBeacon;
		var thirdNearestBeacon;

		// Update beacon list.
		$.each(app.BEACONS, function(key, beacon)
		{
			// Only show beacons that are updated during the last 20 seconds.
			if (beacon.timeStamp + 20000 > timeNow)
			{
				// Hardcode x and y values for testing
				if(key == "12350:52257")
				{
					beacon.x = 5;
					beacon.y = 0;
				}
				if(key == "56181:59165")
				{
					beacon.x = 0;
					beacon.y = 1;
				}
				if(key == "41988:60931")
				{
					beacon.x = 2;
					beacon.y = 4;
				}
				
				// Set distance, color, and id
				beacon.id = key;
				//beacon.distance = app.utils.getDistance(beacon);
				if(beacon.color == undefined)
				{
					beacon.color = app.utils.getColor(beacon);
				}
				
				//Set the closest and second closest beacons
				if(nearestBeacon == undefined)
				{
					nearestBeacon = beacon;
				}
				else if(beacon.distance < nearestBeacon.distance)
				{
					thirdNearestBeacon = secondNearestBeacon;
					secondNearestBeacon = nearestBeacon;
					nearestBeacon = beacon;
				}
				else if(secondNearestBeacon == undefined)
				{
					secondNearestBeacon = beacon;
				}
				else if(beacon.distance < secondNearestBeacon.distance)
				{
					thirdNearestBeacon = secondNearestBeacon;
					secondNearestBeacon = beacon;
				}
				else if(thirdNearestBeacon == undefined)
				{
					thirdNearestBeacon = beacon;
				}
				else if(beacon.distance < thirdNearestBeacon.distance)
				{
					thirdNearestBeacon = beacon;
				}
			}
		});
		
		this.calculateLocation(nearestBeacon, secondNearestBeacon, thirdNearestBeacon);
	},
	sqr: function(a) {
		return Math.pow(a, 2);
	},
	calculateLocation: function(a, b, c){
	
		console.log("A distance = " + a.distance + "& X = " + a.x);
		console.log("B distance = " + b.distance + "& X = " + b.x);
		console.log("C distance = " + c.distance);
		
		var xa = a.x;
		var ya = a.y;
		var xb = b.x;
		var yb = b.y;
		var xc = c.x;
		var yc = c.y;
		var ra = a.distance;
		var rb = b.distance;
		var rc = c.distance;
	 
		var j, k, x, y;

		k = (this.sqr(xa) + this.sqr(ya) - this.sqr(xb) - this.sqr(yb) - this.sqr(ra) + this.sqr(rb)) / (2 * (ya - yb)) - (this.sqr(xa) + this.sqr(ya) - this.sqr(xc) - this.sqr(yc) - this.sqr(ra) + this.sqr(rc)) / (2 * (ya - yc));
		j = (xc - xa) / (ya - yc) - (xb - xa) / (ya - yb);
		x = k / j;
		y = ((xb - xa) / (ya - yb)) * x + (this.sqr(xa) + this.sqr(ya) - this.sqr(xb) - this.sqr(yb) - this.sqr(ra) + this.sqr(rb)) / (2 * (ya - yb));
		
		console.log("(" + x + "," + y + ")");
	}
};

app.main.initialize();
