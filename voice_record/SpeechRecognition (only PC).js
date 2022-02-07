const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;	
var recognizer = new SpeechRecognition();
recognizer.continuous = false;
recognizer.interimResults = false;
recognizer.lang = 'ru-Ru';
var transcript_text = "";

recognizer.onend= function (event) {
    if ( !document.querySelector('#stop').classList.contains("disabled") ){
        recognizer.start();
    }
};
recognizer.onerror = function(event) {
    console.log('Speech recognition error detected: ' + event.error);
}
recognizer.onresult= function (event) {
    var result = event.results[event.resultIndex];
    if (result.isFinal) {
        transcript_text += result[0].transcript + " "
        $("#TEXT" + ques).val(transcript_text)
        recognizer.abort();
    } else {
        console.log('Промежуточный результат: ', result[0].transcript);
    }
};
recognizer.start();