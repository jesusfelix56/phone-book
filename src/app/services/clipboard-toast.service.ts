import { Injectable } from '@angular/core';
import { AppToastService } from './app-toast.service';

@Injectable({
  providedIn: 'root',
})
export class ClipboardToastService {
  constructor(private _toast: AppToastService) {}

  copyWithFeedback(value: string, label: string): void {
    const text = value.trim();
    if (!text) {
      return;
    }

    const showToast = (): void => {
      this._toast.success(`${label} copied`, 'Value copied to clipboard.');
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(showToast);
      return;
    }

    showToast();
  }
}
