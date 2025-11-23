'use client'

import { CharacterCard, type Character } from './character-card'
import { Plus, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

// 示例数据
const SAMPLE_CHARACTERS: Character[] = [
  {
    id: '1',
    name: '林在野',
    role: '主角',
    description: '总是穿着洗得发白的牛仔衬衫，眼神像深秋的湖水一样平静。手里永远拿着一台老式胶片相机，记录着城市角落里被人遗忘的光影。',
    traits: ['敏锐', '沉默寡言', '怀旧'],
    keywords: ['OBSERVER', 'PHOTOGRAPHER', 'SILENT'],
    chapters: ['第一章：黄昏的快门'],
    note: '原型参考了那个在旧书店遇到的修表匠，记得给他加上喜欢闻旧纸张味道的习惯。'
  },
  {
    id: '2',
    name: '苏浅',
    role: '配角',
    description: '在深夜电台做DJ的女孩，声音有着让人安心的颗粒感。习惯在凌晨三点喝一杯热可可，对着麦克风讲述那些无人倾听的秘密。',
    traits: ['温柔', '失眠症', '倾听者'],
    keywords: ['NIGHT_OWL', 'VOICE', 'SECRET'],
    chapters: ['第三章：无线电波'],
    note: '她的声音应该是那种稍微带点沙哑的，像黑胶唱片转动的声音。'
  },
  {
    id: '3',
    name: '老陈',
    role: '反派',
    description: '经营着一家从不打烊的便利店，笑容背后藏着看不透的精明。喜欢收集过期的报纸，似乎在寻找某些被掩盖的真相线索。',
    traits: ['神秘', '精明', '收藏癖'],
    keywords: ['STORE_OWNER', 'MYSTERIOUS', 'COLLECTOR'],
    chapters: ['第五章：过期的秘密'],
  }
]

export function CharacterShowcase() {
  return (
    <div className="h-full flex flex-col">
      {/* 顶部搜索栏 */}
      <div className="p-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">角色档案</h2>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md text-gray-500 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input 
            placeholder="搜索角色..." 
            className="h-8 pl-8 bg-white dark:bg-zinc-800/50 border-gray-200 dark:border-gray-700 text-xs"
          />
        </div>
      </div>

      {/* 角色列表 */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="space-y-4 pb-10">
          {SAMPLE_CHARACTERS.map(char => (
            <CharacterCard key={char.id} character={char} />
          ))}
          
          {/* 添加新角色的虚线框占位符 */}
          <button className="w-full p-4 rounded-sm border-2 border-dashed border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-all duration-300 group flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">新建角色档案</span>
          </button>
        </div>
      </div>
    </div>
  )
}

