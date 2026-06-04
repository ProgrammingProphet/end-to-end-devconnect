import { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

export default function Dropdown({ trigger, items, align = 'left' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev + 1;
            return nextIndex >= items.length ? 0 : nextIndex;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev - 1;
            return nextIndex < 0 ? items.length - 1 : nextIndex;
          });
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, items.length]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    // Auto-positioning to stay in viewport
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check if menu goes beyond bottom of viewport
    if (rect.bottom > viewportHeight) {
      menu.style.bottom = '100%';
      menu.style.top = 'auto';
      menu.style.marginBottom = 'var(--space-1)';
      menu.style.marginTop = '0';
    }

    // Check if menu goes beyond right edge of viewport
    if (rect.right > viewportWidth) {
      menu.style.right = '0';
      menu.style.left = 'auto';
    }
  }, [isOpen]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  };

  const handleItemClick = (item) => {
    item.onClick();
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleItemKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div onClick={handleTriggerClick} className={styles.trigger}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`${styles.menu} ${styles[align]}`}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              ref={(el) => (itemRefs.current[idx] = el)}
              className={`${styles.item} ${item.danger ? styles.danger : ''}`}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleItemKeyDown(e, item)}
              role="menuitem"
              tabIndex={focusedIndex === idx ? 0 : -1}
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
