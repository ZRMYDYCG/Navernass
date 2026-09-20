### Novels（小说）

| 方法   | 路径                       | 说明                               |
| ------ | -------------------------- | ---------------------------------- |
| GET    | `/api/novels`              | 获取小说列表（支持分页、状态筛选） |
| POST   | `/api/novels`              | 创建新小说                         |
| GET    | `/api/novels/:id`          | 获取小说详情                       |
| PUT    | `/api/novels/:id`          | 更新小说信息                       |
| DELETE | `/api/novels/:id`          | 删除小说（硬删除）                 |
| POST   | `/api/novels/:id/archive`  | 归档小说                           |
| POST   | `/api/novels/:id/restore`  | 恢复小说                           |
| POST   | `/api/novels/:id/publish`  | 发布小说                           |
| DELETE | `/api/novels/:id/publish`  | 取消发布                           |
| GET    | `/api/novels/archived`     | 获取归档列表                       |
| GET    | `/api/novels/:id/chapters` | 获取小说的所有章节                 |

### Chapters（章节）

| 方法   | 路径                        | 说明             |
| ------ | --------------------------- | ---------------- |
| POST   | `/api/chapters`             | 创建新章节       |
| GET    | `/api/chapters/:id`         | 获取章节详情     |
| PUT    | `/api/chapters/:id`         | 更新章节         |
| DELETE | `/api/chapters/:id`         | 删除章节         |
| POST   | `/api/chapters/reorder`     | 批量更新章节顺序 |
| POST   | `/api/chapters/:id/publish` | 发布章节         |
| DELETE | `/api/chapters/:id/publish` | 取消发布章节     |

### Conversations（对话）

| 方法   | 路径                                    | 说明               |
| ------ | --------------------------------------- | ------------------ |
| GET    | `/api/conversations`                    | 获取对话列表       |
| POST   | `/api/conversations`                    | 创建新对话         |
| GET    | `/api/conversations/:id`                | 获取对话详情       |
| PUT    | `/api/conversations/:id`                | 更新对话           |
| DELETE | `/api/conversations/:id`                | 删除对话           |
| GET    | `/api/conversations/recent`             | 获取最近对话       |
| GET    | `/api/conversations/:id/messages`       | 获取对话的所有消息 |
| POST   | `/api/conversations/:id/messages`       | 创建新消息         |
| DELETE | `/api/conversations/:id/messages/clear` | 清空对话消息       |

### Messages（消息）

| 方法   | 路径                  | 说明         |
| ------ | --------------------- | ------------ |
| DELETE | `/api/messages/:id`   | 删除消息     |
| POST   | `/api/messages/batch` | 批量创建消息 |
