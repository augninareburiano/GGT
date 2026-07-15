"use client";

// International guests often prefer WhatsApp over a phone call or email.
// Update the number (international format, no + or spaces) if it changes.
const WHATSAPP_NUMBER = "61416139567";
const PREFILL =
  "Hi Jimmy, I'm visiting Australia and would love to ask about a tour.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    PREFILL,
  )}`;

  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Enquire on WhatsApp"
    >
      <svg
        className="wa-fab-icon"
        viewBox="0 0 32 32"
        width="26"
        height="26"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M16.01 3.2c-7.06 0-12.8 5.73-12.8 12.79 0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.6-1.73a12.77 12.77 0 0 0 6.2 1.58h.01c7.06 0 12.79-5.73 12.79-12.79 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.04-3.61Zm0 23.28h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.6 10.6 0 0 1-1.62-5.64c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.87-4.77 10.64-10.63 10.64Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.3 3.29.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.38.19-1.52-.08-.14-.29-.21-.61-.37Z"
        />
      </svg>
      <span className="wa-fab-text">Chat on WhatsApp</span>
    </a>
  );
}
