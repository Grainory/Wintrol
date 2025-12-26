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
!macroend
