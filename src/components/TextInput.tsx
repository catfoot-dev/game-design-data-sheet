import clsx from 'clsx';
import React from 'react';

export default function TextInput({
  size,
  icon,
  className,
  ...props
} : {
  size?: 'sm' | 'md' | 'lg';
  icon?: JSX.Element;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className={`flex flex-row gap-1 justify-between items-center
        mb-1 p-1 border-[1px] border-blue-gray-500 bg-white ${className}`}
    >
      <input
        className={clsx('flex px-1 w-full outline-none', {
          'text-sm': !size || size === 'sm',
          'text-md': size === 'md',
          'text-lg': size === 'lg',
        })}
        {...props}
      />
      <div className="flex text-blue-gray-500">
        {icon}
      </div>
    </div>
  );
}
