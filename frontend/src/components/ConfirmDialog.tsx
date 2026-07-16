interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-300 rounded-md py-2.5 font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-md py-2.5 font-medium text-white ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-700 hover:bg-teal-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}