"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type InfoTipProps = {
  label: string;
  body: string;
  children: ReactNode;
  className?: string;
};

const FOOTER = "Teaching map only. This lab does not call AWS.";
const MARGIN = 12;

export function InfoTip({ label, body, children, className = "" }: InfoTipProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280, maxHeight: 240 });
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const open = hover || pinned;
  const panelId = useId();

  function clearClose() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openHover() {
    clearClose();
    setHover(true);
  }

  function closeHoverSoon() {
    clearClose();
    closeTimer.current = window.setTimeout(() => setHover(false), 180);
  }

  function place() {
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!trigger) return;
    const width = Math.min(280, window.innerWidth - MARGIN * 2);
    const maxHeight = Math.min(320, window.innerHeight - MARGIN * 2);
    const height = Math.min(panelRef.current?.offsetHeight ?? 168, maxHeight);
    const spaceBelow = window.innerHeight - trigger.bottom - MARGIN;
    const spaceAbove = trigger.top - MARGIN;
    const openAbove = spaceBelow < height && spaceAbove > spaceBelow;
    let top = openAbove ? trigger.top - height - 8 : trigger.bottom + 8;
    let left = trigger.left + trigger.width / 2 - width / 2;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - width - MARGIN));
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - height - MARGIN));
    setPos({ top, left, width, maxHeight });
    setReady(true);
  }

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    place();
    const frame = window.requestAnimationFrame(() => place());
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPinned(false);
        setHover(false);
      }
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setPinned(false);
      setHover(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, label, body]);

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              zIndex: 80,
            }}
            className={`overflow-y-auto rounded-lg border border-[var(--line)] bg-white p-3 shadow-[0_18px_50px_-28px_rgba(15,40,50,0.55)] ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            onMouseEnter={openHover}
            onMouseLeave={closeHoverSoon}
          >
            <p className="font-[family-name:var(--font-display)] text-sm text-[var(--ink)]">{label}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-muted)]">{body}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">{FOOTER}</p>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={`cursor-help text-left ${className}`.trim()}
        onClick={() => {
          setPinned((current) => !current);
        }}
        onMouseEnter={openHover}
        onMouseLeave={closeHoverSoon}
        onFocus={openHover}
        onBlur={(event) => {
          if (panelRef.current?.contains(event.relatedTarget as Node)) return;
          closeHoverSoon();
        }}
      >
        {children}
      </button>
      {panel}
    </>
  );
}
