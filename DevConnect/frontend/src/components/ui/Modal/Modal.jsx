import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const focusableElementsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      // Store the element that triggered the modal
      previousFocusRef.current = document.activeElement;

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Get all focusable elements within the modal
      const updateFocusableElements = () => {
        if (modalRef.current) {
          const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
          focusableElementsRef.current = Array.from(
            modalRef.current.querySelectorAll(focusableSelectors)
          ).filter(el => !el.hasAttribute('disabled'));
        }
      };

      updateFocusableElements();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the trigger element
      previousFocusRef.current?.focus();

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = focusableElementsRef.current;
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {title && (
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.content}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
