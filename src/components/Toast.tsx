"use client";
import { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

const config = {
  success: { icon: CheckCircle, bg: "bg-green-50 border-green-200", text: "text-green-800", icon_color: "text-green-500" },
  error:   { icon: AlertTriangle, bg: "bg-red-50 border-red-200",   text: "text-red-800",   icon_color: "text-red-500"   },
  info:    { icon: Info,          bg: "bg-blue-50 border-blue-200",  text: "text-blue-800",  icon_color: "text-blue-500"  },
};

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const { icon: Icon, bg, text, icon_color } = config[type];

  return (
    <div className={`fixed top-24 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${bg}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icon_color}`} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button onClick={onClose} className={`${text} opacity-60 hover:opacity-100 transition-opacity`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
