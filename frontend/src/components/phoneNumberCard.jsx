import React, { useState } from "react";

export default function PhoneNumberCard({ number }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(number).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className="w-max text-left bg-surface border border-border hover:border-border-2
        rounded-[12px] px-6 py-5 flex items-center justify-between gap-4
        transition-all group cursor-pointer"
    >
      <p className="font-mono text-[22px] font-medium tracking-wide text-blue-400">
        {number}
      </p>

      <div
        className={`flex items-center gap-1.5 text-[12px] font-medium shrink-0 transition-colors
        ${copied ? "text-brand-green" : "text-tx-3 group-hover:text-tx-2"}`}
      >
        {copied ? (
          <>
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg
              className="w- h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          </>
        )}
      </div>
    </button>
  );
}
