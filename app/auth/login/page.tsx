"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";

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

// 登录表单验证 schema
const loginSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // 登录 mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      // 显示成功提示
      toast.success("登录成功！");

      // 跳转到首页
      router.push("/");
    },
    onError: (error) => {
      // Axios 拦截器已经显示了错误 toast
      console.error("登录失败:", error);
    },
  });

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleGoogleLogin = () => {
    // TODO: 实现 Google 登录
    console.log("Google login");
  };

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  };

  return (
    <main className="h-screen flex overflow-hidden">
      {/* 左侧 - 登录表单 */}
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
        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            {/* 标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                欢迎回到 NarraVerse
              </h1>
              <p className="text-gray-600 dark:text-gray-400">登录以继续你的创作之旅</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Google 登录按钮 */}
              <button
                type="button"
                onClick={handleGoogleLogin}
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
                  使用 Google 账号登录
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
                  placeholder="输入密码"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">记住我</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  忘记密码？
                </a>
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? "登录中..." : "登录"}
              </button>

              {/* 注册链接 */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                还没有账号？{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  免费注册
                </Link>
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
              "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')",
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
