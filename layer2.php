<?php
	$link = $_POST["link"];

	$re = "/<h2><a title=\\\"[^\\\"]*\\\" href=\\\"([^\\\"]*)\">([^<]*)<\\/a><\\/h2>/"; 

	$page = file_get_contents($link);
	$page = str_replace(array("\n","\r"), '', $page);
	preg_match_all($re, $page, $episodes);

	$data=array("episodes"=>[]);

	$s=sizeof($episodes[1]);
	for ($i=$s-1; $i >=0; $i--) 
	{ 
		array_push($data["episodes"], array("link"=>$episodes[1][$i],"title"=>$episodes[2][$i]));
	}
	echo json_encode($data);
?>