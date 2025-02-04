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
import { ChevronDown, Save, GitCompare } from "lucide-react"
import './diff.css'

interface EditorState {
  content: string;
  timestamp: number;
}

interface DiffViewProps {
  currentContent: string;
  previousContent: string;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const DiffView = ({ currentContent, previousContent, onAccept, onReject, onClose }: DiffViewProps) => {
  const previousEditor = useEditor({
    extensions: [StarterKit],
    content: previousContent,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
      },
    },
  });

  const currentEditor = useEditor({
    extensions: [StarterKit],
    content: currentContent,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (previousEditor && currentEditor) {
      // Add custom styles to highlight changes
      const previousDOM = previousEditor.view.dom as HTMLElement;
      const currentDOM = currentEditor.view.dom as HTMLElement;

      // Function to compare and highlight changes
      const highlightChanges = () => {
        const previousHTML = previousEditor.getHTML();
        const currentHTML = currentEditor.getHTML();

        if (previousHTML === currentHTML) return;

        // Add a wrapper class to both editors for styling
        previousDOM.classList.add('diff-view');
        currentDOM.classList.add('diff-view');

        // Simple diff highlighting based on element comparison
        const previousElements = previousDOM.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, li');
        const currentElements = currentDOM.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, li');

        previousElements.forEach((el, i) => {
          const currentEl = currentElements[i];
          if (!currentEl || el.textContent !== currentEl.textContent) {
            el.classList.add('diff-deleted');
          }
        });

        currentElements.forEach((el, i) => {
          const previousEl = previousElements[i];
          if (!previousEl || el.textContent !== previousEl.textContent) {
            el.classList.add('diff-added');
          }
        });
      };

      highlightChanges();
    }
  }, [previousEditor, currentEditor]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Review Changes</h2>
          <Button onClick={onClose}>×</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-2">Previous Version</div>
            <div className="prose-diff-old">
              <EditorContent editor={previousEditor} />
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-2">Current Version</div>
            <div className="prose-diff-new">
              <EditorContent editor={currentEditor} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onReject} variant="outline" className="bg-red-50 hover:bg-red-100">
            Reject Changes
          </Button>
          <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white">
            Accept Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const Tiptap = () => {
  const [savedStates, setSavedStates] = useState<EditorState[]>([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(-1);
  const [showDiff, setShowDiff] = useState(false);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);

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

  const handleCompare = (index: number) => {
    setCompareIndex(index);
    setShowDiff(true);
  };

  const handleAcceptChanges = () => {
    if (compareIndex === null || !editor) return;
    loadState(compareIndex);
    setShowDiff(false);
    setCompareIndex(null);
  };

  const handleRejectChanges = () => {
    setShowDiff(false);
    setCompareIndex(null);
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
          <DropdownMenuContent className="w-72">
            <DropdownMenuLabel>Saved States</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedStates.length === 0 ? (
              <DropdownMenuItem disabled>No saved states</DropdownMenuItem>
            ) : (
              savedStates.map((state, index) => (
                <DropdownMenuItem
                  key={state.timestamp}
                  className={`flex items-center justify-between ${currentStateIndex === index ? "bg-muted" : ""}`}
                >
                  <span onClick={() => loadState(index)}>{formatTimestamp(state.timestamp)}</span>
                  {index !== currentStateIndex && (
                    <Button
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleCompare(index)}
                    >
                      <GitCompare className="h-4 w-4" />
                      Compare
                    </Button>
                  )}
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

      {showDiff && compareIndex !== null && editor && (
        <DiffView
          currentContent={editor.getHTML()}
          previousContent={savedStates[compareIndex].content}
          onAccept={handleAcceptChanges}
          onReject={handleRejectChanges}
          onClose={() => setShowDiff(false)}
        />
      )}
    </div>
  )
}

export default Tiptap 