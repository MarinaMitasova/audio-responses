<?php
$pass = $_GET['pass'];
$q = $_GET['q'];
$testMode = $_GET['testMode'];
 
if ($testMode == 0){
	$uploadDir = 'records/';
}else{
	$uploadDir = 'records_test/';
}

if (!file_exists($uploadDir)){
	mkdir($uploadDir, 0700);
}

if(!isset($_FILES['voice']) || $_FILES['voice']['error'] == UPLOAD_ERR_NO_FILE) {
	$response = Array();
	$dir = scandir($uploadDir); 
    foreach ($dir as $key => $file){ 
        if($file != '.' && $file != '..'){		
            if(is_file($uploadDir.'/'.$file)){
				$tmp = explode('_', $file);
				if ($tmp[0] == $pass && $tmp[1] == $q){
					array_push($response, '../voice_record/' . $uploadDir . $file);
				}
			}
		}
	}
}else{
	$typeFile = explode('/', $_FILES['voice']['type']);
	$uploadFile = $uploadDir . $pass.'_'.$q.'.'.$typeFile[1];
	if (move_uploaded_file($_FILES['voice']['tmp_name'], $uploadFile)) {
		$response = ['result'=>'OK', 'data'=>'../voice_record/' . $uploadFile];
	} else {
		$response = ['result'=>'ERROR', 'data'=>''];
	}
}


echo json_encode($response);
?>