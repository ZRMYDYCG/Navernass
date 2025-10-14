"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const testimonials = [
  {
    quote: "这个平台让我的写作效率提升了3倍，AI助手的建议总是恰到好处。",
    author: "张晓月",
    role: "网络小说作家",
  },
  {
    quote: "从构思到发布，所有创作流程都在一个平台完成，太方便了！",
    author: "李明",
    role: "自由撰稿人",
  },
  {
    quote: "最好的写作工具，没有之一。强大的知识库功能让我的世界观管理变得井井有条。",
    author: "王思雨",
    role: "科幻作家",
  },
];

// 注册表单验证 schema
const registerSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  verificationCode: z.string().min(6, "验证码为6位数字").max(6, "验证码为6位数字"),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/[0-9]/, "密码必须包含至少一个数字"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const email = watch("email");

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleGoogleSignup = () => {
    // TODO: 实现 Google 注册
    console.log("Google signup");
  };

  const handleSendCode = async () => {
    if (!email || !email.includes("@") || countdown > 0) return;

    setIsSending(true);
    try {
      // TODO: 调用发送验证码接口
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟API调用
      console.log("发送验证码到:", email);

      // 开始60秒倒计时
      setCountdown(60);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("发送验证码失败:", error);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // TODO: 实现注册逻辑
      console.log("Register submitted", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟API调用
    } catch (error) {
      console.error("注册失败:", error);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <main className="h-screen flex overflow-hidden">
      {/* 左侧 - 注册表单 */}
      <section className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-gray-900">
        {/* Logo */}
        <div className="p-8">
          <div className="flex items-center gap-2">
            <Icon name="logo-dark" size={40} className="dark:hidden" />
            <Icon name="logo-light" size={40} className="hidden dark:block" />
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              NarraVerse
            </span>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 overflow-y-auto">
          <div className="w-full max-w-md py-8">
            {/* 标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                创建你的账号
              </h1>
              <p className="text-gray-600 dark:text-gray-400">加入 NarraVerse，开启创作之旅</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Google 注册按钮 */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  使用 Google 账号注册
                </span>
              </button>

              {/* 分隔线 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    或
                  </span>
                </div>
              </div>

              {/* Email 输入框 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="example@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 验证码输入框 */}
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  验证码
                </label>
                <div className="flex gap-2">
                  <input
                    id="verificationCode"
                    type="text"
                    {...register("verificationCode")}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={!email || !email.includes("@") || countdown > 0 || isSending}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 dark:disabled:text-gray-400 font-medium rounded-lg transition-colors whitespace-nowrap disabled:cursor-not-allowed"
                  >
                    {isSending ? "发送中..." : countdown > 0 ? `${countdown}秒` : "发送验证码"}
                  </button>
                </div>
                {errors.verificationCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.verificationCode.message}
                  </p>
                )}
              </div>

              {/* Password 输入框 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="至少8位，包含大小写字母和数字"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  密码必须包含至少8个字符，包括大写字母、小写字母和数字
                </p>
              </div>

              {/* 注册按钮 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "注册中..." : "注册"}
              </button>

              {/* 登录链接 */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                已有账号？{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  立即登录
                </Link>
              </p>

              {/* 服务条款 */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                注册即表示您同意我们的{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  服务条款
                </a>{" "}
                和{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  隐私政策
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 右侧 - 背景图片和评价 */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden ">
        {/* 背景图片 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-md"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
          }}
        />

        {/* 浅色遮罩层 - 确保文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* 内容区域 - 底部毛玻璃效果 */}
        <div className="absolute bottom-0 left-0 right-0 h-80 backdrop-blur-xl bg-gradient-to-t from-black/40 via-black/30 to-transparent border-t border-white/10 flex items-end">
          <div className="p-12 text-white w-full">
            {/* 评价内容 */}
            <div className="mb-8">
              <blockquote className="text-2xl font-medium leading-relaxed mb-6">
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              <div>
                <div className="font-semibold">{testimonials[currentTestimonial].author}</div>
                <div className="text-sm text-white/80">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>

            {/* 导航按钮 */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="上一条评价"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "bg-white w-8"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`查看第 ${index + 1} 条评价`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="下一条评价"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
