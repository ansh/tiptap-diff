import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Save } from "lucide-react"

interface EditorState {
  content: string;
  timestamp: number;
}

const Tiptap = () => {
  const [savedStates, setSavedStates] = useState<EditorState[]>([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(-1);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! Start typing...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  useEffect(() => {
    // Load saved states from localStorage on component mount
    const savedStatesFromStorage = localStorage.getItem('editorStates');
    if (savedStatesFromStorage) {
      const states = JSON.parse(savedStatesFromStorage);
      setSavedStates(states);
      
      // Set to the latest state (last in the array)
      if (states.length > 0 && editor) {
        const latestIndex = states.length - 1;
        setCurrentStateIndex(latestIndex);
        editor.commands.setContent(states[latestIndex].content);
      }
    }
  }, [editor]); // Add editor as dependency to ensure it's available

  const saveCurrentState = () => {
    if (!editor) return;
    
    const newState: EditorState = {
      content: editor.getHTML(),
      timestamp: Date.now(),
    };
    
    const newStates = [...savedStates, newState];
    setSavedStates(newStates);
    setCurrentStateIndex(newStates.length - 1);
    localStorage.setItem('editorStates', JSON.stringify(newStates));
  };

  const loadState = (index: number) => {
    if (!editor || index < 0 || index >= savedStates.length) return;
    setCurrentStateIndex(index);
    editor.commands.setContent(savedStates[index].content);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-controls flex items-center gap-2 mb-4">
        <Button onClick={saveCurrentState} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Current State
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              History
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Saved States</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedStates.length === 0 ? (
              <DropdownMenuItem disabled>No saved states</DropdownMenuItem>
            ) : (
              savedStates.map((state, index) => (
                <DropdownMenuItem
                  key={state.timestamp}
                  onClick={() => loadState(index)}
                  className={currentStateIndex === index ? "bg-muted" : ""}
                >
                  {formatTimestamp(state.timestamp)}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {savedStates.length > 0 && (
          <span className="text-sm text-muted-foreground">
            State {currentStateIndex + 1} of {savedStates.length}
          </span>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap 