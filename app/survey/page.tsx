'use client'

import { ArrowLeft, Check, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { surveysApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'

function RadioGroup({ value, onValueChange, options, name }: { value: string, onValueChange: (val: string) => void, options: { label: string, value: string }[], name: string }) {
  return (
    <div className="grid gap-3 pt-2">
      {options.map(option => (
        <label
          key={option.value}
          className={cn(
            'flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-all duration-200',
            value === option.value
              ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
              : 'border-border/40 bg-card hover:bg-muted/50 hover:border-primary/20',
          )}
        >
          <div className={cn(
            'h-4 w-4 rounded-full border flex items-center justify-center transition-colors',
            value === option.value ? 'border-primary bg-primary' : 'border-muted-foreground/30',
          )}
          >
            {value === option.value && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
          </div>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            className="sr-only"
          />
          <span className={cn(
            'text-sm font-medium leading-none transition-colors',
            value === option.value ? 'text-foreground' : 'text-muted-foreground',
          )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}

function CheckboxGroup({ value = [], onValueChange, options, name }: { value: string[], onValueChange: (val: string[]) => void, options: { label: string, value: string }[], name: string }) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onValueChange([...value, optionValue])
    } else {
      onValueChange(value.filter(v => v !== optionValue))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
      {options.map((option) => {
        const isChecked = value.includes(option.value)
        return (
          <label
            key={option.value}
            className={cn(
              'flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-all duration-200',
              isChecked
                ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-border/40 bg-card hover:bg-muted/50 hover:border-primary/20',
            )}
          >
            <div className={cn(
              'h-4 w-4 rounded border flex items-center justify-center transition-colors',
              isChecked ? 'border-primary bg-primary' : 'border-muted-foreground/30',
            )}
            >
              {isChecked && <Check className="h-3 w-3 text-background" />}
            </div>
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={e => handleChange(option.value, e.target.checked)}
              className="sr-only"
            />
            <span className={cn(
              'text-sm font-medium leading-none transition-colors',
              isChecked ? 'text-foreground' : 'text-muted-foreground',
            )}
            >
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}

export default function SurveyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    experience: '',
    genres: [] as string[],
    painPoints: [] as string[],
    tools: [] as string[],
    aiExpectations: [] as string[],
    aiConcerns: '',
    contact: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await surveysApi.create({
        experience: formData.experience,
        genres: formData.genres,
        pain_points: formData.painPoints,
        tools: formData.tools,
        ai_expectations: formData.aiExpectations,
        ai_concerns: formData.aiConcerns,
        contact: formData.contact,
      })

      toast.success('感谢您的真知灼见，我们已收到！')
      setSubmitted(true)
    } catch (error) {
      console.error('Submit survey error:', error)
      toast.error('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-serif">
        <div className="w-full max-w-md text-center py-12 px-6 bg-card rounded-2xl border shadow-sm animate-in fade-in zoom-in duration-500">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-medium tracking-tight mb-3 text-foreground">感谢您的分享</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            每一位创作者的声音，都是 Narraverse 成长的养分。
            <br />
            我们会认真聆听，不负期待。
          </p>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Header */}
        <header className="flex flex-col items-center text-center mb-16 space-y-6">

          <h1 className="text-3xl md:text-5xl font-serif font-medium text-foreground tracking-tight leading-tight">
            共创计划：
            <br className="md:hidden" />
            寻找你的创作伙伴
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl font-light leading-relaxed">
            我们不只是在制造工具，更是在寻找一种能与灵感共舞的方式。
            <br />
            诚邀您花 3 分钟，聊聊那些关于写作的故事。
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Section 1: 创作画像 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">01</span>
              <h2 className="text-xl font-serif font-medium">关于你的创作旅程</h2>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-foreground/80">目前的创作状态是？</Label>
              <RadioGroup
                name="experience"
                value={formData.experience}
                onValueChange={val => setFormData({ ...formData, experience: val })}
                options={[
                  { label: '初探门径 (刚开始尝试写作)', value: 'newbie' },
                  { label: '渐入佳境 (累计创作 < 50万字)', value: 'intermediate' },
                  { label: '笔耕不辍 (累计创作 > 50万字)', value: 'advanced' },
                  { label: '职业作家 (以此为生/全职写作)', value: 'pro' },
                ]}
              />
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-base font-medium text-foreground/80">偏爱的创作领域？(可多选)</Label>
              <CheckboxGroup
                name="genres"
                value={formData.genres}
                onValueChange={val => setFormData({ ...formData, genres: val })}
                options={[
                  { label: '玄幻 / 仙侠 / 奇幻', value: 'fantasy' },
                  { label: '都市 / 现实 / 言情', value: 'urban' },
                  { label: '科幻 / 末世 / 无限', value: 'scifi' },
                  { label: '悬疑 / 推理 / 惊悚', value: 'suspense' },
                  { label: '历史 / 军事 / 权谋', value: 'history' },
                  { label: '同人 / 衍生 / 轻小说', value: 'fanfic' },
                  { label: '其他类型', value: 'other' },
                ]}
              />
            </div>
          </section>

          {/* Section 2: 痛点与习惯 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">02</span>
              <h2 className="text-xl font-serif font-medium">那些让你停笔的瞬间</h2>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-foreground/80">哪个环节最容易消磨你的热情？(可多选)</Label>
              <CheckboxGroup
                name="painPoints"
                value={formData.painPoints}
                onValueChange={val => setFormData({ ...formData, painPoints: val })}
                options={[
                  { label: '灵感枯竭 (想写却不知道写什么)', value: 'idea' },
                  { label: '结构困局 (大纲卡壳，逻辑不通)', value: 'outline' },
                  { label: '设定迷宫 (世界观庞杂，难以自洽)', value: 'world' },
                  { label: '角色扁平 (人物缺乏灵魂与弧光)', value: 'character' },
                  { label: '行文卡顿 (正文推进困难，手速慢)', value: 'drafting' },
                  { label: '润色繁琐 (查错改稿，词不达意)', value: 'editing' },
                ]}
              />
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-base font-medium text-foreground/80">目前主要使用的工具？(可多选)</Label>
              <CheckboxGroup
                name="tools"
                value={formData.tools}
                onValueChange={val => setFormData({ ...formData, tools: val })}
                options={[
                  { label: 'Word / WPS / Pages', value: 'word' },
                  { label: 'Notion / Obsidian / Logseq', value: 'note' },
                  { label: 'Scrivener / Ulysses', value: 'scrivener' },
                  { label: '墨者 / 大神 / 橙瓜', value: 'webnovel_tools' },
                  { label: '手机备忘录 / 纯文本', value: 'memo' },
                ]}
              />
            </div>
          </section>

          {/* Section 3: AI 期望 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">03</span>
              <h2 className="text-xl font-serif font-medium">想象中的理想助手</h2>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground/80 flex items-center justify-between">
                  <span>如果 AI 是一位助手，你希望它擅长...</span>
                  <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">至多选 3 项</span>
                </Label>
                <CheckboxGroup
                  name="aiExpectations"
                  value={formData.aiExpectations}
                  onValueChange={(val) => {
                    if (val.length <= 3) {
                      setFormData({ ...formData, aiExpectations: val })
                    }
                  }}
                  options={[
                    { label: '灵感风暴：提供创意点子、反转剧情建议', value: 'brainstorm' },
                    { label: '设定管家：自动整理、检索、可视化人物和世界观', value: 'wiki' },
                    { label: '自动续写：根据上下文风格辅助生成段落', value: 'autocomplete' },
                    { label: '逻辑纠错：检查前后文矛盾、时间线 BUG', value: 'logic_check' },
                    { label: '角色绘图：一键生成角色立绘、场景插图', value: 'image_gen' },
                    { label: '市场参谋：分析题材热度、读者喜好趋势', value: 'analytics' },
                    { label: '角色扮演：模拟书中角色与我对戏，寻找语感', value: 'roleplay' },
                  ]}
                />
              </div>

              <div className="space-y-4 pt-2">
                <Label htmlFor="aiConcerns" className="text-base font-medium text-foreground/80">对于 AI 辅助写作，你最大的顾虑或建议？</Label>
                <Textarea
                  id="aiConcerns"
                  placeholder="例如：担心版权问题、担心风格不统一、希望 AI 不要干涉核心创意..."
                  className="min-h-[120px] bg-background resize-none border-border/50 focus:border-primary/50 transition-colors"
                  value={formData.aiConcerns}
                  onChange={e => setFormData({ ...formData, aiConcerns: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Section 4: 联系方式 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">04</span>
              <h2 className="text-xl font-serif font-medium">保持联系</h2>
            </div>

            <div className="space-y-4">
              <Label htmlFor="contact" className="text-base font-medium text-foreground/80">留下联系方式，优先获取内测资格 (选填)</Label>
              <Input
                id="contact"
                placeholder="Email 或 微信号"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="h-12 bg-background border-border/50 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground/80">
                承诺：您的信息仅用于产品内测邀请，绝无垃圾邮件。
              </p>
            </div>
          </section>

          <div className="flex flex-col items-center gap-6 pt-8 animate-in fade-in duration-1000 delay-500">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto md:min-w-[240px] h-14 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-foreground text-background hover:bg-foreground/90"
              disabled={isSubmitting || !formData.experience || formData.genres.length === 0}
            >
              {isSubmitting
                ? (
                    <>正在提交...</>
                  )
                : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      {' '}
                      发送反馈
                    </>
                  )}
            </Button>

            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回首页
            </Link>
          </div>
        </form>

        <div className="flex justify-center pt-12 pb-4">
          <div className="relative group flex flex-col items-center">
            <p className="text-sm text-muted-foreground/60 cursor-default transition-colors hover:text-foreground/80 flex items-center gap-1.5">
              想寻找更多同路人？
              <span className="underline decoration-dotted underline-offset-4 decoration-primary/30 hover:decoration-primary hover:text-primary cursor-pointer transition-all">
                加入共创交流群
              </span>
            </p>

            <div className="absolute bottom-8 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-10 ease-out">
              <div className="bg-popover p-4 rounded-xl shadow-xl border border-border w-[240px] flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-border/10">
                  <Image
                    src="/qunliao.jpg"
                    alt="Narraverse 交流群"
                    fill
                    className="object-cover scale-110"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">扫码加入 Narraverse 朋友们</span>
              </div>
              <div className="w-3 h-3 bg-popover border-b border-r border-border rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-sm"></div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground/30 pb-8 font-mono">
          Narraverse · Create Worlds with Intelligence
        </footer>
      </div>
    </div>
  )
}
