<?php

	$page = $_POST["page"];

	$link = "http://myasiantv.se/drama/page-".$page."/?selOrder=0&selCat=0&selCountry=4&selYear=0&btnFilter=Submit";
	
	$re = "/<div>\\s*<span class=\\\"status\\\">([^<]*)<\\/span>\\s*<a title=\\\"([^|]*)\\|br\\|\\s*([^\"]*)\\\" href=\\\"([^\"]*)\\\"><img src=\\\"([^\"]*)\\\" alt=\\\"([^\"]*)/"; 

	$page = file_get_contents($link);
	$page = str_replace(array("\n","\r"), '', $page);
	preg_match_all($re, $page, $matches);

	$s=sizeof($matches[1]);

	$data=array("total"=>$s,"videos"=>[]);

	for ($i=0; $i < $s; $i++) 
	{ 
		$drama=array
				(
				"Status"=>$matches[1][$i],
				"Title"=>$matches[2][$i],
				"Plot"=>str_replace(array("\t","\r","\n"), '', $matches[3][$i]),
				"Link"=>$matches[4][$i],
				"Image"=>$matches[5][$i],
				"ShortTitle"=>str_replace(" Poster", '', $matches[6][$i])
				);
		array_push($data["videos"], $drama);
	}
	echo json_encode($data);
?>