interface MessageLike {
  content?: unknown;
  parts?: { type?: string; text?: string }[];
}

export function messageToText(message: MessageLike): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("\n");
  }

  return "";
}

export function messageToTextVerbose(message: MessageLike): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part) => {
        if (part.type === "text") {
          return part.text ?? "";
        }
        return JSON.stringify(part, null, 2);
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}
