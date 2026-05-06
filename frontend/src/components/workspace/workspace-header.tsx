"use client";

import Image from "next/image"; // 为左上角添加logo显示的包

import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useI18n } from "@/core/i18n/hooks";
import { env } from "@/env";
import { cn } from "@/lib/utils";

export function WorkspaceHeader({ className }: { className?: string }) {
  const { t } = useI18n();
  const { state } = useSidebar();
  const pathname = usePathname();
  return (
    <>
      <div
        className={cn(
          "group/workspace-header flex h-12 flex-col justify-center",
          className,
        )}
      >
        {state === "collapsed" ? (
          <div className="group-has-data-[collapsible=icon]/sidebar-wrapper:-translate-y flex w-full cursor-pointer items-center justify-center">
            {/* <div className="text-primary block pt-1 font-serif group-hover/workspace-header:hidden"> */}
            <div className="text-primary block pt-1 font-sans group-hover/workspace-header:hidden">
              LJF
            </div>
            {/* 此处为左上角收缩后的展示 */}
            <SidebarTrigger className="hidden pl-2 group-hover/workspace-header:block" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY === "true" ? (
              // <Link href="/" className="text-primary ml-2 font-serif">
              <Link href="/" className="text-primary ml-2 font-sans">
                灵境·数智研究员
              </Link>
            ) : (
              // 以下这个是左上角显示
              // <div className="text-primary ml-2 cursor-default font-serif">
              // <div className="text-primary ml-2 cursor-default font-sans">
              //   灵境·数智研究员
              // </div>
              // <div className="text-primary ml-2 flex items-center gap-2 cursor-default font-sans">
              //   <Image src="/favicon.ico" alt="Logo" width={24} height={24} />
              //   灵境·数智研究员
              // </div>
              // // 此处为左上角展示

              <div className="ml-2 flex items-center gap-3 cursor-default">
                {/* Logo 容器 */}
                <div className="w-[30px] h-[30px] rounded-[5px] overflow-hidden bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0">
                  <Image 
                    src="/favicon.jpg" 
                    alt="Logo" 
                    width={30} 
                    height={30} 
                    className="object-cover"
                  />
                </div>
                {/* 标题文字 */}
                <span className="font-['Noto_Sans_SC'] text-[25px] font-[700] tracking-[-0.5px] text-[var(--text-strong)] leading-none">
                  灵境·数智研究员
                </span>
              </div>
            )}
            <SidebarTrigger />
          </div>
        )}
      </div>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/workspace/chats/new"}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/chats/new">
              <MessageSquarePlus size={16} />
              <span>{t.sidebar.newChat}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
