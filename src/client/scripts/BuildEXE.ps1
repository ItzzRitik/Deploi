try {
    Import-Module PS2EXE -Force -Erroraction stop
} 
catch {
	[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')		| out-null
	[System.Reflection.Assembly]::LoadWithPartialName('presentationframework')		| out-null
	[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing')				| out-null
	[System.Reflection.Assembly]::LoadWithPartialName('WindowsFormsIntegration')	| out-null

	$InformationIcon = [System.Windows.MessageBoxImage]::Information
	$ButtonType = [System.Windows.MessageBoxButton]::YesNo
	$MessageboxTitle = "Deploi: PS2EXE Module not found"
	$Messageboxbody = "PS2EXE is required to be installed.`nPress yes to install it."
	$response = [System.Windows.MessageBox]::Show($Messageboxbody, $MessageboxTitle, $ButtonType, $InformationIcon)

	if ($response -eq "Yes") {
		if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
			Start-Process PowerShell -Verb RunAs -Wait "-NoProfile -ExecutionPolicy Bypass -Command `"cd '$pwd'; & 'src/client/scripts/InstallDependency.ps1';`"";
		}
	}
	else {
		Stop-Process -Id $pid
	}
}

try {
	Import-Module PS2EXE -Force -Erroraction stop
	PS2EXE -InputFile src/client/scripts/Launcher.ps1 -OutputFile Deploi.exe -iconFile src/client/assets/deploi.ico -noConsole -noOutput -noError
}
catch {
	Stop-Process -Id $pid
}
