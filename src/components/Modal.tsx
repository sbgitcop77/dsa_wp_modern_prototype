"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export default function Modal({ title, children, onClose, footer }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-base font-semibold text-[#212529]">{title}</h3>
          <button onClick={onClose} className="text-[#6c757d] hover:text-[#212529] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
