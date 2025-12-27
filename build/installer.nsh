!macro customUnInstall
  ; Check if the installer exists in the installation directory
  FindFirst $0 $1 "$INSTDIR\wintrol Setup*.exe"
  IfErrors done

  loop:
    ; Found a setup file, move it to the parent directory to save it
    ; $1 is the filename found
    Rename "$INSTDIR\$1" "$INSTDIR\..\$1"
    
    FindNext $0 $1
    IfErrors done
    Goto loop

  done:
    FindClose $0

    ; Aggressive Cleanup: Wipe the folder (files left over)
    ; Safety Check: Don't wipe if path is root (e.g. C:\)
    StrLen $2 "$INSTDIR"
    IntCmp $2 3 skip_wipe skip_wipe ; If len == 3 or less, skip.
    
    ; If we are safely in a subfolder, wipe it.
    ; This deletes everything remaining (including uninstaller itself, which is fine as it runs from temp)
    RMDir /r "$INSTDIR"
    
  skip_wipe:

!macroend
