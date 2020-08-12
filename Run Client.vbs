Set WshShell = CreateObject("Wscript.shell")
WshShell.run "powershell.exe -ExecutionPolicy bypass -windowstyle hidden -file ./script/RunClient.ps1", 0