<?php

require 'slim/Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->response->headers->set('Content-Type', 'application/json; charset=utf-8');

$app->get('/token/:code', 'getToken');
$app->get('/channels', 'getChannels');
$app->get('/messages/:channel(/:ts)', 'getMessages');
$app->get('/search/:search',	'searchMessages');
$app->get('/validatetoken/:token',	'validateToken');

$app->run();

function getMessages($channel, $ts=null) {
    validateToken();

    $pageSize = 20;

    $select = "SELECT messages.channel_slack_id, 
				   channels.name as channel, 
				   messages.user_slack_id, 
				   users.name as user, 
				   messages.text, 
				   messages.ts, 
				   From_unixtime(messages.ts, '%d/%m/%Y') as date, 
				   From_unixtime(messages.ts, '%H:%i') as time 
			FROM   messages 
				   INNER JOIN users 
						   ON messages.user_slack_id = users.slack_id 
				   INNER JOIN channels 
						   ON messages.channel_slack_id = channels.slack_id ";

    if ($ts <> null)
    {
        $where = " WHERE  channels.name = :channel AND ts >= :ts ";		
        $orderby = "ORDER BY ts ";
    }
    else
    {
        $where = " WHERE  channels.name = :channel ";	
        $orderby = "ORDER BY ts DESC ";
    }

    $limit = " LIMIT :pageSize ";

    $sql = 'SELECT * FROM (' . $select . $where . $orderby . $limit . ') AS M ORDER BY ts';

    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);  
        $stmt->bindParam("channel", $channel);
        $stmt->bindParam("pageSize", $pageSize,  PDO::PARAM_INT);

        if ($ts <> null)
            $stmt->bindParam("ts", $ts);

        $stmt->execute();  
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $db = null;

        $navigation = createNavigation($channel,$pageSize,$messages);

        echo '{
    "channel_id": "'.$channel.'",
    "messages": '. json_encode($messages) .',
	 "navigation": '. $navigation .'
    }';

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}'; 
    }
}

function searchMessages($search) {
    validateToken();

    $select = "SELECT messages.channel_slack_id, 
				   channels.name as channel, 
				   messages.user_slack_id, 
				   users.name as user, 
				   messages.text, 
				   messages.ts, 
				   From_unixtime(messages.ts, '%d/%m/%Y') as date, 
				   From_unixtime(messages.ts, '%H:%i') as time 
			FROM   messages 
				   INNER JOIN users 
						   ON messages.user_slack_id = users.slack_id 
				   INNER JOIN channels 
						   ON messages.channel_slack_id = channels.slack_id 
			WHERE text like :search
			ORDER BY ts";
    try {
        $db = getConnection();
        $stmt = $db->prepare($select);  

        $s = "%".$search."%";
        $stmt->bindParam("search", $s);

        $stmt->execute();  
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $db = null;

        foreach($messages as $row) {
            $new_messages[] = array( 
                'channel_slack_id' => $row['channel_slack_id'],
                'channel' => $row['channel'],
                'user_slack_id' => $row['user_slack_id'],
                'user' => $row['user'],
                'ts' => $row['ts'],
                'date' => $row['date'], 
                'time' => $row['time'], 
                'text' => PrepareResult($search, $row['text'])
            ); 
        }

        echo json_encode($new_messages);

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}'; 
    }
}

function getChannels() {
    validateToken();

    $select = "SELECT distinct slack_id, name FROM channels INNER JOIN messages on channels.slack_id = messages.channel_slack_id  order by name;";
    try {
        $db = getConnection();
        $stmt = $db->prepare($select);
        $stmt->execute();
        $channels = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $db = null;

        echo json_encode($channels);

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}'; 
    }
}

function getToken($code){

    $client_id = '';
    $client_secret = '';
    $redirect_uri = 'http://localhost:8088/slarkive-web/src/callback.html'; // must match the originally submitted URI 

    $url = 'https://slack.com/api/oauth.access?client_id='.$client_id.'&client_secret='.$client_secret.'&code='.$code.'&redirect_uri='.$redirect_uri;

    $ch = curl_init ();
    curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
    curl_setopt ( $ch, CURLOPT_URL, $url );
    $result = curl_exec ( $ch );
    curl_close ( $ch );
    return $result;
}

function validateToken() {

    $app = \Slim\Slim::getInstance();

    $token = $app->request->headers->get('Authorization');

    $url = 'https://slack.com/api/auth.test?token='.$token;

    $ch = curl_init ();
    curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
    curl_setopt ( $ch, CURLOPT_URL, $url );
    curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, TRUE);
    $result = curl_exec ( $ch );
    curl_close ( $ch );

    $obj = json_decode($result);
    if ($obj->ok == FALSE){
        $app->status(401);
        echo '{"error":"invalid token"}'; 
        $app->stop();
    }
}

// - private methods

function createNavigation($channel, $pageSize,$messages){
    $prev_page = null;
    $next_page = null;


    if (count($messages) > 0)
    {
        $f_msg = $messages[0];
        $l_msg = $messages[count($messages)-1];

        $prev_page_select = "select ts from messages 
                            INNER JOIN channels 
						    ON messages.channel_slack_id = channels.slack_id
							WHERE channels.name = :channel 
							AND ts < :ts 
							ORDER BY ts DESC Limit :pageSize ";

        $db = getConnection();
        $stmt = $db->prepare($prev_page_select);  
        $stmt->bindParam("channel", $channel);
        $stmt->bindParam("ts", $f_msg["ts"],  PDO::PARAM_INT);
        $stmt->bindParam("pageSize", $pageSize,  PDO::PARAM_INT);

        $stmt->execute();  
        $prev_page_temp = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($prev_page_temp)> 0)
            $prev_page = $prev_page_temp[count($prev_page_temp)-1]["ts"];


        $next_page_select = "select ts from messages 
							INNER JOIN channels 
						    ON messages.channel_slack_id = channels.slack_id
							WHERE channels.name = :channel 
							AND ts > :ts 
							ORDER BY ts ";


        $stmt = $db->prepare($next_page_select);  
        $stmt->bindParam("channel", $channel);
        $stmt->bindParam("ts", $l_msg["ts"],  PDO::PARAM_INT);

        $stmt->execute();  
        $next_page_temp = $stmt->fetchObject();
        if ($next_page_temp != null)
            $next_page = $next_page_temp->ts;

        $db = null;

        return '{
				"prev": "'. $prev_page .'", 
				"next": "'. $next_page .'"
			   }'; 
    }
    else
    {
        return '{}';
    }

}

function PrepareResult($string, $text){
    $var = explode(strtolower($string), strtolower($text));

    $beforeLen = $afterLen = 30;

    if (strlen($var[0]) < $beforeLen)
        $beforeLen = strlen($var[0]);

    if (strlen($var[1]) < $afterLen)
        $afterLen = strlen($var[1]);

    return "... " . substr($var[0],-$beforeLen) . $string . substr($var[1],0,$afterLen) . " ...";
}

function replaceUserID(){
}

function getConnection() {

    $dbhost="127.0.0.1";
    $dbuser="root";
    $dbpass="";
    $dbname="slarkive";
    
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname;charset=utf8", $dbuser, $dbpass);	
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}


