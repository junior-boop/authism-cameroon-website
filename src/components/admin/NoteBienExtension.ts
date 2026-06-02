import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    noteBien: {
      setNoteBien: () => ReturnType;
      toggleNoteBien: () => ReturnType;
      unsetNoteBien: () => ReturnType;
    };
  }
}

export const NoteBien = Node.create({
  name: "noteBien",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="note-bien"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "note-bien",
        class: "nb-callout bg-orange-50 rounded-r-md px-4 py-3 my-3",
      }),
      [
        "div",
        {
          class: "nb-callout-title flex items-center gap-2 font-bold text-orange-700 text-sm mb-1 select-none",
          contenteditable: "false",
        },
        ["span", { class: "text-base leading-none" }, "⚠"],
        ["span", {}, "Attention !"],
      ],
      ["div", { class: "nb-callout-content text-black text-sm" }, 0],
    ];
  },

  addCommands() {
    return {
      setNoteBien:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
      toggleNoteBien:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
      unsetNoteBien:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});
