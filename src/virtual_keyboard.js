'use strict';

var VirtualKeyboard = {
    
    /**
     * A function for initialize the keyboard
     * 
     * @param {object} options - input parameters for initialize
     */
    init: function(options) {

        if (document.querySelector('.virtual_keyboard_container') !== null) {
            throw 'Another keyboard already exists! Please deinitialize it first!';
        }

        // Checking the existence of templates in input data
        if (typeof options.templates === 'undefined' || options.templates.length === 0) {
            throw 'You must define language templates first!';
        }
       
        // Handling an input data
        this.templatesList = options.templates; // Full list of templates
        this.titleText = options.title || null; // Title
        this.inputText = options.inputText || null; // Input text
        this.onEnter = options.onEnter || function(value) { console.log(value) }; // On ENTER callback
        this.onCancel = options.onCancel || function(value) { console.log(value) }; // On Cancel callback
        this.viewContainer = options.viewContainer || document.body; // Where to push keyboard
        this.navigationKeys = options.navigationKeys; // Navigation buttons

        // Containers
        this.keyboardContainer = null; // Keyboard container data
        this.inputContainer = null; // Input container
        this.titleContainer = null; // Title container
        this.buttonsContainer = null; // Buttons container

        // Active button data
        this.activeButton = {
            x: 0, // x coordinate
            y: 0, // y coordinate
            element: null, // Element
            value: null // Value
        };

        // Active layout's data
        this.layout = {
            index: 0, // Current index of active template in a full list
            template: null, // Current template
            active: null, // Current layout to render
            previous: null, // Previous layout (for returning back from symbol layout)
            letters: [null, null], // List of layouts with letter (lower and upper)
            symbols: null, // List of symbol layout
        };

        // Getting necessary data of active layout
        this.layout = this.getActiveLayout(this.templatesList, this.layout.index);

    },

    /**
     * A function for getting an active template data
     * 
     * @param {object} list - array of templates
     * @param {number} index - index of an active template
     */
    getActiveLayout: function(list, index) {

        // Shifting an index to the beginnings, if it reached the end
        index = (index > list.length - 1) ? 0 : index;

        // Checking the correctness of templates
        var template = list[index];
        if (typeof template === 'undefined') {
            throw 'Please, entering a CORRECT or EXISTING name of template!';
        }

        // Defining nested layouts
        var lettersLower = template.hasOwnProperty('lower') ? template['lower'] : null;
        var lettersUpper = template.hasOwnProperty('upper') ? template['upper'] : null;
        var symbols = template.hasOwnProperty('symbols') ? template['symbols'] : null;

        // Selecting the active layout
        var active = lettersLower || lettersUpper || null;

        // Checking the existence of a lower or upper layouts
        if (active === null) {
            throw 'There is no LOWER or UPPER template for language layout!';
        }

        // Returning layout data
        return {
            index: index,
            template: template,
            active: active,
            previous: null,
            letters: [lettersLower, lettersUpper],
            symbols: symbols,
        };

    },

    /**
     * A function for toggle the CAPS
     */
    toggleCaps: function() {

        // Getting an index of the active layout in upper-lower layout list
        var index = this.layout.letters.indexOf(this.layout.active);

        // If an index can not be got (for example, working with symbols layout)
        if (index === -1) {
            return false;
        }

        // Getting a new index (0 or 1), based on current index
        index = (index === 0) ? 1 : 0;

        // If there's no layout with this index
        if (this.layout.letters[index] === null) {
            return false;
        }
        
        // Getting a new active layout
        this.layout.active = this.layout.letters[index];

        return true;
    },

    /**
     * A function for showing the keyboard
     */
    show: function() {

        // Creating keyboard container, if it's not exist
        if (this.keyboardContainer === null) {
            this.create();
        }

        // Drawing keyboard
        this.render(this.layout.active);

        // Focus on input field
        this.inputContainer.focus();

    },

    /**
     * A function for creating keyboard's elements
     */
    create: function() {

        // Creating main keyboard container
        this.keyboardContainer = this.createElementForKeyboard('container', null);
        this.viewContainer.appendChild(this.keyboardContainer);
        this.keyboardContainer.addEventListener('keydown', this.buttonPressHandler.bind(this));

        // Creating title field
        this.titleContainer = this.createElementForKeyboard('title_container', null);
        this.titleContainer.innerHTML = (typeof this.titleText === 'string')
            ? this.titleText
            : 'Enter something interesting, please';
        this.keyboardContainer.appendChild(this.titleContainer);

        // Creating input field
        this.inputContainer = document.createElement('input');
        this.inputContainer.setAttribute('type', 'text');
        this.inputContainer.className = 'virtual_keyboard_input_container';
        this.inputContainer.addEventListener('blur', function() { this.focus(); });
        this.inputContainer.value = (typeof this.inputText === 'string') ? this.inputText : '';
        this.keyboardContainer.appendChild(this.inputContainer);
        
        // Creating buttons container
        this.buttonsContainer = this.createElementForKeyboard('buttons_container', null);
        this.keyboardContainer.appendChild(this.buttonsContainer);

    },

    /**
     * A function for removing the keyboard
     */
    destroy: function() {

        // Removing input container
        this.inputContainer.parentElement.removeChild(this.inputContainer);
        this.inputContainer = null;

        // Removing title container
        this.titleContainer.parentElement.removeChild(this.titleContainer);
        this.titleContainer = null;

        // Removing buttons container
        this.buttonsContainer.parentElement.removeChild(this.buttonsContainer);
        this.buttonsContainer = null;

        // Removing main keyboard container
        this.keyboardContainer.parentElement.removeChild(this.keyboardContainer);
        this.keyboardContainer = null; 
        
    },

    /**
     * A function for rendering layout template
     * 
     * @param {object} layout - input template
     */
    render: function(layout) {

        // Clearing previous template
        this.buttonsContainer.innerHTML = '';

        // Forming new template
        for (var i = 0; i < layout.length; i += 1) { // Going through the rows

            // Creating a row and appending it to the container
            var row = layout[i];
            var rowElement = this.createElementForKeyboard('row', null);
            this.buttonsContainer.appendChild(rowElement);

            for (var j = 0; j < row.length; j += 1) { // Going through the columns (buttons)

                // Creating a button and appending it to the row
                var button = row[j];
                var buttonElement = this.createElementForKeyboard('button', [
                    'virtual_keyboard_button_length_' + button.size,
                    'virtual_keyboard_button_color_' + button.color,
                    'x_' + j + '_y_' + i
                ]);

                buttonElement.innerHTML = button.text; // Button text

                // Adding listeners on button
                buttonElement.addEventListener(
                    'click', this.buttonClickHandler.bind(this, {x: j, y: i}, button.value)
                );
                buttonElement.addEventListener(
                    'mouseover', this.buttonMouseoverHandling.bind(this, {x: j, y: i})
                );

                rowElement.appendChild(buttonElement);

            }

        }

        // Selecting first active button
        this.selectButton(this.activeButton.x, this.activeButton.y);

    },

    /**
     * A function for click handling
     * 
     * @param {object} coordinates - current coordinates of a button
     * @param {string} value - current value of a button
     */
    buttonClickHandler: function(coordinates, value, event) {

        // Adding focus to button
        this.selectButton(coordinates.x, coordinates.y);

        // Reading the value of a button
        this.pressButton(value);

    },

    /**
     * A function for mouseover handling
     * 
     * @param {object} coordinates - current coordinates of a button
     */
    buttonMouseoverHandling: function(coordinates) {

        // Adding focus to button
        this.selectButton(coordinates.x, coordinates.y);

    },

    /**
     * A function for keydown handling
     * 
     * @param {object} event - current event
     */
    buttonPressHandler: function(event) {

        // Stopping event propagation, in case if there's some other listener exist
        event.stopPropagation();

        // Handling input keys
        switch(event.keyCode) {
            case this.navigationKeys.ENTER:
                this.pressButton(this.activeButton.value);
                break;
            case this.navigationKeys.LEFT:
                event.preventDefault();
                this.moveLeftRight('left');
                break;
            case this.navigationKeys.UP:
                event.preventDefault();
                this.moveUpDown('up');
                break;
            case this.navigationKeys.RIGHT:
                event.preventDefault();
                this.moveLeftRight('right');
                break;
            case this.navigationKeys.DOWN:
                event.preventDefault();
                this.moveUpDown('down');
                break;
            case this.navigationKeys.EXIT:
                this.onCancel(this.inputContainer.value);
                this.destroy();
                break;
        }

    },

    /**
     * A function for moving active button to LEFT or RIGHT
     * 
     * @param {string} direction - left or right direction
     */
    moveLeftRight: function(direction) {

        // Some data to handle with
        var x = this.activeButton.x;
        var y = this.activeButton.y;
        var layout = this.layout.active;

        // Defining a new X coordinate, based on direction
        switch(direction) {
            case 'left':
                x = (--x < 0) ? layout[y].length - 1 : x;
                break;
            case 'right':
                x = (++x > layout[y].length - 1) ? 0 : x;
                break;
        }

        // Selecting a new active button
        this.selectButton(x, y);

    },

    /**
     * A function for moving active button to UP or DOWN
     * 
     * @param {string} direction - up or down direction
     */
    moveUpDown: function(direction) {

        // Some data to handle with
        var x = this.activeButton.x;
        var y = this.activeButton.y;
        var layout = this.layout.active;
        
        // Calculating the row size before the active button
        var currentRow = layout[y];
        var currentRowLength = 0;
        for (var i = 0; i <= x; i += 1) {
            currentRowLength += currentRow[i].size;
        }

        // Defining a new Y coordinate, based on direction
        switch(direction) {
            case 'up':
                y = (--y < 0) ? layout.length - 1 : y;
                break;
            case 'down':
                y = (++y > layout.length - 1) ? 0 : y;
                break;
        }

        // Defining a new X coordinate, considering sizes of next row's buttons
        var nextRow = layout[y];
        var nextRowLength = 0
        for (var j = 0; j <= nextRow.length; j += 1) {
            nextRowLength += nextRow[j].size;
            if (currentRowLength <= nextRowLength) {
                x = j;
                break;
            }
        }

        // Selecting a new active button
        this.selectButton(x, y);

    },

    /**
     * A function for handling with chosen button
     * 
     * @param {string} value - the value of the button
     */
    pressButton: function(value) {

        // Looking at button value
        switch(value) {
            case 'backspace':
                this.removeCharacter(this.inputContainer);
                break;
            case 'clear':
                this.inputContainer.value = '';
                break;
            case 'enter':
                this.onEnter(this.inputContainer.value);
                this.destroy();
                break;
            case 'cancel':
                this.onCancel(this.inputContainer.value);
                this.destroy();
                break;
            case 'lang':
                this.layout = this.getActiveLayout(this.templatesList, this.layout.index + 1);
                this.render(this.layout.active);
                break;
            case 'symbols':
                if (this.layout.symbols !== null) {
                    this.layout.previous = this.layout.active;
                    this.layout.active = this.layout.symbols;
                }
                this.render(this.layout.active);
                break;
            case 'letters':
                this.layout.active = this.layout.previous;
                this.render(this.layout.active);
                break;
            case 'caps':
                if (this.toggleCaps()) {
                    this.render(this.layout.active);
                }
                break;
            case 'cursor_left':
                this.moveCaret(this.inputContainer, -1);
                break;
            case 'cursor_right':
                this.moveCaret(this.inputContainer, 1);
                break;
            default:
                this.insertCharacter(this.inputContainer, value);
        }

    },

    /**
     * A function for choosing a new active button
     * 
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    selectButton: function(x, y) {

        // Removing a focus from an active button, if it exists
        if (this.activeButton.element !== null) {
            this.addRemoveFocus(this.activeButton.element, 'remove');
        }

        // Defining parameters of a new active button
        this.activeButton.x = x;
        this.activeButton.y = y;
        this.activeButton.value = this.layout.active[y][x].value;
        this.activeButton.element = this.buttonsContainer.querySelector('.x_' + x + '_y_' + y);

        // Adding a focus to the new active button
        this.addRemoveFocus(this.activeButton.element, 'add');

    },

    /**
     * A function for inserting character, considering the caret position
     * 
     * @param {object} input - an input element
     * @param {string} value - the character value
     */
    insertCharacter: function(input, value) {

        var caretPosition = input.selectionStart;
        var textBefore = input.value.substring(0, caretPosition);
        var textAfter = input.value.substring(caretPosition, input.value.length);
        input.value = textBefore + value + textAfter;
        caretPosition += value.length;
        input.selectionStart = caretPosition;
        input.selectionEnd = caretPosition;

    },

    /**
     * A function for removing character, considering the caret position
     * 
     * @param {object} input - an input element
     */
    removeCharacter: function(input) {

        var caretPosition = input.selectionStart;
        if (caretPosition === 0) return;
        var textBefore = input.value.substring(0, caretPosition);
        var textAfter = input.value.substring(caretPosition, input.value.length);
        textBefore = textBefore.slice(0, -1);
        input.value = textBefore + textAfter;
        caretPosition -= 1;
        input.selectionStart = caretPosition;
        input.selectionEnd = caretPosition;

    },

    /**
     * A function for moving the caret
     * 
     * @param {object} input - an input element
     * @param {number} step - a number of steps (-1 - one step left, 1 - one step right)
     */
    moveCaret: function(input, step) {

        var caretPosition = input.selectionStart;
        caretPosition += step;
        if (caretPosition < 0) return;
        input.selectionStart = caretPosition;
        input.selectionEnd = caretPosition;

    },

    /**
     * A function for adding or removing "focus" class
     * (using className for cross-browser support (instead of classList))
     * 
     * @param {object} element - DOM-element
     * @param {string} action - add or remove action
     */
    addRemoveFocus: function(element, action) {

        switch(action) {
            case 'add':
                var name = 'virtual_keyboard_button_focus';
                var array = element.className.split(' ');
                if (array.indexOf(name) === -1) {
                    element.className += ' virtual_keyboard_button_focus';
                }
                break;
            case 'remove':
                element.className = element.className.replace(/\bvirtual_keyboard_button_focus\b/g, '').trim();
                break;
        }

    },

    /**
     * A function for creating specific <div> element
     * 
     * @param {string} type - type of element, a part of className
     * @param {object} additionalClass - array of additional classes, that will be added to element
     */
    createElementForKeyboard: function(type, additionalClass) {

        // Creating a <div> element and defining the main class
        var element = document.createElement('div');
        element.className = 'virtual_keyboard_' + type;

        // Handling additional classes
        if (additionalClass !== null) {
            element.className += ' ' + additionalClass.join(' ');
        }

        // Returnin result element
        return element;

    },

};