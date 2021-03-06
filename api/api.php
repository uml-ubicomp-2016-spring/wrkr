<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
include 'respond.php';

class userAPI {
	
	private $db;

	function __construct(){
		$this->db = new mysqli('localhost', 'sfomiche', 'sf5481', 'sfomiche') or die(mysql_error());
		if ($this->db->connect_error) {
			die('Connect Error (' . $this->db->connect_errno . ') '
				. $this->db->connect_error);
		}
		
		$this->db->autocommit(FALSE);
	}
	function __destruct(){
		$this->db->close();
	}

	function userData() {
		if (isset($_GET["exist"]) && isset($_GET["email"])){
			$email = $_GET["email"];	
			$stmt = $this->db->prepare('SELECT id, name, karma FROM users WHERE email=?');
			$stmt->bind_param('s', $email);
			$stmt->execute();
			$stmt->bind_result($id, $name, $karma);
			$stmt->fetch();
			$stmt->close();
			
			if ($id <= 0) {
				sendResponse(401, 'User doesnt exist');
				return false;
			}
			$result = array(
				"id" => $id,
				"name" => $name,
				"karma" => $karma
			);
			sendResponse(200, json_encode($result));
			return true;
		}
		elseif(isset($_GET["exercises"]) && isset($_GET["id"])){
			$user_id = $_GET["id"];
			
			$stmt = $this->db->prepare('SELECT * FROM users WHERE id=?');
			$stmt->bind_param('s', $user_id);
			$stmt->execute();
			$stmt->store_result();
			//$stmt->fetch();

			if ($stmt->num_rows == 0) {
				sendResponse(401, 'User doesnt exist');
				$stmt->close();
				return false;
			}
			else{
				$stsm = $this->db->prepare('SELECT ts, complete FROM exercises WHERE user_id=? ORDER BY ts DESC');
				$stsm->bind_param('i', $user_id);
				$stsm->execute();
				$stsm->bind_result($ts, $complete);
				$stsm->store_result();
				while($stsm->fetch()){
					$tsArray[] = array($ts, $complete); 
				}
				$stsm = $this->db->prepare('SELECT COUNT(id) FROM exercises WHERE user_id=? && complete=0');
				$stsm->bind_param('i', $user_id);
				$stsm->execute();
				$stsm->bind_result($count);
				$stsm->fetch();
				$stsm->close();
				
				$result = array(
					"status" => "ok",
					"exercises" => $count,
					"timestamp" => $tsArray
				);
				
				sendResponse(200, json_encode($result));
				return true;
			}
		}
		elseif(isset($_POST["email"])){
			$email = $_POST["email"];
			$name = $_POST["name"];
			$stsm = $this->db->prepare('SELECT id FROM users WHERE email=?');
			$stsm->bind_param('s', $email);
			$stsm->execute();
			$stsm->bind_result($id);
			$stsm->fetch();
			$stsm->close();
			if(!$id){
				$stsm = $this->db->prepare('INSERT INTO users (name, email) VALUES (?, ?)');
				$stsm->bind_param('ss', $name, $email);
				$stsm->execute();
				$id = $this->db->insert_id;
				$stsm->close();
			
				$result = array(
					"status" => "ok",
					"id" => $id
				);
				sendResponse(200, json_encode($result));
				return true;
			}
			else{
				sendResponse(401, 'User already exists');
				return false;
			}			
		}
		elseif(isset($_POST["id"])){
			$user_id = $_POST["id"];
			$timestamp = $_POST["timestamp"];
			$stsm = $this->db->prepare('INSERT INTO exercises (user_id, ts) VALUES (?, ?)');
			$stsm->bind_param('ii', $user_id, $timestamp);
			$stsm->execute();
			$stsm->close();
			
			$stsm = $this->db->prepare('SELECT id FROM exercises WHERE user_id=?');
			$stsm->bind_param('i', $user_id);
			$stsm->execute();
			$stsm->store_result();
			
			$result = array(
				"status" => "ok",
				"exercises" => $stsm->num_rows
			);
			$stsm->close();
			sendResponse(200, json_encode($result));
			return true;
			
		}
		elseif($_SERVER['REQUEST_METHOD'] == 'PUT'){
			$putData = array();
			parse_str(file_get_contents("php://input"), $putData);
			$stmt = $this->db->prepare('SELECT * FROM users WHERE id=?');
			$stmt->bind_param('s', $putData['id']);
			$stmt->execute();
			$stmt->store_result();
			//$stmt->fetch();

			if ($stmt->num_rows == 0) {
				sendResponse(401, 'User doesnt exist');
				$stmt->close();
				return false;
			}
			if(isset($putData['decrement'])){
				$stsm = $this->db->prepare('UPDATE exercises SET complete = 1 WHERE user_id = ? && complete = 0 LIMIT 1');
				$stsm->bind_param('i', $putData['id']);
				$stsm->execute();
				$stsm->close();
		
				$result = array(
					"status" => "exercise has done"
				);
			}
			elseif(isset($putData['setkarma'])){
				$stsm = $this->db->prepare('UPDATE users SET karma = ? WHERE id = ?');
				$stsm->bind_param('ii', $putData['karma'], $putData['id']);
				$stsm->execute();
				$stsm->close();
				
				$result = array(
					"status" => "karma changed"
				);
			}
			sendResponse(200, json_encode($result));
			return true;
		}
		elseif($_SERVER['REQUEST_METHOD'] == 'OPTIONS'){
			$result = array(
				"status" => "Thanks jquery! Now you can chill...."
			);
			sendResponse(200, json_encode($result));
			return true;
		}
		
		
		sendResponse(400, 'Invalid request');
		return false;
	}
		
}
 
$api = new userAPI;
$api->userData();
?>