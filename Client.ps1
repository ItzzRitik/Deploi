$pshost = get-host
$pswindow = $pshost.ui.rawui
$pswindow.windowtitle = "Deplow Node Client"
$newsize = $pswindow.buffersize
$newsize.width = 120
$newsize.height = 50
$pswindow.buffersize = $newsize
$newsize = $pswindow.windowsize
$newsize.width = 100
$newsize.height = 20
$pswindow.windowsize = $newsize

$appName = "Deplow\client.js"
$list = forever list
$isDeplowRunning = $false
$state = $null

foreach ($item in $list) {
	if($item.IndexOf($appName) -ne -1) {
		$isDeplowRunning = $true
		break
	}
}

if($isDeplowRunning) {
	forever stop client.js | Out-Null
	$state = "Service stopped"
}
else {
	forever start client.js | Out-Null
	$state = "Service started"
}

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

$template = @"
<toast>
    <visual>
        <binding template="ToastText02">
            <text id="1">Deplow</text>
            <text id="2">$state</text>
        </binding>
    </visual>
	<audio src="ms-winsoundevent:Notification.Default"/>
</toast>
"@

$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Deplow").Show($toast)