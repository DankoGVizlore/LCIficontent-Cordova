/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        navigator.splashscreen.show();
        

        fixHeight();

		var dev_uuid = window.device.uuid;
        setDevId(dev_uuid);
		
        // google analytics start working
        //https://github.com/danwilson/google-analytics-plugin
        /*
        analytics.startTrackerWithId('UA-52741747-1');
        analytics.trackView('Home');
        */
        // google analytics end
        
		// https://github.com/ManRueda/org.apache.cordova.wifiinfo.

		
	   /* start https://github.com/phonegap-build/PushPlugin*/
	    
        pushNotification = window.plugins.pushNotification;
        
        
        function onNotification(e) {

            switch( e.event )
            {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                	alert('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                    // Your GCM push server needs to know the regID before it can push to this device
                    // here is where you might want to send it the regID for later use.
                    alert("regID = " + e.regid);
                }
            break;

            case 'message':

            	alert( e.payload.message + ' - ' + e.payload.msgcnt);

            break;

            case 'error':
            	alert(e.msg );
            break;

            default:
            	
            break;
          }
        }
        
        
        function errorHandler (error) {
            //alert('error = ' + error);
        }
        
        function successHandler (result) {
            //alert('result = ' + result);
        }
        
        if ( window.device.platform == 'android' || window.device.platform == 'Android' || window.device.platform == "amazon-fireos" ){
        	/*pushNotification.unregister(successHandler, errorHandler);*/
        	
            pushNotification.register(
            successHandler,
            errorHandler,
            {
                "senderID":"386757256643",
                "ecb":"onNotification"
            });
           
        } else {
        	//alert('window.device.platform = else');
        } 
        /* end PushPlugin*/

		var firstStart = true;
		var position_data;
		var watchID;
		var onSuccess = function(position) {
			if (firstStart == true ){
				deviceReady(position.coords.latitude, position.coords.longitude);
				firstStart = false;
			}
		   
			SendCoordinatesToJSON(position);
		};
		
		// onError Callback receives a PositionError object
		var onError = function(error) {
			var r = confirm("Turn on GPS and click OK!");
			if (r == true) {
				navigator.geolocation.clearWatch(watchID);
				initWatchPosition();
			} else {
				navigator.geolocation.clearWatch(watchID);
				navigator.app.exitApp();
			} 
		    /*alert('code: '    + error.code    + '\n' +
		          'message: ' + error.message + '\n');*/
		};
		
		// cordova plugin add org.apache.cordova.geolocation
		function initWatchPosition() {
			try {
				//navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true });
				var options = { enableHighAccuracy: true };
				watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
			} 
			catch (err) {
				alert("Please turn ON your GPS reciver.");
			}
		}
		initWatchPosition();
		
		var pack = [];
		function SendCoordinatesToJSON(position) {
			var SSID = '',
				BSSID = '';

			var net = window.wifi.networks;
			for (i in net) {
				var n = net[i];
				SSID += n['SSID'] + '\r\n';
				BSSID += n['BSSID'] + '\r\n';
			}

			var date = new Date(position.timestamp);
			var isoDate = date.toISOString(); 
			
			var element = {
							DevId: dev_uuid,
							SSID: SSID,
							BSSID: BSSID,
							Lat: position.coords.latitude, 
							Lon: position.coords.longitude,
							Alt: position.coords.altitude,
							Acc: position.coords.accuracy,
							Speed: position.coords.speed,
							Time: isoDate
						};
			pack.push(element);			
		}
		
		function SendToServerInterval() {
			if (pack.length != 0) {
				//alert(JSON.stringify(pack));
				SendToServer(JSON.stringify(pack));		
				pack = [];
			}
		}
		
		setInterval(SendToServerInterval, 30000);
		
	    function SendToServer(user_data) {
	    	$.ajax({
		        type: 'POST',
		        data:  {data: user_data},
		        url: 'http://lacitadelleingficontent.appspot.com/data',
		        success: function(data){
		            //alert("Data from server: ");
		        },
		        error: function(){
		            alert('There was an error with getting data from server!');
		        }
		    });
	    }
    },
    // Log on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

