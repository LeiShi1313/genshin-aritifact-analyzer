import { memo, ReactNode } from "react";

interface SelectionModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

const SelectionModal = memo(({ title, onClose, children, width = "w-80" }: SelectionModalProps) => {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-neutral/50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
        <div className={`card max-h-[calc(100vh-4rem)] ${width} overflow-hidden bg-neutral text-neutral-content shadow-xl`}>
          <div className="flex h-12 items-center justify-between border-b border-neutral-content/10 px-4">
            <span>{title}</span>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onClose}
            >
              x
            </button>
          </div>
          <ul className="menu w-full max-h-96 flex-nowrap overflow-auto p-2">
            {children}
          </ul>
        </div>
      </div>
    </>
  );
});

SelectionModal.displayName = 'SelectionModal';

export default SelectionModal;
