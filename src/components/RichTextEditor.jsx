import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { Button, Space } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Sync value changes from parent (e.g. Form.Item) to editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only set content if it's actually different to avoid cursor jumping
      // Compare without HTML tags might be safer but precise HTML comparison is tricky
      // For now, simple check. If value is empty and editor is <p></p>, handle that.
      if (value === '' && editor.getHTML() === '<p></p>') return;
      
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <Space>
          <Button
            size="small"
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            type={editor.isActive('bold') ? 'primary' : 'default'}
          />
          <Button
            size="small"
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            type={editor.isActive('italic') ? 'primary' : 'default'}
          />
          <Button
            size="small"
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            type={editor.isActive('strike') ? 'primary' : 'default'}
          />
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
          >
            H2
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
          >
            H3
          </Button>
          <Button
            size="small"
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            type={editor.isActive('orderedList') ? 'primary' : 'default'}
          />
          <Button
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            type={editor.isActive('bulletList') ? 'primary' : 'default'}
          />
          <Button
            size="small"
            icon={<LinkOutlined />}
            onClick={addLink}
            type={editor.isActive('link') ? 'primary' : 'default'}
          />
        </Space>
      </div>
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        className="tiptap-content"
      />
    </div>
  );
};

export default RichTextEditor;
