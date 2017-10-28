var view = {

    textMiss: ["O małe pióro...", "Prawie się udało...", "Było blisko..."],
    textHit: ["Prosto w kuper...", "A na co jej pióra..."],
    displayMessage: function (msg) {
        var messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;
    },
    displayHit: function (location, numDuck) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "hit" + numDuck);
    },

    displayMiss: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    },
    displayBomb: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "bomb");

    },
    displayResult: function (numHits) {
        var viewfinder = document.getElementById("resultShot");
        viewfinder.style.backgroundImage = "url(img/viewfinder/" + numHits + ".png)";

    },
    changeFireButtonValue: function (value) {
        var fireButton = document.getElementById("fireButton");
        fireButton.value = value;

    },
    clearBoard: function () {
        var cells = document.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            cells[i].removeAttribute("class");
        }
        this.changeFireButtonValue("Fire!");
        var viewfinder = document.getElementById("resultShot");
        viewfinder.style.backgroundImage = "url()";
        this.displayMessage("Gang uzbrojonych po zęby kaczek chce wysadzić dolinę, zlikwiduj je zanim zdetonują bombę!");
    }


}

function Duck(amount) {
    this.numDuck = amount;
    this.numHits = 0;
    this.locations = [];
    this.hits = [];

}

var model = {
    boardSize: 7,
    numDucks: 4,
    duckLength: 3,
    ducksShotDown: 0,
    checkedLocations: [],
    ducks: [],
    bombPosition: "",
    bombHit: false,
    fire: function (guess) {
        this.checkedLocations.push(guess);
        if (guess === this.bombPosition) {
            view.displayBomb(guess);
            view.displayResult("boomm");
            this.bombHit = true;
            return false;
        }
        for (var i = 0; i < this.numDucks; i++) {
            var duck = this.ducks[i];
            var index = duck.locations.indexOf(guess);
            if (index >= 0) {
                duck.hits[index] = "hit";
                duck.numHits++;
                view.displayHit(guess, duck.numDuck);
                view.displayResult(duck.numHits);
                view.displayMessage(view.textHit[duck.numHits - 1]);
                if (this.isShotDown(duck)) {
                    view.displayMessage("Odesłałeś " + (this.ducksShotDown + 1) + " kaczora na spotkanie ze Stwórcą...");
                    this.ducksShotDown++;
                }
                return true;
            }
        }
        view.displayMiss(guess);
        view.displayMessage(view.textMiss[outfit.rand(0, view.textMiss.length - 1)]);
        view.displayResult(0);

        return false;
    },

    isShotDown: function (duck) {
        for (var i = 0; i < this.duckLength; i++) {
            if (duck.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    },
    generateDucks: function () {
        for (var i = 1; i <= this.numDucks; i++) {
            this.ducks.push(new Duck(i));
        }
        this.generateDuckLocations();
    },
    generateDuckLocations: function () {
        var locations;
        for (var i = 0; i < this.numDucks; i++) {

            do {
                locations = this.generateDuck();
            } while (this.collision(locations));
            this.ducks[i].locations = locations;
        }
    },
    generateDuck: function () {
        var direction = outfit.rand(0, 1);
        var row, col;
        if (direction === 1) {
            row = outfit.rand(0, this.boardSize - 1);
            col = outfit.rand(0, this.boardSize - this.duckLength);

        } else {
            row = outfit.rand(0, this.boardSize - this.duckLength);
            col = outfit.rand(0, this.boardSize - 1);

        }
        var newDuckLocations = [];
        for (var i = 0; i < this.duckLength; i++) {
            if (direction === 1) {
                newDuckLocations.push(row + "" + (col + i));
            } else {
                newDuckLocations.push((row + i) + "" + col);
            }
        }
        return newDuckLocations;
    },
    generateBomb: function () {
        var row, col, position;
        while (!position) {
            row = outfit.rand(0, this.boardSize - 1);
            col = outfit.rand(0, this.boardSize - 1);
            position = row + "" + col;
            for (var i = 0; i < this.numDucks; i++) {
                var index = this.ducks[i].locations.indexOf(position);
                if (index >= 0) {
                    position = undefined;
                    i = this.numDucks;
                }
            }
        }
        this.bombPosition = position;

    },


    collision: function (locations) {
        for (var i = 0; i < this.numDucks; i++) {
            var duck = model.ducks[i];
            for (var j = 0; j < locations.length; j++) {
                if (duck.locations.indexOf(locations[j]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    },

    clearData: function () {
        this.ducksShotDown = 0;
        this.checkedLocations = [];
        this.ducks = [];
        this.bombPosition = "";
        this.bombHit = false;
    }

};


var controller = {
    guesses: 0,
    processGuess: function (guess) {
        var location = outfit.parseGuess(guess);
        if (location) {
            var locationChecked = outfit.isAreadyChecked(location);
            if (locationChecked) {
                alert("To pole już sprawdzałeś!");
            } else {
                this.guesses++;
                var hit = model.fire(location);
                if (hit && model.ducksShotDown === model.numDucks) {
                    view.displayMessage("Misja zakończona sukcesem: zlikwidowałeś wszystkich członków gangu oddając " + this.guesses + " strzałów.");
                    this.guesses = 0;
                    view.changeFireButtonValue("Replay");
                    outfit.disconnect();
                } else if (!hit && model.bombHit) {
                    view.displayMessage("Misja zakończona niepowodzeniem: kaczki zdetonowały bombę...");
                    this.guesses = 0;
                    view.changeFireButtonValue("Replay");
                    outfit.disconnect();
                }

            }

        }

    }

};

var outfit = {

    rand: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    parseGuess(guess) {
        var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

        if (guess === null || guess.length !== 2) {
            alert("Proszę podać poprawne współrzędne!");
        } else {
            var firstChar = guess.charAt(0).toUpperCase();

            var row = alphabet.indexOf(firstChar);
            var column = guess.charAt(1);

            if (isNaN(row) || isNaN(column)) {
                alert("Nieprawidłowe współrzędne!");
            } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
                alert("Pole poza planszą!");
            } else {
                return row + column;
            }
        }
        return null;
    },
    isAreadyChecked: function (location) {
        var index = model.checkedLocations.indexOf(location);
        if (index === -1) {
            return false;
        } else {
            return true;
        }
    },

    convertPosition(position) {
        var alphabet = ["A", "B", "C", "D", "E", "F", "G"];
        var index = position.charAt(0);
        var char = alphabet[index];
        var num = position.charAt(1);

        return char + num;


    },

    handleFireButton: function () {
        var fireButton = document.getElementById("fireButton");
        if (fireButton.value === "Fire!") {
            var guessInput = document.getElementById("guessInput");
            var guess = guessInput.value;
            controller.processGuess(guess);
            guessInput.value = "";
        } else if (fireButton.value === "Replay") {
            model.clearData();
            view.clearBoard();
            outfit.init();
        }
    },
    handleKeyPress: function (e) {
        var fireButton = document.getElementById("fireButton");
        if (e.keyCode === 13) {
            fireButton.click();
            return false;
        }

    },
    handleTableCells: function (e) {
        var guess = outfit.convertPosition(e.target.id);
        controller.processGuess(guess);
        //var fireButton = document.getElementById("fireButton");
        //var guessInput = document.getElementById("guessInput");
        //guessInput.value = guess;

        //guessInput.value = "";
        //fireButton.focus();

    },
    init: function () {

        var fireButton = document.getElementById("fireButton");
        fireButton.onclick = outfit.handleFireButton;
        var guessInput = document.getElementById("guessInput");
        guessInput.onkeypress = outfit.handleKeyPress;

        var cells = document.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            cells[i].onclick = outfit.handleTableCells;
        }

        model.generateDucks();
        model.generateBomb();

    },
    disconnect: function () {
        var cells = document.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            cells[i].onclick = null;
        }
    }

};

window.onload = outfit.init;
