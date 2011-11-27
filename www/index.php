<?
include_once ('include/functions.php');

$_URL = preg_replace("/^(.*?)index\.php$/is", "$1", $_SERVER['SCRIPT_NAME']);
$_URL = preg_replace("/^".preg_quote($_URL, "/")."/is", "", urldecode($_SERVER['REQUEST_URI']));
$_URL = preg_replace("/(\/?)(\?.*)?$/is", "", $_URL);
$_URL = preg_replace("/[^0-9A-Za-z._\\-\\/]/is", "", $_URL); // вырезаем ненужные символы (не обязательно это делать)
$_URL = explode("/", $_URL);
if (preg_match("/^index\.(?:html|php)$/is", $_URL[count($_URL) - 1])) unset($_URL[count($_URL) - 1]); // удаляем суффикс

if (empty($_URL[0]))
  $_URL[0] = 'map';

if ($_URL[0] == "account") {
  if (!checkauth()) {
    session_start();
    $_SESSION["returnto"] = "./account";
    Header("Location: ./login");
    die;
  }
  $data = array("name"=>"account", "text"=>"Настройки");
} else {
  dbconn();
  $result = pg_query("SELECT * FROM pagedata WHERE name='".pg_escape_string($_URL[0])."' AND activate");
  if (pg_num_rows($result) <= 0) Err404();
  $data = pg_fetch_assoc($result);
}

if (!file_exists($data['name'].'.php'))
  Err404();

include_once ('include/external.php');
include_once ($_URL[0].'.php');
?>
<!doctype html>
<html>
<head>
  <title>OpenStreetMap Россия — <?=$data['text'] ?></title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <link rel="stylesheet" href="css/main.css" type="text/css" media="screen, projection" />
  <link rel="stylesheet" href="css/main_small.css" type="text/css" media="handheld, only screen and (max-device-width:800px)" />
  <link rel="stylesheet" href="css/leaflet.css" />
  <link rel="search" href="/search.xml" type="application/opensearchdescription+xml" title="OpenStreetMap.Ru" />
  <script src="js/leaflet.js"></script>
  <!--[if lte IE 8]><link rel="stylesheet" href="css/leaflet.ie.css" /><![endif]-->
  <script type="text/javascript" src="js/main.js"></script>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <? print($external_head); ?>
  <? print($page_head); ?>
</head>
<body>

<? show_menu($_URL[0]); ?>

  <div id="toppan">
    <a href="/">
      <img src="<? print($page_logo); ?>" alt="OpenStreetMap.ru" id="logo">
    </a>
    <div id="searchcont">
<? print($page_toopbar); ?>

    </div>
    <div id="colorline" style="background:<?=$data['color']?>;"></div>
  </div>
  
  <div id="content">
    <? print($page_content); ?>
  </div>
  
  <? print($external_bodyend); ?>
</body>
