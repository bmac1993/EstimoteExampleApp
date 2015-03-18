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
				var key = beacon.uuid + ":" + beacon.major + ":" + beacon.minor;
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
			console.log("key = " + key);
			console.log("beacon = " + JSON.stringify(beacon));
			
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
		var timeNow = Date.now();
		
		var nearestBeacon;
		var secondNearestBeacon;

		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 20 seconds.
			if (beacon.timeStamp + 20000 > timeNow)
			{
					beacon.distance = app.utils.getDistance(beacon)
					if(beacon.color == undefined)
					{
						beacon.color = app.utils.getColor(beacon)
					}
					
					//Set the closest and second closest beacons
					if(nearestBeacon == undefined)
					{
						nearestBeacon = beacon;
					}
					else if(secondNearestBeacon == undefined)
					{
						secondNearestBeacon = beacon;
					}
					else if(nearestBeacon.distance > beacon.distance)
					{
						nearestBeacon = beacon;
					}
					else if(secondNearestBeacon.distance > beacon.distance)
					{
						secondNearestBeacon = beacon;
					}
			}
		});
		
		this.calculateLocation(nearestBeacon, secondNearestBeacon);
	},
	
	calculateLocation: function(nearestBeacon, secondNearestBeacon){
		//Do our MOTHAFUCKING CALCULATIONS
	}
};

app.main.initialize();
