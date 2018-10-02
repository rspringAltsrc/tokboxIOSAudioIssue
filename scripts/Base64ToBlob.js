(function (window) {
	'use strict';


	window.Base64Manager = new function () {
		var self = this;

		self.ToBlob = function (base64, mime) {
			mime = mime || '';
			var sliceSize = 1024;
			var byteChars = window.atob(base64);
			var byteArrays = [];

			for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
				var slice = byteChars.slice(offset, offset + sliceSize);

				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				var byteArray = new Uint8Array(byteNumbers);

				byteArrays.push(byteArray);
			}

			return new Blob(byteArrays, { type: mime });
		};

		return self;

	}();

})(window);

	
