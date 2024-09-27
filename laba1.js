const form = document.getElementById("form");
const result = document.getElementById("result");
const colorValues = document.getElementById("color-values");
const imageInfo = document.getElementById("image-info");
let imageElement; // Define imageElement outside event listener scope
let image;

form.addEventListener("change", (e) => {
	image = e.target.files[0];

	if (image) {
		const reader = new FileReader();

		reader.onload = () => {
			if (imageElement) {
				result.removeChild(imageElement); // Remove previous image if exists
			}

			imageElement = new Image();
			imageElement.src = reader.result;

			imageElement.onload = () => {
				result.innerHTML = ""; // Clear previous content
				result.appendChild(imageElement);

				// Display image information
				displayImageInfo();

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				canvas.width = imageElement.width;
				canvas.height = imageElement.height;
				ctx.drawImage(imageElement, 0, 0);

				document.body.appendChild(canvas); // Append the canvas to the document body

				canvas.addEventListener("mousemove", (e) => {
					const rect = canvas.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const y = e.clientY - rect.top;
					const pixel = ctx.getImageData(x, y, 1, 1).data;

					const rgb = `RGB: ${pixel[0]}, ${pixel[1]}, ${pixel[2]}`;
					const cmyk = `CMYK: ${calculateCMYK(pixel[0], pixel[1], pixel[2])}`;
					const hsl = `HSL: ${calculateHSL(pixel[0], pixel[1], pixel[2])}`;
					const lab = `LAB: ${calculateLAB(pixel[0], pixel[1], pixel[2])}`;
					const hsv = `HSV: ${calculateHSV(pixel[0], pixel[1], pixel[2])}`;
					const ycbcr = `YCbCr: ${calculateYCbCr(pixel[0], pixel[1], pixel[2])}`;

					colorValues.innerHTML = `${rgb}<br>${cmyk}<br>${hsl}<br>${lab}<br>${hsv}<br>${ycbcr}`;
				});
			};
		};

		reader.readAsDataURL(image);
	}
});

// Function to display image information
const displayImageInfo = () => {
	const fileSize = (image.size / 1024).toFixed(2) + " KB";
	const resolution = imageElement.width + "x" + imageElement.height;
	const depth = "24 bit"; // Assuming 24-bit depth in this example
	const format = image.type;
	const colorModel = "RGB"; // Assuming RGB color model in this example

	const imageDetails = `File Size: ${fileSize}<br>Resolution: ${resolution}<br>Depth: ${depth}<br>Format: ${format}<br>Color Model: ${colorModel}`;
	imageInfo.innerHTML = imageDetails;
};


function calculateCMYK(r, g, b) {
	const c = 1 - r / 255;
	const m = 1 - g / 255;
	const y = 1 - b / 255;
	const k = Math.min(c, m, y);
	const cyan = ((c - k) / (1 - k)).toFixed(2);
	const magenta = ((m - k) / (1 - k)).toFixed(2);
	const yellow = ((y - k) / (1 - k)).toFixed(2);
	const black = (k).toFixed(2);
	return `${cyan}, ${magenta}, ${yellow}, ${black}`;
}

function calculateHSL(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;
	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
		case r:
			h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
			break;
		case g:
			h = ((b - r) / d + 2) / 6;
			break;
		case b:
			h = ((r - g) / d + 4) / 6;
			break;
		}
	}
	h = Math.round(h * 360);
	s = Math.round(s * 100);
	l = Math.round(l * 100);
	return `${h}, ${s}%, ${l}%`;
}

function calculateLAB(r, g, b) {
	// Convert RGB to XYZ
	let x, y, z;
	r /= 255;
	g /= 255;
	b /= 255;
	if (r > 0.04045) {
		r = Math.pow(((r + 0.055) / 1.055), 2.4);
	} else {
		r = r / 12.92;
	}
	if (g > 0.04045) {
		g = Math.pow(((g + 0.055) / 1.055), 2.4);
	} else {
		g = g / 12.92;
	}
	if (b > 0.04045) {
		b = Math.pow(((b + 0.055) / 1.055), 2.4);
	} else {
		b = b / 12.92;
	}
	r *= 100;
	g *= 100;
	b *= 100;
	x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
	y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
	z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

	// Convert XYZ to LAB
	x /= 95.047;
	y /= 100.000;
	z /= 108.883;
	if (x > 0.008856) {
		x = Math.pow(x, 1 / 3);
	} else {
		x = (7.787 * x) + (16 / 116);
	}
	if (y > 0.008856) {
		y = Math.pow(y, 1 / 3);
	} else {
		y = (7.787 * y) + (16 / 116);
	}
	if (z > 0.008856) {
		z = Math.pow(z, 1 / 3);
	} else {
		z = (7.787 * z) + (16 / 116);
	}
	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const bVal = 200 * (y - z);

	return `${l.toFixed(2)}, ${a.toFixed(2)}, ${bVal.toFixed(2)}`;
}

function calculateHSV(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h, s, v = max;
	const d = max - min;
	s = max === 0 ? 0 : d / max;
	if (max === min) {
		h = 0; // achromatic
	} else {
		switch (max) {
		case r:
			h = (g - b) / d + (g < b ? 6 : 0);
			break;
		case g:
			h = (b - r) / d + 2;
			break;
		case b:
			h = (r - g) / d + 4;
			break;
		}
		h /= 6;
	}
	h = Math.round(h * 360);
	s = Math.round(s * 100);
	v = Math.round(v * 100);
	return `${h}, ${s}%, ${v}%`;
}

function calculateYCbCr(r, g, b) {
	const y = 0.299 * r + 0.587 * g + 0.114 * b;
	const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
	const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
	return `${y.toFixed(2)}, ${cb.toFixed(2)}, ${cr.toFixed(2)}`;
}