# JavaScript Virtual Keyboard

### Intro
The idea of this small library came from the lack of the ability to call the on-screen keyboard on some Smart TVs or STB. For example, when you want to make a search or something in your application.

------------
### Structure
The library is written on pure JavaScript, so it does not require any side libraries (like jQuery). The library is not using any ES6+ features, because some Smart TVs or STB have old browsers, which do not support modern standarts.
The library consists of the main script file `virtual_keyboard.js` and the stylesheet file `virtual_keyboard.css` (see `/src` folder).
In addition there must be at least one keyboard layout file. Currently there are 2 layouts available - English and Russian (`virtual_keyboard_layout_eng.js` and `virtual_keyboard_layout_rus.js`). If necessary, you can add your own layout based on these.
The keyboard is controlled by buttons (physical keyboard or remote controller). Also there is a mouse support for control.

------------
### Basic usage
First of all, include a main script, stylesheet and layout files to your application:

    <link rel="stylesheet" href="src/virtual_keyboard.css">
    <script src="src/virtual_keyboard.js"></script>
    <script src="src/virtual_keyboard_layout_eng.js"></script>
    <script src="src/virtual_keyboard_layout_rus.js"></script>

Then initialize the keyboard in your application. In the library the main object is `VirtualKeyboard`. You should create a new object, based on it. Then you should call the `init()` method to setup the keyboard. And finally use `show()` method to show created keyboard. Look at the sample below:

    // Creating a new keyboard object
    var newKeyboard = Object.create(VirtualKeyboard);

    // Initialize a keyboard
    newKeyboard.init({
        templates: [VirtualKeyboardLayoutEnglish, VirtualKeyboardLayoutRussian],
        navigationKeys: {
            ENTER: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            EXIT: 8
        },
       onEnter: function(value) {
           console.log('Keyboard ENTER with value: ' + value);
       },
       onCancel: function(value) {
           console.log('Keyboard CANCEL with value: ' + value);
       }
    });

    // Showing a keyboard
    newKeyboard.show();

You can also try to run the example from a file `sample/index.html`.

------------
### Configuration
Full configuration is showing below (`init()` method parameters):

	newKeyboard.init({

		// List of templates, you can use as much as you can (there must be at least one) - mandatory!
		templates: [VirtualKeyboardLayoutEnglish, VirtualKeyboardLayoutRussian],
		
		// Custom title - optional.
		title: 'My title',
		
		// Initial input text - optional.
		inputText: 'Some input text',
		
		// Container to which the keyboard will be append - optional.
		viewContainer: document.body,
		
		// Keycodes of buttons for navigation - optional.
		navigationKeys: {
			ENTER: 13,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			EXIT: 8
		},
		
		// OnEnter-callback - optional.
		onEnter: function(value) {
			console.log('Keyboard ENTER with value: ' + value);
		},
		
		// OnCancel-callback - optional.
		onCancel: function(value) {
			console.log('Keyboard CANCEL with value: ' + value);
		}

	});

Only the `templates` parameter is mandatory.

------------
### License
See `LICENSE.txt` file.