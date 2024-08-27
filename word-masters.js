import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const letterDiv = document.getElementsByClassName('scoreboard-letter');
const loading = document.getElementsByClassName('spiral');
let buffer = 0;
let line = 0;
let guessword='';
let actualword ='';
let done = false;
let lossCounter = 0;

function makeConfetti(){
    confetti()
}

function removeLastLetter(letter) {
    if(buffer > 0){
        letterDiv[buffer-1+line].innerText = '';
        guessword = guessword.substring(0, guessword.length-1);
        buffer--;
    }
}

function addLetter(letter) {
    if(buffer < 5){
        letterDiv[buffer+line].innerText = letter;
        guessword += letter;
        buffer++;
    }
}

async function commit(letter){
    if(buffer === 5){
        setLoading(true);
        const res = await fetch('https://words.dev-apis.com/validate-word', {
            method: "POST",
            body: JSON.stringify ({ word : guessword})
        })
        const resobj = await res.json();
        const { validWord } = resobj;
        setLoading(false);
        
        if(!validWord){
            for(var k=0; k<guessword.length; k++){
                letterDiv[k+line].classList.add('invalid');
            }
            setTimeout(() => {
                for(var k=0; k<guessword.length; k++){
                    letterDiv[k+line].classList.remove('invalid');
                }
            }, 1000);
        }
        
        else{
            checking(guessword.toUpperCase());
            lossCounter++;
            if(guessword.toUpperCase() === actualword){
                makeConfetti();
                done = true;
                setTimeout(function(){
                    alert('You Win. The correct word is indeed ' + actualword);
                }, 100);
                return;
            }
            buffer = 0;
            line += 5;
            guessword='';
            if(lossCounter === 6){
                setTimeout(function(){
                    alert('You Lose. Press F5 to try again');
                },100);
            }
        }
    }
}

function checking(gword){
    //console.log(actualword);
    let cpy = actualword;
    for(var i=0; i<actualword.length; i++){
        if(gword[i] == cpy[i]){
            letterDiv[i+line].classList.add('correct');
            cpy = replaceAt(i,cpy);
        }
        else{           
            letterDiv[i+line].classList.add('wrong');
        }
    }
    yellow(cpy,gword);
}

function yellow(cpy,gword){
    for(var i=0; i<cpy.length; i++){
        for(var j=0; j<gword.length; j++){
            if(gword[j] == cpy[i] && cpy[j]!='_'){
                letterDiv[j+line].classList.remove('wrong');
                letterDiv[j+line].classList.add('close');
            }
        }
    }
}

function replaceAt(index, string) {
    let wordArray = string.split('');
    wordArray[index] = '_';
    return wordArray.toString().replaceAll(',','');
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

async function init(){
    setLoading(true);
    const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const data = await response.json();
    //const { word } = await response.json();
    const word = data.word.toUpperCase();
    actualword = word;
    setLoading(false);
    
    if(done === false){
        document.addEventListener('keydown', function keyPressed(event){
            const letter=event.key;

            if(letter === 'Enter'){
                commit();
            }
            else if(letter === 'Backspace'){
                removeLastLetter();
            }
            else if(isLetter(letter)){
                addLetter(letter);
            }
        })
    }
}

function setLoading(isLoading){
    loading[0].classList.toggle('show', isLoading);
}

init();
