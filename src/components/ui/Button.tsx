import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger-outline";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-extrabold leading-none border-[1.5px] border-transparent transition-transform duration-75 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100";

const sizes = {
  full: "w-full min-h-[50px] px-5 py-[14px] text-[15px]",
  compact: "w-auto min-h-0 px-[14px] py-2 text-[12px]",
} as const;

const variants: Record<Variant, string> = {
  primary: "bg-lime text-action-text hover:bg-lime-hover",
  secondary:
    "bg-transparent text-lime border-[rgba(181,214,84,0.40)] hover:bg-[rgba(181,214,84,0.06)]",
  ghost:
    "bg-[rgba(255,253,250,0.04)] text-text border-border-subtle hover:bg-[rgba(255,253,250,0.07)]",
  "danger-outline":
    "bg-transparent text-danger border-[rgba(255,122,133,0.35)] hover:bg-[rgba(255,122,133,0.06)]",
};

interface CommonProps {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
}

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "full", children, className = "" } = props;
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (props.href !== undefined) {
    const { variant: _v, size: _s, children: _c, className: _cn, href, ...rest } = props;
    // `href` is a plain string (callers may pass internal routes or external
    // URLs like the Google Calendar link) — cast past typed-routes.
    return (
      <Link href={href as Route} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, children: _c, className: _cn, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
