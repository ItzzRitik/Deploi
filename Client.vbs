Set WshShell = CreateObject("Wscript.shell")
WshShell.run "powershell.exe -ExecutionPolicy bypass -windowstyle hidden -file ./Client.ps1", 0