import './code-highlight-block.css';

import type { NodeViewProps } from '@tiptap/react';

import React from 'react';
import { NodeViewContent, NodeViewWrapper  } from '@tiptap/react';

import { editorClasses } from '../classes';


// ----------------------------------------------------------------------


export const CodeHighlightBlock: React.FC<NodeViewProps> = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  extension,
  updateAttributes,
}) => (
    <NodeViewWrapper className={editorClasses.content.codeBlock}>
      <select
        name="language"
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        className={editorClasses.content.langSelect}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );