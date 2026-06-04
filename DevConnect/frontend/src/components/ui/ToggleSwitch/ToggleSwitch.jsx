import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  const handleChange = (e) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' && !disabled) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label className={`${styles.toggleSwitch} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={styles.input}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      />
      <span className={styles.slider}>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
