"use client";

import React, { ButtonHTMLAttributes } from "react";
import style from "./style.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button className={`${className} ${style.button}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
