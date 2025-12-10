import type { Node as ProseMirrorNode, Schema } from '@tiptap/pm/model'
import MarkdownIt from 'markdown-it'

interface Token {
  type: string
  tag?: string
  content?: string
  children?: Token[]
  info?: string
  attrGet?: (key: string) => string | null
  [key: string]: unknown
}

export function parseMarkdownContent(markdown: string, schema: Schema): ProseMirrorNode {
  try {
    const md = new MarkdownIt()
    const tokens = md.parse(markdown, {})

    if (!tokens || tokens.length === 0) {
      return schema.nodes.doc.create()
    }

    // @ts-ignore
    const nodes = parseTokens(tokens, schema)
    return schema.nodes.doc.create({}, nodes)
  } catch (error) {
    console.error('Failed to parse markdown:', error)
    return schema.nodes.doc.create()
  }
}

/**
 * 解析 markdown-it tokens 为 ProseMirror 节点
 */
// @ts-ignore
function parseTokens(tokens: Token[], schema: Schema): ProseMirrorNode[] {
  const nodes: ProseMirrorNode[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type === 'heading_open') {
      const level = Number.parseInt(token.tag?.slice(1) || '1', 10)
      const headingToken = tokens[i + 1]
      const text = headingToken?.content || ''
      const node = schema.nodes.heading?.create(
        { level },
        schema.text(text),
      )
      if (node) nodes.push(node)
      i += 3
      continue
    }

    if (token.type === 'paragraph_open') {
      const contentToken = tokens[i + 1]
      if (contentToken && contentToken.type === 'inline') {
        const textContent = contentToken.content || ''
        const inlineChildren = parseInlineContent(contentToken.children || [], schema)
        const content = inlineChildren && inlineChildren.length > 0 ? inlineChildren.filter((n): n is ProseMirrorNode => n !== null) : [schema.text(textContent)]
        const node = schema.nodes.paragraph?.create({}, content)
        if (node) nodes.push(node)
      }
      i += 3
      continue
    }

    if (token.type === 'bullet_list_open') {
      const listItems: ProseMirrorNode[] = []
      i += 1
      while (i < tokens.length && tokens[i].type !== 'bullet_list_close') {
        if (tokens[i].type === 'list_item_open') {
          const itemContent = tokens[i + 1]
          if (itemContent && itemContent.type === 'paragraph_open') {
            const textToken = tokens[i + 2]
            const inlineChildren = parseInlineContent(textToken?.children || [], schema)
            const content = inlineChildren && inlineChildren.length > 0 ? inlineChildren.filter((n): n is ProseMirrorNode => n !== null) : [schema.text(textToken?.content || '')]
            const listItem = schema.nodes.listItem?.create(
              {},
              schema.nodes.paragraph?.create({}, content),
            )
            if (listItem) listItems.push(listItem)
          }
          i += 4
        } else {
          i += 1
        }
      }
      const bulletList = schema.nodes.bulletList?.create({}, listItems)
      if (bulletList) nodes.push(bulletList)
      i += 1
      continue
    }

    if (token.type === 'code_block' || token.type === 'fence') {
      const code = token.content || ''
      const language = token.info || ''
      const node = schema.nodes.codeBlock?.create(
        { language },
        schema.text(code),
      )
      if (node) nodes.push(node)
      i += 1
      continue
    }

    if (token.type === 'hr') {
      const node = schema.nodes.horizontalRule?.create()
      if (node) nodes.push(node)
      i += 1
      continue
    }

    if (token.type === 'blockquote_open') {
      const quoteContent: ProseMirrorNode[] = []
      i += 1
      while (i < tokens.length && tokens[i].type !== 'blockquote_close') {
        if (tokens[i].type === 'paragraph_open') {
          const contentToken = tokens[i + 1]
          const inlineChildren = parseInlineContent(contentToken?.children || [], schema)
          const content = inlineChildren && inlineChildren.length > 0 ? inlineChildren.filter((n): n is ProseMirrorNode => n !== null) : [schema.text(contentToken?.content || '')]
          const para = schema.nodes.paragraph?.create({}, content)
          if (para) quoteContent.push(para)
          i += 3
        } else {
          i += 1
        }
      }
      const blockquote = schema.nodes.blockquote?.create({}, quoteContent)
      if (blockquote) nodes.push(blockquote)
      i += 1
      continue
    }

    i += 1
  }

  return nodes.length > 0 ? nodes : [schema.nodes.paragraph?.create() || schema.text('')]
}

/**
 * 解析内联内容（文本、加粗、斜体等）
 */
function parseInlineContent(children: Token[], schema: Schema): (ProseMirrorNode | null)[] | undefined {
  if (!children || children.length === 0) {
    return undefined
  }

  const nodes: (ProseMirrorNode | null)[] = []

  for (const child of children) {
    if (child.type === 'text') {
      const textNode = schema.text(child.content || '')
      nodes.push(textNode)
    } else if (child.type === 'softbreak' || child.type === 'hardbreak') {
      const br = schema.nodes.hardBreak?.create()
      if (br) nodes.push(br)
    } else if (child.type === 'strong_open') {
      // 需要配对处理
      let boldText = ''
      let j = 1
      while (j < children.length && children[j].type !== 'strong_close') {
        if (children[j].type === 'text') {
          boldText += children[j].content || ''
        }
        j += 1
      }
      if (boldText) {
        const textNode = schema.text(boldText)
        const boldMark = schema.marks.bold?.create()
        if (textNode && boldMark) {
          nodes.push(textNode.mark([boldMark]))
        }
      }
    } else if (child.type === 'em_open') {
      // 处理斜体
      let italicText = ''
      let j = 1
      while (j < children.length && children[j].type !== 'em_close') {
        if (children[j].type === 'text') {
          italicText += children[j].content || ''
        }
        j += 1
      }
      if (italicText) {
        const textNode = schema.text(italicText)
        const italicMark = schema.marks.italic?.create()
        if (textNode && italicMark) {
          nodes.push(textNode.mark([italicMark]))
        }
      }
    } else if (child.type === 'code_inline') {
      const textNode = schema.text(child.content || '')
      const codeMark = schema.marks.code?.create()
      if (textNode && codeMark) {
        nodes.push(textNode.mark([codeMark]))
      }
    } else if (child.type === 'link_open') {
      const href = typeof child.attrGet === 'function' ? child.attrGet('href') : ''
      let linkText = ''
      let j = 1
      while (j < children.length && children[j].type !== 'link_close') {
        if (children[j].type === 'text') {
          linkText += children[j].content || ''
        }
        j += 1
      }
      if (linkText) {
        const textNode = schema.text(linkText)
        const linkMark = schema.marks.link?.create({ href: href || '' })
        if (textNode && linkMark) {
          nodes.push(textNode.mark([linkMark]))
        }
      }
    } else if (child.type === 'image') {
      const src = typeof child.attrGet === 'function' ? child.attrGet('src') : ''
      const alt = typeof child.attrGet === 'function' ? child.attrGet('alt') : ''
      const imageNode = schema.nodes.image?.create({ src: src || '', alt: alt || '' })
      if (imageNode) nodes.push(imageNode)
    }
  }

  return nodes.length > 0 ? nodes : undefined
}
