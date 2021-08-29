Set WshShell = CreateObject("Wscript.shell")
WshShell.run "powershell -ExecutionPolicy bypass -windowstyle hidden -file ./src/client/script/RunClient.ps1", 0