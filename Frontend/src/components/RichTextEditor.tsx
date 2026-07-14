import { useRef, useCallback, useEffect } from 'react'
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Image, List, Type, Minus,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32']

export default function RichTextEditor({ value, onChange, placeholder = 'Write problem description...', minHeight = 200 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternal = useRef(false)

  // Sync external value changes into editor (avoid cursor loss)
  useEffect(() => {
    if (!editorRef.current || isInternal.current) return
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    emit()
  }, [])

  function emit() {
    isInternal.current = true
    onChange(editorRef.current?.innerHTML ?? '')
    setTimeout(() => { isInternal.current = false }, 0)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    // Handle image paste
    const items = e.clipboardData.items
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        const reader = new FileReader()
        reader.onload = ev => {
          if (ev.target?.result) {
            exec('insertHTML', `<img src="${ev.target.result}" style="max-width:100%;height:auto;border-radius:8px;margin:4px 0;" alt="pasted image" />`)
          }
        }
        reader.readAsDataURL(file)
        return
      }
    }
    // Paste as plain text to avoid style leakage
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  function handleFontSize(size: string) {
    // execCommand fontSize uses 1–7, so we use inline style via insertHTML
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (!range.collapsed) {
      const selectedText = range.toString()
      exec('insertHTML', `<span style="font-size:${size}px">${selectedText}</span>`)
    }
  }

  const btnCls = 'p-1.5 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center'
  const btnSt = { color: 'var(--foreground)', background: 'transparent' }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--muted)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>

        {/* Font size */}
        <div className="flex items-center gap-1 mr-1">
          <Type size={12} style={{ color: 'var(--muted-foreground)' }} />
          <select
            onChange={e => handleFontSize(e.target.value)}
            className="text-xs rounded-md px-1 py-0.5 outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' }}
            defaultValue="14">
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <button className={btnCls} style={btnSt} title="Bold" onMouseDown={e => { e.preventDefault(); exec('bold') }}>
          <Bold size={14} />
        </button>
        <button className={btnCls} style={btnSt} title="Italic" onMouseDown={e => { e.preventDefault(); exec('italic') }}>
          <Italic size={14} />
        </button>
        <button className={btnCls} style={btnSt} title="Underline" onMouseDown={e => { e.preventDefault(); exec('underline') }}>
          <Underline size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <button className={btnCls} style={btnSt} title="Bullet list" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}>
          <List size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <button className={btnCls} style={btnSt} title="Align left" onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }}>
          <AlignLeft size={14} />
        </button>
        <button className={btnCls} style={btnSt} title="Align center" onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }}>
          <AlignCenter size={14} />
        </button>
        <button className={btnCls} style={btnSt} title="Align right" onMouseDown={e => { e.preventDefault(); exec('justifyRight') }}>
          <AlignRight size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

        <button className={btnCls} style={btnSt} title="Horizontal rule" onMouseDown={e => { e.preventDefault(); exec('insertHorizontalRule') }}>
          <Minus size={14} />
        </button>

        {/* Insert image from URL */}
        <button className={btnCls} style={btnSt} title="Insert image (paste or URL)"
          onMouseDown={e => {
            e.preventDefault()
            const url = prompt('Image URL (or paste image directly into editor):')
            if (url) exec('insertHTML', `<img src="${url}" style="max-width:100%;height:auto;border-radius:8px;margin:4px 0;" alt="image" />`)
          }}>
          <Image size={14} />
        </button>

        <span className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Paste image directly
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{
          minHeight,
          padding: '12px 16px',
          outline: 'none',
          color: 'var(--foreground)',
          background: 'var(--muted)',
          fontSize: 14,
          lineHeight: 1.6,
        }}
        className="rich-editor"
      />

      <style>{`
        .rich-editor:empty::before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
          opacity: 0.6;
        }
        .rich-editor img { max-width: 100%; }
        .rich-editor ul { padding-left: 1.5em; list-style: disc; }
        .rich-editor ol { padding-left: 1.5em; list-style: decimal; }
        .rich-editor code { font-family: monospace; background: rgba(99,102,241,0.1); padding: 0 4px; border-radius: 4px; }
      `}</style>
    </div>
  )
}
