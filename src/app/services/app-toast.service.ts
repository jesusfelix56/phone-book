import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AppToastService {
  constructor(private _messageService: MessageService) {}

  success(summary: string, detail: string): void {
    this._show('success', summary, detail);
  }

  error(summary: string, detail: string): void {
    this._show('error', summary, detail);
  }

  info(summary: string, detail: string): void {
    this._show('info', summary, detail);
  }

  private _show(
    severity: 'success' | 'error' | 'info',
    summary: string,
    detail: string,
  ): void {
    this._messageService.add({
      severity,
      summary,
      detail,
    });
  }
}
