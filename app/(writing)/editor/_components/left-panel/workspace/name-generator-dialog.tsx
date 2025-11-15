import * as Dialog from '@radix-ui/react-dialog'
import { Copy, RefreshCw, Sparkles, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface NameGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 姓氏库
const SURNAMES = [
  '张',
  '李',
  '王',
  '刘',
  '陈',
  '杨',
  '赵',
  '黄',
  '周',
  '吴',
  '徐',
  '孙',
  '胡',
  '朱',
  '高',
  '林',
  '何',
  '郭',
  '马',
  '罗',
  '梁',
  '宋',
  '郑',
  '谢',
  '韩',
  '唐',
  '冯',
  '于',
  '董',
  '萧',
  '程',
  '曹',
  '袁',
  '邓',
  '许',
  '傅',
  '沈',
  '曾',
  '彭',
  '吕',
  '苏',
  '卢',
  '蒋',
  '蔡',
  '贾',
  '丁',
  '魏',
  '薛',
  '叶',
  '阎',
  '余',
  '潘',
  '杜',
  '戴',
  '夏',
  '钟',
  '汪',
  '田',
  '任',
  '姜',
  '范',
  '方',
  '石',
  '姚',
  '谭',
  '廖',
  '邹',
  '熊',
  '金',
  '陆',
  '郝',
  '孔',
  '白',
  '崔',
  '康',
  '毛',
  '邱',
  '秦',
  '江',
  '史',
  '顾',
  '侯',
  '邵',
  '孟',
  '龙',
  '万',
  '段',
  '雷',
  '钱',
  '汤',
]

// 名字库（单字）
const GIVEN_NAMES_SINGLE = [
  '明',
  '华',
  '强',
  '伟',
  '芳',
  '娜',
  '敏',
  '静',
  '丽',
  '红',
  '军',
  '杰',
  '磊',
  '勇',
  '艳',
  '娟',
  '涛',
  '超',
  '秀',
  '英',
  '霞',
  '平',
  '刚',
  '桂',
  '英',
  '辉',
  '鹏',
  '飞',
  '雪',
  '梅',
  '兰',
  '竹',
  '菊',
  '松',
  '柏',
  '枫',
  '柳',
  '杨',
  '桃',
  '李',
  '云',
  '风',
  '雨',
  '雷',
  '电',
  '山',
  '水',
  '火',
  '土',
  '金',
  '木',
  '日',
  '月',
  '星',
  '辰',
  '天',
  '地',
  '人',
  '和',
  '美',
  '智',
  '慧',
  '勇',
  '毅',
  '仁',
  '义',
  '礼',
  '信',
  '忠',
  '孝',
  '文',
  '武',
  '德',
  '才',
  '学',
  '识',
  '见',
  '闻',
  '思',
  '想',
]

// 名字库（双字）
const GIVEN_NAMES_DOUBLE = [
  '志强',
  '志明',
  '志华',
  '志勇',
  '志伟',
  '志刚',
  '志坚',
  '志远',
  '志高',
  '志新',
  '文博',
  '文华',
  '文静',
  '文雅',
  '文秀',
  '文慧',
  '文丽',
  '文娟',
  '文芳',
  '文英',
  '明华',
  '明强',
  '明伟',
  '明辉',
  '明远',
  '明德',
  '明理',
  '明志',
  '明心',
  '明慧',
  '建华',
  '建国',
  '建强',
  '建伟',
  '建明',
  '建新',
  '建平',
  '建安',
  '建业',
  '建树',
  '秀英',
  '秀华',
  '秀芳',
  '秀梅',
  '秀兰',
  '秀莲',
  '秀云',
  '秀霞',
  '秀红',
  '秀美',
  '丽华',
  '丽娟',
  '丽芳',
  '丽红',
  '丽梅',
  '丽云',
  '丽霞',
  '丽娜',
  '丽萍',
  '丽君',
  '海涛',
  '海波',
  '海峰',
  '海燕',
  '海霞',
  '海明',
  '海强',
  '海东',
  '海西',
  '海南',
  '春华',
  '春梅',
  '春燕',
  '春霞',
  '春芳',
  '春红',
  '春兰',
  '春桃',
  '春柳',
  '春风',
  '秋月',
  '秋菊',
  '秋香',
  '秋华',
  '秋实',
  '秋收',
  '秋分',
  '秋霜',
  '秋雨',
  '秋风',
  '雪梅',
  '雪莲',
  '雪松',
  '雪峰',
  '雪华',
  '雪晴',
  '雪雁',
  '雪飞',
  '雪舞',
  '雪飘',
]

// 生成随机名字
function generateName(type: 'single' | 'double' | 'both' = 'both'): string {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]

  if (type === 'single') {
    const givenName = GIVEN_NAMES_SINGLE[Math.floor(Math.random() * GIVEN_NAMES_SINGLE.length)]
    return surname + givenName
  }

  if (type === 'double') {
    const givenName = GIVEN_NAMES_DOUBLE[Math.floor(Math.random() * GIVEN_NAMES_DOUBLE.length)]
    return surname + givenName
  }

  // both: 随机选择单字或双字
  const useDouble = Math.random() > 0.5
  if (useDouble) {
    const givenName = GIVEN_NAMES_DOUBLE[Math.floor(Math.random() * GIVEN_NAMES_DOUBLE.length)]
    return surname + givenName
  } else {
    const givenName = GIVEN_NAMES_SINGLE[Math.floor(Math.random() * GIVEN_NAMES_SINGLE.length)]
    return surname + givenName
  }
}

export function NameGeneratorDialog({ open, onOpenChange }: NameGeneratorDialogProps) {
  const [nameType, setNameType] = React.useState<'single' | 'double' | 'both'>('both')
  const [generatedNames, setGeneratedNames] = React.useState<Array<{ id: string, name: string }>>([])
  const [selectedName, setSelectedName] = React.useState<string | null>(null)

  // 生成名字
  const handleGenerate = React.useCallback(() => {
    const names: Array<{ id: string, name: string }> = []
    for (let i = 0; i < 10; i++) {
      const name = generateName(nameType)
      names.push({
        id: `name-${i}-${name}-${Date.now()}`,
        name,
      })
    }
    setGeneratedNames(names)
    setSelectedName(null)
  }, [nameType])

  // 初始化时生成一次
  React.useEffect(() => {
    if (open) {
      handleGenerate()
    }
  }, [open, handleGenerate])

  // 复制名字
  const handleCopy = React.useCallback(async (name: string) => {
    try {
      await navigator.clipboard.writeText(name)
      toast.success(`已复制：${name}`)
      setSelectedName(name)
    } catch (error) {
      toast.error('复制失败')
      console.error('复制失败:', error)
    }
  }, [])

  // 复制所有名字
  const handleCopyAll = React.useCallback(async () => {
    if (generatedNames.length === 0) return
    try {
      const allNames = generatedNames.map(item => item.name).join('\n')
      await navigator.clipboard.writeText(allNames)
      toast.success(`已复制 ${generatedNames.length} 个名字`)
    } catch (error) {
      toast.error('复制失败')
      console.error('复制失败:', error)
    }
  }, [generatedNames])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  随机名字生成器
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* 内容区域 */}
            <div className="p-4 space-y-4">
              {/* 类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  名字类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['single', 'double', 'both'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNameType(type)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        nameType === type
                          ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-700'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {type === 'single' && '单字名'}
                      {type === 'double' && '双字名'}
                      {type === 'both' && '随机'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                type="button"
                onClick={handleGenerate}
                className="w-full bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>

              {/* 生成的名字列表 */}
              {generatedNames.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      生成的名字
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      复制全部
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {generatedNames.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleCopy(item.name)}
                        className={`px-2 py-2 rounded border transition-all text-sm font-medium ${
                          selectedName === item.name
                            ? 'border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
