import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get usernameInput() {
    return this.page.getByRole('textbox', { name: '사용자ID' });
  }

  get passwordInput() {
    return this.page.getByRole('textbox', { name: '비밀번호' });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login', exact: true });
  }

  async open(loginUrl: string) {
    await this.page.goto(loginUrl);
  }

  async enterCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }
}
