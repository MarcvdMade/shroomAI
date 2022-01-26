import { DecisionTree } from "./libraries/decisiontree.js"
import { VegaTree } from "./libraries/vegatree.js"

//
// DATA 
//
const csvFile = "./data/mushrooms.csv"
const trainingLabel = "class"
const ignored = []

function alert() {
    let body = document.getElementsByTagName('video')[0]
    body.style.display = "none"
    if (confirm("epilepsy alert! don't click ok if you have epilepsy. Click cancel instead.")) {
        console.log("cool")
        body.style.display = "block"
    } else {
        body.style.display = "none"
    }
}

//
// laad csv data als json
//
function loadData() {
    Papa.parse(csvFile, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => trainModel(results.data)   // gebruik deze data om te trainen
    })
}

function loadJson() {
    fetch('./json/shroomDecisionTree.json')
        .then(response => response.json())
        .then(data => trainModel(data))
        .catch(err => console.log(`Error: ${err}`))
}

//
// MACHINE LEARNING - Decision Tree
//
function trainModel(data) {

    alert()
    // todo : splits data in traindata en testdata

    let trainData = data.slice(0, Math.floor(data.length * 0.8))
    let testData = data.slice(Math.floor(data.length * 0.8) + 1)

    // maak het algoritme aan
    let decisionTree = new DecisionTree({
        ignoredAttributes: ignored,
        trainingSet: trainData,
        categoryAttr: trainingLabel
    })

    // create json for decisionTree
    // let json = decisionTree.toJSON()
    // let jsonString = JSON.stringify(json)
    // console.log(jsonString)

    // Teken de boomstructuur - DOM element, breedte, hoogte, decision tree
    let visual = new VegaTree('#view', window.innerWidth - 100, window.innerHeight - 100, decisionTree.toJSON())

    // class,cap-shape,cap-surface,cap-color,bruises,odor,gill-attachment,gill-spacing,gill-size,gill-color,stalk-shape,stalk-root,stalk-surface-above-ring,stalk-surface-below-ring,stalk-color-above-ring,stalk-color-below-ring,veil-type,veil-color,ring-number,ring-type,spore-print-color,population,habitat
    // todo : maak een prediction met een sample uit de testdata
    let shroom = {
        cap_shape: "b",
        cap_surface: "s",
        cap_color: "p",
        bruises: "f",
        odor: "s",
        gill_attachment: "d",
        gill_spacing: "w",
        gill_size: "n",
        gill_color: "u",
        stalk_shape: "e",
        stalk_root: "b",
        stalk_surface_above_ring: "s",
        stalk_surface_below_ring: "s",
        stalk_color_above_ring: "w",
        stalk_color_below_ring: "w",
        veil_type: "u",
        veil_color: "w",
        ring_number: "t",
        ring_type: "c",
        spore_print: "u",
        population: "y",
        habitat: "d"
    }

    let prediction = decisionTree.predict(shroom)
    console.log(`This shroom is ${prediction}`)

    // form data
    let form = document.getElementById("shroomForm")
    let outcome = document.getElementById('formOutcome')

    form.onsubmit = function (e) {
        e.preventDefault()

        let object = {}

        for (let i = 0; i < form.length - 1; i++) {
            let name = form[i].name
            let value = form[i].value
            Object.assign(object, { [name]: value })

        }
        let formPredict = decisionTree.predict(object)
        console.log(formPredict)

        if (formPredict == "p") {
            outcome.innerHTML = "You're probably going to die if you eat this☠"
        }
        if (formPredict == "e") {
            outcome.innerHTML = "Aaah you will be fine don't worry about it😵 but if you die don't blame me!"
        }
    }

    // todo : bereken de accuracy met behulp van alle test data
    testAcc(testData, decisionTree)
}

function testAcc(shrooms, tree) {

    let amountCorrect = 0
    let totalAmount = shrooms.length
    console.log(totalAmount)

    let rightEdible = 0
    let wrongEdible = 0

    let rightPoisonous = 0
    let wrongPoisonous = 0

    for (let i = 0; i < totalAmount; i++) {

        const shroomWithoutLabel = Object.assign({}, shrooms[i])
        delete shroomWithoutLabel.class

        let prediction = tree.predict(shroomWithoutLabel)

        if (prediction == "e" && shrooms[i].class == "p") {
            wrongEdible++
        }
        if (prediction == "p" && shrooms[i].class == "e") {
            wrongPoisonous++
        }
        if (prediction == "p" && shrooms[i].class == "p") {
            rightPoisonous++
        }
        if (prediction == "e" && shrooms[i].class == "e") {
            rightEdible++
        }

        // console.log(prediction + "&" + shrooms[i].class)

        if (prediction == shrooms[i].class) {
            amountCorrect++
        }
    }

    document.getElementById("edible").innerHTML = rightEdible
    document.getElementById("wrongPoisonous").innerHTML = wrongPoisonous
    document.getElementById("poisonous").innerHTML = rightPoisonous
    document.getElementById("wrongEdible").innerHTML = wrongEdible

    console.log(amountCorrect)

    let acc = amountCorrect / totalAmount
    let accDiv = document.getElementById("accuracy")
    console.log(`Accuracy: ${acc}`)
    accDiv.innerHTML = `This AI is ${Math.floor(acc * 100)}% accurate. Die at your own risk ☠`
}


loadData()