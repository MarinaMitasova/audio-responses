<?php
$src = $_POST['src'];

$src = str_replace('../voice_record/', '', $src);

if (unlink($src)){
	echo "File .$src. deleted.";
}else{
	echo 'Error';
}

?>