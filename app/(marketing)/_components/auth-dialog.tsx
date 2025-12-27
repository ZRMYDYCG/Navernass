'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'

const EMAIL_DOMAINS = [
  { label: 'gmail.com', value: '@gmail.com' },
  { label: 'outlook.com', value: '@outlook.com' },
  { label: 'qq.com', value: '@qq.com' },
  { label: '163.com', value: '@163.com' },
  { label: 'foxmail.com', value: '@foxmail.com' },
  { label: 'yahoo.com', value: '@yahoo.com' },
  { label: 'icloud.com', value: '@icloud.com' },
]

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signIn, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })

  const [loginShowDomains, setLoginShowDomains] = useState(false)
  const [registerShowDomains, setRegisterShowDomains] = useState(false)
  const [loginEmailInput, setLoginEmailInput] = useState('')
  const [registerEmailInput, setRegisterEmailInput] = useState('')

  const loginInputRef = useRef<HTMLInputElement>(null)
  const registerInputRef = useRef<HTMLInputElement>(null)
  const loginDropdownRef = useRef<HTMLDivElement>(null)
  const registerDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)
        && loginInputRef.current && !loginInputRef.current.contains(e.target as Node)) {
        setLoginShowDomains(false)
      }
      if (registerDropdownRef.current && !registerDropdownRef.current.contains(e.target as Node)
        && registerInputRef.current && !registerInputRef.current.contains(e.target as Node)) {
        setRegisterShowDomains(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLoginForm({ ...loginForm, email: value })
    setLoginEmailInput(value)
    setLoginShowDomains(value.includes('@'))
  }

  const handleRegisterEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRegisterForm({ ...registerForm, email: value })
    setRegisterEmailInput(value)
    setRegisterShowDomains(value.includes('@'))
  }

  const applyLoginDomain = (domain: string) => {
    const parts = loginEmailInput.split('@')
    const prefix = parts[0] || ''
    const newEmail = prefix + domain
    setLoginForm({ ...loginForm, email: newEmail })
    setLoginEmailInput(newEmail)
    setLoginShowDomains(false)
    loginInputRef.current?.focus()
  }

  const applyRegisterDomain = (domain: string) => {
    const parts = registerEmailInput.split('@')
    const prefix = parts[0] || ''
    const newEmail = prefix + domain
    setRegisterForm({ ...registerForm, email: newEmail })
    setRegisterEmailInput(newEmail)
    setRegisterShowDomains(false)
    registerInputRef.current?.focus()
  }

  const filteredLoginDomains = EMAIL_DOMAINS.filter(d =>
    d.value.toLowerCase().includes(loginEmailInput.split('@')[1]?.toLowerCase() || ''),
  )
  const filteredRegisterDomains = EMAIL_DOMAINS.filter(d =>
    d.value.toLowerCase().includes(registerEmailInput.split('@')[1]?.toLowerCase() || ''),
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(loginForm.email, loginForm.password)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('登录成功！')
        onOpenChange(false)
        setLoginForm({ email: '', password: '' })
      }
    } catch {
      toast.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('密码不匹配')
      return
    }

    if (registerForm.password.length < 6) {
      toast.error('密码至少需要6位')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(registerForm.email, registerForm.password)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('注册成功！请检查邮箱验证')
        onOpenChange(false)
        setRegisterForm({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
        })
      }
    } catch {
      toast.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>欢迎使用 Narraverse</DialogTitle>
          <DialogDescription>
            登录或注册以开始你的创作之旅
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">邮箱</Label>
                <div className="relative">
                  <Input
                    ref={loginInputRef}
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={handleLoginEmailChange}
                    required
                  />
                  {loginShowDomains && (
                    <div
                      ref={loginDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
                    >
                      {filteredLoginDomains.length > 0
                        ? (
                            filteredLoginDomains.map(domain => (
                              <button
                                key={domain.value}
                                type="button"
                                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                onClick={() => applyLoginDomain(domain.value)}
                              >
                                {domain.label}
                              </button>
                            ))
                          )
                        : (
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                              onClick={() => applyLoginDomain('')}
                            >
                              使用自定义邮箱地址
                            </button>
                          )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">密码</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中...
                      </>
                    )
                  : (
                      '登录'
                    )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">姓名</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="张三"
                  value={registerForm.fullName}
                  onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">邮箱</Label>
                <div className="relative">
                  <Input
                    ref={registerInputRef}
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={handleRegisterEmailChange}
                    required
                  />
                  {registerShowDomains && (
                    <div
                      ref={registerDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
                    >
                      {filteredRegisterDomains.length > 0
                        ? (
                            filteredRegisterDomains.map(domain => (
                              <button
                                key={domain.value}
                                type="button"
                                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                onClick={() => applyRegisterDomain(domain.value)}
                              >
                                {domain.label}
                              </button>
                            ))
                          )
                        : (
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                              onClick={() => applyRegisterDomain('')}
                            >
                              使用自定义邮箱地址
                            </button>
                          )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">确认密码</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.confirmPassword}
                  onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    )
                  : (
                      '注册'
                    )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
