import type { Node as ProseMirrorNode, Schema } from '@tiptap/pm/model'
import MarkdownIt from 'markdown-it'

/**
 * 将 Markdown 文本解析为 ProseMirror Document
 */
export function parseMarkdownContent(markdown: string, schema: Schema): ProseMirrorNode {
  try {
    const md = new MarkdownIt()
    const html = md.render(markdown)

    if (!html || html.trim() === '') {
      return schema.nodes.doc.create()
    }

    // 创建临时容器来解析 HTML
    const tempDiv = typeof window !== 'undefined' ? document.createElement('div') : null
    if (tempDiv) {
      tempDiv.innerHTML = html
      return parseHtmlToProseMirror(tempDiv, schema)
    }

    // 服务端 fallback：返回空文档
    return schema.nodes.doc.create()
  } catch (error) {
    console.error('Failed to parse markdown:', error)
    return schema.nodes.doc.create()
  }
}

/**
 * 将 HTML DOM 节点转换为 ProseMirror 节点
 */
function parseHtmlToProseMirror(element: HTMLElement, schema: Schema): ProseMirrorNode {
  const nodes: ProseMirrorNode[] = []

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim()
      if (text) {
        const para = schema.nodes.paragraph?.create({}, [schema.text(text)])
        if (para) nodes.push(para)
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement
      const node = parseHtmlElement(el, schema)
      if (node) nodes.push(node)
    }
  }

  return schema.nodes.doc.create({}, nodes.length > 0 ? nodes : [schema.nodes.paragraph?.create()])
}

/**
 * 解析单个 HTML 元素为 ProseMirror 节点
 */
function parseHtmlElement(el: HTMLElement, schema: Schema): ProseMirrorNode | null {
  const tag = el.tagName.toLowerCase()

  // 处理标题
  if (tag.match(/^h[1-6]$/)) {
    const level = Number.parseInt(tag[1], 10)
    const content = parseInlineElement(el, schema)
    return schema.nodes.heading?.create({ level }, content)
  }

  // 处理段落
  if (tag === 'p') {
    const content = parseInlineElement(el, schema)
    return schema.nodes.paragraph?.create({}, content)
  }

  // 处理无序列表
  if (tag === 'ul') {
    const listItems: ProseMirrorNode[] = []
    for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
      const liEl = li as HTMLElement
      const itemContent = parseListItemContent(liEl, schema)
      const item = schema.nodes.listItem?.create({}, itemContent)
      if (item) listItems.push(item)
    }
    return schema.nodes.bulletList?.create({}, listItems)
  }

  // 处理有序列表
  if (tag === 'ol') {
    const listItems: ProseMirrorNode[] = []
    for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
      const liEl = li as HTMLElement
      const itemContent = parseListItemContent(liEl, schema)
      const item = schema.nodes.listItem?.create({}, itemContent)
      if (item) listItems.push(item)
    }
    const start = el.getAttribute('start') ? Number.parseInt(el.getAttribute('start') || '1', 10) : 1
    return schema.nodes.orderedList?.create({ start }, listItems)
  }

  // 处理代码块
  if (tag === 'pre') {
    const codeEl = el.querySelector('code')
    const code = codeEl?.textContent || el.textContent || ''
    const language = codeEl?.className.replace('language-', '').split(' ')[0] || ''
    return schema.nodes.codeBlock?.create({ language }, [schema.text(code)])
  }

  // 处理块引用
  if (tag === 'blockquote') {
    const content: ProseMirrorNode[] = []
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const node = parseHtmlElement(child as HTMLElement, schema)
        if (node) content.push(node)
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim()
        if (text) {
          const para = schema.nodes.paragraph?.create({}, [schema.text(text)])
          if (para) content.push(para)
        }
      }
    }
    return schema.nodes.blockquote?.create({}, content)
  }

  // 处理水平线
  if (tag === 'hr') {
    return schema.nodes.horizontalRule?.create()
  }

  return null
}

/**
 * 解析列表项内容（支持嵌套列表、段落等）
 */
function parseListItemContent(li: HTMLElement, schema: Schema): ProseMirrorNode[] {
  const nodes: ProseMirrorNode[] = []
  let currentParagraphContent: ProseMirrorNode[] = []

  for (const child of Array.from(li.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      // 文本节点直接加入当前段落
      const text = child.textContent
      if (text && text.trim()) {
        currentParagraphContent.push(schema.text(text))
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement
      const childTag = el.tagName.toLowerCase()

      // 块级元素（列表、代码块等）先保存当前段落
      if (['ul', 'ol', 'pre', 'blockquote'].includes(childTag)) {
        if (currentParagraphContent.length > 0) {
          const para = schema.nodes.paragraph?.create({}, currentParagraphContent)
          if (para) nodes.push(para)
          currentParagraphContent = []
        }
        // 处理块级元素
        const blockNode = parseHtmlElement(el, schema)
        if (blockNode) nodes.push(blockNode)
      } else if (childTag === 'p') {
        // 段落元素
        if (currentParagraphContent.length > 0) {
          const para = schema.nodes.paragraph?.create({}, currentParagraphContent)
          if (para) nodes.push(para)
          currentParagraphContent = []
        }
        const content = parseInlineElement(el, schema)
        const para = schema.nodes.paragraph?.create({}, content)
        if (para) nodes.push(para)
      } else {
        // 内联元素加入当前段落
        const inlineContent = parseInlineElement(el, schema)
        currentParagraphContent.push(...inlineContent)
      }
    }
  }

  // 处理剩余的段落内容
  if (currentParagraphContent.length > 0) {
    const para = schema.nodes.paragraph?.create({}, currentParagraphContent)
    if (para) nodes.push(para)
  }

  return nodes.length > 0 ? nodes : [schema.nodes.paragraph?.create() || schema.text('')]
}

/**
 * 解析内联元素（文本、链接、加粗等）
 */
function parseInlineElement(el: HTMLElement, schema: Schema): ProseMirrorNode[] {
  const nodes: ProseMirrorNode[] = []

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent
      if (text && text.trim()) {
        nodes.push(schema.text(text))
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childEl = child as HTMLElement
      const tag = childEl.tagName.toLowerCase()

      if (tag === 'strong' || tag === 'b') {
        const content = parseInlineElement(childEl, schema)
        const marked = content.map((node) => {
          if (node.type.name === 'text') {
            const mark = schema.marks.bold?.create()
            return mark ? node.mark([mark]) : node
          }
          return node
        })
        nodes.push(...marked)
      } else if (tag === 'em' || tag === 'i') {
        const content = parseInlineElement(childEl, schema)
        const marked = content.map((node) => {
          if (node.type.name === 'text') {
            const mark = schema.marks.italic?.create()
            return mark ? node.mark([mark]) : node
          }
          return node
        })
        nodes.push(...marked)
      } else if (tag === 'code') {
        const text = childEl.textContent || ''
        if (text) {
          const textNode = schema.text(text)
          const mark = schema.marks.code?.create()
          nodes.push(mark ? textNode.mark([mark]) : textNode)
        }
      } else if (tag === 'a') {
        const href = childEl.getAttribute('href') || ''
        const text = childEl.textContent || ''
        if (text && href) {
          const textNode = schema.text(text)
          const mark = schema.marks.link?.create({ href })
          nodes.push(mark ? textNode.mark([mark]) : textNode)
        }
      } else if (tag === 'img') {
        const src = childEl.getAttribute('src') || ''
        const alt = childEl.getAttribute('alt') || ''
        if (src) {
          const img = schema.nodes.image?.create({ src, alt })
          if (img) nodes.push(img)
        }
      } else if (tag === 'br') {
        const br = schema.nodes.hardBreak?.create()
        if (br) nodes.push(br)
      } else {
        // 递归处理其他元素
        const content = parseInlineElement(childEl, schema)
        nodes.push(...content)
      }
    }
  }

  return nodes
}
