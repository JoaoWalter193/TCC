import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'dark-mode';
  private darkMode = signal(false);

  isDarkMode = this.darkMode.asReadonly();

  constructor() {
    this.init();
  }

  private init() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) {
      const isDark = stored === 'true';
      this.darkMode.set(isDark);
      this.apply(isDark);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(prefersDark);
      this.apply(prefersDark);
    }
  }

  set(isDark: boolean) {
    this.darkMode.set(isDark);
    this.apply(isDark);
    localStorage.setItem(this.STORAGE_KEY, String(isDark));
  }

  private apply(isDark: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }
}
