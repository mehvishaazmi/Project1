"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      className,
      activeClassName = "text-primary font-semibold", // ✅ default
      href,
      children,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();

    // ✅ handle string href only
    const hrefString = typeof href === "string" ? href : href.pathname || "";

    // ✅ support nested routes
    const isActive =
      pathname === hrefString || pathname.startsWith(hrefString + "/");

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };