import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

const footerLinks = {
  product: [
    { name: "功能特性", href: "#features" },
    {
      name: "更新日志",
      href: "https://github.com/narraverse/narraverse-next-mvp/releases",
      target: "_blank",
    },
    {
      name: "路线图",
      href: "https://github.com/narraverse/narraverse-next-mvp/projects",
      target: "_blank",
    },
    {
      name: "问题反馈",
      href: "https://github.com/narraverse/narraverse-next-mvp/issues",
      target: "_blank",
    },
  ],
  community: [
    { name: "GitHub", href: "https://github.com/narraverse/narraverse-next-mvp", target: "_blank" },
    {
      name: "贡献指南",
      href: "https://github.com/narraverse/narraverse-next-mvp/blob/main/CONTRIBUTING.md",
      target: "_blank",
    },
    {
      name: "行为准则",
      href: "https://github.com/narraverse/narraverse-next-mvp/blob/main/CODE_OF_CONDUCT.md",
      target: "_blank",
    },
    {
      name: "讨论区",
      href: "https://github.com/narraverse/narraverse-next-mvp/discussions",
      target: "_blank",
    },
  ],
  resources: [
    { name: "文档", href: "#docs" },
    { name: "API 文档", href: "#api" },
    { name: "开发指南", href: "#dev-guide" },
    { name: "常见问题", href: "#faq" },
  ],
  legal: [
    {
      name: "MIT 许可证",
      href: "https://github.com/narraverse/narraverse-next-mvp/blob/main/LICENSE",
      target: "_blank",
    },
    { name: "隐私政策", href: "#privacy" },
    { name: "服务条款", href: "#terms" },
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
              开源 AI 智能小说创作平台，由社区驱动，永久免费
            </p>
            {/* 社交媒体 */}
            <div className="flex gap-3">
              <a
                href="https://github.com/narraverse/narraverse-next-mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/narraverse"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 产品 */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">产品</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => {
                const isExternal = link.target === "_blank";
                return (
                  <li key={link.name}>
                    {isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 社区 */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">社区</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => {
                const isExternal = link.target === "_blank";
                return (
                  <li key={link.name}>
                    {isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                );
              })}
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
              {footerLinks.legal.map((link) => {
                const isExternal = link.target === "_blank";
                return (
                  <li key={link.name}>
                    {isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Narraverse. Open source under MIT License.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a
              href="https://github.com/narraverse/narraverse-next-mvp/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              MIT License
            </a>
            <Link href="#privacy" className="hover:text-foreground transition-colors">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
