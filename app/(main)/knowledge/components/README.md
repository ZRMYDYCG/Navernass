# Knowledge Page Components

知识库页面的组件模块化拆分

## 文件结构

```
components/
├── buildTree.ts                      # 树形数据构建工具 (51 lines)
├── FolderTreeItem.tsx               # 文件夹树项组件 (97 lines)
├── KnowledgeBaseList.tsx            # 知识库列表组件 (62 lines)
├── CreateKnowledgeBaseDialog.tsx   # 创建知识库对话框 (85 lines)
├── CreateKnowledgeItemDialog.tsx   # 创建知识项对话框 (77 lines)
├── index.ts                         # 导出入口
└── README.md                        # 本文件
```

## 主页面

- `page.tsx` - 主页面逻辑 (324 lines, 原 642 lines)

## 组件说明

### buildTree.ts

- 将扁平化的知识项数组转换为树形结构
- 处理父子关系和嵌套层级
- 导出 `KnowledgeItem` 接口用于树形展示

### FolderTreeItem.tsx

- 递归渲染文件夹和文件树
- 支持展开/折叠文件夹
- 高亮显示选中项
- 显示文件更新时间

### KnowledgeBaseList.tsx

- 显示知识库列表
- 支持选择和创建知识库
- 处理加载状态和空状态

### CreateKnowledgeBaseDialog.tsx

- 创建知识库对话框
- 输入知识库名称和描述
- 表单验证

### CreateKnowledgeItemDialog.tsx

- 创建知识项对话框
- 支持创建文件夹和文件
- 动态标题和占位符

## 优势

1. **代码可维护性** - 每个组件职责单一，易于理解和修改
2. **代码复用** - 组件可以在其他地方重用
3. **测试友好** - 小组件更容易编写单元测试
4. **性能优化** - 可以针对单个组件进行优化
5. **团队协作** - 多人可以同时编辑不同组件而不冲突
