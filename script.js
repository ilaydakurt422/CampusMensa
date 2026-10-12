const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxMRCyXAD0X2L0xUnRKwft5O5NgPBJ8PbB9dz-HyqBtwQY08EnDLc6onS57VSZEHkhx/exec";

const menuDaten = {
    spaghetti: {
        name: "Spaghetti Bolognese",
        preis: 4.50
    },
    curry: {
        name: "Gemüse-Curry",
        preis: 4.00
    },
    pizza: {
        name: "Pizza Margherita",
        preis: 3.50
    }
};

const zusatzDaten = {
    getraenk: {
        name: "Getränk",
        preis: 1.50
    },
    salat: {
        name: "Salat",
        preis: 1.00
    },
    dessert: {
        name: "Dessert",
        preis: 1.50
    }
};

const button = document.getElementById("bestellenButton");
const bestaetigung = document.getElementById("bestaetigung");


// Zahlungsart anzeigen, sobald eine Mensa ausgewählt wurde

const zahlungBereich = document.getElementById("zahlungBereich");

const mensaRadioButtons = document.querySelectorAll(
    'input[name="mensa"]'
);

mensaRadioButtons.forEach(function(radio) {

    radio.addEventListener("change", function() {

        zahlungBereich.style.display = "block";

    });

});


// Zusatzoptionen steuern

const zusatzCheckboxen = document.querySelectorAll(
    'input[name="zusatz"]'
);

zusatzCheckboxen.forEach(function(checkbox) {

    checkbox.addEventListener("change", function() {

        if (this.value === "keine" && this.checked) {

            zusatzCheckboxen.forEach(function(andereCheckbox) {

                if (andereCheckbox.value !== "keine") {
                    andereCheckbox.checked = false;
                }

            });

        } else if (this.value !== "keine" && this.checked) {

            const keineCheckbox = document.querySelector(
                'input[name="zusatz"][value="keine"]'
            );

            keineCheckbox.checked = false;
        }
    });
});


// Bestellung

button.addEventListener("click", async function() {

    const mensa = document.querySelector(
        'input[name="mensa"]:checked'
    );

    const menu = document.querySelector(
        'input[name="menu"]:checked'
    );

    const abholzeit = document.getElementById(
        "abholzeit"
    ).value;

    const zahlung = document.querySelector(
        'input[name="zahlung"]:checked'
    );


    // Pflichtfelder prüfen

    if (!mensa) {
        alert("Bitte wähle zuerst eine Mensa aus.");
        return;
    }

    if (!menu) {
        alert("Bitte wähle ein Menü aus.");
        return;
    }

    if (!abholzeit) {
        alert("Bitte wähle eine Abholzeit aus.");
        return;
    }

    if (!zahlung) {
        alert("Bitte wähle eine Zahlungsart aus.");
        return;
    }


    // Menü bestimmen

    const ausgewaehltesMenu = menuDaten[menu.value];


    // Zusatzoptionen bestimmen

    const ausgewaehlteZusatzoptionen =
        document.querySelectorAll(
            'input[name="zusatz"]:checked'
        );

    let gesamtpreis = ausgewaehltesMenu.preis;

    let zusatzText = "";

    let zusatzNamen = [];


    ausgewaehlteZusatzoptionen.forEach(function(zusatz) {

        if (zusatz.value !== "keine") {

            const daten = zusatzDaten[zusatz.value];

            gesamtpreis += daten.preis;

            zusatzNamen.push(daten.name);

            zusatzText += `
                <li>
                    ${daten.name} –
                    ${daten.preis.toFixed(2).replace(".", ",")} €
                </li>
            `;
        }
    });


    // Mensa lesbar machen

    let mensaName;

    if (mensa.value === "campus") {
        mensaName = "Mensa Campus";
    } else if (mensa.value === "hauptgebaeude") {
        mensaName = "Mensa Hauptgebäude";
    } else {
        mensaName = "Cafeteria";
    }


    // Zahlungsart lesbar machen

    let zahlungName;

    if (zahlung.value === "karte") {
        zahlungName = "Karte";
    } else if (zahlung.value === "app") {
        zahlungName = "Mensa-App";
    } else {
        zahlungName = "Barzahlung";
    }


    // Bestätigung anzeigen

    bestaetigung.classList.add("anzeigen");

    bestaetigung.innerHTML = `
        <h2>✅ Bestellung erfolgreich!</h2>

        <h3>Deine Bestellung</h3>

        <p>
            <strong>Mensa:</strong>
            ${mensaName}
        </p>

        <p>
            <strong>Menü:</strong>
            ${ausgewaehltesMenu.name}
        </p>

        <p>
            <strong>Menüpreis:</strong>
            ${ausgewaehltesMenu.preis.toFixed(2).replace(".", ",")} €
        </p>

        <p>
            <strong>Zusatzoptionen:</strong>
        </p>

        <ul>
            ${zusatzText || "<li>Keine Zusatzoption</li>"}
        </ul>

        <p>
            <strong>Abholzeit:</strong>
            ${abholzeit}
        </p>

        <p>
            <strong>Zahlungsart:</strong>
            ${zahlungName}
        </p>

        <h3>
            Gesamtpreis:
            ${gesamtpreis.toFixed(2).replace(".", ",")} €
        </h3>
    `;


    // Bestellung an Google Sheets senden

    const bestellung = {
        mensa: mensaName,
        menu: ausgewaehltesMenu.name,
        extras: zusatzNamen.length > 0
            ? zusatzNamen.join(", ")
            : "Keine",
        abholzeit: abholzeit,
        zahlung: zahlungName,
        gesamtpreis: gesamtpreis.toFixed(2)
    };


    try {

        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(bestellung)
        });

        console.log("Bestellung wurde an Google Sheets gesendet.");

    } catch (fehler) {

        console.error(
            "Fehler beim Senden der Bestellung:",
            fehler
        );

    }

});