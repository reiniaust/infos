<?php 
	header("Access-Control-Allow-Origin: *");
	
	$ordner = "/var/www/vhosts/reinhard-austermeier.de/httpdocs/~upload/";

	
	$benutzer = array(
		"reini" => array(
			"passwort" => "Sces04ok!",
			"gruppen" => array(
				"Reini-privat",
				"sd-software",
				"Schützenvorstand"
			)
		)
	);

	if ($_GET["aktion"] == "lesen") {
		$user = $benutzer[$_GET["username"]];
		if ($user["passwort"] == $_GET["passwort"]) {
			//foreach ($gruppen as $key => $gruppe) {
				$datei = $ordner . $_GET["datei"];
				//$datei = $ordner . $gruppe;
	
				$fp = fopen($datei, "r");
				$ausgabe = fread($fp, filesize($datei)-1);
				fclose($fp);

				$fileList = glob($ordner . "infos-*.json");
				$ausgabe .= ', "dateien": [';
				foreach($fileList as $filename){
					$ausgabe .= '"' . substr($filename, strlen($ordner)) . '",';
				}
				$ausgabe = substr($ausgabe, 0, strlen($ausgabe)-1) . "]";
				
				$ausgabe .= ', "gruppen": [';
				foreach ($user["gruppen"] as $key => $gruppe) {
					$ausgabe .= '"' . $gruppe . '",';
				}
				$ausgabe = substr($ausgabe, 0, strlen($ausgabe)-1) . "]";
				
				$ausgabe .= '}';
				
				echo $ausgabe;
			//}
		} else {
			echo '{"Fehler": "Anmeldung"}';
		}
	}

	if ($_GET["aktion"] == "speichern") {
		$datei = $ordner . "infos.json";
	
		$timestamp = time();
		if($_POST["aktion"] == "sichern-datum") {
			$datum = date("Y-m-d", $timestamp);
			rename($datei, $ordner . "infos-" . $datum . ".json" );
			}
		if($_POST["aktion"] == "sichern-datum-zeit") {
			$datum = date("Y-m-d-H:i", $timestamp);
			rename($datei, $ordner . "infos-" . $datum . ".json" );
		}
	
		$fp = fopen($datei , "w");
		fwrite($fp, $_POST["daten"]);
		fclose($fp);
	
		echo $_POST["daten"];
	}
?> 
