/**
 * @file copyToClipboard.ts
 * @description Provides a cross-browser utility to copy text to the user's clipboard.
 * It uses the modern `navigator.clipboard` API with a fallback to a legacy `execCommand` method for older browsers.
 */

/**
 * Copies the given string to the clipboard using a fallback method involving a textarea element.
 * This method is used when the modern `navigator.clipboard.writeText` API is not available or fails.
 * @param str The string to copy to the clipboard.
 */
const copyToClipboardRaw = (str: string) => {
	const el = document.createElement('textarea'); // Create a <textarea> element
	el.value = str; // Set its value to the string that you want copied
	el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
	el.style.position = 'absolute';
	el.style.left = '-9999px'; // Move outside the screen to make it invisible
	document.body.appendChild(el); // Append the <textarea> element to the HTML document
	const selected =
		(document.getSelection() as any).rangeCount > 0 // Check if there is any content selected previously
			? (document.getSelection() as any).getRangeAt(0) // Store selection if found
			: false; // Mark as false to know no selection existed before
	el.select(); // Select the <textarea> content
	document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
	document.body.removeChild(el); // Remove the <textarea> element
	if (selected) {
		// If a selection existed before copying
		(document.getSelection() as any).removeAllRanges(); // Unselect everything on the HTML document
		(document.getSelection() as any).addRange(selected); // Restore the original selection
	}
};

/**
 * Copies the given text to the clipboard.
 * It attempts to use the modern `navigator.clipboard.writeText` API first.
 * If that fails or is not available, it falls back to a method that uses a temporary textarea element.
 * @param text The text to be copied to the clipboard.
 */
const copyToClipBoard = function (text: string) {
	try {
		if (navigator.clipboard != undefined) {
			//Chrome
			navigator.clipboard.writeText(text).then(
				function () {},
				function (err) {
					copyToClipboardRaw(text);
				}
			);
		} else if ((window as any).clipboardData) {
			// Internet Explorer
			(window as any).clipboardData.setData('Text', text);
		} else {
			copyToClipboardRaw(text);
		}
	} catch (ex) {
		copyToClipboardRaw(text);
	}
};

export default copyToClipBoard;
