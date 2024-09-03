"use client";

import React, { useRef } from "react";
import { Editor as TinyMceEditor } from "@tinymce/tinymce-react";

interface EditorProps {
  onChange: (html: string) => void;
}

const Editor: React.FC<EditorProps> = ({ onChange }) => {
  const editorRef = useRef<any>(null);

  return (
    <TinyMceEditor
      apiKey="3gzrzdqitrjtu9ximasl1bg2unyady6wk6gwgpo3cn2u6a0y"
      onInit={(_evt, editor) => (editorRef.current = editor)}
      initialValue={
        '<p style="font-size: 14px; text-align: justify;"><span style="color: #ecf0f1;">Ol&aacute;, {{NOME}}</span></p><p style="font-size: 14px; text-align: justify;"><span style="color: #ecf0f1;">Informamos que seu certificado de participa&ccedil;&atilde;o no CONARH 2024 est&aacute; em anexo a este e-mail.&nbsp;</span><span style="color: #ecf0f1;">Agradecemos imensamente por sua presen&ccedil;a e contribui&ccedil;&atilde;o, que foram fundamentais para o sucesso do evento. </span><span style="color: #ecf0f1;">Caso tenha qualquer d&uacute;vida ou necessite de informa&ccedil;&otilde;es adicionais, por favor, n&atilde;o hesite em nos contatar.</span></p><p style="font-size: 14px; text-align: justify;"><span style="color: #ecf0f1;">Atenciosamente,</span><br><span style="color: #ecf0f1;">ABRH Brasil</span></p>'
      }
      init={{
        width: "100%",
        height: "100%",
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo fontsize | blocks | bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        font_size_formats: "8px 10px 12px 14px 16px 18px 24px 36px 48px",
        skin: "oxide-dark",
        content_css: "dark",
      }}
      onChange={() => {
        onChange((editorRef.current as any).getContent());
      }}
      onLoadContent={() => {
        setTimeout(() => {
          onChange((editorRef.current as any).getContent());
        }, 1000);
      }}
    />
  );
};

export default Editor;
