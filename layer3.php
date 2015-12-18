<?php
	$link = $_POST["link"];

	$re = "/file: window\\.atob\\(\\\"([^\"]*)\\\"\\),\\s*label: \\\"([^\"]*)\\\"/"; 

	$page = file_get_contents($link);
	$page = str_replace(array("\n","\r"), '', $page);
	preg_match_all($re, $page, $video);

	$data=array("video"=>[]);

	$s=sizeof($video[1]);
	for ($i=0; $i <$s; $i++) 
	{ 
		array_push($data["video"], array("link"=>base64_decode($video[1][$i]),"label"=>$video[2][$i]));
	}
	echo json_encode($data);
?>