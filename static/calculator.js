// const lips = require('@jcubic/lips'); //INSTALL NODE.JS
// const WolframAlphaAPI = require('wolfram-alpha-api');

//Convert function to LaTeX
//Display function using MathJax
//Add calculator-akin functionality (buttons with symbols)
let textInput;
let validFunc = true;
let mj;

window.onload = function(){
    textInput = document.getElementById("calc-input");
    mj = window.MathJax;
    textInput.addEventListener("change", function () {
        processInput(mj);
    }, false);
    textInput.addEventListener("keyup", function(){
        processInput(mj);
    });
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
    }, false);
}

function processInput(mj){
    let currInput = document.getElementById("calc-input").value.toString();
    const parsedInput = parser(currInput);
    document.getElementById("func-display").innerHTML = `$$\\int ${parsedInput} dx$$`;
    mj.typesetPromise().then(() => {
        validFunc = true;
        mj.typesetPromise();
    }).catch(validFunc = false);
}

function parser(str) {
    let pos = -1, ch;
    function nextChar(){
        ch = (++pos < str.length) ? str.charAt(pos) : -1;
    }
    function eat(charToEat) {
        while (ch === ' ') nextChar();
        if (ch === charToEat) {
            nextChar();
            return true;
        }
        return false;
    }
    function parse(){
        nextChar();
        let x = parseExpression();
        if (pos < str.length) throw `Unexpected: ${ch}`
        return x;
    }
    function parseExpression() {
        let x = parseTerm();
        for (;;) {
            if      (eat('+')) x = `${x} + ${parseTerm()}` // addition
            else if (eat('-')) x = `${x} - ${parseTerm()}` // subtraction
            else return x;
        }
    }
    function parseTerm() {
        let x = parseFactor();
        for (;;) {
            if      (eat('*')) x=`${x} \\cdot ${parseTerm()}`; // multiplication
            else if (eat('/')) x= `\\frac{${x}}{${parseTerm()}}`; // division
            else return x;
        }
    }
    function parseFactor() {
        if (eat('+')) return `${parseFactor()}`; // unary plus
        if (eat('-')) return `-${parseFactor()}`; // unary minus

        let x;
        let startPos = pos;
        if (eat('(')) { // parentheses
            x = `{(${parseExpression()})}`
            eat(')');
        } else if ((ch >= '0' && ch <= '9') || ch === '.') { // numbers
            while ((ch >= '0' && ch <= '9') || ch === '.') nextChar();
            x = str.substring(startPos, pos);
        } else if (ch >= 'a' && ch <= 'z') { // variables
            while (ch >= 'a' && ch <= 'z') nextChar();
            x= str.substring(startPos, pos);
            if(x.length>1){
                x = `\\${x} {${parseFactor()}}`;
            }
        } else {
            throw `Unexpected: ${ch}`
        }
        if (eat('^')) x = `${x} ^ {${parseFactor()}}` //superscript
        if(eat('_')) x = `${x}_{${parseFactor()}}`;

        return x;
    }
    // let parsed = parse();
    // let checkImplicitMulti = Array.from(parsed);
    // while(true) {
    //     let a = false;
    //     for (let i = 0; i < checkImplicitMulti.length - 1; i++) {
    //         if (isNaN(checkImplicitMulti[i]) && checkImplicitMulti[i + 1] === 'x') {
    //             checkImplicitMulti.splice(i, 0, '*');
    //             a = true;
    //             i = 0;
    //         }
    //     }
    //     if(!a) break;
    // }
    // console.log(checkImplicitMulti.toString());
    return parse();
    // return "$$" + str + "$$";
}

function calculateIntegral(){
    $.ajax({
        type: "POST",
        url: "/process_input",
        dataType: "json",
        data: JSON.stringify({param: document.getElementById("calc-input")
                .value
                .toString()}),
        contentType: "application/json",
        success: function(response) {
            handleResult(response);
        },
        failure: function(response){
            alert(response);
        }
    }).done(function(o){
        console.log(o);
    });
}

function handleResult(integral){
    // let data = JSON.parse(integral);
    let func = integral.result;
    document.getElementById("integral-display").innerHTML = `$$F(x) = ${parser(func)} + C$$`;
        mj.typesetPromise().then(() => {
        mj.typesetPromise();
    }).catch(validFunc = false);
}

//INITIAL PLAN
//Use mathematica to interpret integrals by piping user input into mathematica function
//browserify calculator.js -o bundle.js

// const baseURL = "https://api.wolframalpha.com/v2/query?appid=YAL25U-V3L55YYW89";

// function calcIntegral(func){
//     let subURL = baseURL + `&input=Integrate[${func},x]&includepodid=IndefiniteIntegral&format=image`;
//     // let subURL = baseURL + "&input=Integrate[x^2,x]&includepodid=IndefiniteIntegral&format=image";
//     let xhr = new XMLHttpRequest();
//     let doc = null;
//     xhr.open("GET", subURL, true);
//     xhr.onreadystatechange = function(){
//         if(xhr.readyState === 4 && xhr.status === 200){
//             doc = xhr.responseXML;
//         }
//     };
//     xhr.send(null);
//     readXML(doc);
//     return doc;
// }

// function calcIntegral(func){
//     let subURL = baseURL + `&input=Integrate[${func},x]&includepodid=IndefiniteIntegral&format=image`;
//     fetch(subURL, {mode: "cors"})
//         .then(blob => blob.json())
//         .then(data => {
//             console.table(data);
//             return data;
//         })
//         .catch(e => {
//             console.log(e);
//             return e;
//         });
// }

// function readXML(doc){
//     alert("DOC STATUS: " + (doc == null));
//     let alternate = doc.getElementsByName("img")[0].firstChild.nodeValue;
//     // alert(alternate);
// }
//
// function plotIntegral(func){
//
// }

// let wAPI = WolframAlphaAPI('YAL25U-V3L55YYW89');
//
// function calcIntegral(func){
//     wAPI.getFull({
//         input: `Integrate[${func}, x]`,
//         includepodid: 'IndefiniteIntegral',
//         format: 'image',
//         mode: 'cors',
//         output: 'xml'
//     }).then((queryResult) => {
//         alert(queryResult);
//     }).catch(console.error);
// }

//BACKUP PLAN
//Interpret function using Lisp backend
//Possibly add multi-functionality if a Lisp backend is achievable?

// lips.exec('(let ((a 10) (b 20)) (* a b))').then(results => {
//     results.forEach(function(result) {
//         if (typeof result !== 'undefined') {
//             console.log(result.toString());
//         }
//     });
// });
//
// let test_exec = "(mfuncall '$integrate 'x^2+2*x-3 'x)";
//
// lips.exec(test_exec).then(results => {
//     results.forEach(function(result) {
//         if (typeof result !== 'undefined') {
//             console.log(result.toString());
//         }
//     });
// });
