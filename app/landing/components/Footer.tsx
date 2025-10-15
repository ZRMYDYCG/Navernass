import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

const footerLinks = {
  product: [
    { name: "功能特性", href: "#features" },
    { name: "定价", href: "#pricing" },
    { name: "更新日志", href: "#changelog" },
    { name: "路线图", href: "#roadmap" },
  ],
  company: [
    { name: "关于我们", href: "#about" },
    { name: "博客", href: "#blog" },
    { name: "加入我们", href: "#careers" },
    { name: "联系我们", href: "#contact" },
  ],
  resources: [
    { name: "文档", href: "#docs" },
    { name: "API", href: "#api" },
    { name: "社区", href: "#community" },
    { name: "支持", href: "#support" },
  ],
  legal: [
    { name: "隐私政策", href: "#privacy" },
    { name: "服务条款", href: "#terms" },
    { name: "Cookie 政策", href: "#cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo 和简介 */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/svg/logo-eye.svg"
                width={32}
                height={32}
                alt="Narraverse"
                className="dark:invert"
              />
              <span className="text-xl font-bold">Narraverse</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              AI 驱动的智能小说创作平台，让每一个故事都精彩绝伦
            </p>
            {/* 社交媒体 */}
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 产品 */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">产品</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司 */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">公司</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 资源 */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">资源</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 法律 */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">法律</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Narraverse. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#privacy" className="hover:text-foreground transition-colors">
              隐私政策
            </Link>
            <Link href="#terms" className="hover:text-foreground transition-colors">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
