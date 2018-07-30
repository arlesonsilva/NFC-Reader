(function() {
	
	document.addEventListener("deviceready", onDeviceReady, false);
	console.log("Starting NFC app");

	function onDeviceReady() {
		
		if (device.platform == "Android") {

			nfc.addTagDiscoveredListener(
				onNonNdef, // tag successfully scanned 
				function (status) { // listener successfully initialized
		       		console.log("Listening for NFC tags.");
		       	},
				function (error) { // listener fails to initialize 
					console.log("NFC reader failed to initialize " + JSON.stringify(error));
		       	}
		    );
			
			nfc.addNdefFormatableListener(
				onNonNdef, // tag successfully scanned
				function (status) { // listener successfully initialized 
					console.log("Listening for NDEF Formatable tags.");
				},
				function (error) { // listener fails to initialize
		      		console.log("NFC reader failed to initialize " + JSON.stringify(error));
				}
			);

			nfc.addNdefListener(
				onNfc, // tag successfully scanned 
				function (status) { // listener successfully initialized
		      		console.log("Listening for NDEF messages.");
		   		},
				function (error) { // listener fails to initialize 
					console.log("NFC reader failed to initialize " + JSON.stringify(error));
				}
			);

			nfc.addMimeTypeListener( 
				"text/plain", 
				onNfc, // tag successfully scanned
				function (status) { // listener successfully initialized
					//display(" ");
					console.log("Listening for plain text MIME Types.");
		        },
				function (error) { // listener fails to initialize 
					console.log("NFC reader failed to initialize " + JSON.stringify(error));
		        }
			);

		}

	}

	//display("Tap a tag to read data.");

})();

function display (message) {
	var label = document.createTextNode(message),
	    lineBreak = document.createElement("br");
	messageDiv.appendChild(lineBreak);
	messageDiv.appendChild(label);	
}

function clear () { 
	messageDiv.innerHTML = "";
}

function onNfc (nfcEvent) {
	clear(); // clear the message div
	showTag(nfcEvent.tag); // display the tag details
	navigator.vibrate(100);
}

function offNfc (nfcEvent) {
	clear(); // clear the message div
	showTag("Remove o listener de eventos registrado anteriormente adicionado via nfc.addMimeTypeListener."); // display the tag details
}

function onNonNdef (nfcEvent) {
	clear(); // clear the message div com.example.hello
	display("Event Type: " + nfcEvent.type);
	var tag = nfcEvent.tag;
	display("Tag ID: " + nfc.bytesToHexString(tag.id)); 
	for (var i = 0; i < tag.techTypes.length; i++) {
        display("  * " + tag.techTypes[i]);
    }

    navigator.vibrate(100);
}

function showTag (tag) {
	var thisMessage = tag.ndefMessage;
	if (thisMessage !== null) {
        //.display("Tag has NDEF message with " + thisMessage.length + " record" + (thisMessage.length === 1 ? ".":"s."));
        display("Message Contents: ");
        showMessage(thisMessage);
    }
}

function showMessage (message) { 
	for (var thisRecord in message) {
		var record = message[thisRecord];
		showRecord(record); // show it
	}
}

function showRecord (record) {
	display(" ");
	if (nfc.bytesToString(record.type) === "T") { 
		if (nfc.bytesToString(record.type) === "Sp") {
			var ndefMessage = ndef.decodeMessage(record.payload); 
			app.showMessage(ndefMessage);
		} else {
			display("Text Plain: " + nfc.bytesToString(record.payload));
			var cd_setor = nfc.bytesToString(record.payload).replace(/[^0-9\.]+/g, '');
			document.getElementById("cd_setor").value = cd_setor;
			valida_setor_preenchido(cd_setor);
		}
	}	
};

function valida_setor_preenchido (setor) {
	if (setor != "") {
		alert("Código do banheiro: " + setor);
	}
};

function scan() {
    console.log("scanning barcode/QR_CODE");
    
    if (device.platform == "Android" || device.platform == "iOS") {
  		cordova.plugins.barcodeScanner.scan(
			function (result) {
				var cd_setor = result.text.replace(/[^0-9\.]+/g, '');
				document.getElementById("cd_setor").value = cd_setor;
				valida_setor_preenchido(cd_setor);				
				// "Cancelled: " + result.cancelled);
			},
			function (error) {
				alert("Scanning failed: " + error);
			},
			{
			//  preferFrontCamera : true, // iOS and Android
			 	showFlipCameraButton : true, // iOS and Android
			 	showTorchButton : true, // iOS and Android
			// 	torchOn: true, // Android, launch with the torch switched on (if available)
			// 	saveHistory: true, // Android, save scan history (default false)
			 	prompt : "Place a barcode inside the scan area", // Android
			// 	resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
			// 	formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
				orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
			// 	disableAnimations : true, // iOS
			// 	disableSuccessBeep: false // iOS and Android
			}
		);
	}	
  
}
