import Image from "next/image";
import type { WelcomeSectionProps } from "../types";
import { WELCOME_TEXT, LOGO_SIZE, STYLES } from "../config";

/**
 * 欢迎区域组件
 */
export function WelcomeSection({
  welcomeText = WELCOME_TEXT,
  logoSize = LOGO_SIZE,
}: WelcomeSectionProps) {
  return (
    <div className={STYLES.chatArea.welcome}>
      {/* Logo */}
      <Image
        src="/assets/svg/logo-dark.svg"
        width={logoSize}
        height={logoSize}
        alt="Logo"
        className="dark:hidden"
        priority
      />
      <Image
        src="/assets/svg/logo-light.svg"
        width={logoSize}
        height={logoSize}
        alt="Logo"
        className="hidden dark:block"
        priority
      />

      {/* 欢迎文本 */}
      <span className={STYLES.chatArea.welcomeText}>{welcomeText}</span>
    </div>
  );
}
