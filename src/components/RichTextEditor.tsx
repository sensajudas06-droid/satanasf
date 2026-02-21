import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded transition-colors ${
      active
        ? 'bg-red-600 text-white'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const ColorButton = ({
  color,
  onClick,
  active,
}: {
  color: string;
  onClick: () => void;
  active: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-6 h-6 rounded border-2 transition-all ${
      active ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-500'
    }`}
    style={{ backgroundColor: color }}
    title={color}
  />
);

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const colors = [
    '#FFFFFF',
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#6B7280',
  ];

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
      <div className="border-b border-zinc-800 bg-zinc-950 p-2">
        <div className="flex flex-wrap gap-1">
          <div className="flex gap-1 pr-2 border-r border-zinc-800">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Kalın (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="İtalik (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Altı Çizili (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Üstü Çizili"
            >
              <Strikethrough className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex gap-1 pr-2 border-r border-zinc-800">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Başlık 1"
            >
              <Heading1 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Başlık 2"
            >
              <Heading2 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Başlık 3"
            >
              <Heading3 className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex gap-1 pr-2 border-r border-zinc-800">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Madde İşaretli Liste"
            >
              <List className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numaralı Liste"
            >
              <ListOrdered className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Alıntı"
            >
              <Quote className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex gap-1 pr-2 border-r border-zinc-800">
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="Sola Hizala"
            >
              <AlignLeft className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="Ortaya Hizala"
            >
              <AlignCenter className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="Sağa Hizala"
            >
              <AlignRight className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              active={editor.isActive({ textAlign: 'justify' })}
              title="İki Yana Yasla"
            >
              <AlignJustify className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex gap-1 items-center pr-2 border-r border-zinc-800">
            {colors.map((color) => (
              <ColorButton
                key={color}
                color={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                active={editor.isActive('textStyle', { color })}
              />
            ))}
          </div>

          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Geri Al (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Yinele (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </MenuButton>
          </div>
        </div>
      </div>

      <EditorContent editor={editor} className="bg-zinc-900" />
    </div>
  );
}
