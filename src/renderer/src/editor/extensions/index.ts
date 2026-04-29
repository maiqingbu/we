import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { MarkdownPaste } from './MarkdownPaste'
import { MarkdownLink } from './MarkdownLink'
import { FontSize } from './FontSize'
import { FontFamily } from './FontFamily'
import { LineHeight } from './LineHeight'
import { TextIndent } from './TextIndent'
import { ParagraphSpacing } from './ParagraphSpacing'
import { LintHighlight } from './LintHighlight'
import { DragHandle as DragHandleExtension } from '@tiptap/extension-drag-handle-react'
import { SlashCommand } from './SlashCommand'
import { ImageUpload } from './ImageUpload'
import { TemplateBlock } from './TemplateBlock'
import { ImageEditExtension } from './ImageEdit'
import { ColumnsContainer } from './ColumnsContainer'
import { Column } from './Column'
import { FindReplace } from './FindReplace'

const lowlight = createLowlight(common)

export function getExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: false,
      link: false,
      underline: false,
    }),
    Placeholder.configure({
      placeholder: '开始写作…',
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        class: 'editor-link',
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    FontSize,
    FontFamily,
    LineHeight,
    TextIndent,
    ParagraphSpacing,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    Typography,
    CodeBlockLowlight.configure({
      lowlight,
    }),
    MarkdownPaste,
    MarkdownLink,
    LintHighlight,
    DragHandleExtension,
    SlashCommand,
    ImageUpload,
    TemplateBlock,
    ImageEditExtension,
    Column,
    ColumnsContainer,
    FindReplace,
  ]
}
