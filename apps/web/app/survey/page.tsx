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
import { useI18n } from '@/hooks/use-i18n'
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
  const { t } = useI18n()
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

      toast.success(t('survey.submit.success'))
      setSubmitted(true)
    } catch (error) {
      console.error('Submit survey error:', error)
      toast.error(t('survey.submit.error'))
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
          <h2 className="text-2xl font-medium tracking-tight mb-3 text-foreground">{t('survey.successScreen.title')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
            {t('survey.successScreen.message')}
          </p>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/">{t('survey.successScreen.backHome')}</Link>
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

          <h1 className="text-3xl md:text-5xl font-serif font-medium text-foreground tracking-tight leading-tight whitespace-pre-line">
            {t('survey.header.title')}
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl font-light leading-relaxed whitespace-pre-line">
            {t('survey.header.subtitle')}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Section 1: 创作画像 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">{t('survey.sections.profile.step')}</span>
              <h2 className="text-xl font-serif font-medium">{t('survey.sections.profile.title')}</h2>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-foreground/80">{t('survey.sections.profile.experience')}</Label>
              <RadioGroup
                name="experience"
                value={formData.experience}
                onValueChange={val => setFormData({ ...formData, experience: val })}
                options={t('survey.sections.profile.experienceOptions', { returnObjects: true }) as { label: string, value: string }[]}
              />
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-base font-medium text-foreground/80">{t('survey.sections.profile.genres')}</Label>
              <CheckboxGroup
                name="genres"
                value={formData.genres}
                onValueChange={val => setFormData({ ...formData, genres: val })}
                options={t('survey.sections.profile.genresOptions', { returnObjects: true }) as { label: string, value: string }[]}
              />
            </div>
          </section>

          {/* Section 2: 痛点与习惯 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">{t('survey.sections.painPoints.step')}</span>
              <h2 className="text-xl font-serif font-medium">{t('survey.sections.painPoints.title')}</h2>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-foreground/80">{t('survey.sections.painPoints.struggles')}</Label>
              <CheckboxGroup
                name="painPoints"
                value={formData.painPoints}
                onValueChange={val => setFormData({ ...formData, painPoints: val })}
                options={t('survey.sections.painPoints.strugglesOptions', { returnObjects: true }) as { label: string, value: string }[]}
              />
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-base font-medium text-foreground/80">{t('survey.sections.painPoints.tools')}</Label>
              <CheckboxGroup
                name="tools"
                value={formData.tools}
                onValueChange={val => setFormData({ ...formData, tools: val })}
                options={t('survey.sections.painPoints.toolsOptions', { returnObjects: true }) as { label: string, value: string }[]}
              />
            </div>
          </section>

          {/* Section 3: AI 期望 */}
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2 mb-6">
              <span className="text-sm font-mono text-muted-foreground">{t('survey.sections.expectations.step')}</span>
              <h2 className="text-xl font-serif font-medium">{t('survey.sections.expectations.title')}</h2>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground/80 flex items-center justify-between">
                  <span>{t('survey.sections.expectations.aiFeatures')}</span>
                  <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">{t('survey.sections.expectations.max3')}</span>
                </Label>
                <CheckboxGroup
                  name="aiExpectations"
                  value={formData.aiExpectations}
                  onValueChange={(val) => {
                    if (val.length <= 3) {
                      setFormData({ ...formData, aiExpectations: val })
                    }
                  }}
                  options={t('survey.sections.expectations.aiFeaturesOptions', { returnObjects: true }) as { label: string, value: string }[]}
                />
              </div>

              <div className="space-y-4 pt-2">
                <Label htmlFor="aiConcerns" className="text-base font-medium text-foreground/80">{t('survey.sections.expectations.concerns')}</Label>
                <Textarea
                  id="aiConcerns"
                  placeholder={t('survey.sections.expectations.concernsPlaceholder')}
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
              <span className="text-sm font-mono text-muted-foreground">{t('survey.sections.contact.step')}</span>
              <h2 className="text-xl font-serif font-medium">{t('survey.sections.contact.title')}</h2>
            </div>

            <div className="space-y-4">
              <Label htmlFor="contact" className="text-base font-medium text-foreground/80">{t('survey.sections.contact.info')}</Label>
              <Input
                id="contact"
                placeholder={t('survey.sections.contact.infoPlaceholder')}
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="h-12 bg-background border-border/50 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground/80">
                {t('survey.sections.contact.promise')}
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
                    <>{t('survey.submit.submitting')}</>
                  )
                : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      {' '}
                      {t('survey.submit.button')}
                    </>
                  )}
            </Button>

            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t('survey.successScreen.backHome')}
            </Link>
          </div>
        </form>

        <div className="flex justify-center pt-12 pb-4">
          <div className="relative group flex flex-col items-center">
            <p className="text-sm text-muted-foreground/60 cursor-default transition-colors hover:text-foreground/80 flex items-center gap-1.5">
              {t('survey.community.findMore')}
              <span className="underline decoration-dotted underline-offset-4 decoration-primary/30 hover:decoration-primary hover:text-primary cursor-pointer transition-all">
                {t('survey.community.joinGroup')}
              </span>
            </p>

            <div className="absolute bottom-8 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-10 ease-out">
              <div className="bg-popover p-4 rounded-xl shadow-xl border border-border w-[240px] flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-border/10">
                  <Image
                    src="/qunliao.jpg"
                    alt="Narraverse Group"
                    fill
                    className="object-cover scale-110"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{t('survey.community.scanQr')}</span>
              </div>
              <div className="w-3 h-3 bg-popover border-b border-r border-border rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-sm"></div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground/30 pb-8 font-mono">
          {t('survey.footer')}
        </footer>
      </div>
    </div>
  )
}
