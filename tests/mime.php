<?php

if (isset($_REQUEST['justshow']) && $_REQUEST['justshow']) {
  unset($_REQUEST['justshow']);
  $url = $PHP_SELF."?";
  foreach ($_REQUEST as $key => $val) {
    $url .= "$key=$val&";
  }
  echo "<p><a href=\"$url\">$url</a></p>";
}

else {

if (isset($_REQUEST["do"]) && $_REQUEST["do"] == 1) {
  if (isset($_REQUEST["type"]))
    header("Content-Type: ".$_REQUEST["type"]);

  $brokendisp = isset($_REQUEST["brokendisp"]) && $_REQUEST["brokendisp"] != "1";
  $disp = "";
  if (isset($_REQUEST["filename"]) && !$brokendisp)
    $disp = "attachment";

  if (isset($_REQUEST["disposition"]) && !$brokendisp)
    $disp = $_REQUEST["disposition"];

  if (isset($_REQUEST["filename"]) && $_REQUEST["filename"] != "") {
    if (!$brokendisp)
      $disp .= "; ";

    $disp .= "filename=";
    if ($_REQUEST["quote"])
      $disp .= "\"";

    $disp .= $_REQUEST["filename"];

    if ($_REQUEST["quote"])
      $disp .= "\"";
  }

  if ($disp != "")
    header("Content-Disposition: ".$disp);

  if (isset($_REQUEST["binary"]) && $_REQUEST["binary"] == 1) {
    readfile("TESTCASE.doc.gz");
    exit;
  }
}
}
?>
<DOCTYPE html>
<head>
  <title>MIME General-purpose testcase</title>
  <meta charset="utf-8">
</head>
<h1>GET</h1>
<form action="<?echo $_SERVER['PHP_SELF'];?>" method="GET">
<input type="hidden" name="do" value="1">

<table>


<tr><td>MIME-Type to send, empty if unspecified</td><td> <input name="type" value="text/html"></td></tr>
<tr><td>Content-Disposition to send, will not get sent if unspecified unless filename is specified</td><td>
  <input name="disposition"> (if empty but filename specified, attachment will be used) </td></tr>

<tr><td>Disposition Filename to send, none if unspecified </td><td><input name="filename"></td></tr>
<tr><td colspan="2"><input type="checkbox" name="binary" value="1">Send binary content instead of textual</td></tr>
<tr><td colspan="2"><input type="checkbox" name="quote" value="1" checked>Quote filename sent in Content-Disposition</td></tr>
<tr><td colspan="2"><input type="checkbox" name="brokendisp" value="1">Send Content-Disposition without disposition, but with filename (Content-Disposition: filename="foo")</td></tr>

</table>

<button>Submit</button><br>
<button name="justshow" value="1">Show url</button>

</form>

<?php
if (isset($_REQUEST["txt"])) {
  echo $_REQUEST["txt"];
}
?>
