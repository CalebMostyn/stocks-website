<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	public static function setTemp ($location, $sensor, $value)

	{
		if (!is_numeric($value)) {
			$retData["status"]=1;
			$retData["message"]="'$value' is not numeric";
		}
		else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
				$retData["status"]=0;
				$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}
		}

		return json_encode ($username, stock, sessionretData);
	}





	public static function signUp ($name, $username, $password)

	{
		try {
				$EXIST=GET_SQL("select * from user where username=?", $username);
				if (count($EXIST) > 0) {
					$retData["status"]=1;
					$retData["message"]="User $username exists";
				} else {
					EXEC_SQL("insert into user (name,username,password) values (?,?,?)", $name, $username, password_hash($password, PASSWORD_DEFAULT));
					$retData["status"]=0;
					$retData["message"]="user $username Inserted";
				}
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}

		return json_encode ($retData);
	}


	
	public static function login ($username, $password) {
		try {
			$USER=GET_SQL("select * from user where username=?",$username);
			// GET_SQL returns a list of returned records
			// Each array element is an array of selected fields with column names as key
			if (count($USER) == 1) { // Check if record returned
  				if (password_verify($password, $USER[0]["password"])) {
    					$id = session_create_id();
    					EXEC_SQL("update user set session=?, expiration= DATETIME(CURRENT_TIMESTAMP, '+30 minutes') where username=?", $id, $username);
    					$retData["status"]=0;
    					$retData["session"]=$id;
    					$retData["message"]= "User '$username' logged in";
				} else {
					$retData["status"]=1;
        				$retData["message"]= "User/Password Not Found";
	       			}
  			} else {
    				$retData["status"]=1;
    				$retData["message"]= "User/Password Not Found";
  			}
		} catch  (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}
		RETURN json_encode($retData);
	}

	public static function logout ($username, $session) {
		try {
			$USER=GET_SQL("select * from user where username=? and session=? ",$username,$session);
			// GET_SQL returns a list of returned records
			// Each array element is an array of selected fields with column names as key
			if (count($USER) == 1) { // Check if record returned
    				EXEC_SQL("update user set session=null, expiration= null where username=?", $username);
    				$retData["status"]=0;
    				$retData["message"]= "User '$username' logged out";
			} else {
        			$retData["status"]=1;
        			$retData["message"]= "User Not Found";
			}
		
		} catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
		}
		return json_encode($retData);
	}

	public static function addFavorite ($username, $stock, $session, $name) 
	
	{
		try {
			$function="add";
			$user=GET_SQL("select * from user where username=?", $username);
			if (count($user) > 0) {
				if ($user[0]['session'] == $session) {
					$userID = $user[0]['userid'];
					$existing = GET_SQL("select * from favorite where userid=? and stock=?", $userID, $stock);
					if (count($existing) < 1) {
						EXEC_SQL("insert into favorite (userid,stock,name) values (?,?,?)", $userID, $stock, $name);			
						EXEC_SQL("insert into log (userid,function,stock,name) values (?,?,?,?)", $userID, $function, $stock, $name);
						$retData["status"]=0;
						$retData["message"]="Favorite $stock for user $username Inserted";
					} else {
						$retData["status"]=1;
						$retData["message"]="Stock $stock already favorited by user $username"; 
					}
				} else {	
					$retData["status"]=1;
					$retData["message"]="User Not Logged In"; 
				}	
			} else {	
				$retData["status"]=1;
				$retData["message"]="User Not Found"; 
			}
		} catch  (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}

		return json_encode ($retData);
	}

	
	public static function deleteFavorite ($username, $stock, $session) 
	
	{
		try {
			$function="delete";
			$user=GET_SQL("select * from user where username=?", $username);
			if (count($user) > 0) {
				if ($user[0]['session'] == $session) {
					$userID = $user[0]['userid'];
					$existing = GET_SQL("select * from favorite where userid=? and stock=?", $userID, $stock);
					if (count($existing) > 0) {
						EXEC_SQL("delete from favorite where userid=? and stock=?", $userID, $stock);			
						EXEC_SQL("insert into log (userid,function,stock,name) values (?,?,?,?)", $userID, $function, $stock, $existing[0]['name']);
						$retData["status"]=0;
						$retData["message"]="Favorite $stock for user $username Removed";
					} else {
						$retData["status"]=1;
						$retData["message"]="Stock $stock not favorited by user $username"; 
					}
				} else {	
					$retData["status"]=1;
					$retData["message"]="User Not Logged In"; 
				}	
			} else {	
				$retData["status"]=1;
				$retData["message"]="User Not Found"; 
			}
		} catch  (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}

		return json_encode ($retData);
	}

	
public static function listChanges ($username, $session, $start, $end) 
	
	{
		try {
			$user=GET_SQL("select * from user where username=?", $username);
			if (count($user) > 0) {
				if ($user[0]['session'] == $session) {
					$userID = $user[0]['userid'];
					if ($start == "none" && $end == "none") {
						$results = GET_SQL("select time,stock,function,name from log where userid=?", $userID);
					} else if ($start == "none") {	
						$results = GET_SQL("select time,stock,function,name from log where time <=? and userid=?", $end, $userID);
					} else if ($end == "none") {	
						$results = GET_SQL("select time,stock,function,name from log where time >=? and userid=?", $start, $userID);
					}
					else {
						$results = GET_SQL("select time,stock,function,name from log where time >=? and time <=? and userid=?", $start, $end, $userID);
					}
					$numChanges=count($results);	
					$retData["results"] = $results;
					$retData["status"]=0;
					if ($start == "none" && $end == "none") {
						$retData["message"]="$numChanges Change(s) Found By User $username";
					} else if ($start == "none") {
						$retData["message"]="$numChanges Change(s) Found By User $username before $end";	
					
					} else if ($end == "none") {
						$retData["message"]="$numChanges Change(s) Found By User $username after $start";	
					}
				       	else {
						$retData["message"]="$numChanges Change(s) Found By User $username between $start and $end";	
					}
				} else {	
					$retData["status"]=1;
					$retData["message"]="User Not Logged In"; 
				}	
			} else {	
				$retData["status"]=1;
				$retData["message"]="User Not Found"; 
			}
		} catch  (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}

		return json_encode ($retData);
	}



	


	public static function getFavorites ($username, $session, $date) 
	
	{
		try {
			$user=GET_SQL("select * from user where username=?", $username);
			if (count($user) > 0) {
				if ($user[0]['session'] == $session) {
					$userID = $user[0]['userid'];
					if ($date == "none") {
						$changes = GET_SQL("select stock,time,name,function from log where userid=?", $userID);
					} else {
						$changes = GET_SQL("select stock,time,name,function from log where time <=? and userid=?", $date, $userID);			
					}
					$results = array();
						foreach($changes as $change) {
							if ($change['function'] == "add") {
								$results[] = array("stock" => $change["stock"], "name" => $change['name'], "time" => $change['time']);
							} else {
								// Remove the object from results if it exists
       								 foreach ($results as $key => $result) {
            								if ($result["stock"] == $change["stock"]) {
                								unset($results[$key]);
                								break; // Exit the loop once the item is removed
            								}
        							}
        							// Re-index the array to ensure it is sequential
        							$results = array_values($results);
							}
						}
					$numChanges=count($results);	
					$retData["results"] = $results;
					$retData["status"]=0;
					if ($date == "none") {
						$retData["message"]="$numChanges Favorite(s) Found By User $username";
					} else {
						$retData["message"]="$numChanges Favorite(s) Found By User $username at $date";	
					}
				} else {	
					$retData["status"]=1;
					$retData["message"]="User Not Logged In"; 
				}	
			} else {	
				$retData["status"]=1;
				$retData["message"]="User Not Found"; 
			}
		} catch  (Exception $e) {
			$retData["status"]=1;
			$retData["message"]=$e->getMessage();
		}

		return json_encode ($retData);
	}
		 
}

