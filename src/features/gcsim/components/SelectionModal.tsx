import { memo, ReactNode, useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";

interface SelectionModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

const SelectionModal = memo(
  ({
    title,
    description,
    onClose,
    children,
    width = "w-80",
  }: SelectionModalProps) => {
    const { t } = useTranslation();
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);
    const titleId = useId();
    const descriptionId = useId();
    onCloseRef.current = onClose;

    useEffect(() => {
      const previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const focusableSelector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCloseRef.current();
          return;
        }
        if (event.key !== "Tab") return;

        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(focusableSelector)
        );
        if (focusable.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!dialog.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown, true);
      closeButtonRef.current?.focus();
      return () => {
        document.removeEventListener("keydown", handleKeyDown, true);
        previouslyFocused?.focus();
      };
    }, []);

    return (
      <div
        className="bg-neutral/50 fixed inset-0 z-50 flex items-start justify-center pt-8"
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={`card max-h-[calc(100vh-4rem)] ${width} bg-neutral text-neutral-content overflow-hidden shadow-xl`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-neutral-content/10 flex h-12 items-center justify-between border-b px-4">
            <span id={titleId}>{title}</span>
            <button
              ref={closeButtonRef}
              type="button"
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onClose}
              aria-label={t("Close")}
            >
              x
            </button>
          </div>
          {description && (
            <p
              id={descriptionId}
              className="border-neutral-content/10 border-b px-4 py-2 text-xs opacity-70"
            >
              {description}
            </p>
          )}
          <ul className="menu max-h-96 w-full flex-nowrap overflow-auto p-2">
            {children}
          </ul>
        </div>
      </div>
    );
  }
);

SelectionModal.displayName = "SelectionModal";

export default SelectionModal;
