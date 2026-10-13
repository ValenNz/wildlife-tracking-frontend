"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BREADCRUMB_PATHS, {
  type BreadcrumbPathNode,
} from "@/constant/path/breadcrumb";


interface BreadcrumbCrumb {
  path: string;
  name: string;
  disabled?: boolean;
}


/**
 * Convert a pattern path (e.g. "/master-data/job-position/:id/detail")
 * to a regex that can match actual paths (e.g. "/master-data/job-position/123/detail")
 */
function patternToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .split("/")
    .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment))
    .join("/");
  return new RegExp(`^${regexPattern}$`);
}

/**
 * Check if a pathname matches a pattern path.
 * Pattern can have dynamic segments like ":id"
 */
function pathMatches(pathname: string, pattern: string): boolean {
  if (pattern === "/") {
    return pathname === "/";
  }
  const regex = patternToRegex(pattern);
  return regex.test(pathname);
}

/**
 * Recursively walks the BREADCRUMB_PATHS tree and builds a flat array of
 * crumbs that match the leading segments of `pathname`.
 *
 * Returns `null` when the node (or any of its children) does NOT match the
 * current path, so the recursive caller can skip it.
 */
function resolveCrumbs(
  nodes: BreadcrumbPathNode[],
  pathname: string,
): BreadcrumbCrumb[] | null {

  const sortedNodes = [...nodes].sort((a, b) => b.path.length - a.path.length);

  for (const node of sortedNodes) {
    const isMatch =
      pathMatches(pathname, node.path) ||
      (node.path !== "/" &&
        pathname.startsWith(node.path + "/") &&
        !node.path.includes(":"));

    if (!isMatch) continue;

    const crumb: BreadcrumbCrumb = {
      path: node.path,
      name: node.name,
      disabled: node.disabled,
    };

    if (pathMatches(pathname, node.path)) {
      return [crumb];
    }

    const children: BreadcrumbPathNode[] = [
      ...(node.subMenuList ?? []),
      ...(node.subMenu ?? []),
    ];

    if (children.length > 0) {
      const childCrumbs = resolveCrumbs(children, pathname);
      if (childCrumbs) {
        return [crumb, ...childCrumbs];
      }
    }

    return [crumb];
  }

  return null;
}


/**
 * Maximum number of crumbs shown inline (excluding the first "root" crumb).
 * Any crumbs in between are collapsed into an ellipsis dropdown.
 */
const MAX_VISIBLE = 3;

export function BreadcrumbCustom() {
  const pathname = usePathname();
  const crumbs = resolveCrumbs(BREADCRUMB_PATHS, pathname) ?? [];

  if (crumbs.length === 0) return null;

  const first = crumbs[0];
  const last = crumbs[crumbs.length - 1];
  const middle = crumbs.slice(1, -1); 

  const showEllipsis = middle.length > MAX_VISIBLE;
  const visibleMiddle = showEllipsis ? middle.slice(-MAX_VISIBLE) : middle;
  const collapsedMiddle = showEllipsis
    ? middle.slice(0, middle.length - MAX_VISIBLE)
    : [];

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center gap-2">
        <BreadcrumbItem className="text-xl font-semibold leading-none">
          {crumbs.length === 1 ? (
            <BreadcrumbPage>{first.name}</BreadcrumbPage>
          ) : first.disabled ? (
            <span className="text-black">{first.name}</span>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={first.path}>{first.name}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {showEllipsis && (
          <React.Fragment>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost">
                    <BreadcrumbEllipsis />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    {collapsedMiddle.map((crumb) => (
                      <DropdownMenuItem
                        key={crumb.path}
                        asChild
                        className="text-base"
                      >
                        {crumb.disabled ? (
                          <span>{crumb.name}</span>
                        ) : (
                          <Link href={crumb.path}>{crumb.name}</Link>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </React.Fragment>
        )}

        {visibleMiddle.map((crumb) => (
          <div
            key={`breadcrumb-${crumb.path}`}
            className="flex items-center gap-1 mt-1"
          >
            <BreadcrumbSeparator />
            <BreadcrumbItem className="text-base">
              {crumb.disabled ? (
                <span className="text-muted-foreground">{crumb.name}</span>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.path}>{crumb.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}

        {crumbs.length > 1 && (
          <div className="flex items-center gap-1 mt-1">
            <BreadcrumbSeparator />
            <BreadcrumbItem className="text-base leading-none">
              <BreadcrumbPage className=" text-muted-foreground">
                {last.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
