import React, { InputHTMLAttributes } from "react";
import style from "./style.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <label className={`${style.inputContainer} ${className}`}>
      <span className={style.inputLabel}>{label}</span>
      <input className={style.input} {...props} />
    </label>
  );
};

export default Input;
