$Current_Folder = split-path $MyInvocation.MyCommand.Path

Function Show-Toast {
	[CmdletBinding()]
	Param (
		[String]$ToastMessage
	)

	[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
	[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

$template = @"
<toast>
    <visual>
        <binding template="ToastImageAndText03">
            <text id="1">Deploi</text>
            <text id="2">$ToastMessage</text>
			<image id="1" src="$Current_Folder/assets/deploi.png" />
        </binding>
    </visual>
	<audio src="ms-winsoundevent:Notification.Default"/>
</toast>
"@

	$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
	$xml.LoadXml($template)
	$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
	[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Deploi").Show($toast)
}

Function Test-IsDeploiRunning {
    <#
    .SYNOPSIS
        Kills CURRENT instance if this script already running.
    .DESCRIPTION
        Kills CURRENT instance if this script already running.
        Call this function VERY early in your script.
        If it sees itself already running, it exits.

        Uses WMI because any other methods because we need the commandline 
    .PARAMETER ScriptName
        Name of this script
        Use the following line *OUTSIDE* of this function to get it automatically
        $ScriptName = $MyInvocation.MyCommand.Name
    .EXAMPLE
        $ScriptName = $MyInvocation.MyCommand.Name
        Test-IsDeploiRunning -ScriptName $ScriptName
    .NOTES
        $PID is a Built-in Variable for the current script''s Process ID number
    .LINK
    #>

	[CmdletBinding()]
	Param (
		[Parameter(Mandatory=$true)]
		[ValidateNotNullorEmpty()]
		[String]$ScriptName
	)
	#Get array of all powershell scripts currently running
	$PsScriptsRunning = get-wmiobject win32_process | where{$_.processname -eq 'powershell.exe'} | select-object commandline,ProcessId

	#Get name of current script
	#$ScriptName = $MyInvocation.MyCommand.Name #NO! This gets name of *THIS FUNCTION*

	#Enumerate each element of array and compare
	ForEach ($PsCmdLine in $PsScriptsRunning){
		[Int32]$OtherPID = $PsCmdLine.ProcessId
		[String]$OtherCmdLine = $PsCmdLine.commandline
		#Are other instances of this script already running?
		If (($OtherCmdLine -match $ScriptName) -And ($OtherPID -ne $PID) ){
			Show-Toast -ToastMessage 'Deploi is already running.'
			Exit
		}
	}
}

Test-IsDeploiRunning -ScriptName $MyInvocation.MyCommand.Name

################################################################################################################################
# Initialize Deploi Dependencies
################################################################################################################################

[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')  	 | out-null
[System.Reflection.Assembly]::LoadWithPartialName('presentationframework') 	 | out-null
[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing') 		 | out-null
[System.Reflection.Assembly]::LoadWithPartialName('WindowsFormsIntegration') | out-null

$App_Icon = New-Object System.Windows.Forms.NotifyIcon
$icons = "$Current_Folder\assets\icons"

# -----------------------------------------------------------------------------------
# Caching all Icons
# -----------------------------------------------------------------------------------
$App_Tray_Icon = "$icons\deploi.ico"
$Cross_Icon = [System.Drawing.Bitmap]::FromFile("$icons\exit.png")
$InformationIcon = [System.Windows.MessageBoxImage]::Information
$WarningIcon = [System.Windows.MessageBoxImage]::Warning

$foreverExists = npm list -g forever
if($foreverExists -clike '*(empty)*') {
	$ButtonType = [System.Windows.MessageBoxButton]::YesNo
	$MessageboxTitle = "Deploi: Forever module doesn't exist"
	$Messageboxbody = "Forever npm module is required to be installed.`nPress yes to download and install it."
	$response = [System.Windows.MessageBox]::Show($Messageboxbody, $MessageboxTitle, $ButtonType, $InformationIcon)

	if ($response -eq "Yes") {
		npm i -g forever
	}
	else {
		Stop-Process -Id $PID
	}
}

################################################################################################################################
# Start Deploi Client
################################################################################################################################
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
}
npm run startClient | Out-Null
Show-Toast -ToastMessage 'Deploi has started'

################################################################################################################################
# Add the systray menu
################################################################################################################################

$App_Icon.Text = "Deploi"
$App_Icon.Icon = $App_Tray_Icon
$App_Icon.Visible = $true
$App_Icon.Add_Click({
	If ($_.Button -eq [Windows.Forms.MouseButtons]::Left) {
		Start-Process 'https://deploi.herokuapp.com'
	}
})

$contextmenu = New-Object System.Windows.Forms.ContextMenuStrip
$App_Icon.ContextMenuStrip = $contextmenu

# -----------------------------------------------------------------------------------
# Adding Submenu `Quit`
# -----------------------------------------------------------------------------------
$Quit = $contextmenu.Items.Add("Quit")
$Quit.Image = $Cross_Icon
$Quit.Add_Click({
	$App_Icon.Visible = $false
	npm run stopClient | Out-Null
	Stop-Process -Id $PID
})

#Make PowerShell Disappear
$windowcode = '[DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);'
$asyncwindow = Add-Type -MemberDefinition $windowcode -name Win32ShowWindowAsync -namespace Win32Functions -PassThru
$null = $asyncwindow::ShowWindowAsync((Get-Process -PID $PID).MainWindowHandle, 0)

# Force garbage collection just to start slightly lower RAM usage.
[System.GC]::Collect()

# Create an application context for it to all run within.
# This helps with responsiveness, especially when clicking Exit.
$appContext = New-Object System.Windows.Forms.ApplicationContext
[void][System.Windows.Forms.Application]::Run($appContext)