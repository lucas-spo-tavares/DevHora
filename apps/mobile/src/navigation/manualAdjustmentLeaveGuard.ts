type ManualAdjustmentLeaveHandler = (proceed: () => void) => void;

let leaveHandler: ManualAdjustmentLeaveHandler | null = null;

export function registerManualAdjustmentLeaveHandler(handler: ManualAdjustmentLeaveHandler) {
  leaveHandler = handler;

  return () => {
    if (leaveHandler === handler) {
      leaveHandler = null;
    }
  };
}

export function hasManualAdjustmentLeaveHandler() {
  return leaveHandler !== null;
}

export function runManualAdjustmentLeaveHandler(proceed: () => void) {
  if (!leaveHandler) {
    proceed();
    return;
  }

  leaveHandler(proceed);
}
