import { delayFor, sleep } from "./static-mode";

export async function replaySequence<T>(
  items: T[],
  onItem: (item: T, index: number) => void,
  nameOf: (item: T) => string,
  isCurrent: () => boolean,
): Promise<void> {
  for (let index = 0; index < items.length; index += 1) {
    if (!isCurrent()) return;
    await sleep(delayFor(nameOf(items[index])));
    if (!isCurrent()) return;
    onItem(items[index], index);
  }
}
