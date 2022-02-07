function voiceRecord(pass, ques, testMode){
	$("#" + ques).hide().after('<input type="text" class="open_end_text_box text_input" id="'+ques+'_timer">')
	$("#" + ques+'_timer').addClass("timer")
	
	$(".timer").show().prop("readonly", true)
	$("#" + ques + "_div .header2 .err").hide()
	
	var URL = '../voice_record/voice.php?pass=' + pass + '&q=' + ques + '&testMode=' + testMode;
	
	if (navigator.mediaDevices === undefined) {
		navigator.mediaDevices = {};
	}
	if (navigator.mediaDevices.getUserMedia === undefined) {
		navigator.mediaDevices.getUserMedia = function(constraints) {
			var getUserMedia = (navigator.getUserMedia ||
							  navigator.mozGetUserMedia ||
							  navigator.msGetUserMedia ||
							  navigator.webkitGetUserMedia);
			if (!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}
			return new Promise(function(resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		}
	}

	if (navigator.mediaDevices.getUserMedia === undefined || MediaRecorder === undefined){
		$("#" + ques + "_div .header2 .err").show()
	}else {
		$("#" + ques + "_div .footer").append(
			'<div id="start" class="btn"><i class="fa fa-microphone" aria-hidden="true"></i> Начать запись</div>' + 
			'<div id="stop" class="btn disabled"><i class="fa fa-stop" aria-hidden="true"></i> Остановить</div>' + 
			'<div id="replay" class="btn disabled"><i class="fa fa-reply" aria-hidden="true"></i> Перезаписать</div>' + 
			'<div id="messages"></div>'
		);
		if ($(".timer").val() == "") {
			$(".timer").val("00:00:00")
		}else{
			fetch(URL, {method: 'POST'}).then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
				data.forEach(function(src) {
					let audio = document.createElement('audio');
					audio.src = src;
					audio.controls = true;
					audio.autoplay = false;
					document.querySelector('#messages').appendChild(audio);
				})
			});
		}

		if ($("#" + ques).val() != '') {
			let audio = document.createElement('audio');
			audio.src = $("#" + ques).val();
			audio.controls = true;
			audio.autoplay = false;
			document.querySelector('#messages').appendChild(audio);

			$('#start').addClass("disabled")
			$('#replay').removeClass("disabled")

			audio.onloadedmetadata = function() {
				$(".timer").val( formatTime(audio.duration) );
			};
		}
	}

	function formatTime(seconds) {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);
		return (h < 10 ? "0" : "") + h + (m < 10 ? ":0" : ":") + m + (s < 10 ? ":0" : ":") + s;
	}

	var mime = 'audio/webm';
	if(!MediaRecorder.isTypeSupported(mime)){mime = 'audio/mp3'}
	if(!MediaRecorder.isTypeSupported(mime)){mime = 'audio/wav'}
	if(!MediaRecorder.isTypeSupported(mime)){mime = 'audio/ogg'}
	
	navigator.mediaDevices.getUserMedia({ audio: true})
		.then(stream => {
			const mediaRecorder = new MediaRecorder(stream, {mimeType : mime});

			document.querySelector('#start').addEventListener('click', function(){
				if ( !document.querySelector('#start').classList.contains("disabled") ){
					mediaRecorder.start();
					$('#start').addClass("disabled")
					$('#stop').removeClass("disabled")
					StartTime()
				}
			});
			let audioChunks = [];
			mediaRecorder.addEventListener("dataavailable",function(event) {
				audioChunks.push(event.data);
			});

			document.querySelector('#stop').addEventListener('click', function(){
				if ( !document.querySelector('#stop').classList.contains("disabled") ){
					mediaRecorder.stop();
					$('#stop').addClass("disabled")
					$('#replay').removeClass("disabled")
					StopTime()
				}
			});

			document.querySelector('#replay').addEventListener('click', function(){
				if (window.confirm("Подтвердите, пожалуйста, что Вы хотите удалить эту запись и записать свой ответ заново.")) {
					if ( !document.querySelector('#replay').classList.contains("disabled") ){
						$('#start').removeClass("disabled")
						$('#replay').addClass("disabled")
						$(".timer").val("00:00:00")
						$("#messages").empty()

						if ($("audio").length == 1) {
							let src = $("audio").attr("src")
							let params = {
								src: src
							}

							(async () => {
								let promise = await fetch("../voice_record/remove.php", {
									method: 'POST',
									body: JSON.stringify(params)});
								if (promise.ok) {
									let response =  await promise.json();
									console.log(response.data);
								}
							})();
						}
					}
				}
			});

			mediaRecorder.addEventListener("stop", function() {
				const audioBlob = new Blob(audioChunks, {
					type: mime
				});

				let fd = new FormData();
				fd.append('voice', audioBlob);
				
				sendVoice(fd);
				audioChunks = [];
			});
		});
		
	async function sendVoice(form) {
		let promise = await fetch(URL, {
			method: 'POST',
			body: form});
		if (promise.ok) {
			let response =  await promise.json();
			console.log(response.data);
			let audio = document.createElement('audio');
			audio.src = response.data;
			audio.controls = true;
			audio.autoplay = false;
			document.querySelector('#messages').appendChild(audio);
			$("#" + ques).val(location.href.split('/cgi-bin')[0] + response.data.replace("..", ""))
		}
	};

	//-----------ДЛИТЕЛЬНОСТЬ ЗАПИСИ (суммарно по всем)
	var clocktimer, flag = 0;
	function StartTime() {
	  var tmp = $(".timer").val().split(":")
	  var h = +tmp[0]
	  var m = +tmp[1]
	  var s = +tmp[2]

	  if (m == 2) {
		var event = new Event("click")
		document.querySelector('#stop').dispatchEvent(event)  
		return;
	  }

	  if (flag) s++;

	  hNew=new Date(0,0,0,h,m,s).getHours();
	  mNew=new Date(0,0,0,h,m,s).getMinutes();
	  sNew=new Date(0,0,0,h,m,s).getSeconds();

	  $(".timer").val( (hNew < 10 ? "0" : "") + hNew + (mNew < 10 ? ":0" : ":") + mNew + (sNew < 10 ? ":0" : ":") + sNew );
	  flag = 1;
	  clocktimer = setTimeout(StartTime, 1000);
	}

	//Функция запуска и остановки
	function StopTime() {
	  clearTimeout(clocktimer);
	}
}
