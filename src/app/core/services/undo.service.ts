import { Injectable, signal, computed } from '@angular/core';

export interface UndoPendingAction {
  label: string;
  execute: () => void;
  onUndo?: () => void;
}

@Injectable({ providedIn: 'root' })
export class UndoService {
  private readonly COUNTDOWN = 5;
  private pendingAction = signal<UndoPendingAction | null>(null);
  private timer: any = null;
  readonly countdown = signal<number>(0);

  // Public signal để các component subscribe
  readonly hasPendingAction = computed(() => this.pendingAction() !== null);
  readonly pendingLabel = computed(() => this.pendingAction()?.label || '');

  schedule(action: UndoPendingAction) {
    // Hủy action cũ nếu có
    this.cancel();
    this.pendingAction.set(action);
    this.countdown.set(this.COUNTDOWN);

    this.timer = setInterval(() => {
      this.countdown.update(n => n - 1);
      if (this.countdown() <= 0) {
        this.commit();
      }
    }, 1000);
  }

  undo() {
    const action = this.pendingAction();
    if (action?.onUndo) {
      action.onUndo();
    }
    this.cancel();
  }

  commit() {
    const action = this.pendingAction();
    if (!action) return;
    
    // Clear timer BEFORE executing action to prevent any race conditions
    clearInterval(this.timer);
    this.timer = null;
    this.pendingAction.set(null);
    this.countdown.set(0);
    
    action.execute(); // ← Thực thi xóa thật tại đây
  }

  private cancel() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
    this.pendingAction.set(null);
    this.countdown.set(0);
  }
}
