import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import MediaPickerModal from "./MediaPickerModal";
import { mediaUrl } from "../../lib/api";
import { NoteBien } from "./NoteBienExtension";
import "./rich-text-editor.css";
import {
  FluentTextBold24Regular,
  FluentTextItalic24Regular,
  FluentTextHeader224Regular,
  FluentTextHeader324Regular,
  FluentTextBulletList24Regular,
  FluentTextNumberListLtr24Regular,
  FluentLink24Regular,
  FluentImageAdd24Regular,
  FluentWarning24Regular,
} from "./icons";

type Props = {
  name: string;
  label?: string;
  defaultValue?: string;
  rows?: number;
  token?: string;
  defaultFolder?: string;
};

export default function RichTextEditor({ name, label, defaultValue = "", rows = 6, token, defaultFolder }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "text-[#00bcd4] underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-2" } }),
      NoteBien,
    ],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `tt-editor prose prose-sm max-w-none focus:outline-none px-3 py-2 min-h-[450px]`,
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className="flex flex-col gap-1 text-sm text-gray-700">
      {label && <span>{label}</span>}
      <div className="border border-gray-300 rounded focus-within:border-[#00bcd4] overflow-hidden bg-white">
        {editor && <Toolbar editor={editor} onPickImage={token ? () => setPickerOpen(true) : undefined} />}
        <EditorContent editor={editor} />
      </div>
      <textarea name={name} value={html} readOnly hidden />
      {pickerOpen && token && (
        <MediaPickerModal
          token={token}
          defaultFolder={defaultFolder}
          onClose={() => setPickerOpen(false)}
          onSelect={(key) => {
            const url = mediaUrl(key);
            if (url) editor?.chain().focus().setImage({ src: url, alt: key }).run();
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Toolbar({ editor, onPickImage }: { editor: Editor; onPickImage?: () => void }) {
  const btn = (active: boolean) =>
    `px-2 py-1.5 text-base rounded transition-colors inline-flex items-center justify-center ${active ? "bg-[#00bcd4] text-white" : "text-gray-700 hover:bg-gray-100"}`;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1 bg-gray-50">
      <button type="button" title="Gras" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}><FluentTextBold24Regular /></button>
      <button type="button" title="Italique" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><FluentTextItalic24Regular /></button>
      <button type="button" title="Barré" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}><span className="text-xs font-semibold line-through w-[1em] h-[1em] inline-flex items-center justify-center">S</span></button>
      <span className="w-px bg-gray-200 mx-1" />
      <button type="button" title="Titre 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}><FluentTextHeader224Regular /></button>
      <button type="button" title="Titre 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}><FluentTextHeader324Regular /></button>
      <span className="w-px bg-gray-200 mx-1" />
      <button type="button" title="Liste à puces" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}><FluentTextBulletList24Regular /></button>
      <button type="button" title="Liste numérotée" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}><FluentTextNumberListLtr24Regular /></button>
      <button type="button" title="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}><span className="text-base leading-none">“”</span></button>
      <span className="w-px bg-gray-200 mx-1" />
      <button type="button" title="Lien" onClick={setLink} className={btn(editor.isActive("link"))}><FluentLink24Regular /></button>
      {onPickImage && (
        <button type="button" title="Insérer une image depuis la médiathèque" onClick={onPickImage} className={btn(false)}><FluentImageAdd24Regular /></button>
      )}
      <button type="button" title="Note bien / Attention" onClick={() => editor.chain().focus().toggleNoteBien().run()} className={btn(editor.isActive("noteBien"))}><FluentWarning24Regular /></button>
      <button type="button" title="Effacer le formatage" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className={btn(false)}><span className="text-sm">⨯</span></button>
    </div>
  );
}
