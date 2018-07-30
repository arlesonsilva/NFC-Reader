var app = {
	// Application constructor
	initialize: function() {
		this.bindEvents();
		console.log("Starting NFC app");
	},

	/*
          bind any events that are required on startup to listeners:
	*/
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.getElementById('scan').addEventListener('click', this.scan, false);
	},

	onDeviceReady: function() {
		
		//app.clear();

		if (device.platform == "Android") {
			
			nfc.addTagDiscoveredListener(
				app.onNonNdef, // tag successfully scanned 
				function (status) { // listener successfully initialized
		       		//app.display("Listening for NFC tags.");
		       		console.log("Listening for NFC tags.");
		       	},
				function (error) { // listener fails to initialize 
					app.display("NFC reader failed to initialize " + JSON.stringify(error));
		       	}
		    );
			
			nfc.addNdefFormatableListener(
				app.onNonNdef, // tag successfully scanned
				function (status) { // listener successfully initialized 
					//app.display("Listening for NDEF Formatable tags.");
					console.log("Listening for NDEF Formatable tags.");
				},
				function (error) { // listener fails to initialize
		      		app.display("NFC reader failed to initialize " + JSON.stringify(error));
				}
			);

			nfc.addNdefListener(
				app.onNfc, // tag successfully scanned 
				function (status) { // listener successfully initialized
		      		//app.display("Listening for NDEF messages.");
		      		console.log("Listening for NDEF messages.");
		   		},
				function (error) { // listener fails to initialize 
					app.display("NFC reader failed to initialize " + JSON.stringify(error));
				}
			);

			nfc.addMimeTypeListener( 
				"text/plain", 
				app.onNfc, // tag successfully scanned
				function (status) { // listener successfully initialized
					app.display(" ");
					app.display("Listening for plain text MIME Types.");
		        },
				function (error) { // listener fails to initialize 
					app.display("NFC reader failed to initialize " + JSON.stringify(error));
		        }
			);

		}

		app.display("Tap a tag to read data.");

	},

	/*
        appends @message to the message div:
	*/
	display: function(message) {
		var label = document.createTextNode(message),
		    lineBreak = document.createElement("br");
		messageDiv.appendChild(lineBreak);
		messageDiv.appendChild(label);
	},

	/*
	   clears the message div:
	*/
	clear: function() { 
		messageDiv.innerHTML = "";
	},

	/*
	          Process NDEF tag data from the nfcEvent
	*/
	onNfc: function(nfcEvent) {
		app.clear(); // clear the message div
		
		// display the event type:
		//app.display(" Event Type: " + nfcEvent.type); 
		app.showTag(nfcEvent.tag); // display the tag details

		navigator.vibrate(100);
	},

	/*
	          Process non-NDEF tag data from the nfcEvent
	          This includes
	           * Non NDEF NFC Tags
	           * NDEF-Formatable Tags
	           * Mifare Classic Tags on Nexus 4, Samsung S4
	           (because Broadcom doesn't support Mifare Classic)
	*/
	onNonNdef: function(nfcEvent) {
		app.clear(); // clear the message div
		
		// display the event type:
		app.display("Event Type: " + nfcEvent.type);
		var tag = nfcEvent.tag;
		app.display("Tag ID: " + nfc.bytesToHexString(tag.id)); 
		//app.display("Tech Types: ");
		for (var i = 0; i < tag.techTypes.length; i++) {
	        //app.display("  * " + tag.techTypes[i]);
	    }

	    navigator.vibrate(100);
	},

	/*
	       writes @tag to the message div:
	*/
	showTag: function(tag) {
		// display the tag properties:
		
		//app.display("Tag ID: " + nfc.bytesToHexString(tag.id)); 
		//app.display("Tag Type: " + tag.type);
		//app.display("Max Size: " + tag.maxSize + " bytes"); 
		//app.display("Is Writable: " + tag.isWritable); 
		//app.display("Can Make Read Only: " + tag.canMakeReadOnly);

		// if there is an NDEF message on the tag, display it:
		var thisMessage = tag.ndefMessage;
		if (thisMessage !== null) {
	        // get and display the NDEF record count:
	        //app.display("Tag has NDEF message with " + thisMessage.length + " record" + (thisMessage.length === 1 ? ".":"s."));
	        app.display("Message Contents: ");
	        app.showMessage(thisMessage);
	    }
	},

	/*
    	iterates over the records in an NDEF message to display them:
	*/
	showMessage: function(message) { 
		for (var thisRecord in message) {
    		// get the next record in the message array:
			var record = message[thisRecord];
			app.showRecord(record); // show it
		} 
	},

	/*
    	writes @record to the message div:
	*/
	showRecord: function(record) {
		// display the TNF, Type, and ID:
		app.display(" ");
		//app.display("TNF: " + record.tnf);
		//app.display("Type: " + nfc.bytesToString(record.type)); 
		
		// read apenas se for msg de texto
		if (nfc.bytesToString(record.type) === "T") { 
			//app.display("ID: " + nfc.bytesToString(record.id));
			// if the payload is a Smart Poster, it's an NDEF message. 
			// read it and display it (recursion is your friend here):
			if (nfc.bytesToString(record.type) === "Sp") {
				var ndefMessage = ndef.decodeMessage(record.payload); 
				app.showMessage(ndefMessage);
			// if the payload's not a Smart Poster, display it:
			} else {
				app.display("Text Plain: " + nfc.bytesToString(record.payload));
				var cd_setor = nfc.bytesToString(record.payload).replace(/[^0-9\.]+/g, '');
				document.getElementById("cd_setor").value = cd_setor;
				app.valida_setor_preenchido(cd_setor);
			}
		}	
	},

	valida_setor_preenchido: function(setor) {
		if (setor != "") {
			alert("Código do banheiro: " + setor);
		}
	},

	scan: function() {
        console.log('scanning');
        
        if (device.platform == "Android" || device.platform == "iOS") {
	  		cordova.plugins.barcodeScanner.scan(
				function (result) {
					alert("We got a barcode\n" +
					    "Result: " + result.text + "\n" +
					    "Format: " + result.format + "\n" +
					    "Cancelled: " + result.cancelled);
				},
				function (error) {
					alert("Scanning failed: " + error);
				},
				{
					preferFrontCamera : true, // iOS and Android
					showFlipCameraButton : true, // iOS and Android
					showTorchButton : true, // iOS and Android
					torchOn: true, // Android, launch with the torch switched on (if available)
					saveHistory: true, // Android, save scan history (default false)
					prompt : "Place a barcode inside the scan area", // Android
					resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
					formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
					orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
					disableAnimations : true, // iOS
					disableSuccessBeep: false // iOS and Android
				}
			);
	  //       var scanner = cordova.plugins.barcodeScanner;

	  //       scanner.scan( 
	  //       	function (result) {
			// 		alert("We got a barcode\n" +
			// 		    "Result: " + result.text + "\n" +
			// 		    "Format: " + result.format + "\n" +
			// 		    "Cancelled: " + result.cancelled);
			// 	},
			// 	function (error) {
			// 		alert("Scanning failed: " + error);
			// 	},
			// 	{
			// 		preferFrontCamera : true, // iOS and Android
			// 		showFlipCameraButton : true, // iOS and Android
			// 		showTorchButton : true, // iOS and Android
			// 		torchOn: true, // Android, launch with the torch switched on (if available)
			// 		saveHistory: true, // Android, save scan history (default false)
			// 		prompt : "Place a barcode inside the scan area", // Android
			// 		resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
			// 		formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
			// 		orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
			// 		disableAnimations : true, // iOS
			// 		disableSuccessBeep: false // iOS and Android
			// 	}
			// );
	    }
    }

};

