import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState, useEffect } from 'react'

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
      setSavedStates(JSON.parse(savedStatesFromStorage));
    }
  }, []);

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

  const loadPreviousState = () => {
    if (!editor || currentStateIndex <= 0) return;
    
    const newIndex = currentStateIndex - 1;
    setCurrentStateIndex(newIndex);
    editor.commands.setContent(savedStates[newIndex].content);
  };

  const loadNextState = () => {
    if (!editor || currentStateIndex >= savedStates.length - 1) return;
    
    const newIndex = currentStateIndex + 1;
    setCurrentStateIndex(newIndex);
    editor.commands.setContent(savedStates[newIndex].content);
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-controls" style={{ marginBottom: '1rem' }}>
        <button 
          onClick={saveCurrentState}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
        >
          Save Current State
        </button>
        <button 
          onClick={loadPreviousState}
          disabled={currentStateIndex <= 0}
          className="px-4 py-2 bg-gray-500 text-white rounded mr-2 hover:bg-gray-600 disabled:opacity-50"
        >
          ← Previous State
        </button>
        <button 
          onClick={loadNextState}
          disabled={currentStateIndex >= savedStates.length - 1}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Next State →
        </button>
        <span className="ml-4 text-sm text-gray-600">
          {savedStates.length > 0 ? `State ${currentStateIndex + 1} of ${savedStates.length}` : 'No saved states'}
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap 