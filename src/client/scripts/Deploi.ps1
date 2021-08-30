$foreverExists = npm list -g forever
if($foreverExists -clike '*(empty)*') {
	echo "Forever module doesn't exist -> Installing"
	npm i -g forever
}

$list = forever list
$isDeploiRunning = $false
$state = $null

foreach ($item in $list) {
	if($item -clike '*deploi.js*') {
		$isDeploiRunning = $true
		break
	}
}

if($isDeploiRunning) {
	npm run stopClient | Out-Null
	$state = "Service stopped"
}
else {
	npm run startClient | Out-Null
	$state = "Service started"
}

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

#Current Directory
$ScriptPath = $MyInvocation.MyCommand.Path
$CurrentDir = Split-Path $ScriptPath

$AppLogo = "file:///$CurrentDir/../assets/deploi.png"

echo $AppLogo

$template = @"
<toast>
    <visual>
        <binding template="ToastImageAndText03">
            <text id="1">Deploi</text>
            <text id="2">$state</text>
			<image id="1" src="$AppLogo" />
        </binding>
    </visual>
	<audio src="ms-winsoundevent:Notification.Default"/>
</toast>
"@

$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Deploi").Show($toast)