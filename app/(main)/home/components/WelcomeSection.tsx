import { Icon } from "@/components/ui/icon";
import type { WelcomeSectionProps } from "../types";
import { WELCOME_TEXT, LOGO_SIZE, STYLES } from "../config";

/**
 * 欢迎区域组件
 */
export function WelcomeSection({ welcomeText = WELCOME_TEXT, logoSize = LOGO_SIZE }: WelcomeSectionProps) {
  return (
    <div className={STYLES.chatArea.welcome}>
      {/* Logo */}
      <Icon name="logo-dark" size={logoSize} className="dark:hidden" />
      <Icon name="logo-light" size={logoSize} className="hidden dark:block" />

      {/* 欢迎文本 */}
      <span className={STYLES.chatArea.welcomeText}>{welcomeText}</span>
    </div>
  );
}
