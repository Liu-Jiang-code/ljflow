import type { Element, Root, ElementContent } from "hast";
import { useMemo } from "react";
import { visit } from "unist-util-visit";
import type { BuildVisitor } from "unist-util-visit";

// 修复前端流式输出bug
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

const CJK_TEXT_RE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

export function rehypeSplitWordsIntoSpans() {
  return (tree: Root) => {
    visit(tree, "element", ((node: Element) => {
      if (
        // ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "strong"].includes(
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "strong", "ol", "ul"].includes(

          node.tagName,
        ) &&
        node.children
      ) {
        const newChildren: Array<ElementContent> = [];
        node.children.forEach((child) => {
          if (child.type === "text") {
            if (CJK_TEXT_RE.test(child.value)) {
              newChildren.push(child);
              return;
            }
            const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
            const segments = segmenter.segment(child.value);
            const words = Array.from(segments)
              .map((segment) => segment.segment)
              .filter(Boolean);
            words.forEach((word: string) => {
              newChildren.push({
                type: "element",
                tagName: "span",
                properties: {
                  className: "animate-fade-in",
                },
                children: [{ type: "text", value: word }],
              });
            });
          } else {
            newChildren.push(child);
          }
        });
        node.children = newChildren;
      }
    }) as BuildVisitor<Root, "element">);
  };
}

// 修改前
export function useRehypeSplitWordsIntoSpans(enabled = true) {
// export function useRehypeSplitWordsIntoSpans(enabled = false) { // 直接禁用
  const rehypePlugins = useMemo(
    () => (enabled ? [rehypeSplitWordsIntoSpans] : []),
    [enabled],
  );
  return rehypePlugins;
}

// 未解决
// // ../streamdown 的 streamdownPluginsWithWordAnimation 对应修改， 还有 frontend/src/components/workspace/messages/message-list-item.tsx 220行处
// export function useRehypeSplitWordsIntoSpans(enabled = true) {
//   const rehypePlugins = useMemo(
//     () =>
//       enabled
//         ? [rehypeRaw, [rehypeKatex, { output: "html" }], rehypeSplitWordsIntoSpans]
//         : [rehypeRaw, [rehypeKatex, { output: "html" }]],
//     [enabled],
//   );
//   return rehypePlugins;
// }
